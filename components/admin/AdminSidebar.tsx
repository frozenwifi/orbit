"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { adminNavigationItems } from "@/data/admin-dashboard";
import { SidebarCollapseButton, SidebarFlyout, SidebarTooltipLayer } from "@/components/shell/SidebarPrimitives";

interface AdminSidebarProps {
  isCollapsed: boolean;
  isOpen: boolean;
  onCollapseToggle: () => void;
  onNavigate: () => void;
}

interface OpenAdminFlyout {
  anchor: HTMLButtonElement;
  label: string;
}

function iconStyle(asset: string): CSSProperties {
  return {
    WebkitMaskImage: `url(/assets/admin/nav-${asset}.png)`,
    maskImage: `url(/assets/admin/nav-${asset}.png)`,
  };
}

export function AdminSidebar({ isCollapsed, isOpen, onCollapseToggle, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isEmptyRoute, setIsEmptyRoute] = useState(false);
  const [openFlyout, setOpenFlyout] = useState<OpenAdminFlyout | null>(null);
  const [sidebarRoot, setSidebarRoot] = useState<HTMLElement | null>(null);

  useEffect(() => setIsEmptyRoute(new URLSearchParams(window.location.search).get("state") === "empty"), []);
  useEffect(() => setOpenFlyout(null), [pathname]);
  useEffect(() => {
    if (!isCollapsed) setOpenFlyout(null);
  }, [isCollapsed]);

  const closeFlyout = useCallback(() => setOpenFlyout(null), []);
  const navigate = useCallback(() => {
    setOpenFlyout(null);
    onNavigate();
  }, [onNavigate]);
  const flyoutItem = openFlyout ? adminNavigationItems.find((item) => item.label === openFlyout.label) : undefined;
  const networkChildren = [
    { label: "Regions", href: "/admin/networks" },
    { label: "Network operators", href: "/admin/networks/operators" },
  ] as const;

  return (
    <>
      <aside className={`admin-sidebar${isOpen ? " open" : ""}`} aria-label="Admin navigation" ref={setSidebarRoot}>
        <Link className="admin-brand" href="/admin" aria-label="Orbit Admin home" onClick={navigate}>
          <span className="admin-sidebar-brand-clip"><span className="admin-brand-mark" aria-hidden="true" /></span>
          <span className="sr-only">Orbit</span>
        </Link>
        <SidebarCollapseButton
          isCollapsed={isCollapsed}
          label="Admin navigation"
          onToggle={() => {
            closeFlyout();
            onCollapseToggle();
          }}
          variant="admin"
        />
        <nav className="admin-sidebar-nav">
          {adminNavigationItems.map((item) => {
            const label = item.label === "API keys" && theme === "light" ? "API" : item.label;
            const isDashboard = item.label === "Dashboard";
            const isEsims = item.label === "eSIMs";
            const isCustomers = item.label === "Customers";
            const isDataPlans = item.label === "Data plans";
            const isNetworks = item.label === "Networks";
            const isBilling = item.label === "Billing";
            const isNetworksRoute = pathname.startsWith("/admin/networks");
            const isExpanded = expandedItems.has(item.label) || (isNetworks && isNetworksRoute);
            const content = (
              <>
                <span className="admin-nav-icon" aria-hidden="true" style={iconStyle(item.asset)} />
                <span className="admin-nav-label">{label}</span>
                {item.expandable ? <span className="admin-nav-chevron" aria-hidden="true" /> : <span className="admin-nav-end-spacer" />}
              </>
            );

            if (isDashboard) {
              const showActiveState = pathname === "/admin" && !(theme === "light" && isEmptyRoute);
              return (
                <Link className={`admin-nav-button${showActiveState ? " active" : ""}`} data-sidebar-tooltip={item.label} href="/admin" aria-current={showActiveState ? "page" : undefined} key={item.label} onClick={navigate}>
                  {content}
                </Link>
              );
            }

            if (isEsims) {
              const active = pathname.startsWith("/admin/esims");
              return (
                <Link className={`admin-nav-button${active ? " active" : ""}`} data-sidebar-tooltip={item.label} href="/admin/esims" aria-current={active ? "page" : undefined} key={item.label} onClick={navigate}>
                  {content}
                </Link>
              );
            }

            if (isCustomers) {
              const active = pathname.startsWith("/admin/customers");
              return (
                <Link className={`admin-nav-button${active ? " active" : ""}`} data-sidebar-tooltip={item.label} href="/admin/customers" aria-current={active ? "page" : undefined} key={item.label} onClick={navigate}>
                  {content}
                </Link>
              );
            }

            if (isBilling) {
              const active = pathname.startsWith("/admin/billing");
              return (
                <Link className={`admin-nav-button${active ? " active" : ""}`} data-sidebar-tooltip={item.label} href="/admin/billing" aria-current={active ? "page" : undefined} key={item.label} onClick={navigate}>
                  {content}
                </Link>
              );
            }

            if (isDataPlans) {
              const active = pathname.startsWith("/admin/data-plans");
              return (
                <Link className={`admin-nav-button${active ? " active" : ""}`} data-sidebar-tooltip={item.label} href="/admin/data-plans" aria-current={active ? "page" : undefined} key={item.label} onClick={navigate}>
                  {content}
                </Link>
              );
            }

            if (isNetworks) {
              const submenuId = "admin-networks-submenu";
              const flyoutOpen = isCollapsed && openFlyout?.label === item.label;
              const inlineExpanded = !isCollapsed && isExpanded;
              return (
                <div className="admin-nav-group" key={item.label}>
                  <button
                    className={`admin-nav-button${isNetworksRoute ? " active" : ""}${inlineExpanded || flyoutOpen ? " expanded" : ""}`}
                    data-sidebar-tooltip={item.label}
                    type="button"
                    aria-expanded={isCollapsed ? flyoutOpen : isExpanded}
                    aria-controls={`${submenuId}-${isCollapsed ? "flyout" : "inline"}`}
                    onClick={(event) => {
                      if (isCollapsed) {
                        setOpenFlyout((current) => current?.label === item.label ? null : { anchor: event.currentTarget, label: item.label });
                        return;
                      }
                      setExpandedItems((current) => {
                        const next = new Set(current);
                        if (isNetworksRoute) return next;
                        if (next.has(item.label)) next.delete(item.label); else next.add(item.label);
                        return next;
                      });
                    }}
                  >
                    {content}
                  </button>
                  <div className={`admin-nav-submenu${inlineExpanded ? " expanded" : ""}`} id={`${submenuId}-inline`} aria-hidden={!inlineExpanded} inert={!inlineExpanded ? true : undefined}>
                    {networkChildren.map((child) => {
                      const active = pathname === child.href;
                      return <Link className={active ? "active" : ""} href={child.href} aria-current={active ? "page" : undefined} tabIndex={inlineExpanded ? 0 : -1} key={child.href} onClick={navigate}><span aria-hidden="true" />{child.label}</Link>;
                    })}
                  </div>
                </div>
              );
            }

            if (item.expandable) {
              const submenuId = `admin-${item.asset}-submenu`;
              const flyoutOpen = isCollapsed && openFlyout?.label === item.label;
              const inlineExpanded = !isCollapsed && isExpanded;
              return (
                <div className="admin-nav-group" key={item.label}>
                  <button
                    className={`admin-nav-button${inlineExpanded || flyoutOpen ? " expanded" : ""}`}
                    data-sidebar-tooltip={item.label}
                    type="button"
                    aria-expanded={isCollapsed ? flyoutOpen : isExpanded}
                    aria-controls={`${submenuId}-${isCollapsed ? "flyout" : "inline"}`}
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
                  >
                    {content}
                  </button>
                  <div className={`admin-nav-submenu${inlineExpanded ? " expanded" : ""}`} id={`${submenuId}-inline`} aria-hidden={!inlineExpanded} inert={!inlineExpanded ? true : undefined}>
                    {item.children?.map((child) => (
                      <button type="button" tabIndex={inlineExpanded ? 0 : -1} key={child} onClick={() => showToast(`${child} will be added in a future Admin phase.`)}>
                        <span aria-hidden="true" />{child}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <button className="admin-nav-button" data-sidebar-tooltip={item.label} key={item.label} type="button" onClick={() => showToast(`${item.label} will be added in a future Admin phase.`)}>
                {content}
              </button>
            );
          })}
        </nav>
        <SidebarTooltipLayer enabled={isCollapsed && !openFlyout} root={sidebarRoot} variant="admin" />
      </aside>
      <SidebarFlyout
        anchor={openFlyout?.anchor ?? null}
        id={`admin-${openFlyout?.label.toLocaleLowerCase().replaceAll(" ", "-") ?? "navigation"}-submenu-flyout`}
        label={openFlyout?.label ?? "Navigation"}
        onClose={closeFlyout}
        open={Boolean(isCollapsed && openFlyout && flyoutItem?.children?.length)}
        variant="admin"
      >
        {openFlyout?.label === "Networks" ? networkChildren.map((child) => {
          const active = pathname === child.href;
          return <Link className={active ? "active" : ""} href={child.href} aria-current={active ? "page" : undefined} key={child.href} onClick={navigate}><span aria-hidden="true" />{child.label}</Link>;
        }) : flyoutItem?.children?.map((child) => (
          <button type="button" key={child} onClick={() => {
            closeFlyout();
            showToast(`${child} will be added in a future Admin phase.`);
          }}><span aria-hidden="true" />{child}</button>
        ))}
      </SidebarFlyout>
      <button className={`admin-sidebar-backdrop${isOpen ? " open" : ""}`} type="button" aria-label="Close Admin navigation" onClick={onNavigate} tabIndex={isOpen ? 0 : -1} />
    </>
  );
}
