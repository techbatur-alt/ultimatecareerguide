import { Button } from "@/components/ui/button";
import { Mail, Phone, Target, Users, GraduationCap, Building2, TrendingUp, Globe, ArrowRight, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const sponsorTiers = [
  { name: "Diamond Sponsor", amount: "R183.4M", description: "Fund the entire UCG set production and distribution. Primary branding across all materials.", gradient: "from-blue-100 to-blue-50 border-blue-300" },
  { name: "Platinum Sponsor", amount: "R177.2M", description: "Fund the 'Train-the-Trainer' program, creating ~3,000 jobs for unemployed youth.", gradient: "from-muted to-card border-border" },
  { name: "Gold Sponsor", amount: "R78.0M", description: "Fund the Events Program & Logistics, invigorating local NPOs.", gradient: "from-yellow-50 to-amber-50 border-yellow-300" },
  { name: "Silver & Bronze", amount: "Custom", description: "Custom contributions for broader partnership inclusion.", gradient: "from-muted to-card border-border" },
];

const Sponsorship = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hero-graduates.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 to-primary/80" />
        <div className="container relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary-foreground text-sm font-display font-bold mb-4">
            Careers4Africa-SA26
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-black text-primary-foreground mb-4">
            Crowd-Sponsorship Project
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            An invitation to sponsor the distribution of the Ultimate Career Guide to every school in South Africa — empowering 11+ million learners.
          </p>
        </div>
      </section>

      <div className="container max-w-5xl py-12 space-y-10">
        {/* Crisis */}
        <div className="bg-card border border-border rounded-xl p-8">
          <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" /> The Career Guidance Crisis
          </h2>
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-5 mb-6">
            <p className="font-display font-bold text-destructive text-xl">Youth unemployment (up to 24 years) stands at 62.4%</p>
            <p className="text-muted-foreground mt-1 text-sm">Millions of learners make life-altering choices without adequate career guidance.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Tunnel-Visioning Careers", "Critical Skills Gaps", "Resource & Access Inequality", "The Digital Divide"].map((t) => (
              <div key={t} className="bg-muted rounded-xl p-4 text-center border border-border">
                <h3 className="font-display font-bold text-sm">{t}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Solution */}
        <div className="bg-card border border-border rounded-xl p-8">
          <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" /> The Solution — Ultimate Career Guide
          </h2>
          <p className="text-muted-foreground mb-4">
            A comprehensive, 13-volume career guidance set researched over 25 years for South Africa.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {["Comprehensive: Self-discovery to career advancement", "Contextual: Designed for the SA labour market", "Accessible: Physical copies overcome the digital divide", "Durable: High-quality print, 10+ year shelf life"].map((t) => (
              <div key={t} className="flex items-start gap-2 text-sm bg-muted rounded-lg p-3">
                <span className="text-primary font-bold">✓</span> {t}
              </div>
            ))}
          </div>
        </div>

        {/* Impact Targets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { val: "20,808", label: "Schools" },
            { val: "53,709", label: "UCG Sets" },
            { val: "11M+", label: "Learners" },
            { val: "5,982", label: "Educators" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-6 text-center">
              <p className="font-display text-3xl font-black text-primary">{s.val}</p>
              <p className="text-xs text-muted-foreground">{s.label} Impacted</p>
            </div>
          ))}
        </div>

        {/* Sponsorship Tiers */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" /> Sponsorship Tiers
          </h2>
          <div className="space-y-4">
            {sponsorTiers.map((tier) => (
              <div key={tier.name} className={`border rounded-xl p-6 bg-gradient-to-r ${tier.gradient} hover:shadow-lg transition-shadow`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-display text-xl font-bold">{tier.name}</h3>
                    <p className="text-muted-foreground text-sm">{tier.description}</p>
                  </div>
                  <span className="font-display text-2xl font-black text-primary">{tier.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROI */}
        <div className="bg-card border border-border rounded-xl p-8">
          <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" /> Your Return on Investment
          </h2>
          <div className="space-y-4">
            {[
              { icon: Globe, title: "Unprecedented Brand Exposure", text: "6.8+ billion annual impressions. Branding on guides with 10+ year shelf life." },
              { icon: GraduationCap, title: "Tangible Social Impact", text: "Directly addresses UN SDG 4: Quality Education. Creates jobs and uplifts NPOs." },
              { icon: Users, title: "A Lasting Legacy", text: "Empower the next generation of South African professionals and entrepreneurs." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 bg-muted rounded-xl p-5">
                <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-display font-bold">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="gradient-brand rounded-xl p-10 text-center text-primary-foreground">
          <h2 className="font-display text-2xl font-bold mb-3">Sponsor Change Today</h2>
          <p className="opacity-90 mb-6">Join us in transforming career guidance across South Africa.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="mailto:info@ibatur.co.za">
              <Button variant="secondary" className="font-display"><Mail className="w-4 h-4 mr-2" /> info@ibatur.co.za</Button>
            </a>
            <Link to="/sponsorship-tracker">
              <Button variant="secondary" className="font-display">View Tracker <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </div>
          <p className="text-xs mt-4 opacity-70">© IP Protected by IBATUR Education CC</p>
        </div>
      </div>
    </div>
  );
};

export default Sponsorship;
