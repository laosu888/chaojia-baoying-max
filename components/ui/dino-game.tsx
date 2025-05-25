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
  const [gameSpeed, setGameSpeed] = useState(1.5);
  
  const gameRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const obstacleIdRef = useRef(0);
  
  const DINO_SIZE = 50;
  const GROUND_HEIGHT = 60;
  const JUMP_HEIGHT = 100;
  const GAME_WIDTH = 600;
  const GAME_HEIGHT = 200;

  // 重置游戏
  const resetGame = useCallback(() => {
    setGameOver(false);
    setGameStarted(false);
    setScore(0);
    setObstacles([]);
    setDinoY(0);
    setGameSpeed(1.5);
    setIsJumping(false);
  }, []);

  // 开始游戏
  const startGame = useCallback(() => {
    if (!gameStarted && !gameOver) {
      setGameStarted(true);
    }
  }, [gameStarted, gameOver]);

  // 跳跃
  const jump = useCallback(() => {
    if (!isJumping && !gameOver) {
      if (!gameStarted) {
        startGame();
      }
      setIsJumping(true);
      setDinoY(JUMP_HEIGHT);
      
      setTimeout(() => {
        setDinoY(0);
        setTimeout(() => {
          setIsJumping(false);
        }, 150);
      }, 400);
    }
  }, [isJumping, gameOver, gameStarted, startGame]);

  // 键盘事件
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

    if (isVisible) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
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

        // 添加新障碍物 - 增加间距
        if (updated.length === 0 || updated[updated.length - 1].x < GAME_WIDTH - 300) {
          const newObstacle: Obstacle = {
            id: obstacleIdRef.current++,
            x: GAME_WIDTH,
            width: 25,
            height: Math.random() > 0.7 ? 50 : 35
          };
          updated.push(newObstacle);
        }

        return updated;
      });

      // 增加分数 - 降低分数增长速度
      setScore(prev => prev + 0.5);

      // 增加游戏速度 - 更缓慢的速度增长
      if (score > 0 && score % 200 === 0) {
        setGameSpeed(prev => Math.min(prev + 0.2, 4));
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameStarted, gameOver, isVisible, gameSpeed, score]);

  // 碰撞检测 - 更宽松的碰撞检测
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const checkCollision = () => {
      const dinoLeft = 50 + 5;
      const dinoRight = dinoLeft + DINO_SIZE - 10;
      const dinoTop = GAME_HEIGHT - GROUND_HEIGHT - DINO_SIZE - dinoY + 5;
      const dinoBottom = dinoTop + DINO_SIZE - 10;

      for (const obstacle of obstacles) {
        const obstacleLeft = obstacle.x + 3;
        const obstacleRight = obstacle.x + obstacle.width - 3;
        const obstacleTop = GAME_HEIGHT - GROUND_HEIGHT - obstacle.height;
        const obstacleBottom = GAME_HEIGHT - GROUND_HEIGHT;

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
  }, [obstacles, dinoY, gameStarted, gameOver, score, onGameEnd]);

  if (!isVisible) return null;

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
      <div className="text-center">
        <h3 className="text-lg font-bold text-white mb-2">🦕 小恐龙游戏</h3>
        <p className="text-sm text-gray-400">
          {!gameStarted && !gameOver && '按空格键或点击开始游戏'}
          {gameStarted && !gameOver && '按空格键跳跃'}
          {gameOver && '游戏结束！按空格键重新开始'}
        </p>
        <p className="text-sm text-orange-400 mt-1">缓解等待焦虑，降低怒气值 😌</p>
      </div>

      <div 
        ref={gameRef}
        className="relative bg-gradient-to-b from-blue-200 to-green-200 border border-gray-600 rounded cursor-pointer overflow-hidden"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        onClick={gameOver ? resetGame : jump}
      >
        {/* 云朵背景 */}
        <div className="absolute top-4 left-20 text-white text-2xl opacity-60">☁️</div>
        <div className="absolute top-8 right-32 text-white text-xl opacity-40">☁️</div>
        <div className="absolute top-6 left-80 text-white text-lg opacity-50">☁️</div>

        {/* 地面 */}
        <div 
          className="absolute bottom-0 w-full bg-gradient-to-r from-green-600 to-green-500 border-t-2 border-green-700"
          style={{ height: GROUND_HEIGHT }}
        >
          {/* 草地纹理 */}
          <div className="absolute top-0 left-0 w-full h-2 bg-green-400 opacity-60"></div>
        </div>

        {/* 恐龙 */}
        <motion.div
          className="absolute flex items-center justify-center"
          style={{
            width: DINO_SIZE,
            height: DINO_SIZE,
            left: 50,
            bottom: GROUND_HEIGHT + dinoY
          }}
          animate={{
            rotate: isJumping ? [0, -5, 0] : 0,
            scale: isJumping ? [1, 1.1, 1] : 1
          }}
          transition={{ duration: 0.4 }}
        >
          {/* 恐龙身体 */}
          <div className="relative w-full h-full">
            {/* 恐龙头部 */}
            <div className="absolute top-0 left-2 w-8 h-6 bg-green-500 rounded-full border-2 border-green-600">
              {/* 眼睛 */}
              <div className="absolute top-1 left-1 w-1 h-1 bg-black rounded-full"></div>
              <div className="absolute top-1 right-1 w-1 h-1 bg-black rounded-full"></div>
              {/* 嘴巴 */}
              <div className="absolute bottom-0 left-2 w-3 h-1 bg-green-600 rounded"></div>
            </div>
            
            {/* 恐龙身体 */}
            <div className="absolute top-4 left-0 w-10 h-8 bg-green-500 rounded-lg border-2 border-green-600"></div>
            
            {/* 恐龙腿部 */}
            <div className="absolute bottom-0 left-1 w-2 h-4 bg-green-500 border border-green-600"></div>
            <div className="absolute bottom-0 right-1 w-2 h-4 bg-green-500 border border-green-600"></div>
            
            {/* 恐龙尾巴 */}
            <div className="absolute top-6 right-0 w-6 h-2 bg-green-500 rounded-full border border-green-600"></div>
          </div>
        </motion.div>

        {/* 障碍物 - 仙人掌样式 */}
        {obstacles.map(obstacle => (
          <div
            key={obstacle.id}
            className="absolute bg-green-700 border-2 border-green-800 rounded-t-lg"
            style={{
              width: obstacle.width,
              height: obstacle.height,
              left: obstacle.x,
              bottom: GROUND_HEIGHT
            }}
          >
            {/* 仙人掌刺 */}
            <div className="absolute top-1 left-1 w-1 h-1 bg-green-900 rounded-full"></div>
            <div className="absolute top-3 right-1 w-1 h-1 bg-green-900 rounded-full"></div>
            <div className="absolute bottom-2 left-2 w-1 h-1 bg-green-900 rounded-full"></div>
          </div>
        ))}

        {/* 分数 */}
        <div className="absolute top-4 right-4 text-gray-800 font-mono font-bold bg-white/80 px-2 py-1 rounded">
          分数: {Math.floor(score / 5)}
        </div>

        {/* 游戏结束画面 */}
        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white bg-gray-800 p-6 rounded-lg border border-gray-600">
              <div className="text-2xl font-bold mb-2">🦕 游戏结束</div>
              <div className="text-lg mb-4">最终分数: {Math.floor(score / 5)}</div>
              <div className="text-sm text-gray-300 mb-2">
                {Math.floor(score / 5) > 20 ? '太棒了！怒气值大幅降低！😊' : 
                 Math.floor(score / 5) > 10 ? '不错！心情平静了一些 😌' : 
                 '继续努力，放松心情！🎮'}
              </div>
              <div className="text-xs text-gray-400">按空格键或点击重新开始</div>
            </div>
          </div>
        )}

        {/* 开始提示 */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-800 bg-white/90 p-6 rounded-lg border border-gray-300">
              <div className="text-xl font-bold mb-2">🦕 准备好了吗？</div>
              <div className="text-sm text-gray-600 mb-2">帮助小恐龙跳过仙人掌</div>
              <div className="text-xs text-gray-500">按空格键或点击开始</div>
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 text-center max-w-md">
        💡 小贴士：这个小游戏可以帮助您在等待AI生成回应时放松心情，降低怒气值。
        说不定玩完游戏，您就不想回怼了呢？😊
      </div>
    </div>
  );
} 