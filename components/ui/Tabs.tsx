"use client";

import { useId, useRef } from "react";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface TabsProps {
  items: readonly TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  ariaLabel: string;
}

export function Tabs({ items, value, onValueChange, ariaLabel }: TabsProps) {
  const baseId = useId();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = Math.max(0, items.findIndex((item) => item.id === value));

  const move = (nextIndex: number) => {
    const wrapped = (nextIndex + items.length) % items.length;
    onValueChange(items[wrapped].id);
    refs.current[wrapped]?.focus();
  };

  return (
    <div className="tabs">
      <div className="tabs-list" role="tablist" aria-label={ariaLabel}>
        {items.map((item, index) => (
          <button
            aria-controls={`${baseId}-${item.id}-panel`}
            aria-selected={index === selectedIndex}
            className="tabs-trigger"
            id={`${baseId}-${item.id}-tab`}
            key={item.id}
            onClick={() => onValueChange(item.id)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") move(selectedIndex + 1);
              if (event.key === "ArrowLeft") move(selectedIndex - 1);
              if (event.key === "Home") move(0);
              if (event.key === "End") move(items.length - 1);
            }}
            ref={(node) => { refs.current[index] = node; }}
            role="tab"
            tabIndex={index === selectedIndex ? 0 : -1}
            type="button"
          >
            {item.icon ? <span className="tabs-trigger-icon" aria-hidden="true">{item.icon}</span> : null}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      <div className="tabs-panel" id={`${baseId}-${items[selectedIndex].id}-panel`} role="tabpanel" aria-labelledby={`${baseId}-${items[selectedIndex].id}-tab`} tabIndex={0}>
        {items[selectedIndex].content}
      </div>
    </div>
  );
}
