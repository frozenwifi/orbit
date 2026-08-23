interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  ariaLabel: string;
}

export function Pagination({ page, pageCount, onPageChange, ariaLabel }: PaginationProps) {
  if (pageCount < 1) return null;
  return (
    <div className="pager" aria-label={ariaLabel}>
      <button className="pager-button prev" type="button" aria-label="Previous page" disabled={page === 1} onClick={() => onPageChange(page - 1)}>‹</button>
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
        <button className={`pager-button page${page === pageNumber ? " active" : ""}`} key={pageNumber} type="button" aria-current={page === pageNumber ? "page" : undefined} aria-label={`Page ${pageNumber}`} onClick={() => onPageChange(pageNumber)}>{pageNumber}</button>
      ))}
      <button className="pager-button next" type="button" aria-label="Next page" disabled={page === pageCount} onClick={() => onPageChange(page + 1)}>›</button>
    </div>
  );
}
