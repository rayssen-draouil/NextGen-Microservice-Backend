import { Icon } from '@iconify/react';

export default function OrderStatusStep({ active, complete, title, time }) {
  return (
    <div className={`flex gap-6 relative ${!active && !complete ? 'opacity-40' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 shadow-lg border-4 border-background ${complete ? 'bg-primary text-primary-foreground' : active ? 'bg-secondary text-secondary-foreground animate-pulse' : 'bg-muted text-muted-foreground'}`}>
        <Icon icon={complete ? 'lucide:check' : active ? 'lucide:truck' : 'lucide:circle'} className="text-sm" />
      </div>
      <div className="flex-grow pt-0.5">
        <p className="text-sm font-bold text-primary">{title}</p>
        <p className={`text-xs ${active ? 'text-secondary font-bold uppercase tracking-wider' : 'text-muted-foreground'}`}>{time}</p>
      </div>
    </div>
  );
}
