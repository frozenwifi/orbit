"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { navigationItems } from "@/data/navigation";
import { useToast } from "@/components/providers/ToastProvider";
import { SidebarCollapseButton, SidebarFlyout, SidebarTooltipLayer } from "@/components/shell/SidebarPrimitives";

interface SidebarProps {
  isCollapsed: boolean;
  isOpen: boolean;
  onCollapseToggle: () => void;
  onNavigate: () => void;
}

interface OpenFlyout {
  anchor: HTMLButtonElement;
  label: string;
}

export function Sidebar({ isCollapsed, isOpen, onCollapseToggle, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { showToast } = useToast();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => new Set([...(pathname.startsWith("/networks") ? ["Networks"] : []), ...(pathname.startsWith("/subtenants") ? ["Subtenants"] : [])]));
  const [openFlyout, setOpenFlyout] = useState<OpenFlyout | null>(null);
  const [sidebarRoot, setSidebarRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const activeParent = navigationItems.find((item) => item.children?.some((child) => child.href === "/networks" ? pathname === "/networks" : pathname.startsWith(child.href)));
    if (activeParent) setExpandedItems((current) => current.has(activeParent.label) ? current : new Set([...current, activeParent.label]));
    setOpenFlyout(null);
  }, [pathname]);

  useEffect(() => {
    if (!isCollapsed) setOpenFlyout(null);
  }, [isCollapsed]);

  const isActive = (href?: string) => href === "/" ? pathname === "/" : Boolean(href && pathname.startsWith(href));
  const isChildActive = (href: string) => href === "/networks" ? pathname === "/networks" : href === "/subtenants/brand-vno" ? pathname === href || pathname.startsWith(`${href}/`) : pathname.startsWith(href);
  const closeFlyout = useCallback(() => setOpenFlyout(null), []);
  const navigate = useCallback(() => {
    setOpenFlyout(null);
    onNavigate();
  }, [onNavigate]);
  const flyoutItem = openFlyout ? navigationItems.find((item) => item.label === openFlyout.label) : undefined;

  return (
    <>
      <aside className={`sidebar${isOpen ? " open" : ""}`} aria-label="Primary navigation" ref={setSidebarRoot}>
        <Link className="brand" href="/" aria-label="Orbit home" onClick={navigate}>
          <span className="sidebar-brand-clip"><img src="/assets/orbit-logo.png" alt="Orbit" /></span>
        </Link>
        <SidebarCollapseButton
          isCollapsed={isCollapsed}
          label="Superadmin navigation"
          onToggle={() => {
            closeFlyout();
            onCollapseToggle();
          }}
          variant="superadmin"
        />
        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            const childActive = item.children?.some((child) => isChildActive(child.href)) ?? false;
            const active = isActive(item.href) || childActive;
            const expanded = expandedItems.has(item.label);
            const content = (
              <>
                <span className="nav-icon" aria-hidden="true"><img className="nav-icon-image" src={`/assets/nav-${item.asset}.png`} alt="" /></span>
                <span className="nav-label">{item.label}</span>
                {item.expandable ? <span className="nav-chevron" aria-hidden="true">⌄</span> : <span className="nav-end-spacer" />}
              </>
            );

            if (item.href) {
              return (
                <Link className={`nav-button${active ? " active" : ""}`} data-sidebar-tooltip={item.label} href={item.href} aria-current={active ? "page" : undefined} key={item.label} onClick={navigate}>
                  {content}
                </Link>
              );
            }

            if (item.children?.length) {
              const submenuId = `sidebar-${item.label.toLocaleLowerCase().replaceAll(" ", "-")}`;
              const flyoutOpen = isCollapsed && openFlyout?.label === item.label;
              const inlineExpanded = !isCollapsed && expanded;
              return (
                <div className="nav-group" key={item.label}>
                  <button
                    aria-controls={`${submenuId}-${isCollapsed ? "flyout" : "inline"}`}
                    aria-expanded={isCollapsed ? flyoutOpen : expanded}
                    className={`nav-button${active ? " active" : ""}${inlineExpanded || flyoutOpen ? " expanded" : ""}`}
                    data-sidebar-tooltip={item.label}
                    onClick={(event) => {
                      if (isCollapsed) {
                        setOpenFlyout((current) => current?.label === item.label ? null : { anchor: event.currentTarget, label: item.label });
                        return;
                      }
                      setExpandedItems((current) => {
                        const next = new Set(current);
                        if (next.has(item.label)) next.delete(item.label); else next.add(item.label);
                        return next;
                      });
                    }}
                    type="button"
                  >
                    {content}
                  </button>
                  <div aria-hidden={!inlineExpanded} className={`nav-submenu${inlineExpanded ? " expanded" : ""}`} id={`${submenuId}-inline`} inert={!inlineExpanded ? true : undefined}>
                    {item.children.map((child) => {
                      const activeChild = isChildActive(child.href);
                      return <Link className={`nav-submenu-link${activeChild ? " active" : ""}`} href={child.href} aria-current={activeChild ? "page" : undefined} key={child.href} onClick={navigate} tabIndex={inlineExpanded ? 0 : -1}><span aria-hidden="true" />{child.label}</Link>;
                    })}
                  </div>
                </div>
              );
            }

            return (
              <button
                aria-expanded={item.expandable ? false : undefined}
                className="nav-button"
                data-sidebar-tooltip={item.label}
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
        <SidebarTooltipLayer enabled={isCollapsed && !openFlyout} root={sidebarRoot} variant="superadmin" />
      </aside>
      <SidebarFlyout
        anchor={openFlyout?.anchor ?? null}
        id={`sidebar-${openFlyout?.label.toLocaleLowerCase().replaceAll(" ", "-") ?? "navigation"}-flyout`}
        label={openFlyout?.label ?? "Navigation"}
        onClose={closeFlyout}
        open={Boolean(isCollapsed && openFlyout && flyoutItem?.children?.length)}
        variant="superadmin"
      >
        {flyoutItem?.children?.map((child) => {
          const active = isChildActive(child.href);
          return <Link className={active ? "active" : ""} href={child.href} aria-current={active ? "page" : undefined} key={child.href} onClick={navigate}><span aria-hidden="true" />{child.label}</Link>;
        })}
      </SidebarFlyout>
      <button className={`sidebar-backdrop${isOpen ? " open" : ""}`} type="button" aria-label="Close navigation" onClick={onNavigate} tabIndex={isOpen ? 0 : -1} />
    </>
  );
}
