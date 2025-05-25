'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RageMeterProps {
  level: number;
  className?: string;
}

export function RageMeter({ level, className }: RageMeterProps) {
  // Normalize level to 0-100 for the progress bar
  const normalizedLevel = Math.min(Math.max(level, 0), 10) * 10;
  
  // Message based on level
  const getMessage = () => {
    if (level <= 3) {
      return "冷静制胜，理智占优";
    } else if (level <= 6) {
      return "情绪适中，注意保持";
    } else if (level <= 8) {
      return "怒气上升，小心情绪";
    } else {
      return "即将失控，请深呼吸";
    }
  };
  
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium">怒气槽</span>
        <span className="text-muted-foreground">{level}/10</span>
      </div>
      
      <div className="h-4 w-full rounded-full overflow-hidden rage-meter-background relative">
        <motion.div
          className="absolute top-0 left-0 bottom-0 bg-black/20 backdrop-blur-sm"
          initial={{ width: "0%" }}
          animate={{ width: `${normalizedLevel}%` }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Level indicators */}
        <div className="absolute top-0 bottom-0 left-0 right-0 flex">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((mark) => (
            <div
              key={mark}
              className="h-full w-px bg-white/20"
              style={{ left: `${mark * 10}%` }}
            />
          ))}
        </div>
        
        {/* Tick mark */}
        <motion.div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
          initial={{ left: "0%" }}
          animate={{ left: `${normalizedLevel - 1}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        <motion.p
          key={getMessage()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {getMessage()}
        </motion.p>
      </div>
    </div>
  );
}