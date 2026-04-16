import { Icon } from '@iconify/react';
import StatusDot from '@/components/ui/StatusDot';

export default function RestaurantCard({ item, openLabel, deliveryLabel }) {
  return (
    <div className="bg-card rounded-[2rem] border border-border overflow-hidden group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 relative">
      <div className="relative h-48 overflow-hidden">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
        {item.topBadge && (
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">{item.topBadge}</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xl font-bold text-primary">{item.title}</h4>
          <div className="flex items-center gap-1 text-sm font-extrabold">
            <Icon icon="lucide:star" className="text-secondary" /> {item.rate}
          </div>
        </div>
        <p className="text-muted-foreground text-sm mb-4">{item.subtitle}</p>
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <Icon icon="lucide:clock" className="text-lg" /> {deliveryLabel}
          </div>
          <StatusDot label={openLabel} tone="success" pulse />
        </div>
      </div>
    </div>
  );
}
