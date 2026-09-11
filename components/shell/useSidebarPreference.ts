"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";

export type SidebarScope = "superadmin" | "admin";

const sidebarPreference = {
  superadmin: {
    attribute: "orbitSidebar",
    storageKey: "orbit-superadmin-sidebar",
  },
  admin: {
    attribute: "adminSidebar",
    storageKey: "orbit-admin-sidebar",
  },
} as const;

function readPreference(scope: SidebarScope) {
  const config = sidebarPreference[scope];
  return document.documentElement.dataset[config.attribute] === "collapsed";
}

function writePreference(scope: SidebarScope, collapsed: boolean) {
  const config = sidebarPreference[scope];
  const value = collapsed ? "collapsed" : "expanded";
  document.documentElement.dataset[config.attribute] = value;
  try {
    window.localStorage.setItem(config.storageKey, value);
  } catch {
    // Keep the current-session preference even when storage is unavailable.
  }
}

export function useSidebarPreference(scope: SidebarScope) {
  // Expanded matches the server-rendered accessibility state. The layout bootstrap
  // attribute applies a saved visual preference before first paint; this state is
  // synchronized in a layout effect before the hydrated UI becomes interactive.
  const [isPreferenceCollapsed, setIsPreferenceCollapsed] = useState(false);
  const [supportsCollapse, setSupportsCollapse] = useState(false);

  useLayoutEffect(() => {
    const media = window.matchMedia("(min-width: 721px)");
    const syncViewport = () => setSupportsCollapse(media.matches);
    setIsPreferenceCollapsed(readPreference(scope));
    syncViewport();
    media.addEventListener("change", syncViewport);
    return () => media.removeEventListener("change", syncViewport);
  }, [scope]);

  useEffect(() => {
    const config = sidebarPreference[scope];
    const syncAcrossTabs = (event: StorageEvent) => {
      if (event.key !== config.storageKey) return;
      const collapsed = event.newValue === "collapsed";
      document.documentElement.dataset[config.attribute] = collapsed ? "collapsed" : "expanded";
      setIsPreferenceCollapsed(collapsed);
    };

    window.addEventListener("storage", syncAcrossTabs);
    return () => window.removeEventListener("storage", syncAcrossTabs);
  }, [scope]);

  const toggle = useCallback(() => {
    setIsPreferenceCollapsed((current) => {
      const next = !current;
      writePreference(scope, next);
      return next;
    });
  }, [scope]);

  return { isCollapsed: supportsCollapse && isPreferenceCollapsed, toggle };
}
