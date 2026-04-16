import clsx from 'clsx';

export default function StatusDot({ label, tone = 'success', pulse = false }) {
  const toneClass = {
    success: 'bg-tertiary',
    warning: 'bg-secondary',
    error: 'bg-destructive',
    muted: 'bg-muted-foreground',
  }[tone];

  return (
    <div className="flex items-center gap-2">
      <span className={clsx('w-2 h-2 rounded-full', toneClass, pulse && 'animate-pulse')}></span>
      <span className="text-[10px] font-bold uppercase">{label}</span>
    </div>
  );
}
