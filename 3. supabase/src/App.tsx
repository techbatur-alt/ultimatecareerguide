import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RouteGuard from './components/RouteGuard';
import AdminLayout from './components/admin/AdminLayout';
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CreatePassword from './pages/CreatePassword';
import CompleteProfile from './pages/CompleteProfile';
import About from './pages/About';
import Testimonials from './pages/Testimonials';
import Volumes from './pages/Volumes';
import VolumeViewer from './pages/VolumeViewer';
import Phase2Operations from './pages/Phase2Operations';
import Portal from './pages/Portal';
import Partners from './pages/Partners';
import UCGProject from './pages/UCGProject';
import Sponsorship from './pages/Sponsorship';
import SponsorshipTracker from './pages/SponsorshipTracker';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ServiceCentre from './pages/admin/ServiceCentre';
import OrdersManagement from './pages/admin/OrdersManagement';
import BillingManagement from './pages/admin/BillingManagement';
import Stakeholders from './pages/admin/Stakeholders';
import SalesAgents from './pages/admin/SalesAgents';
import CommandCentre from './pages/admin/CommandCentre';
import AdminData from './pages/AdminData';
import OperationsData from './pages/admin/OperationsData';
import FulfillmentOperations from './pages/admin/FulfillmentOperations';
import TrainingOperations from './pages/admin/TrainingOperations';
import ReportingOperations from './pages/admin/ReportingOperations';
import DeliveryOperations from './pages/admin/DeliveryOperations';
import ApiConsole from './pages/admin/ApiConsole';
import Escalations from './pages/admin/Escalations';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Index /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/testimonials" element={<Layout><Testimonials /></Layout>} />
        <Route path="/volumes" element={<Layout><Volumes /></Layout>} />
        <Route path="/evolumes" element={<Layout><Volumes /></Layout>} />
        <Route path="/volume/:id" element={<Layout><VolumeViewer /></Layout>} />
        <Route path="/phase2" element={<RouteGuard allowedRoles={["executive"]}><Layout><Phase2Operations /></Layout></RouteGuard>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/signup" element={<Layout><Signup /></Layout>} />
        <Route path="/create-password" element={<Layout><CreatePassword /></Layout>} />
        <Route path="/complete-profile" element={<Layout><CompleteProfile /></Layout>} />

        <Route path="/portal" element={<RouteGuard allowedRoles={["service", "support", "sales_agent", "executive"]}><Layout><Portal /></Layout></RouteGuard>} />
        <Route path="/portal/partners" element={<RouteGuard allowedRoles={["service", "support", "sales_agent", "executive"]}><Layout><Partners /></Layout></RouteGuard>} />
        <Route path="/portal/ucg-project" element={<RouteGuard allowedRoles={["service", "support", "sales_agent", "executive"]}><Layout><UCGProject /></Layout></RouteGuard>} />
        <Route path="/portal/sponsorship" element={<RouteGuard allowedRoles={["service", "support", "sales_agent", "executive"]}><Layout><Sponsorship /></Layout></RouteGuard>} />
        <Route path="/portal/sponsorship-tracker" element={<RouteGuard allowedRoles={["service", "support", "sales_agent", "executive"]}><Layout><SponsorshipTracker /></Layout></RouteGuard>} />

        <Route path="/admin/dashboard" element={<RouteGuard allowedRoles={["service", "support", "sales_agent", "executive"]}><AdminLayout><AdminDashboard /></AdminLayout></RouteGuard>} />
        <Route path="/admin/users" element={<RouteGuard allowedRoles={["service", "support", "sales_agent", "executive"]}><AdminLayout><UserManagement /></AdminLayout></RouteGuard>} />
        <Route path="/admin/service" element={<RouteGuard allowedRoles={["service", "support", "sales_agent", "executive"]}><AdminLayout><ServiceCentre /></AdminLayout></RouteGuard>} />
        <Route path="/admin/orders" element={<RouteGuard allowedRoles={["service", "support", "sales_agent", "executive"]}><AdminLayout><OrdersManagement /></AdminLayout></RouteGuard>} />
        <Route path="/admin/billing" element={<RouteGuard allowedRoles={["service", "support", "sales_agent", "executive"]}><AdminLayout><BillingManagement /></AdminLayout></RouteGuard>} />
        <Route path="/admin/stakeholders" element={<RouteGuard allowedRoles={["service", "support", "sales_agent", "executive"]}><AdminLayout><Stakeholders /></AdminLayout></RouteGuard>} />
        <Route path="/admin/sales-agents" element={<RouteGuard allowedRoles={["service", "support", "sales_agent", "executive"]}><AdminLayout><SalesAgents /></AdminLayout></RouteGuard>} />
        <Route path="/admin/command-centre" element={<RouteGuard allowedRoles={["executive"]}><AdminLayout><CommandCentre /></AdminLayout></RouteGuard>} />
        <Route path="/admin-data" element={<RouteGuard allowedRoles={["service", "support", "sales_agent", "executive"]}><AdminLayout><AdminData /></AdminLayout></RouteGuard>} />
        <Route path="/admin/operations-data" element={<RouteGuard allowedRoles={["service", "support", "sales_agent", "executive"]}><AdminLayout><OperationsData /></AdminLayout></RouteGuard>} />
        <Route path="/admin/fulfillment" element={<RouteGuard allowedRoles={["service", "support", "sales_agent", "executive"]}><AdminLayout><FulfillmentOperations /></AdminLayout></RouteGuard>} />
        <Route path="/admin/training" element={<RouteGuard allowedRoles={["service", "support", "sales_agent", "executive"]}><AdminLayout><TrainingOperations /></AdminLayout></RouteGuard>} />
        <Route path="/admin/reporting" element={<RouteGuard allowedRoles={["service", "support", "sales_agent", "executive"]}><AdminLayout><ReportingOperations /></AdminLayout></RouteGuard>} />
        <Route path="/admin/delivery" element={<RouteGuard allowedRoles={["service", "support", "sales_agent", "executive"]}><AdminLayout><DeliveryOperations /></AdminLayout></RouteGuard>} />
        <Route path="/admin/api-console" element={<RouteGuard allowedRoles={["service", "support", "sales_agent", "executive"]}><AdminLayout><ApiConsole /></AdminLayout></RouteGuard>} />
        <Route path="/admin/escalations" element={<RouteGuard allowedRoles={["executive"]}><AdminLayout><Escalations /></AdminLayout></RouteGuard>} />

        <Route path="/dashboard" element={<Layout><div className="min-h-screen bg-gray-100 p-8"><div className="max-w-7xl mx-auto"><h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1></div></div></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
