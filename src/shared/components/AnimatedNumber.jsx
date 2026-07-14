import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

export default function AnimatedNumber({ value, formatter = (v) => Math.round(v).toLocaleString('vi-VN'), className }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => formatter(v));
  const prevValue = useRef(0);

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.8, ease: [0.16, 1, 0.3, 1] });
    prevValue.current = value;
    return controls.stop;
  }, [value]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
