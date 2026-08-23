"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navigationItems } from "@/data/navigation";
import { useToast } from "@/components/providers/ToastProvider";

interface SidebarProps {
  isOpen: boolean;
  onNavigate: () => void;
}

export function Sidebar({ isOpen, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { showToast } = useToast();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => new Set(pathname.startsWith("/networks") ? ["Networks"] : []));

  useEffect(() => {
    const activeParent = navigationItems.find((item) => item.children?.some((child) => child.href === "/networks" ? pathname === "/networks" : pathname.startsWith(child.href)));
    if (activeParent) setExpandedItems((current) => current.has(activeParent.label) ? current : new Set([...current, activeParent.label]));
  }, [pathname]);

  const isActive = (href?: string) => href === "/" ? pathname === "/" : Boolean(href && pathname.startsWith(href));
  const isChildActive = (href: string) => href === "/networks" ? pathname === "/networks" : pathname.startsWith(href);

  return (
    <>
      <aside className={`sidebar${isOpen ? " open" : ""}`} aria-label="Primary navigation">
        <Link className="brand" href="/" aria-label="Orbit home" onClick={onNavigate}>
          <img src="/assets/orbit-logo.png" alt="Orbit" />
        </Link>
        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            const childActive = item.children?.some((child) => isChildActive(child.href)) ?? false;
            const active = isActive(item.href) || childActive;
            const expanded = expandedItems.has(item.label);
            const content = (
              <>
                <span className="nav-icon" aria-hidden="true"><img className="nav-icon-image" src={`/assets/nav-${item.asset}.png`} alt="" /></span>
                <span className="nav-label">{item.label}</span>
                {item.expandable ? <span className="nav-chevron" aria-hidden="true">⌄</span> : <span />}
              </>
            );

            if (item.href) {
              return (
                <Link className={`nav-button${active ? " active" : ""}`} href={item.href} aria-current={active ? "page" : undefined} key={item.label} onClick={onNavigate}>
                  {content}
                </Link>
              );
            }

            if (item.children?.length) {
              const submenuId = `sidebar-${item.label.toLocaleLowerCase().replaceAll(" ", "-")}`;
              return (
                <div className="nav-group" key={item.label}>
                  <button
                    aria-controls={submenuId}
                    aria-expanded={expanded}
                    className={`nav-button${active ? " active" : ""}${expanded ? " expanded" : ""}`}
                    onClick={() => setExpandedItems((current) => {
                      const next = new Set(current);
                      if (next.has(item.label)) next.delete(item.label); else next.add(item.label);
                      return next;
                    })}
                    type="button"
                  >
                    {content}
                  </button>
                  <div className={`nav-submenu${expanded ? " expanded" : ""}`} id={submenuId}>
                    {item.children.map((child) => {
                      const activeChild = isChildActive(child.href);
                      return <Link className={`nav-submenu-link${activeChild ? " active" : ""}`} href={child.href} aria-current={activeChild ? "page" : undefined} key={child.href} onClick={onNavigate}><span aria-hidden="true" />{child.label}</Link>;
                    })}
                  </div>
                </div>
              );
            }

            return (
              <button
                aria-expanded={item.expandable ? false : undefined}
                className="nav-button"
                key={item.label}
                onClick={() => {
                  showToast(`${item.label} is ready for a future Orbit product route.`);
                }}
                type="button"
              >
                {content}
              </button>
            );
          })}
        </nav>
      </aside>
      <button className={`sidebar-backdrop${isOpen ? " open" : ""}`} type="button" aria-label="Close navigation" onClick={onNavigate} tabIndex={isOpen ? 0 : -1} />
    </>
  );
}
