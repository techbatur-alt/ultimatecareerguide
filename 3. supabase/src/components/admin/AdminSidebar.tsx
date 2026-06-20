import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutGrid, BarChart3, Users, Headphones, CreditCard,
  Wrench, AlertTriangle, Handshake, Target, Heart, Package, Network, Briefcase, Truck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { type AppRole } from "@/lib/roleUtils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Users;
  roles?: AppRole[];
  end?: boolean;
}

const operationsItems: NavItem[] = [
  { to: "/portal", label: "Portal Home", icon: LayoutGrid, end: true, roles: ["service", "support", "sales_agent", "executive"] },
  { to: "/admin/dashboard", label: "Dashboard", icon: BarChart3, roles: ["service", "support", "sales_agent", "executive"] },
  { to: "/phase2", label: "Phase 2 Ops", icon: Package, roles: ["executive"] },
  { to: "/admin/command-centre", label: "Command Centre", icon: BarChart3, roles: ["executive"] },
  { to: "/admin/users", label: "User Management", icon: Users, roles: ["service", "support", "sales_agent", "executive"] },
  { to: "/admin/service", label: "Service Centre", icon: Headphones, roles: ["service", "support", "sales_agent", "executive"] },
  { to: "/admin/orders", label: "Orders", icon: Package, roles: ["service", "support", "sales_agent", "executive"] },
  { to: "/admin/billing", label: "Billing", icon: CreditCard, roles: ["service", "support", "sales_agent", "executive"] },
  { to: "/admin/stakeholders", label: "Stakeholders CRM", icon: Network, roles: ["service", "support", "sales_agent", "executive"] },
  { to: "/admin/sales-agents", label: "Sales Agents", icon: Briefcase, roles: ["service", "support", "sales_agent", "executive"] },
];

const advancedItems: NavItem[] = [
  { to: "/admin-data", label: "Admin Data", icon: Wrench, roles: ["support", "executive"] },
  { to: "/admin/reporting", label: "Reporting", icon: BarChart3, roles: ["service", "support", "executive"] },
  { to: "/admin/delivery", label: "Delivery", icon: Truck, roles: ["service", "support", "executive"] },
  { to: "/admin/api-console", label: "API Console", icon: Wrench, roles: ["support", "executive"] },
  { to: "/admin/escalations", label: "Escalations", icon: AlertTriangle, roles: ["executive"] },
];

const stakeholderItems: NavItem[] = [
  { to: "/portal/partners", label: "Our Partners", icon: Handshake },
  { to: "/portal/ucg-project", label: "UCG Project", icon: Target },
  { to: "/portal/sponsorship", label: "Sponsorship", icon: Heart },
  { to: "/portal/sponsorship-tracker", label: "Sponsorship Tracker", icon: BarChart3 },
];

const AdminSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { isRole } = useAuth();

  const isActive = (to: string, end?: boolean) =>
    end ? location.pathname === to : location.pathname === to || location.pathname.startsWith(to + "/");

  const renderItems = (items: NavItem[]) =>
    items
      .filter((i) => !i.roles || isRole(i.roles))
      .map((item) => (
        <SidebarMenuItem key={item.to}>
          <SidebarMenuButton asChild isActive={isActive(item.to, item.end)}>
            <NavLink to={item.to} end={item.end}>
              <item.icon className="w-4 h-4" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ));

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(operationsItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {(isRole(["support", "executive"])) && (
          <SidebarGroup>
            <SidebarGroupLabel>Advanced</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderItems(advancedItems)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Stakeholder</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(stakeholderItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
