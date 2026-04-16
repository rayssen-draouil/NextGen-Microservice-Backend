import clsx from 'clsx';

export default function Button({ className, children, type = 'button', ...props }) {
  return (
    <button type={type} className={clsx(className)} {...props}>
      {children}
    </button>
  );
}
