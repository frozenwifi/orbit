"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageTransition } from "@/components/ui/PageTransition";
import { useSidebarPreference } from "@/components/shell/useSidebarPreference";

export function OrbitShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const sidebar = useSidebarPreference("superadmin");

  useEffect(() => setMobileMenuOpen(false), [pathname]);

  if (pathname.startsWith("/login")) {
    return <>{children}</>;
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return <AdminShell>{children}</AdminShell>;
  }

  return (
    <div className="app-shell" data-sidebar-state={sidebar.isCollapsed ? "collapsed" : "expanded"}>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Sidebar isCollapsed={sidebar.isCollapsed} isOpen={isMobileMenuOpen} onCollapseToggle={sidebar.toggle} onNavigate={() => setMobileMenuOpen(false)} />
      <Topbar isMobileMenuOpen={isMobileMenuOpen} onMobileMenuToggle={() => setMobileMenuOpen((open) => !open)} />
      <main className="main" id="main-content" tabIndex={-1}>
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
