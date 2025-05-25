'use client';

import { motion } from 'framer-motion';
import { ChevronDown, Flame, Zap, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  const scrollToMain = () => {
    const generatorSection = document.querySelector('[data-section="generator"]');
    if (generatorSection) {
      generatorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  const scrollToTestimonials = () => {
    const testimonialsSection = document.querySelector('[data-section="testimonials"]');
    if (testimonialsSection) {
      testimonialsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  // Falling emojis animation - 增加更多表情包
  const leftEmojis = ['😂', '🔥', '💯', '👊', '💪', '🤬', '💣'];
  const rightEmojis = ['🤡', '😡', '👑', '🎯', '⚡', '💥', '🚀', '😤', '🙄', '🤨'];
  
  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center hero-gradient overflow-hidden">
      {/* Falling emojis - 左侧 */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {leftEmojis.map((emoji, i) => (
          <motion.div
            key={`left-${i}`}
            className="absolute text-3xl md:text-4xl"
            initial={{ 
              x: `${Math.random() * 40}%`, // 左侧0-40%
              y: -100,
              opacity: Math.random() * 0.6 + 0.4,
              scale: Math.random() * 0.5 + 0.8
            }}
            animate={{
              y: '120vh',
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: Math.random() * 8 + 12,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'linear'
            }}
          >
            {emoji}
          </motion.div>
        ))}
        
        {/* 右侧表情包掉落 - 确保显示 */}
        {rightEmojis.map((emoji, i) => (
          <motion.div
            key={`right-${i}`}
            className="absolute text-2xl md:text-3xl z-0"
            initial={{ 
              x: `${60 + Math.random() * 40}%`, // 右侧60%-100%
              y: -100,
              opacity: Math.random() * 0.7 + 0.3,
              scale: Math.random() * 0.6 + 0.7
            }}
            animate={{
              y: '120vh',
              rotate: -Math.random() * 360, // 反向旋转
            }}
            transition={{
              duration: Math.random() * 10 + 8,
              repeat: Infinity,
              delay: Math.random() * 8 + 1, // 不同的延迟
              ease: 'linear'
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>
      
      {/* Hero content */}
      <div className="container px-4 z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame className="h-8 w-8 text-primary animate-fire" />
            <h1 className="text-4xl md:text-6xl font-bold font-chakra text-white">
              吵架<span className="text-primary">包赢</span><span className="text-accent">MAX</span>
            </h1>
            <Flame className="h-8 w-8 text-primary animate-fire" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-accent_orange">全网最牛吵架神器</p>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="max-w-2xl mx-auto text-lg md:text-xl mb-8 text-white/90"
        >
          让你的每一次吵架都有回响，一键回怼 + 表情包制胜
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button 
            onClick={scrollToMain}
            size="lg"
            className="battle-button group text-xl px-8 py-6"
          >
            <span className="mr-2">开吵！</span>
            <Zap className="h-5 w-5 group-hover:animate-pulse" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="bg-muted/50 border border-muted-foreground/30 hover:bg-muted hover:text-accent_orange px-6 py-5"
            onClick={scrollToTestimonials}
          >
            <span className="mr-2">查看用户心声</span>
            <MessageSquare className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 1.2, duration: 1.5, repeat: Infinity }}
      >
        <ChevronDown 
          className="h-8 w-8 text-white/70 cursor-pointer" 
          onClick={scrollToMain}
        />
      </motion.div>
    </section>
  );
}