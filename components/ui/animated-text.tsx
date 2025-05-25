'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface AnimatedTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export function AnimatedText({
  text,
  speed = 50,
  className,
  onComplete,
}: AnimatedTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const { isAnimatingText, setIsAnimatingText } = useStore();
  const indexRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Start animation when component mounts
  useEffect(() => {
    setIsAnimatingText(true);
    indexRef.current = 0;
    setDisplayedText('');
    setIsComplete(false);
    
    const animate = () => {
      if (indexRef.current < text.length) {
        setDisplayedText(prev => prev + text[indexRef.current]);
        indexRef.current += 1;
        timerRef.current = setTimeout(animate, speed);
      } else {
        setIsComplete(true);
        setIsAnimatingText(false);
        onComplete?.();
      }
    };
    
    timerRef.current = setTimeout(animate, speed);
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setIsAnimatingText(false);
    };
  }, [text, speed, onComplete, setIsAnimatingText]);
  
  // Handle manual complete (skip animation)
  const handleSkip = () => {
    if (!isComplete) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setDisplayedText(text);
      setIsComplete(true);
      setIsAnimatingText(false);
      onComplete?.();
    }
  };
  
  return (
    <div 
      className="relative cursor-pointer" 
      onClick={handleSkip}
      title={!isComplete ? "点击跳过动画" : undefined}
    >
      <p className={cn("whitespace-pre-wrap", className)}>
        {displayedText}
        {!isComplete && <span className="animated-text-cursor">&nbsp;</span>}
      </p>
    </div>
  );
}