import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import DRMProtection from "@/components/DRMProtection";
import RouteGuard from "@/components/RouteGuard";
import SubscriptionGate from "@/components/SubscriptionGate";
import Index from "./pages/Index";
import Volumes from "./pages/Volumes";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CreatePassword from "./pages/CreatePassword";
import CompleteProfile from "./pages/CompleteProfile";
import Payment from "./pages/Payment";
import ResetPassword from "./pages/ResetPassword";
import Partners from "./pages/Partners";
import Testimonials from "./pages/Testimonials";
import Sponsorship from "./pages/Sponsorship";
import VolumeViewer from "./pages/VolumeViewer";
import Profile from "./pages/Profile";
import UCGProject from "./pages/UCGProject";
import SponsorshipTracker from "./pages/SponsorshipTracker";
import AdminData from "./pages/AdminData";
import Portal from "./pages/Portal";
import ServiceCentre from "./pages/admin/ServiceCentre";
import UserManagement from "./pages/admin/UserManagement";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CommandCentre from "./pages/admin/CommandCentre";
import BillingManagement from "./pages/admin/BillingManagement";
import OrdersManagement from "./pages/admin/OrdersManagement";
import Stakeholders from "./pages/admin/Stakeholders";
import SalesAgents from "./pages/admin/SalesAgents";
import AgentDashboard from "./pages/agent/AgentDashboard";
import AdminLayout from "./components/admin/AdminLayout";
import NotFound from "./pages/NotFound";

// Wrap any admin/portal page with the sidebar layout
const withAdminLayout = (node: React.ReactNode) => <AdminLayout>{node}</AdminLayout>;

const queryClient = new QueryClient();

const STAFF_ROLES = ["stakeholder", "service", "support", "sales_agent", "executive"] as const;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DRMProtection />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* PUBLIC routes */}
              <Route path="/" element={<Index />} />
              <Route path="/volumes" element={<Volumes />} />
              <Route path="/volume/:id" element={<SubscriptionGate><VolumeViewer /></SubscriptionGate>} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/testimonials" element={<Testimonials />} />

              {/* AUTHENTICATED routes */}
              <Route path="/create-password" element={<RouteGuard authOnly><CreatePassword /></RouteGuard>} />
              <Route path="/complete-profile" element={<RouteGuard authOnly><CompleteProfile /></RouteGuard>} />
              <Route path="/payment" element={<RouteGuard authOnly><Payment /></RouteGuard>} />
              <Route path="/profile" element={<RouteGuard authOnly><Profile /></RouteGuard>} />

              {/* ADMIN PORTAL — service+ */}
              <Route path="/portal" element={<RouteGuard minRole="service">{withAdminLayout(<Portal />)}</RouteGuard>} />

              {/* Stakeholder pages now live under /portal/* (staff-only) */}
              <Route path="/portal/partners" element={<RouteGuard allowedRoles={[...STAFF_ROLES]}>{withAdminLayout(<Partners />)}</RouteGuard>} />
              <Route path="/portal/ucg-project" element={<RouteGuard allowedRoles={[...STAFF_ROLES]}>{withAdminLayout(<UCGProject />)}</RouteGuard>} />
              <Route path="/portal/sponsorship" element={<RouteGuard allowedRoles={[...STAFF_ROLES]}>{withAdminLayout(<Sponsorship />)}</RouteGuard>} />
              <Route path="/portal/sponsorship-tracker" element={<RouteGuard allowedRoles={[...STAFF_ROLES]}>{withAdminLayout(<SponsorshipTracker />)}</RouteGuard>} />

              {/* Backwards-compat redirects (old paths still work for staff) */}
              <Route path="/partners" element={<RouteGuard allowedRoles={[...STAFF_ROLES]}><Partners /></RouteGuard>} />
              <Route path="/ucg-project" element={<RouteGuard allowedRoles={[...STAFF_ROLES]}><UCGProject /></RouteGuard>} />
              <Route path="/sponsorship" element={<RouteGuard allowedRoles={[...STAFF_ROLES]}><Sponsorship /></RouteGuard>} />
              <Route path="/sponsorship-tracker" element={<RouteGuard allowedRoles={[...STAFF_ROLES]}><SponsorshipTracker /></RouteGuard>} />

              {/* L4+ */}
              <Route path="/admin-data" element={<RouteGuard allowedRoles={["support", "executive"]}><AdminData /></RouteGuard>} />

              {/* L3+ admin routes */}
              <Route path="/admin/dashboard" element={<RouteGuard minRole="service">{withAdminLayout(<AdminDashboard />)}</RouteGuard>} />
              <Route path="/admin/command-centre" element={<RouteGuard minRole="service">{withAdminLayout(<CommandCentre />)}</RouteGuard>} />
              <Route path="/admin/users" element={<RouteGuard minRole="service">{withAdminLayout(<UserManagement />)}</RouteGuard>} />
              <Route path="/admin/billing" element={<RouteGuard minRole="service">{withAdminLayout(<BillingManagement />)}</RouteGuard>} />
              <Route path="/admin/service" element={<RouteGuard minRole="service">{withAdminLayout(<ServiceCentre />)}</RouteGuard>} />
              <Route path="/admin/orders" element={<RouteGuard minRole="service">{withAdminLayout(<OrdersManagement />)}</RouteGuard>} />
              <Route path="/admin/stakeholders" element={<RouteGuard minRole="service">{withAdminLayout(<Stakeholders />)}</RouteGuard>} />
              <Route path="/admin/sales-agents" element={<RouteGuard minRole="service">{withAdminLayout(<SalesAgents />)}</RouteGuard>} />

              {/* Sales agent self-service */}
              <Route path="/agent/dashboard" element={<RouteGuard allowedRoles={["sales_agent", "support", "executive"]}>{withAdminLayout(<AgentDashboard />)}</RouteGuard>} />


              {/* L4/L6 */}
              <Route path="/admin/api-console" element={<RouteGuard allowedRoles={["support", "executive"]}>{withAdminLayout(<AdminPlaceholder title="API Console" />)}</RouteGuard>} />

              {/* L6 only */}
              <Route path="/admin/escalations" element={<RouteGuard allowedRoles={["executive"]}>{withAdminLayout(<AdminPlaceholder title="Escalations" />)}</RouteGuard>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

/** Temporary placeholder for admin pages to be built in Phase 4 */
const AdminPlaceholder = ({ title }: { title: string }) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center space-y-4">
      <h1 className="font-display text-3xl font-black">
        <span className="text-primary">{title}</span>
      </h1>
      <p className="text-muted-foreground">This page will be built in Phase 4.</p>
    </div>
  </div>
);

export default App;
