"use client";

import { Dropdown } from "@/components/ui/Dropdown";
import { usePathname } from "next/navigation";
import { useSearch } from "@/components/providers/SearchProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useToast } from "@/components/providers/ToastProvider";

interface TopbarProps {
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

export function Topbar({ isMobileMenuOpen, onMobileMenuToggle }: TopbarProps) {
  const pathname = usePathname();
  const { query, setQuery } = useSearch();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const searchLabel = pathname.startsWith("/api-keys") ? "Search API applications" : pathname.startsWith("/operations") ? "Search operations" : pathname.startsWith("/networks") ? "Search networks" : pathname.startsWith("/data-plans") ? "Search data plans" : pathname.startsWith("/customers") ? "Search customers" : pathname.startsWith("/esims") ? "Search eSIMs" : "Search orders";

  return (
    <header className="topbar">
      <div className="search-box">
        <button className="mobile-menu-button" type="button" aria-label={isMobileMenuOpen ? "Close navigation" : "Open navigation"} aria-expanded={isMobileMenuOpen} onClick={onMobileMenuToggle}>☰</button>
        <span className="search-icon" aria-hidden="true" />
        <input type="search" placeholder="Type to search..." aria-label={searchLabel} autoComplete="off" value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
      </div>
      <div className="top-actions">
        <button className="theme-toggle" type="button" aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} aria-pressed={theme === "dark"} onClick={toggleTheme}>
          <span className="theme-knob" aria-hidden="true" />
        </button>
        <Dropdown
          ariaLabel="Notifications"
          className="notification-wrap"
          contentRole="dialog"
          menuClassName="notification-panel"
          trigger={({ isOpen, toggle, buttonRef, contentId }) => (
            <button className="icon-button notification-button" type="button" aria-label="Open notifications" aria-expanded={isOpen} aria-controls={contentId} ref={buttonRef} onClick={toggle}>
              <span className="chat-glyph" aria-hidden="true" />
              <span className="notification-dot" aria-hidden="true" />
            </button>
          )}
        >
          {() => (
            <>
              <strong>Dashboard report ready</strong>
              <p>Your weekly sales report is ready to export. No other alerts require attention.</p>
            </>
          )}
        </Dropdown>
        <Dropdown
          ariaLabel="Profile menu"
          className="profile-wrap"
          menuClassName="profile-menu"
          trigger={({ isOpen, toggle, buttonRef, contentId }) => (
            <button className="profile-button" type="button" aria-label="Open profile menu" aria-haspopup="menu" aria-expanded={isOpen} aria-controls={contentId} ref={buttonRef} onClick={toggle}>
              <span className="profile-copy">
                <span className="profile-name">Jane Doe</span>
                <span className="profile-role">Superadmin</span>
              </span>
              <img className="avatar" src="/assets/jane-doe.jpg" alt="Jane Doe" />
              <span className="profile-chevron" aria-hidden="true">⌄</span>
            </button>
          )}
        >
          {(close) => (
            <>
              {[["profile", "View profile"], ["settings", "Account settings"], ["signout", "Sign out"]].map(([action, label]) => (
                <button key={action} type="button" role="menuitem" onClick={() => {
                  close();
                  showToast(action === "signout" ? "Sign out is disabled in this prototype." : `${label} selected`);
                }}>{label}</button>
              ))}
            </>
          )}
        </Dropdown>
      </div>
    </header>
  );
}
