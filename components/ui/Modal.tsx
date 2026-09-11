"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  panelClassName?: string;
  layerClassName?: string;
  showClose?: boolean;
  portal?: boolean;
  initialFocus?: "first" | "panel";
}

const focusableSelector = "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

export function Modal({ open, title, children, onClose, footer, panelClassName = "", layerClassName = "", showClose = true, portal = false, initialFocus = "first" }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    const firstFocusable = panel?.querySelector<HTMLElement>(focusableSelector);
    (initialFocus === "panel" ? panel : firstFocusable)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector));
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables.at(-1)!;
      if (document.activeElement === panel) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [initialFocus, open]);

  if (!open) return null;

  const modal = (
    <div className={`modal-layer${layerClassName ? ` ${layerClassName}` : ""}`} role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className={`modal-panel${panelClassName ? ` ${panelClassName}` : ""}`} role="dialog" aria-modal="true" aria-labelledby={titleId} ref={panelRef} tabIndex={initialFocus === "panel" ? -1 : undefined}>
        <header className="modal-header">
          <h2 id={titleId}>{title}</h2>
          {showClose ? <button className="modal-close" type="button" onClick={onClose} aria-label="Close dialog">×</button> : null}
        </header>
        <div className="modal-body">{children}</div>
        {footer ? <footer className="modal-footer">{footer}</footer> : null}
      </div>
    </div>
  );
  return portal ? createPortal(modal, document.body) : modal;
}
