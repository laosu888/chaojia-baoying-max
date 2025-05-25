'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

interface DinoGameProps {
  isVisible: boolean;
  onGameEnd?: (score: number) => void;
}

interface Obstacle {
  id: number;
  x: number;
  width: number;
  height: number;
}

export function DinoGame({ isVisible, onGameEnd }: DinoGameProps) {
  const [isJumping, setIsJumping] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [dinoY, setDinoY] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(2);
  
  const gameRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const obstacleIdRef = useRef(0);
  
  const DINO_SIZE = 40; // 稍微减小恐龙尺寸
  const GROUND_HEIGHT = 50; // 减小地面高度
  const JUMP_HEIGHT = 80; // 调整跳跃高度
  
  // 响应式游戏尺寸
  const [gameWidth, setGameWidth] = useState(600);
  const [gameHeight, setGameHeight] = useState(180);

  // 检测屏幕尺寸并调整游戏尺寸
  useEffect(() => {
    const updateGameSize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 640) { // 手机端
        setGameWidth(Math.min(screenWidth - 32, 350)); // 留出边距
        setGameHeight(150);
      } else if (screenWidth < 768) { // 平板端
        setGameWidth(500);
        setGameHeight(160);
      } else { // 桌面端
        setGameWidth(600);
        setGameHeight(180);
      }
    };

    updateGameSize();
    window.addEventListener('resize', updateGameSize);
    return () => window.removeEventListener('resize', updateGameSize);
  }, []);

  // 重置游戏
  const resetGame = useCallback(() => {
    setGameOver(false);
    setGameStarted(false);
    setScore(0);
    setObstacles([]);
    setDinoY(0);
    setGameSpeed(2);
    setIsJumping(false);
  }, []);

  // 开始游戏
  const startGame = useCallback(() => {
    if (!gameStarted && !gameOver) {
      setGameStarted(true);
    }
  }, [gameStarted, gameOver]);

  // 跳跃逻辑
  const jump = useCallback(() => {
    if (!gameStarted && !gameOver) {
      startGame();
      return;
    }
    
    if (!isJumping && !gameOver) {
      setIsJumping(true);
      setDinoY(-JUMP_HEIGHT); // 使用动态跳跃高度
      
      setTimeout(() => {
        setDinoY(0);
        setIsJumping(false);
      }, 600);
    }
  }, [isJumping, gameOver, gameStarted, startGame]);

  // 键盘和触摸事件
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (gameOver) {
          resetGame();
        } else {
          jump();
        }
      }
    };

    // 触摸事件处理
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (gameOver) {
        resetGame();
      } else {
        jump();
      }
    };

    // 点击事件处理
    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      if (gameOver) {
        resetGame();
      } else {
        jump();
      }
    };

    if (isVisible) {
      // 全局键盘事件
      document.addEventListener('keydown', handleKeyPress);
      
      // 游戏区域的触摸和点击事件
      const gameElement = gameRef.current;
      if (gameElement) {
        gameElement.addEventListener('touchstart', handleTouchStart, { passive: false });
        gameElement.addEventListener('click', handleClick);
      }
      
      return () => {
        document.removeEventListener('keydown', handleKeyPress);
        if (gameElement) {
          gameElement.removeEventListener('touchstart', handleTouchStart);
          gameElement.removeEventListener('click', handleClick);
        }
      };
    }
  }, [isVisible, jump, gameOver, resetGame]);

  // 游戏循环
  useEffect(() => {
    if (!gameStarted || gameOver || !isVisible) return;

    const gameLoop = () => {
      // 移动障碍物
      setObstacles(prev => {
        const updated = prev
          .map(obstacle => ({
            ...obstacle,
            x: obstacle.x - gameSpeed
          }))
          .filter(obstacle => obstacle.x > -50);

        // 添加新障碍物 - 根据屏幕尺寸调整间距
        const minDistance = gameWidth < 400 ? 300 : 400;
        if (updated.length === 0 || updated[updated.length - 1].x < gameWidth - minDistance) {
          const newObstacle: Obstacle = {
            id: obstacleIdRef.current++,
            x: gameWidth,
            width: gameWidth < 400 ? 15 : 20, // 手机端障碍物更小
            height: Math.random() > 0.8 ? (gameWidth < 400 ? 30 : 40) : (gameWidth < 400 ? 25 : 30)
          };
          updated.push(newObstacle);
        }

        return updated;
      });

      // 增加分数
      setScore(prev => prev + 0.3);

      // 增加游戏速度
      if (score > 0 && score % 300 === 0) {
        setGameSpeed(prev => Math.min(prev + 0.1, 3));
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameStarted, gameOver, isVisible, gameSpeed, score, gameWidth]);

  // 碰撞检测
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const checkCollision = () => {
      const dinoLeft = 50 + 5;
      const dinoRight = dinoLeft + DINO_SIZE - 10;
      const dinoTop = gameHeight - GROUND_HEIGHT - DINO_SIZE - dinoY + 5;
      const dinoBottom = dinoTop + DINO_SIZE - 10;

      for (const obstacle of obstacles) {
        const obstacleLeft = obstacle.x + 3;
        const obstacleRight = obstacle.x + obstacle.width - 3;
        const obstacleTop = gameHeight - GROUND_HEIGHT - obstacle.height;
        const obstacleBottom = gameHeight - GROUND_HEIGHT;

        if (
          dinoRight > obstacleLeft &&
          dinoLeft < obstacleRight &&
          dinoBottom > obstacleTop &&
          dinoTop < obstacleBottom
        ) {
          setGameOver(true);
          onGameEnd?.(Math.floor(score / 5));
          return;
        }
      }
    };

    checkCollision();
  }, [obstacles, dinoY, gameStarted, gameOver, score, onGameEnd, gameHeight]);

  if (!isVisible) return null;

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gray-900 rounded-lg border border-gray-700 w-full max-w-full">
      <div className="text-center">
        <h3 className="text-lg font-bold text-white mb-2">🦕 小恐龙游戏</h3>
        <p className="text-sm text-gray-400 px-2">
          {!gameStarted && !gameOver && '点击屏幕或按空格键开始游戏'}
          {gameStarted && !gameOver && '点击屏幕或按空格键跳跃'}
          {gameOver && '游戏结束！点击屏幕或按空格键重新开始'}
        </p>
        <p className="text-sm text-orange-400 mt-1">缓解等待焦虑，降低怒气值 😌</p>
      </div>

      <div 
        ref={gameRef}
        className="relative bg-gradient-to-b from-blue-200 to-green-200 border border-gray-600 rounded cursor-pointer overflow-hidden touch-none select-none"
        style={{ 
          width: gameWidth, 
          height: gameHeight,
          minWidth: '300px', // 确保最小宽度
          maxWidth: '100%'
        }}
        onClick={gameOver ? resetGame : jump}
      >
        {/* 云朵背景 - 响应式位置 */}
        <div className="absolute top-2 left-4 text-white text-lg opacity-60">☁️</div>
        <div className="absolute top-4 right-8 text-white text-sm opacity-40">☁️</div>
        {gameWidth > 400 && (
          <div className="absolute top-3 left-1/2 text-white text-base opacity-50">☁️</div>
        )}

        {/* 地面 */}
        <div 
          className="absolute bottom-0 w-full bg-gradient-to-r from-green-600 to-green-500 border-t-2 border-green-700"
          style={{ height: GROUND_HEIGHT }}
        >
          {/* 草地纹理 */}
          <div className="absolute top-0 left-0 w-full h-1 bg-green-400 opacity-60"></div>
        </div>

        {/* 恐龙 - 确保显示 */}
        <motion.div
          className="absolute flex items-center justify-center z-10"
          style={{
            width: DINO_SIZE,
            height: DINO_SIZE,
            left: Math.min(50, gameWidth * 0.1), // 响应式位置
            bottom: Math.max(GROUND_HEIGHT + dinoY, GROUND_HEIGHT), // 确保不会低于地面
            transform: dinoY < 0 ? `translateY(${dinoY}px)` : 'none' // 明确的跳跃变换
          }}
          animate={{
            rotate: isJumping ? [0, -5, 0] : 0,
            scale: isJumping ? [1, 1.1, 1] : 1
          }}
          transition={{ duration: 0.4 }}
        >
          {/* 恐龙身体 - 简化设计确保显示 */}
          <div className="relative w-full h-full bg-green-500 rounded-lg border-2 border-green-600">
            {/* 恐龙头部 */}
            <div className="absolute -top-1 left-1 w-6 h-5 bg-green-500 rounded-full border-2 border-green-600">
              {/* 眼睛 */}
              <div className="absolute top-1 left-1 w-1 h-1 bg-black rounded-full"></div>
              <div className="absolute top-1 right-1 w-1 h-1 bg-black rounded-full"></div>
            </div>
            
            {/* 恐龙腿部 */}
            <div className="absolute -bottom-1 left-1 w-1 h-3 bg-green-500 border border-green-600"></div>
            <div className="absolute -bottom-1 right-1 w-1 h-3 bg-green-500 border border-green-600"></div>
            
            {/* 恐龙尾巴 */}
            <div className="absolute top-2 -right-2 w-4 h-1 bg-green-500 rounded-full border border-green-600"></div>
          </div>
        </motion.div>

        {/* 障碍物 - 仙人掌样式 */}
        {obstacles.map(obstacle => (
          <div
            key={obstacle.id}
            className="absolute bg-green-700 border-2 border-green-800 rounded-t-lg z-5"
            style={{
              width: obstacle.width,
              height: obstacle.height,
              left: obstacle.x,
              bottom: GROUND_HEIGHT
            }}
          >
            {/* 仙人掌刺 */}
            <div className="absolute top-1 left-1 w-0.5 h-0.5 bg-green-900 rounded-full"></div>
            <div className="absolute top-2 right-1 w-0.5 h-0.5 bg-green-900 rounded-full"></div>
            {obstacle.height > 25 && (
              <div className="absolute bottom-2 left-1 w-0.5 h-0.5 bg-green-900 rounded-full"></div>
            )}
          </div>
        ))}

        {/* 分数 */}
        <div className="absolute top-2 right-2 text-gray-800 font-mono font-bold bg-white/80 px-2 py-1 rounded text-sm">
          分数: {Math.floor(score / 5)}
        </div>

        {/* 游戏结束画面 */}
        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="text-center text-white bg-gray-800 p-4 rounded-lg border border-gray-600 mx-4 max-w-xs">
              <div className="text-xl font-bold mb-2">🦕 游戏结束</div>
              <div className="text-lg mb-3">最终分数: {Math.floor(score / 5)}</div>
              <div className="text-sm text-gray-300 mb-2">
                {Math.floor(score / 5) > 20 ? '太棒了！怒气值大幅降低！😊' : 
                 Math.floor(score / 5) > 10 ? '不错！心情平静了一些 😌' : 
                 '继续努力，放松心情！🎮'}
              </div>
              <div className="text-xs text-gray-400">点击屏幕重新开始</div>
            </div>
          </div>
        )}

        {/* 开始提示 */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-center text-gray-800 bg-white/90 p-4 rounded-lg border border-gray-300 mx-4 max-w-xs">
              <div className="text-lg font-bold mb-2">🦕 准备好了吗？</div>
              <div className="text-sm text-gray-600 mb-2">帮助小恐龙跳过仙人掌</div>
              <div className="text-xs text-gray-500">点击屏幕开始</div>
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 text-center max-w-md px-4">
        💡 小贴士：这个小游戏可以帮助您在等待AI生成回应时放松心情，降低怒气值。
        说不定玩完游戏，您就不想回怼了呢？😊
      </div>
    </div>
  );
} 