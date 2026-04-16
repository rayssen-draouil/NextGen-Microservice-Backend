import { Icon } from '@iconify/react';
import QuantitySelector from '@/components/ui/QuantitySelector';

export default function MenuItemCard({ item, qty, onMinus, onPlus, addLabel }) {
  return (
    <div className="group bg-card p-4 rounded-2xl border border-border hover:shadow-xl transition-all duration-300 flex flex-col gap-4">
      <div className="relative h-40 rounded-xl overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-primary group-hover:text-secondary transition-colors">{item.name}</h3>
          <span className="text-lg font-bold text-primary">{item.price}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
      </div>
      <div className="flex items-center justify-between mt-auto">
        <QuantitySelector value={qty} onDecrement={onMinus} onIncrement={onPlus} />
        <button type="button" className="bg-primary text-primary-foreground p-3 rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg" aria-label={addLabel}>
          <Icon icon="lucide:shopping-cart" className="text-xl" />
        </button>
      </div>
    </div>
  );
}
