"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export interface CatalogToolbarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  onExport: () => void;
  entityLabel: string;
  className?: string;
  exportIcon?: ReactNode;
}

export function CatalogToolbar({ query, onQueryChange, onSearch, onExport, entityLabel, className = "", exportIcon }: CatalogToolbarProps) {
  return <div className={`network-catalog-toolbar orbit-catalog-toolbar${className ? ` ${className}` : ""}`}>
    <label className="network-catalog-search"><span className="search-icon" aria-hidden="true" /><span className="sr-only">Search {entityLabel}</span><input type="search" value={query} onChange={(event) => onQueryChange(event.currentTarget.value)} onKeyDown={(event) => { if (event.key === "Enter") onSearch(); }} placeholder="Search" />{query ? <button type="button" aria-label={`Clear ${entityLabel} search`} onClick={() => onQueryChange("")}>×</button> : null}</label>
    <Button className="network-search-submit" variant="primary" aria-label={`Search ${entityLabel}`} onClick={onSearch}><span className="search-icon" aria-hidden="true" /></Button>
    <Button className="network-export-button" onClick={onExport}>{exportIcon ?? <span className="network-export-icon" aria-hidden="true">⇧</span>}Export excel</Button>
  </div>;
}
