"use client";

import { usePathname } from "next/navigation";

export function PageTransition({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  return <div className="route-transition" key={pathname}>{children}</div>;
}
