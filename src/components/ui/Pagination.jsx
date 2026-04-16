export default function Pagination({ page = 1, total = 12 }) {
  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <button type="button" className="w-10 h-10 rounded-xl border border-border hover:bg-muted transition-all">&lt;</button>
      <button type="button" className="w-10 h-10 rounded-xl bg-primary text-primary-foreground font-bold">{page}</button>
      <button type="button" className="w-10 h-10 rounded-xl border border-border font-bold hover:bg-muted transition-all">2</button>
      <span className="px-2 text-muted-foreground">...</span>
      <button type="button" className="w-10 h-10 rounded-xl border border-border font-bold hover:bg-muted transition-all">{total}</button>
      <button type="button" className="w-10 h-10 rounded-xl border border-border hover:bg-muted transition-all">&gt;</button>
    </div>
  );
}
