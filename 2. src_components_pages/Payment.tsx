import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  CreditCard,
  Building2,
  Shield,
  Loader2,
  Sparkles,
  Monitor,
  Package,
  Layers,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type PurchaseKind = "subscription" | "physical" | "combo";

interface SimulationResult {
  ok: boolean;
  simulated: boolean;
  kind: PurchaseKind;
  order: {
    id: string;
    order_number: string;
    total_amount: number;
    currency: string;
    status: string;
    payment_method: string;
    payment_reference: string;
    product_name: string;
    product_type: string;
  };
  ticket: { id?: string; subject?: string; category?: string; error?: string } | null;
  subscription: {
    id?: string;
    order_number?: string;
    end_date?: string;
    status?: string;
    amount_paid?: number;
    error?: string;
  } | null;
  pipeline: string[];
}

interface ProductOption {
  kind: PurchaseKind;
  sku: string;
  title: string;
  subtitle: string;
  price: string;
  bullets: string[];
  icon: typeof Monitor;
}

const PRODUCTS: ProductOption[] = [
  {
    kind: "subscription",
    sku: "UCG-SUB-DIGITAL",
    title: "1-Year Digital Subscription",
    subtitle: "Instant online access to all 13 eVolumes",
    price: "ZAR 500.00",
    bullets: [
      "All 10 Career Volumes + 3 Guidance Volumes",
      "1 Account Holder + 1 Student sub-profile",
      "Up to 2 devices simultaneously",
      "Free updates during subscription",
      "Renewal: ZAR 500.00/year",
    ],
    icon: Monitor,
  },
  {
    kind: "physical",
    sku: "UCG-SET-PRINT",
    title: "Full Printed Set",
    subtitle: "Hard-copy 13-volume set delivered to you",
    price: "ZAR 3,415.00",
    bullets: [
      "Complete printed boxset of all 13 volumes",
      "Door-to-door courier delivery (RSA)",
      "Procurement & logistics handled by IBATUR",
      "No digital subscription included",
    ],
    icon: Package,
  },
  {
    kind: "combo",
    sku: "UCG-COMBO",
    title: "Combo: Set + Subscription",
    subtitle: "Best value — printed set AND digital subscription",
    price: "ZAR 3,915.00",
    bullets: [
      "Full printed boxset (13 volumes)",
      "1-Year Digital Subscription included",
      "Future eVolume updates FREE during subscription",
      "Door-to-door delivery + instant digital access",
    ],
    icon: Layers,
  },
];

