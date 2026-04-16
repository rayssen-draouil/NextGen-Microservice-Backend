import clsx from 'clsx';

export default function Select({ className, children, ...props }) {
  return (
    <select
      className={clsx(
        'w-full bg-input border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
