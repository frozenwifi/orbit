"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { PageTransition } from "@/components/ui/PageTransition";
import { useSidebarPreference } from "@/components/shell/useSidebarPreference";

export function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sidebar = useSidebarPreference("admin");

  useEffect(() => setMobileMenuOpen(false), [pathname]);

  return (
    <div className="admin-shell" data-sidebar-state={sidebar.isCollapsed ? "collapsed" : "expanded"}>
      <a className="skip-link" href="#admin-main-content">Skip to main content</a>
      <AdminSidebar isCollapsed={sidebar.isCollapsed} isOpen={isMobileMenuOpen} onCollapseToggle={sidebar.toggle} onNavigate={() => setMobileMenuOpen(false)} />
      <AdminTopbar isMobileMenuOpen={isMobileMenuOpen} onMobileMenuToggle={() => setMobileMenuOpen((open) => !open)} />
      <main className="admin-main" id="admin-main-content" tabIndex={-1}>
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
