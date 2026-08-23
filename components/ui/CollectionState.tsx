import { Button } from "@/components/ui/Button";

interface CollectionStateProps {
  kind: "loading" | "empty" | "error";
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  entityLabel?: string;
}

export function CollectionState({ kind, title, message, actionLabel, onAction, entityLabel = "eSIMs" }: CollectionStateProps) {
  if (kind === "loading") {
    return (
      <div className="collection-state loading" role="status" aria-label={`Loading ${entityLabel}`}>
        <span className="loading-spinner" aria-hidden="true" />
        <strong>Loading {entityLabel}</strong>
        <span>Preparing the latest {entityLabel.toLocaleLowerCase()}…</span>
        <div className="loading-lines" aria-hidden="true"><i /><i /><i /></div>
      </div>
    );
  }

  const isError = kind === "error";
  return (
    <div className={`collection-state ${kind}`} role={isError ? "alert" : "status"}>
      <span className="collection-state-icon" aria-hidden="true">{isError ? "!" : "⌁"}</span>
      <strong>{title ?? (isError ? `Unable to load ${entityLabel}` : `No ${entityLabel} found`)}</strong>
      <span>{message ?? (isError ? "Something went wrong while preparing this view." : "Try adjusting your search or filters.")}</span>
      {actionLabel && onAction ? <Button compact onClick={onAction}>{actionLabel}</Button> : null}
    </div>
  );
}
