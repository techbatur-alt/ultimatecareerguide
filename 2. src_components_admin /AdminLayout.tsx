import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "./AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

const SIDEBAR_STATE_KEY = "ibatur.admin.sidebar.open";

const readStoredSidebarOpen = (): boolean => {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(SIDEBAR_STATE_KEY);
    if (raw === null) return true;
    return raw === "true";
  } catch {
    return true;
  }
};

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const defaultOpen = readStoredSidebarOpen();

  const handleOpenChange = (open: boolean) => {
    try {
      window.localStorage.setItem(SIDEBAR_STATE_KEY, String(open));
    } catch {
      /* ignore */
    }
  };

  return (
    <SidebarProvider defaultOpen={defaultOpen} onOpenChange={handleOpenChange}>
      <div className="flex w-full min-h-[calc(100vh-3rem)]">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-10 flex items-center border-b border-border bg-card px-2">
            <SidebarTrigger />
            <span className="ml-2 text-xs font-display font-medium text-muted-foreground uppercase tracking-wider">
              Admin Portal
            </span>
          </div>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;