const Payment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedKind, setSelectedKind] = useState<PurchaseKind>("subscription");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [submitting, setSubmitting] = useState<null | "card" | "eft">(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const termsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = termsRef.current;
    if (!el) return;
    const handleScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
        setScrolledToBottom(true);
      }
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const selectedProduct = PRODUCTS.find((p) => p.kind === selectedKind)!;

  const runSimulation = async (method: "card" | "eft") => {
    if (!user) return;
    setSubmitting(method);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("simulate-checkout", {
        body: {
          payment_method: method,
          product_sku: selectedProduct.sku,
          purchase_kind: selectedProduct.kind,
          quantity: 1,
        },
      });
      if (error) throw error;
      const res = data as SimulationResult;
      setResult(res);
      const label =
        res.kind === "subscription" ? "subscription" : res.kind === "combo" ? "combo order" : "order";
      toast.success(
        `Simulated ${method.toUpperCase()} payment — ${label} ${res.order.order_number} created`,
      );
    } catch (e: any) {
      toast.error(e?.message ?? "Simulation failed");
    } finally {
      setSubmitting(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-4">You need to be signed in to purchase the eUCG.</p>
          <Link to="/login"><Button>Sign In</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="container max-w-3xl">
        <h1 className="font-display text-4xl font-black text-center mb-2">Get the Ultimate Career Guide</h1>
        <p className="text-muted-foreground text-center mb-8">
          Choose the format that suits you — digital subscription or printed set.
        </p>

        {/* Simulation banner */}
        <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm flex items-start gap-2">
          <Sparkles className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
          <div>
            <strong className="text-foreground">Sandbox mode:</strong>{" "}
            <span className="text-muted-foreground">
              The buy buttons run a simulated checkout — no money moves. Subscriptions activate a real
              1-year subscription record; printed sets create a procurement ticket for logistics.
            </span>
          </div>
        </div>

        {/* Product picker */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {PRODUCTS.map((p) => {
            const Icon = p.icon;
            const active = selectedKind === p.kind;
            return (
              <button
                key={p.kind}
                type="button"
                onClick={() => {
                  setSelectedKind(p.kind);
                  setResult(null);
                }}
                className={`text-left rounded-lg border-2 p-5 transition-all ${
                  active
                    ? "border-primary bg-card shadow-md"
                    : "border-border bg-card/60 hover:border-primary/50"
                }`}
                aria-pressed={active}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-5 h-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="font-display font-bold">{p.title}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{p.subtitle}</p>
                <p className="font-display text-2xl font-black text-primary mb-3">{p.price}</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {p.bullets.map((b) => (
                    <li key={b}>✓ {b}</li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Selected summary */}
        <div className="bg-card border border-primary/30 rounded-lg p-4 mb-6 text-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">You're buying</p>
            <p className="font-display font-bold">{selectedProduct.title}</p>
          </div>
          <p className="font-display text-xl font-black text-primary">{selectedProduct.price}</p>
        </div>

        {/* Terms */}
        <div className="mb-6">
          <h2 className="font-display text-xl font-bold mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Terms & Conditions
          </h2>
          <p className="text-xs text-muted-foreground mb-2">Please scroll to the bottom to agree.</p>
          <div
            ref={termsRef}
            className="bg-muted rounded-lg p-4 text-sm text-muted-foreground max-h-48 overflow-y-auto border border-border"
          >
            <p className="mb-2"><strong>1. Intellectual Property:</strong> The eUCG and all contents are IP of IBATUR Education. Unauthorized copying, screenshotting, or distribution is prohibited.</p>
            <p className="mb-2"><strong>2. Pricing:</strong> Digital Subscription <strong>R500/year</strong>. Printed Set <strong>R3,415</strong>. Combo (Set + Subscription) <strong>R3,915</strong>. Combo includes free eVolume updates during the subscription.</p>
            <p className="mb-2"><strong>3. Account Usage:</strong> 1 account holder + 1 student sub-profile. Max 2 devices simultaneously.</p>
            <p className="mb-2"><strong>4. Content Protection:</strong> Screenshots, copying, printing, screen recording are prohibited. Violations may result in account suspension.</p>
            <p className="mb-2"><strong>5. KYC:</strong> Email, mobile, and ID verification required.</p>
            <p className="mb-2"><strong>6. Payments:</strong> Via Visa/Mastercard or EFT (ABSA, Nedbank, Standard Bank, FNB, Capitec).</p>
            <p className="mb-2"><strong>7. Refunds:</strong> No refunds once access is granted.</p>
            <p className="mb-2"><strong>8. Privacy:</strong> Data handled per POPIA regulations.</p>
            <p className="mb-2"><strong>9. Updates:</strong> IBATUR may update content and terms at any time.</p>
            <p><strong>10. Governing Law:</strong> Republic of South Africa.</p>
          </div>
          <label className="flex items-center gap-2 mt-3">
            <input
              type="checkbox"
              checked={agreedToTerms}
              disabled={!scrolledToBottom}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="rounded border-border"
            />
            <span className={`text-sm ${!scrolledToBottom ? "text-muted-foreground" : "text-foreground"}`}>
              I have read and agree to the Terms & Conditions
            </span>
          </label>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" /> Payment Method
          </h2>

          <Button
            className="w-full justify-start h-14 font-display"
            disabled={!agreedToTerms || submitting !== null}
            onClick={() => runSimulation("card")}
          >
            {submitting === "card" ? (
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
            ) : (
              <CreditCard className="w-5 h-5 mr-3" />
            )}
            {submitting === "card"
              ? "Simulating payment…"
              : `Pay with Card — ${selectedProduct.price}`}
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-14 font-display"
            disabled={!agreedToTerms || submitting !== null}
            onClick={() => runSimulation("eft")}
          >
            {submitting === "eft" ? (
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
            ) : (
              <Building2 className="w-5 h-5 mr-3" />
            )}
            {submitting === "eft"
              ? "Simulating EFT…"
              : `Pay via Direct EFT — ${selectedProduct.price}`}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            For payment queries, contact IBATUR Education: +27 83 332 9584 | info@ibatur.co.za
          </p>
        </div>

        {/* Simulation result panel */}
        {result && (
          <div className="mt-8 rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <h3 className="font-display font-bold text-lg">
                Simulation succeeded —{" "}
                {result.kind === "subscription"
                  ? "Subscription activated"
                  : result.kind === "combo"
                    ? "Combo order placed (subscription + dispatch)"
                    : "Order placed"}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div className="text-muted-foreground">Order #</div>
              <div className="font-mono">{result.order.order_number}</div>
              <div className="text-muted-foreground">Product</div>
              <div>{result.order.product_name}</div>
              <div className="text-muted-foreground">Status</div>
              <div className="font-medium capitalize">{result.order.status}</div>
              <div className="text-muted-foreground">Method</div>
              <div className="capitalize">{result.order.payment_method}</div>
              <div className="text-muted-foreground">Reference</div>
              <div className="font-mono text-xs">{result.order.payment_reference}</div>
              <div className="text-muted-foreground">Total</div>
              <div>
                {result.order.currency} {result.order.total_amount.toFixed(2)}
              </div>
              {result.subscription?.id && (
                <>
                  <div className="text-muted-foreground">Subscription</div>
                  <div className="font-mono text-xs">{result.subscription.id}</div>
                  <div className="text-muted-foreground">Active until</div>
                  <div>
                    {result.subscription.end_date
                      ? new Date(result.subscription.end_date).toLocaleDateString()
                      : "—"}
                  </div>
                </>
              )}
              {result.ticket?.id && (
                <>
                  <div className="text-muted-foreground">Procurement Ticket</div>
                  <div className="font-mono text-xs">{result.ticket.id}</div>
                </>
              )}
            </div>

            <div className="mb-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Internal pipeline</p>
              <ul className="text-sm space-y-0.5 font-mono">
                {result.pipeline.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => navigate("/admin/orders")}>
                Open in Orders
              </Button>
              {result.subscription?.id && (
                <Button size="sm" variant="outline" onClick={() => navigate("/admin/billing")}>
                  View Subscription
                </Button>
              )}
              {result.ticket?.id && (
                <Button size="sm" variant="outline" onClick={() => navigate("/admin/service")}>
                  View Procurement Ticket
                </Button>
              )}
              {result.kind !== "physical" && (
                <Button size="sm" variant="outline" onClick={() => navigate("/volumes")}>
                  Go to Volumes
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setResult(null)}>
                Run another simulation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
