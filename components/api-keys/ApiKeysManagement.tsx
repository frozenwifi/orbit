"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiApplicationModal } from "@/components/api-keys/ApiApplicationModal";
import { ExportIcon, SuccessIcon } from "@/components/api-keys/ApiKeyIcons";
import { ApiKeysTable } from "@/components/api-keys/ApiKeysTable";
import { RemoveApiKeyModal } from "@/components/api-keys/RemoveApiKeyModal";
import { OrbitFooter } from "@/components/dashboard/OrbitFooter";
import { useDomain } from "@/components/providers/DomainProvider";
import { useSearch } from "@/components/providers/SearchProvider";
import { Button } from "@/components/ui/Button";
import { CatalogToolbar } from "@/components/ui/CatalogToolbar";
import { CollectionState } from "@/components/ui/CollectionState";
import type { ApiApplication, NewApiApplicationInput } from "@/types/domain";
import { filterApiApplications } from "@/utils/api-applications";
import { downloadExcelTable } from "@/utils/export";

const PAGE_SIZE = 9;

export function ApiKeysManagement() {
  const { apiApplications, createApiApplication, revokeApiApplication } = useDomain();
  const { query, setQuery } = useSearch();
  const [collectionState, setCollectionState] = useState<"loading" | "ready" | "error">("loading");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [removeApplication, setRemoveApplication] = useState<ApiApplication | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => new Set(["APIAPP-1011"]));
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setCollectionState("ready"), 320);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => setPage(1), [query]);

  useEffect(() => {
    if (!showSuccess) return;
    const timer = window.setTimeout(() => setShowSuccess(false), 7000);
    return () => window.clearTimeout(timer);
  }, [showSuccess]);

  const filteredApplications = useMemo(() => filterApiApplications(apiApplications, query), [apiApplications, query]);
  const pageCount = Math.max(1, Math.ceil(filteredApplications.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleApplications = filteredApplications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const createApplication = (input: NewApiApplicationInput) => {
    const application = createApiApplication(input);
    setQuery("");
    setPage(1);
    setRevealedIds((current) => new Set([...current, application.id]));
    setCreateOpen(false);
    setShowSuccess(true);
  };

  const confirmRemove = () => {
    if (!removeApplication) return;
    revokeApiApplication(removeApplication.id);
    setRevealedIds((current) => {
      const next = new Set(current);
      next.delete(removeApplication.id);
      return next;
    });
    setRemoveApplication(null);
  };

  const exportApplications = () => downloadExcelTable("orbit-api-keys.xls", ["APP NAME", "API KEY", "API SECRET"], filteredApplications.map((application) => [application.name, application.apiKey, application.apiSecret]));

  return <div className="api-keys-page">
    <header className="api-keys-page-header">
      <h1>API keys</h1>
      {showSuccess ? <div className="api-success-notice" role="status"><SuccessIcon /><span>API has been successfully added and is now ready for use.</span></div> : <Button className="api-add-application" variant="primary" onClick={() => setCreateOpen(true)}>Add application</Button>}
    </header>
    <section className="card api-keys-card" aria-label="API applications">
      <CatalogToolbar className="api-keys-toolbar" query={query} onQueryChange={(value) => { setQuery(value); setPage(1); }} onSearch={() => setPage(1)} onExport={exportApplications} entityLabel="API applications" exportIcon={<ExportIcon className="api-export-icon" />} />
      {collectionState === "loading" ? <CollectionState kind="loading" entityLabel="API applications" /> : collectionState === "error" ? <CollectionState kind="error" entityLabel="API applications" actionLabel="Try again" onAction={() => setCollectionState("ready")} /> : filteredApplications.length === 0 ? <CollectionState kind="empty" entityLabel="API applications" title="No matching applications" message="No API applications match this search." actionLabel="Clear search" onAction={() => setQuery("")} /> : <ApiKeysTable applications={visibleApplications} page={currentPage} pageCount={pageCount} pageSize={PAGE_SIZE} totalCount={filteredApplications.length} onPageChange={setPage} revealedIds={revealedIds} onToggleSecret={(id) => setRevealedIds((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; })} onRemove={setRemoveApplication} />}
    </section>
    <OrbitFooter />
    <ApiApplicationModal open={isCreateOpen} onClose={() => setCreateOpen(false)} onCreate={createApplication} />
    <RemoveApiKeyModal application={removeApplication} onClose={() => setRemoveApplication(null)} onConfirm={confirmRemove} />
  </div>;
}
