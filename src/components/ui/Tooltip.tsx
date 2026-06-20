'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Reusable animated tooltip wrapper.
 */
export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className={`absolute z-50 px-2.5 py-1.5 text-xs font-semibold text-white bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-xs rounded-lg shadow-md whitespace-nowrap pointer-events-none border border-slate-700/20 dark:border-slate-700/50 ${
              position === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 -translate-y-2 mb-1.5' : ''
            } ${
              position === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 translate-y-2 mt-1.5' : ''
            } ${
              position === 'left' ? 'right-full top-1/2 -translate-y-1/2 -translate-x-2 mr-1.5' : ''
            } ${
              position === 'right' ? 'left-full top-1/2 -translate-y-1/2 translate-x-2 ml-1.5' : ''
            }`}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
