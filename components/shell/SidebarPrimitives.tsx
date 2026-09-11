"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface SidebarCollapseButtonProps {
  isCollapsed: boolean;
  label: string;
  onToggle: () => void;
  variant: "superadmin" | "admin";
}

export function SidebarCollapseButton({ isCollapsed, label, onToggle, variant }: SidebarCollapseButtonProps) {
  return (
    <button
      aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${label}`}
      aria-pressed={isCollapsed}
      className={`sidebar-collapse-toggle sidebar-collapse-toggle--${variant}`}
      onClick={onToggle}
      type="button"
    >
      <span aria-hidden="true" />
    </button>
  );
}

interface SidebarTooltipLayerProps {
  enabled: boolean;
  root: HTMLElement | null;
  variant: "superadmin" | "admin";
}

interface TooltipState {
  label: string;
  left: number;
  top: number;
}

export function SidebarTooltipLayer({ enabled, root, variant }: SidebarTooltipLayerProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  useEffect(() => {
    if (!enabled || !root) {
      setTooltip(null);
      return;
    }

    let describedItem: HTMLElement | null = null;
    const tooltipId = `sidebar-navigation-tooltip-${variant}`;
    const show = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return;
      const item = target.closest<HTMLElement>("[data-sidebar-tooltip]");
      if (!item || !root.contains(item)) return;
      describedItem?.removeAttribute("aria-describedby");
      describedItem = item;
      describedItem.setAttribute("aria-describedby", tooltipId);
      const bounds = item.getBoundingClientRect();
      setTooltip({
        label: item.dataset.sidebarTooltip ?? "",
        left: bounds.right + 13,
        top: bounds.top + bounds.height / 2,
      });
    };

    const hide = (event: FocusEvent | MouseEvent) => {
      const next = event.relatedTarget;
      if (next instanceof Node && root.contains(next)) {
        const nextItem = next instanceof Element ? next.closest("[data-sidebar-tooltip]") : null;
        if (nextItem) {
          show(next);
          return;
        }
      }
      describedItem?.removeAttribute("aria-describedby");
      describedItem = null;
      setTooltip(null);
    };

    const onPointerOver = (event: PointerEvent) => show(event.target);
    const onFocusIn = (event: FocusEvent) => show(event.target);
    root.addEventListener("pointerover", onPointerOver);
    root.addEventListener("pointerout", hide);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", hide);

    return () => {
      describedItem?.removeAttribute("aria-describedby");
      root.removeEventListener("pointerover", onPointerOver);
      root.removeEventListener("pointerout", hide);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", hide);
    };
  }, [enabled, root]);

  if (!enabled || !tooltip || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`sidebar-nav-tooltip sidebar-nav-tooltip--${variant}`}
      id={`sidebar-navigation-tooltip-${variant}`}
      role="tooltip"
      style={{ left: tooltip.left, top: tooltip.top }}
    >
      {tooltip.label}
    </div>,
    document.body,
  );
}

interface SidebarFlyoutProps {
  anchor: HTMLElement | null;
  children: React.ReactNode;
  id: string;
  label: string;
  onClose: () => void;
  open: boolean;
  variant: "superadmin" | "admin";
}

export function SidebarFlyout({ anchor, children, id, label, onClose, open, variant }: SidebarFlyoutProps) {
  const flyoutRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 105, top: 100 });

  useLayoutEffect(() => {
    if (!open || !anchor) return;

    const updatePosition = () => {
      const bounds = anchor.getBoundingClientRect();
      const estimatedHeight = flyoutRef.current?.offsetHeight ?? 120;
      setPosition({
        left: bounds.right + 13,
        top: Math.max(12, Math.min(bounds.top, window.innerHeight - estimatedHeight - 12)),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    const frame = window.requestAnimationFrame(() => {
      updatePosition();
      flyoutRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchor, open]);

  useEffect(() => {
    if (!open || !anchor) return;

    const closeFromOutside = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (anchor.contains(event.target) || flyoutRef.current?.contains(event.target)) return;
      onClose();
    };
    const closeFromKeyboard = (event: KeyboardEvent) => {
      const flyout = flyoutRef.current;
      const items = flyout ? Array.from(flyout.querySelectorAll<HTMLElement>("a, button")) : [];
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        anchor.focus();
        return;
      }

      if (!flyout?.contains(document.activeElement) || currentIndex < 0) return;

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        items[(currentIndex + direction + items.length) % items.length]?.focus();
        return;
      }

      if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        items[event.key === "Home" ? 0 : items.length - 1]?.focus();
        return;
      }

      if (event.key === "Tab" && event.shiftKey && currentIndex === 0) {
        event.preventDefault();
        onClose();
        anchor.focus();
        return;
      }

      if (event.key === "Tab" && !event.shiftKey && currentIndex === items.length - 1) {
        event.preventDefault();
        const sidebarItems = Array.from(anchor.closest("aside")?.querySelectorAll<HTMLElement>("[data-sidebar-tooltip]") ?? []);
        const next = sidebarItems[sidebarItems.indexOf(anchor) + 1];
        onClose();
        (next ?? anchor).focus();
      }
    };

    document.addEventListener("pointerdown", closeFromOutside);
    document.addEventListener("keydown", closeFromKeyboard);
    return () => {
      document.removeEventListener("pointerdown", closeFromOutside);
      document.removeEventListener("keydown", closeFromKeyboard);
    };
  }, [anchor, onClose, open]);

  if (!open || !anchor || typeof document === "undefined") return null;

  return createPortal(
    <div
      aria-label={`${label} navigation`}
      className={`sidebar-nav-flyout sidebar-nav-flyout--${variant}`}
      id={id}
      ref={flyoutRef}
      role="group"
      style={position}
    >
      <strong>{label}</strong>
      <div>{children}</div>
    </div>,
    document.body,
  );
}
