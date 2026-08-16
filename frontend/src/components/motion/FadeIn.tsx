'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';

/**
 * Fades + slides content up once it scrolls into view. A client component so
 * server pages (buy/rent/invest/etc.) can stay server-rendered and just
 * compose this in rather than converting the whole page to 'use client'.
 */
export default function FadeIn({
  children,
  delay = 0,
  y = 24,
  className,
  ...rest
}: HTMLMotionProps<'div'> & { delay?: number; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
