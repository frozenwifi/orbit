"use client";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { SearchProvider } from "@/components/providers/SearchProvider";
import { DomainProvider } from "@/components/providers/DomainProvider";

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <SearchProvider><DomainProvider>{children}</DomainProvider></SearchProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
