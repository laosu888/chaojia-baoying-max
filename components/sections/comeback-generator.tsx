'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RotateCcw, Download, Copy, Share2, Flame, ImageIcon } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useStore } from '@/lib/store';
import { createComebackResponse, generateComebacks, generateSingleMeme, generateSingleFallbackMeme } from '@/lib/ai-service';
import { addToHistory } from '@/lib/local-storage';
import { RageMeter } from '@/components/ui/rage-meter';
import { DinoGame } from '@/components/ui/dino-game';
import { sleep } from '@/lib/utils';

const STYLES = [
  '文艺风',
  '律师风',
  '东北杠精风',
  '哲学家风',
  '冷嘲热讽风',
  '老板式发言',
  '敷衍风',
];

const LANGUAGES = ['中文', '英文', '自动识别'];

export function ComebackGenerator() {
  const { settings, isGenerating, setIsGenerating, rageLevel, setRageLevel } = useStore();
  
  // Form state
  const [originalText, setOriginalText] = useState('');
  const [style, setStyle] = useState(settings.defaultStyle);
  const [intensity, setIntensity] = useState(settings.defaultIntensity);
  const [language, setLanguage] = useState(settings.defaultLanguage);
  const [enableImageGeneration, setEnableImageGeneration] = useState(false);
  
  // Result state
  const [result, setResult] = useState<{
    responses: string[];
    memeUrls: string[];
  } | null>(null);
  
  // Animation states
  const [showIntro, setShowIntro] = useState(true);
  const [isLoadingMemes, setIsLoadingMemes] = useState(false);
  const [showDinoGame, setShowDinoGame] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [progressiveMemes, setProgressiveMemes] = useState<string[]>([]);
  
  // Refs
  const responseRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!originalText.trim()) {
      toast.error('请输入对方说的话');
      return;
    }
    
    if (isGenerating) return;
    
    try {
      setIsGenerating(true);
      setShowIntro(false);
      setResult(null);
      setProgressiveMemes([]);
      setGameScore(0);
      
      // Update rage meter based on intensity
      setRageLevel(intensity);
      
      console.log('🚀 开始生成文字回应...');
      
      // 先生成文字回应
      const textResponses = await generateComebacks({
        originalText,
        style,
        intensity,
        language,
      });
      
      console.log('✅ 文字回应生成完成，立即显示');
      
      // 立即显示文字回应
      setResult({
        responses: textResponses,
        memeUrls: []
      });
      
      setIsGenerating(false); // 文字生成完成，停止loading
      
      // 如果开启图片生成，开始流式生成表情包
      if (enableImageGeneration) {
        console.log('🎨 开始流式生成表情包...');
        setIsLoadingMemes(true);
        setShowDinoGame(true);
        
        // 初始化占位符
        const placeholders = [
          'https://via.placeholder.com/300x300/6b7280/ffffff?text=生成中...',
          'https://via.placeholder.com/300x300/6b7280/ffffff?text=生成中...',
          'https://via.placeholder.com/300x300/6b7280/ffffff?text=生成中...'
        ];
        setProgressiveMemes(placeholders);
        
        // 逐个生成表情包
        for (let i = 0; i < textResponses.length && i < 3; i++) {
          try {
            console.log(`🎯 开始生成第${i + 1}个表情包`);
            
            const memeUrl = await generateSingleMeme({
              responseText: textResponses[i],
              style,
              index: i,
            });
            
            console.log(`✅ 第${i + 1}个表情包生成完成，立即更新显示`);
            
            // 立即更新对应位置的表情包
            setProgressiveMemes(prev => {
              const newMemes = [...prev];
              newMemes[i] = memeUrl;
              return newMemes;
            });
            
            // 更新result中的memeUrls
            setResult(prevResult => {
              if (!prevResult) return prevResult;
              const newMemeUrls = [...prevResult.memeUrls];
              newMemeUrls[i] = memeUrl;
              return {
                ...prevResult,
                memeUrls: newMemeUrls
              };
            });
            
          } catch (error) {
            console.error(`❌ 第${i + 1}个表情包生成失败:`, error);
            const fallbackUrl = `https://via.placeholder.com/300x300/ef4444/ffffff?text=生成失败${i + 1}`;
            
            setProgressiveMemes(prev => {
              const newMemes = [...prev];
              newMemes[i] = fallbackUrl;
              return newMemes;
            });
          }
        }
        
        setIsLoadingMemes(false);
        setShowDinoGame(false);
      }
      
      // Add to history
      const finalRecord = {
        id: Date.now().toString(),
        originalText,
        responses: textResponses,
        memeUrls: enableImageGeneration ? progressiveMemes : [],
        style,
        intensity,
        language,
        timestamp: Date.now(),
      };
      addToHistory(finalRecord);
      
    } catch (error) {
      console.error('Error generating comeback:', error);
      toast.error('生成失败，请重试');
      setShowDinoGame(false);
      setIsGenerating(false);
      setIsLoadingMemes(false);
    }
  };
  
  // Reset form
  const handleReset = () => {
    setOriginalText('');
    setStyle(settings.defaultStyle);
    setIntensity(settings.defaultIntensity);
    setLanguage(settings.defaultLanguage);
    setEnableImageGeneration(false);
    setResult(null);
    setShowIntro(true);
    setRageLevel(0);
    setShowDinoGame(false);
    setGameScore(0);
    setProgressiveMemes([]);
  };
  
  // Copy response to clipboard
  const copyResponse = (text: string) => {
    // 清理文本，确保没有undefined
    let cleanText = String(text || '').trim();
    cleanText = cleanText.replace(/undefined/gi, '').trim();
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    
    if (!cleanText || cleanText.length < 3) {
      toast.error('无有效内容可复制');
      return;
    }
    
    navigator.clipboard.writeText(cleanText);
    toast.success('已复制到剪贴板');
  };
  
  // Download meme
  const downloadMeme = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `meme-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('表情包已下载');
  };
  
  // Share response
  const shareResponse = (text: string) => {
    // 清理文本，确保没有undefined
    let cleanText = String(text || '').trim();
    cleanText = cleanText.replace(/undefined/gi, '').trim();
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    
    if (!cleanText || cleanText.length < 3) {
      toast.error('无有效内容可分享');
      return;
    }
    
    if (navigator.share) {
      navigator.share({
        title: '吵架包赢MAX',
        text: cleanText,
      }).catch(err => {
        console.error('分享失败:', err);
        copyResponse(cleanText);
      });
    } else {
      copyResponse(cleanText);
    }
  };
  
  // Handle dino game end
  const handleGameEnd = (score: number) => {
    setGameScore(score);
    if (score > 50) {
      toast.success(`游戏分数: ${score}！看来您的怒气已经消散了不少 😊`);
    } else {
      toast.info(`游戏分数: ${score}，继续努力降低怒气值！`);
    }
  };
  
  // Copy meme to clipboard
  const copyMeme = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      toast.success('表情包已复制到剪贴板');
    } catch (error) {
      console.error('复制表情包失败:', error);
      // 备用方案：复制链接
      navigator.clipboard.writeText(url);
      toast.success('表情包链接已复制');
    }
  };
  
  return (
    <section data-section="generator" className="py-20 bg-muted/10">
      <div className="container px-4">
        <div className="mb-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-chakra mb-2">
            <span className="text-primary">AI</span> 回怼生成器
          </h2>
          <p className="text-muted-foreground">输入对方的话，生成高质量回怼 + 表情包</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="tech-card">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Flame className="h-5 w-5 text-primary mr-2" />
              <span>输入信息</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  对方说的话
                </label>
                <TextareaAutosize
                  value={originalText}
                  onChange={(e) => setOriginalText(e.target.value)}
                  placeholder="粘贴对方说的话..."
                  className="neo-input min-h-[100px] font-jetbrains text-sm"
                  disabled={isGenerating}
                  minRows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  怼人风格
                </label>
                <Select
                  value={style}
                  onValueChange={setStyle}
                  disabled={isGenerating}
                >
                  <SelectTrigger className="neo-input">
                    <SelectValue placeholder="选择风格" />
                  </SelectTrigger>
                  <SelectContent className="bg-muted border border-border">
                    {STYLES.map((s) => (
                      <SelectItem 
                        key={s} 
                        value={s}
                        className="hover:bg-primary/10 focus:bg-primary/20"
                      >
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium">
                    语气强度
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {intensity}/10
                  </span>
                </div>
                <Slider
                  value={[intensity]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value: number[]) => setIntensity(value[0])}
                  disabled={isGenerating}
                  className="py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  语言
                </label>
                <Select
                  value={language}
                  onValueChange={setLanguage}
                  disabled={isGenerating}
                >
                  <SelectTrigger className="neo-input">
                    <SelectValue placeholder="选择语言" />
                  </SelectTrigger>
                  <SelectContent className="bg-muted border border-border">
                    {LANGUAGES.map((l) => (
                      <SelectItem 
                        key={l} 
                        value={l}
                        className="hover:bg-primary/10 focus:bg-primary/20"
                      >
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* 图片生成开关 */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">
                    🎨 AI表情包生成
                  </label>
                  <p className="text-xs text-muted-foreground">
                    开启后会生成配套表情包，但等待时间较长（30-60秒）
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableImageGeneration}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // 确认对话框
                          const confirmed = window.confirm(
                            '⚠️ 开启AI表情包生成后，等待时间会增加30-60秒，且会消耗图片生成API额度。\n\n确认要开启吗？'
                          );
                          setEnableImageGeneration(confirmed);
                        } else {
                          setEnableImageGeneration(false);
                        }
                      }}
                      disabled={isGenerating}
                      className="sr-only"
                    />
                    <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                      enableImageGeneration ? 'bg-primary' : 'bg-gray-600'
                    }`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                        enableImageGeneration ? 'translate-x-5' : 'translate-x-0'
                      }`}></div>
                    </div>
                  </label>
                  <span className="text-sm font-medium">
                    {enableImageGeneration ? '已开启' : '已关闭'}
                  </span>
                </div>
              </div>
              
              <div className="pt-2">
                <Button
                  onClick={handleSubmit}
                  disabled={isGenerating || !originalText.trim()}
                  className="battle-button w-full py-6 text-lg"
                >
                  {isGenerating ? (
                    <>
                      <span className="mr-2">生成中...</span>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    </>
                  ) : (
                    <>
                      <span className="mr-2">开始吵架</span>
                      <Zap className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Results Area */}
          <div className="tech-card">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Flame className="h-5 w-5 text-accent_orange mr-2" />
              <span>吵架结果</span>
            </h3>
            
            <Tabs defaultValue="responses" className="space-y-4">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="responses" className="text-sm">回怼语句</TabsTrigger>
                <TabsTrigger value="memes" className="text-sm">表情包</TabsTrigger>
              </TabsList>
              
              <TabsContent value="responses" className="space-y-6 min-h-[300px]">
                <AnimatePresence mode="wait">
                  {showIntro && !result && !isGenerating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-16"
                    >
                      <p className="text-muted-foreground">
                        输入对方说的话，点击"开始吵架"按钮<br />
                        AI 将自动生成多个回怼语句和表情包
                      </p>
                    </motion.div>
                  )}
                  
                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-10 flex flex-col items-center space-y-6"
                    >
                      <div className="relative w-16 h-16 mb-4">
                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                        <div className="absolute inset-2 bg-primary/40 rounded-full animate-pulse animation-delay-150"></div>
                        <Zap className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse animation-delay-300" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-medium">AI 正在构思回怼...</p>
                        {enableImageGeneration ? (
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-muted-foreground">
                              🎨 图片生成已开启，预计等待 30-60 秒
                            </p>
                            <p className="text-xs text-orange-500">
                              💡 可以玩小恐龙游戏缓解等待焦虑
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-2">
                            ⚡ 仅生成文字回应，速度更快
                          </p>
                        )}
                      </div>
                      
                      {/* 小恐龙游戏 */}
                      <DinoGame 
                        isVisible={showDinoGame} 
                        onGameEnd={handleGameEnd}
                      />
                      
                      {gameScore > 0 && (
                        <p className="text-sm text-muted-foreground">
                          🎮 游戏得分: {gameScore} | 怒气值已降低！
                        </p>
                      )}
                    </motion.div>
                  )}
                  
                  {result && result.responses && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      {result.responses.map((response, index) => {
                        // 严格的前端过滤和清理
                        let cleanResponse = '';
                        
                        // 检查response是否有效
                        if (response && typeof response === 'string') {
                          cleanResponse = String(response).trim();
                          
                          // 多重清理undefined
                          cleanResponse = cleanResponse.replace(/undefined/gi, '');
                          cleanResponse = cleanResponse.replace(/\bundefined\b/gi, '');
                          cleanResponse = cleanResponse.replace(/UNDEFINED/g, '');
                          cleanResponse = cleanResponse.replace(/Undefined/g, '');
                          
                          // 清理格式标记
                          cleanResponse = cleanResponse.replace(/^[回应答案ABC]+[\s：:]/gi, '');
                          cleanResponse = cleanResponse.replace(/^[0-9]+[\.\)：:\s]/g, '');
                          
                          // 清理多余空格
                          cleanResponse = cleanResponse.replace(/\s+/g, ' ').trim();
                        }
                        
                        // 如果清理后无效，提供默认回应
                        if (!cleanResponse || 
                            cleanResponse.length < 5 || 
                            cleanResponse.includes('undefined') ||
                            cleanResponse.toLowerCase().includes('undefined')) {
                          cleanResponse = `${style}回应${index + 1}：请重新生成`;
                        }
                        
                        return (
                          <motion.div
                            key={index}
                            ref={responseRefs[index]}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className="relative bg-muted p-4 rounded-lg border border-border"
                          >
                            {/* 只显示纯文字，不显示任何图片 */}
                            <div className="text-sm md:text-base font-jetbrains leading-relaxed">
                              {cleanResponse}
                            </div>
                            
                            <div className="flex gap-2 mt-3">
                              <Button 
                                onClick={() => copyResponse(cleanResponse)}
                                className="h-8 px-3 text-xs bg-primary/10 hover:bg-primary/20"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                复制
                              </Button>
                              <Button 
                                onClick={() => shareResponse(cleanResponse)}
                                className="h-8 px-3 text-xs bg-secondary/10 hover:bg-secondary/20"
                              >
                                <Share2 className="h-3 w-3 mr-1" />
                                分享
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}
                      
                      <div className="flex justify-between pt-2">
                        <Button
                          onClick={handleReset}
                          className="text-xs px-3 py-1 bg-muted hover:bg-muted/80"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          重置
                        </Button>
                        
                        <Button
                          onClick={handleSubmit}
                          className="text-xs px-3 py-1 bg-primary hover:bg-primary/80"
                          disabled={isGenerating}
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          再来一组
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>
              
              <TabsContent value="memes" className="min-h-[300px]">
                <AnimatePresence mode="wait">
                  {showIntro && !result && !isGenerating && !isLoadingMemes && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-16"
                    >
                      <p className="text-muted-foreground">
                        表情包将与回怼语句一起生成<br />
                        可用于配合文字打出致命一击
                      </p>
                    </motion.div>
                  )}
                  
                  {(isGenerating || isLoadingMemes) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-10 flex flex-col items-center space-y-6"
                    >
                      <div className="relative w-16 h-16 mb-4">
                        <div className="absolute inset-0 bg-accent_orange/20 rounded-full animate-pulse"></div>
                        <div className="absolute inset-2 bg-accent_orange/40 rounded-full animate-pulse animation-delay-150"></div>
                        <Zap className="absolute inset-0 m-auto h-8 w-8 text-accent_orange animate-pulse animation-delay-300" />
                      </div>
                      <div className="text-center">
                        {enableImageGeneration ? (
                          <div className="space-y-2">
                            <p className="text-lg font-medium">正在生成AI表情包...</p>
                            <p className="text-sm text-muted-foreground">
                              🎨 AI正在根据回怼内容创作专属表情包
                            </p>
                            <p className="text-xs text-orange-500">
                              ⏱️ 预计还需要 20-40 秒
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-lg font-medium">表情包生成已关闭</p>
                            <p className="text-sm text-muted-foreground">
                              💡 开启AI表情包生成可获得配套表情包
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* 小恐龙游戏 */}
                      {enableImageGeneration && (
                        <DinoGame 
                          isVisible={showDinoGame} 
                          onGameEnd={handleGameEnd}
                        />
                      )}
                      
                      {gameScore > 0 && (
                        <p className="text-sm text-muted-foreground">
                          🎮 游戏得分: {gameScore} | 心情平静了许多
                        </p>
                      )}
                    </motion.div>
                  )}
                  
                  {/* 表情包显示 - 支持逐个显示 */}
                  {(result || progressiveMemes.length > 0) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      {enableImageGeneration ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* 使用progressiveMemes实现流式显示 */}
                          {progressiveMemes.map((url, index) => (
                            <motion.div
                              key={`meme-${index}`}
                              initial={{ opacity: 0, scale: 0.8, y: 20 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{ 
                                delay: index * 0.3, // 错开动画时间
                                duration: 0.5,
                                type: "spring",
                                stiffness: 100
                              }}
                              className="relative bg-muted rounded-lg overflow-hidden border border-border group hover:shadow-lg transition-shadow"
                            >
                              <div className="aspect-square relative">
                                <img
                                  src={url}
                                  alt={`表情包 ${index + 1}`}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = generateSingleFallbackMeme(index);
                                  }}
                                />
                                
                                {/* 生成中的遮罩 */}
                                {url.includes('生成中') && (
                                  <motion.div 
                                    className="absolute inset-0 bg-black/60 flex items-center justify-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                  >
                                    <div className="text-white text-center">
                                      <motion.div 
                                        className="w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                      />
                                      <p className="text-sm">生成中...</p>
                                      <p className="text-xs opacity-75">第{index + 1}张</p>
                                    </div>
                                  </motion.div>
                                )}
                                
                                {/* 生成完成的标识 */}
                                {!url.includes('生成中') && !url.includes('placeholder') && (
                                  <motion.div
                                    className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                  >
                                    ✓
                                  </motion.div>
                                )}
                              </div>
                              
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  onClick={() => downloadMeme(url)}
                                  className="h-8 px-3 text-xs text-white/90 hover:text-white bg-transparent hover:bg-white/10"
                                  disabled={url.includes('生成中') || url.includes('placeholder')}
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  下载
                                </Button>
                                <Button 
                                  onClick={() => copyMeme(url)}
                                  className="h-8 px-3 text-xs text-white/90 hover:text-white bg-transparent hover:bg-white/10"
                                  disabled={url.includes('生成中') || url.includes('placeholder')}
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  复制
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                          
                          {/* 显示生成进度 */}
                          {isLoadingMemes && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="col-span-full text-center py-4"
                            >
                              <div className="text-sm text-muted-foreground">
                                🎨 正在逐个生成表情包... ({progressiveMemes.filter(url => !url.includes('生成中')).length}/3)
                              </div>
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-16 space-y-4">
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium mb-2">表情包生成已关闭</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              开启AI表情包生成可获得与回怼内容匹配的专属表情包
                            </p>
                            <Button
                              onClick={() => {
                                const confirmed = window.confirm(
                                  '⚠️ 开启AI表情包生成后，等待时间会增加30-60秒，且会消耗图片生成API额度。\n\n确认要开启吗？'
                                );
                                if (confirmed) {
                                  setEnableImageGeneration(true);
                                  toast.success('AI表情包生成已开启，下次生成时将包含表情包');
                                }
                              }}
                              className="bg-primary hover:bg-primary/80"
                            >
                              🎨 开启AI表情包生成
                            </Button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>
            </Tabs>
            
            {/* Rage Meter */}
            <div className="mt-6">
              <RageMeter level={rageLevel} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}