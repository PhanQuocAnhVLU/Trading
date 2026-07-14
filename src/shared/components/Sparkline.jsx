import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

export default function Sparkline({ data, positive = true, width = 100, height = 32 }) {
  const color = positive ? 'var(--price-up)' : 'var(--price-down)';
  const gradId = `spark-${positive ? 'up' : 'down'}-${Math.round(Math.random() * 1e6)}`;
  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Area type="monotone" dataKey="close" stroke={color} strokeWidth={1.5} fill={`url(#${gradId})`} isAnimationActive={false} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
