import { Icon } from '@iconify/react';

const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export default function Modal({ open, title, children, onClose, size = 'md' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full ${SIZE_CLASSES[size] || SIZE_CLASSES.md} bg-card border border-border rounded-3xl shadow-2xl p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-heading font-bold text-primary">{title}</h3>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-full border border-border hover:bg-muted transition-all flex items-center justify-center">
            <Icon icon="lucide:x" className="text-primary" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
