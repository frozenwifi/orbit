"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { PageTransition } from "@/components/ui/PageTransition";

export function OrbitShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMobileMenuOpen(false), [pathname]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Sidebar isOpen={isMobileMenuOpen} onNavigate={() => setMobileMenuOpen(false)} />
      <Topbar isMobileMenuOpen={isMobileMenuOpen} onMobileMenuToggle={() => setMobileMenuOpen((open) => !open)} />
      <main className="main" id="main-content" tabIndex={-1}>
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
