import { Icon } from '@iconify/react';

export default function StarRating({ value, className = '' }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Icon icon="lucide:star" className="text-secondary" />
      <span>{value}</span>
    </div>
  );
}
