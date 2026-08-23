"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

interface TriggerState {
  isOpen: boolean;
  toggle: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  contentId: string;
}

interface DropdownProps {
  ariaLabel: string;
  className?: string;
  menuClassName?: string;
  contentRole?: "menu" | "dialog";
  trigger: (state: TriggerState) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  onOpenChange?: (isOpen: boolean) => void;
}

export function Dropdown({ ariaLabel, className = "control-wrap", menuClassName = "control-menu", contentRole = "menu", trigger, children, onOpenChange }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<"down" | "up">("down");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentId = useId();

  const setOpen = useCallback((next: boolean) => {
    if (next) setPlacement("down");
    setIsOpen(next);
    onOpenChange?.(next);
  }, [onOpenChange]);

  const close = useCallback(() => setOpen(false), [setOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (contentRole === "menu") {
      window.requestAnimationFrame(() => contentRef.current?.querySelector<HTMLElement>("[role='menuitem'], [role='menuitemradio']")?.focus());
    }
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [close, contentRole, isOpen]);

  const triggerNode = trigger({ isOpen, toggle: () => setOpen(!isOpen), buttonRef: triggerRef, contentId });

  useLayoutEffect(() => {
    if (!isOpen || !contentRef.current || !rootRef.current) return;
    const contentBox = contentRef.current.getBoundingClientRect();
    const rootBox = rootRef.current.getBoundingClientRect();
    if (contentBox.bottom > window.innerHeight - 8 && rootBox.top > contentBox.height + 8) setPlacement("up");
  }, [isOpen]);

  return (
    <div className={className} ref={rootRef}>
      {triggerNode}
      {isOpen ? (
        <div className={`${menuClassName} open${placement === "up" ? " drop-up" : ""}`} id={contentId} role={contentRole} aria-label={ariaLabel} ref={contentRef} onKeyDown={(event) => {
          if (contentRole !== "menu" || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
          const items = Array.from(contentRef.current?.querySelectorAll<HTMLElement>("[role='menuitem'], [role='menuitemradio']") ?? []);
          if (!items.length) return;
          event.preventDefault();
          const currentIndex = Math.max(0, items.indexOf(document.activeElement as HTMLElement));
          const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : event.key === "ArrowDown" ? (currentIndex + 1) % items.length : (currentIndex - 1 + items.length) % items.length;
          items[nextIndex]?.focus();
        }}>
          {children(close)}
        </div>
      ) : null}
    </div>
  );
}
