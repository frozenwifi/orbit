"use client";

import type { KeyboardEvent } from "react";
import type { NetworkRegion } from "@/types/domain";

export const networkRegionTabs = ["Default", "Europe", "Asia", "Latin America", "Caribbean", "Middle East", "Balkans", "Caucasus"] as const satisfies readonly NetworkRegion[];

interface NetworkRegionTabsProps {
  value: NetworkRegion;
  onChange: (value: NetworkRegion) => void;
}

export function NetworkRegionTabs({ value, onChange }: NetworkRegionTabsProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const currentIndex = networkRegionTabs.indexOf(value);
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? networkRegionTabs.length - 1 : event.key === "ArrowRight" ? (currentIndex + 1) % networkRegionTabs.length : (currentIndex - 1 + networkRegionTabs.length) % networkRegionTabs.length;
    event.preventDefault();
    onChange(networkRegionTabs[nextIndex]);
    requestAnimationFrame(() => document.getElementById(`network-region-${nextIndex}`)?.focus());
  };

  return <div className="network-region-tabs-scroll"><div className="network-region-tabs" role="tablist" aria-label="Geographic network region" onKeyDown={handleKeyDown}>
    {networkRegionTabs.map((region, index) => <button id={`network-region-${index}`} role="tab" type="button" aria-selected={region === value} tabIndex={region === value ? 0 : -1} className="network-region-tab" key={region} onClick={() => onChange(region)}>{region}</button>)}
  </div></div>;
}
