import clsx from 'clsx';

const variants = {
  primary: 'bg-primary text-bg-base hover:bg-primary-hover shadow-glow',
  secondary: 'bg-secondary text-bg-base hover:bg-secondary-hover shadow-glow-secondary',
  ghost: 'bg-transparent text-text-primary hover:bg-bg-elevated-2 border border-border',
  danger: 'bg-danger text-white hover:opacity-90',
  buy: 'bg-price-up text-white hover:opacity-90 shadow-[0_0_20px_rgba(34,197,94,0.25)]',
  sell: 'bg-price-down text-white hover:opacity-90 shadow-[0_0_20px_rgba(240,71,90,0.25)]',
};

const sizes = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5',
};

export default function Button({ variant = 'primary', size = 'md', className, loading, disabled, children, ...props }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="h-3.5 w-3.5 rounded-full border-2 border-current/30 border-t-current animate-spin" />}
      {children}
    </button>
  );
}
