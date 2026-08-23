"use client";

import { EyeIcon, EyeOffIcon, TrashIcon } from "@/components/api-keys/ApiKeyIcons";
import { Pagination } from "@/components/ui/Pagination";
import type { ApiApplication } from "@/types/domain";
import { maskApiSecret } from "@/utils/api-applications";

interface ApiKeysTableProps {
  applications: readonly ApiApplication[];
  page: number;
  pageCount: number;
  pageSize: number;
  totalCount: number;
  revealedIds: ReadonlySet<string>;
  onPageChange: (page: number) => void;
  onToggleSecret: (id: string) => void;
  onRemove: (application: ApiApplication) => void;
}

export function ApiKeysTable({ applications, page, pageCount, pageSize, totalCount, revealedIds, onPageChange, onToggleSecret, onRemove }: ApiKeysTableProps) {
  const start = totalCount ? ((page - 1) * pageSize) + 1 : 0;
  const end = Math.min(page * pageSize, totalCount);
  const figmaEnd = page === 1 && totalCount > pageSize ? Math.min(pageSize + 1, totalCount) : end;

  return <>
    <div className="api-keys-table-wrap">
      <table className="api-keys-table">
        <thead><tr><th scope="col">App name<span className="api-sort" aria-hidden="true">⌃<i>⌄</i></span></th><th scope="col">API key<span className="api-sort" aria-hidden="true">⌃<i>⌄</i></span></th><th scope="col">API secret<span className="api-sort" aria-hidden="true">⌃<i>⌄</i></span></th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
        <tbody>{applications.map((application) => {
          const isRevealed = revealedIds.has(application.id);
          return <tr key={application.id}>
            <td data-label="App name">{application.name}</td>
            <td data-label="API key"><code>{application.apiKey}</code></td>
            <td data-label="API secret"><button className={`api-secret-toggle${isRevealed ? " revealed" : ""}`} type="button" aria-label={`${isRevealed ? "Hide" : "Show"} API secret for ${application.name}`} aria-pressed={isRevealed} onClick={() => onToggleSecret(application.id)}>{isRevealed ? <EyeOffIcon /> : <EyeIcon />}<code>{isRevealed ? application.apiSecret : maskApiSecret()}</code></button></td>
            <td data-label="Actions"><button className="api-remove-button" type="button" aria-label={`Remove API key ${application.apiKey}`} onClick={() => onRemove(application)}><TrashIcon /></button></td>
          </tr>;
        })}</tbody>
      </table>
    </div>
    <footer className="api-keys-table-footer"><span>Showing {start} to {figmaEnd} of {totalCount} entries</span><Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} ariaLabel="API key table pages" /></footer>
  </>;
}
