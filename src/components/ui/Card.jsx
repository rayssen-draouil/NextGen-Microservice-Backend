import clsx from 'clsx';

export default function Card({ className, children, ...props }) {
  return (
    <div className={clsx(className)} {...props}>
      {children}
    </div>
  );
}
