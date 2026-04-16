import clsx from 'clsx';

export default function Stepper({ steps }) {
  return (
    <div className="space-y-8 relative">
      <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-muted"></div>
      {steps.map((step) => (
        <div key={step.id} className={clsx('flex gap-6 relative', step.status === 'pending' && 'opacity-40')}>
          <div className="relative z-10">
            <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-4 border-background', step.status === 'complete' && 'bg-primary text-primary-foreground', step.status === 'active' && 'bg-secondary text-secondary-foreground', step.status === 'pending' && 'bg-muted text-muted-foreground')}>
              {step.icon}
            </div>
          </div>
          <div className="flex-grow pt-0.5">
            <p className="text-sm font-bold text-primary">{step.label}</p>
            <p className={clsx('text-xs', step.status === 'active' ? 'text-secondary font-bold uppercase tracking-wider' : 'text-muted-foreground')}>
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
