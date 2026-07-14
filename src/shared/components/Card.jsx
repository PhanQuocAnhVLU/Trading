import clsx from 'clsx';

export default function Card({ title, action, className, children, padded = true }) {
  return (
    <div className={clsx('bg-bg-elevated border border-border rounded-lg shadow-e1 transition-colors', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
          {title && <h3 className="text-sm font-semibold text-text-primary tracking-tight">{title}</h3>}
          {action}
        </div>
      )}
      <div className={padded ? 'p-4' : ''}>{children}</div>
    </div>
  );
}
