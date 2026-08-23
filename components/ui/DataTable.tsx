interface DataTableColumn {
  id: string;
  label: string;
  screenReaderOnly?: boolean;
}

interface DataTableProps {
  columns: readonly DataTableColumn[];
  className: string;
  wrapperClassName: string;
  children: React.ReactNode;
}

export function DataTable({ columns, className, wrapperClassName, children }: DataTableProps) {
  return (
    <div className={wrapperClassName}>
      <table className={className}>
        <thead><tr>{columns.map((column) => <th scope="col" key={column.id}>{column.screenReaderOnly ? <span className="sr-only">{column.label}</span> : column.label}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
