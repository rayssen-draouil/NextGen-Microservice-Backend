export default function DataTable({ headers, rows, renderRow }) {
  return (
    <div className="bg-card rounded-3xl border border-border p-6 overflow-x-auto">
      <table className="w-full text-left min-w-[760px]">
        <thead>
          <tr className="text-muted-foreground text-sm">
            {headers.map((header) => (
              <th key={header} className="py-3">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>{rows.map(renderRow)}</tbody>
      </table>
    </div>
  );
}
