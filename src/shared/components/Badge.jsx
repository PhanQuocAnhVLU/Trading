import clsx from 'clsx';

const styles = {
  success: 'bg-success/10 text-success border-success/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  danger: 'bg-danger/10 text-danger border-danger/30',
  info: 'bg-info/10 text-info border-info/30',
  neutral: 'bg-text-secondary/10 text-text-secondary border-text-secondary/30',
};

export default function Badge({ variant = 'neutral', children, className }) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border tracking-wide', styles[variant], className)}>
      {children}
    </span>
  );
}
