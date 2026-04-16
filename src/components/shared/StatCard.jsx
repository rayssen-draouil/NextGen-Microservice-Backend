import { Icon } from '@iconify/react';

export default function StatCard({ icon, trend, label, value, tone = 'primary' }) {
  return (
    <div className="bg-card p-8 rounded-3xl border border-border shadow-sm hover:shadow-xl transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center group-hover:text-primary-foreground transition-all ${tone === 'secondary' ? 'bg-secondary/10 text-secondary group-hover:bg-secondary' : tone === 'tertiary' ? 'bg-tertiary/10 text-tertiary group-hover:bg-tertiary' : 'bg-primary/5 text-primary group-hover:bg-primary'}`}>
          <Icon icon={icon} className="text-3xl" />
        </div>
        <span className="text-tertiary text-xs font-bold bg-tertiary/10 px-2 py-1 rounded-full">{trend}</span>
      </div>
      <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-heading font-bold text-primary">{value}</p>
    </div>
  );
}
