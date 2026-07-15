import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, HistogramSeries, ColorType } from 'lightweight-charts';
import { useUIStore } from '../store/uiStore';

function toDateStr(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export default function CandlestickChart({ history, height = 340 }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!history || history.length === 0) return;

    const styles = getComputedStyle(document.documentElement);
    const textColor = styles.getPropertyValue('--color-text-secondary').trim();
    const borderColor = styles.getPropertyValue('--color-border').trim();
    const upColor = styles.getPropertyValue('--price-up').trim();
    const downColor = styles.getPropertyValue('--price-down').trim();

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: borderColor, style: 1 },
        horzLines: { color: borderColor, style: 1 },
      },
      rightPriceScale: { borderColor },
      timeScale: { borderColor, timeVisible: false },
      crosshair: { mode: 0 },
      autoSize: true,
      height,
    });
    chartRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor, downColor,
      borderUpColor: upColor, borderDownColor: downColor,
      wickUpColor: upColor, wickDownColor: downColor,
      priceFormat: { type: 'price', precision: 0, minMove: 10 },
    });

    const n = history.length;
    const candleData = history.map((h, i) => ({
      time: h.date || toDateStr(n - 1 - i),
      open: Math.round(h.open), high: Math.round(h.high), low: Math.round(h.low), close: Math.round(h.close),
    }));
    candleSeries.setData(candleData);

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });

    const volumeData = history.map((h, i) => ({
      time: h.date || toDateStr(n - 1 - i),
      value: h.volume,
      color: h.close >= h.open ? `${upColor}66` : `${downColor}66`,
    }));
    volumeSeries.setData(volumeData);

    chart.timeScale().fitContent();

    return () => chart.remove();
  }, [history, height, theme]);

  return <div ref={containerRef} className="w-full" style={{ height }} />;
}
