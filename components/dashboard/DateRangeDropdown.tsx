"use client";

import { Dropdown } from "@/components/ui/Dropdown";
import { dateRanges } from "@/data/dashboard";

interface DateRangeDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placement: "sales" | "orders";
}

export function DateRangeDropdown({ value, onChange, placement }: DateRangeDropdownProps) {
  return (
    <Dropdown
      ariaLabel={`${placement === "sales" ? "Sales" : "Orders"} date range`}
      menuClassName="control-menu date-menu"
      trigger={({ isOpen, toggle, buttonRef, contentId }) => (
        <button className="date-button" type="button" aria-haspopup="menu" aria-expanded={isOpen} aria-controls={contentId} ref={buttonRef} onClick={toggle}>
          <span className="calendar-icon" aria-hidden="true" />
          <span className="date-label">{value}</span>
          <span className="down-chevron" aria-hidden="true" />
        </button>
      )}
    >
      {(close) => dateRanges.map((range) => (
        <button className={range === value ? "selected" : undefined} key={range} type="button" role="menuitemradio" aria-checked={range === value} onClick={() => {
          onChange(range);
          close();
        }}>{range}</button>
      ))}
    </Dropdown>
  );
}
