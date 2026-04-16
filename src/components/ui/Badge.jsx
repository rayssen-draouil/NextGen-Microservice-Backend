import clsx from 'clsx';

export default function Badge({ className, children, ...props }) {
  return (
    <span className={clsx(className)} {...props}>
      {children}
    </span>
  );
}
