"use client";

import { Dropdown } from "@/components/ui/Dropdown";
import { useSearch } from "@/components/providers/SearchProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useToast } from "@/components/providers/ToastProvider";

interface AdminTopbarProps {
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

export function AdminTopbar({ isMobileMenuOpen, onMobileMenuToggle }: AdminTopbarProps) {
  const { query, setQuery } = useSearch();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  return (
    <header className="admin-topbar">
      <div className="admin-search-box">
        <button className="admin-mobile-menu-button" type="button" aria-label={isMobileMenuOpen ? "Close Admin navigation" : "Open Admin navigation"} aria-expanded={isMobileMenuOpen} onClick={onMobileMenuToggle}>
          <span aria-hidden="true" />
        </button>
        <span className="admin-search-icon" aria-hidden="true" />
        <input type="search" placeholder="Type to search..." aria-label="Search Admin orders" autoComplete="off" value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
      </div>
      <div className="admin-top-actions">
        <button className="admin-theme-toggle" type="button" aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} aria-pressed={theme === "dark"} onClick={toggleTheme}>
          <span className="admin-theme-knob" aria-hidden="true" />
        </button>
        <Dropdown
          ariaLabel="Admin notifications"
          className="admin-notification-wrap"
          contentRole="dialog"
          menuClassName="admin-notification-panel"
          trigger={({ isOpen, toggle, buttonRef, contentId }) => (
            <button className="admin-icon-button" type="button" aria-label="Open notifications" aria-expanded={isOpen} aria-controls={contentId} ref={buttonRef} onClick={toggle}>
              <span className="admin-chat-glyph" aria-hidden="true" />
              <span className="admin-notification-dot" aria-hidden="true" />
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
          ariaLabel="Admin profile menu"
          className="admin-profile-wrap"
          menuClassName="admin-profile-menu"
          trigger={({ isOpen, toggle, buttonRef, contentId }) => (
            <button className="admin-profile-button" type="button" aria-label="Open profile menu" aria-haspopup="menu" aria-expanded={isOpen} aria-controls={contentId} ref={buttonRef} onClick={toggle}>
              <span className="admin-profile-copy">
                <span className="admin-profile-name">Jane Doe</span>
                <span className="admin-profile-role">Admin</span>
              </span>
              <img className="admin-avatar" src="/assets/jane-doe.jpg" alt="Jane Doe" />
              <span className="admin-profile-chevron" aria-hidden="true" />
            </button>
          )}
        >
          {(close) => (
            <>
              {["View profile", "Account settings", "Sign out"].map((label) => (
                <button key={label} type="button" role="menuitem" onClick={() => {
                  close();
                  showToast(label === "Sign out" ? "Sign out is disabled in this prototype." : `${label} selected`);
                }}>{label}</button>
              ))}
            </>
          )}
        </Dropdown>
      </div>
    </header>
  );
}
