'use client';

import { cn } from '@/lib/utils';
import React from 'react';
import { motion } from 'motion/react';

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}) => {
  return (
    <div className={cn('group relative overflow-hidden rounded-xl', containerClassName)}>
      <motion.div
        className={cn(
          'absolute inset-0 z-0 rounded-[inherit]',
          'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.25),rgba(30,41,59,0.5)_50%,transparent)]',
          'border border-white/10'
        )}
        initial={animate ? { opacity: 0.8 } : undefined}
        animate={animate ? { opacity: [0.8, 1, 0.8] } : undefined}
        transition={
          animate
            ? {
                duration: 4,
                repeat: Infinity,
                repeatType: 'reverse',
              }
            : undefined
        }
      />
      <div className={cn('relative z-10', className)}>{children}</div>
    </div>
  );
};
