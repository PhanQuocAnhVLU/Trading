import clsx from 'clsx';

export default function Input({ label, error, className, id, suffix, prefix, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3 text-sm text-text-secondary">{prefix}</span>}
        <input
          id={id}
          className={clsx(
            'w-full rounded-sm border border-border bg-bg-base px-3 py-2 text-sm text-text-primary placeholder:text-text-disabled',
            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors',
            prefix && 'pl-8',
            suffix && 'pr-12',
            error && 'border-danger focus:border-danger focus:ring-danger',
            className
          )}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {suffix && <span className="absolute right-3 text-xs text-text-secondary">{suffix}</span>}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
