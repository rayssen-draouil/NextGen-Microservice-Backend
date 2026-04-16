import { Icon } from '@iconify/react';

export default function QuantitySelector({ value, onDecrement, onIncrement }) {
  return (
    <div className="flex items-center bg-muted rounded-full p-1 border border-border">
      <button type="button" onClick={onDecrement} className="w-8 h-8 flex items-center justify-center hover:bg-card rounded-full transition-colors">
        <Icon icon="lucide:minus" />
      </button>
      <span className="px-4 font-bold text-sm">{value}</span>
      <button type="button" onClick={onIncrement} className="w-8 h-8 flex items-center justify-center hover:bg-card rounded-full transition-colors">
        <Icon icon="lucide:plus" />
      </button>
    </div>
  );
}
