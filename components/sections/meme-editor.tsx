'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, RotateCcw, Type, Eraser, Wand2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// 示例表情包数据 - 使用本地图片
const EXAMPLE_MEMES = [
  {
    id: 1,
    name: '熊猫头不屑',
    url: '/memes/meme-panda-gz.png',
    description: '经典不屑表情，适合轻度讽刺'
  },
  {
    id: 2,
    name: '熊猫头疑问',
    url: '/memes/meme-panda-kaiqiang.png',
    description: '疑问表情，适合反问式回怼'
  },
  {
    id: 3,
    name: '熊猫头愤怒',
    url: '/memes/meme-panda-motou.png',
    description: '愤怒表情，适合强烈回击'
  },
  {
    id: 4,
    name: '熊猫头冷笑',
    url: '/memes/meme-panda-qqh.png',
    description: '冷笑表情，适合嘲讽回应'
  },
  {
    id: 5,
    name: '熊猫头无语',
    url: '/memes/meme-panda-tuosai.png',
    description: '无语表情，适合敷衍回应'
  },
  {
    id: 6,
    name: '熊猫头得意',
    url: '/memes/meme-panda-wunai.png',
    description: '得意表情，适合优越感回应'
  },
  {
    id: 7,
    name: '熊猫头鄙视',
    url: '/memes/meme-panda-wz.png',
    description: '鄙视表情，适合看不起对方'
  },
  {
    id: 8,
    name: '熊猫头惊讶',
    url: '/memes/meme-panda-xu.png',
    description: '惊讶表情，适合反转式回怼'
  }
];

// 内联的表情包编辑器组件
function InlineMemeEditor({ 
  className, 
  selectedImage, 
  onImageUpload 
}: { 
  className?: string; 
  selectedImage?: string | null;
  onImageUpload?: () => void;
}) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [newText, setNewText] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 50, y: 80 });
  const [fontSize, setFontSize] = useState(24);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 当selectedImage改变时，自动设置为上传的图片
  useEffect(() => {
    if (selectedImage) {
      setUploadedImage(selectedImage);
      setEditedImage(null);
      toast.success('示例图片已加载，可以开始编辑');
    }
  }, [selectedImage]);

  // 处理文件上传
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      setEditedImage(null);
      onImageUpload?.(); // 通知父组件清除选中的示例
      toast.success('图片上传成功');
    };
    reader.readAsDataURL(file);
  }, [onImageUpload]);

  // 简单的文字去除（使用Canvas的图像处理）
  const removeTextFromImage = useCallback(async () => {
    if (!uploadedImage || !canvasRef.current) return;

    setIsProcessing(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        // 设置画布尺寸
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 绘制原图
        ctx.drawImage(img, 0, 0);
        
        // 获取图像数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // 简单的文字去除算法：检测白色/浅色区域（通常是文字背景）
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // 如果是接近白色的像素（可能是文字区域）
          if (r > 200 && g > 200 && b > 200) {
            // 使用周围像素的平均色彩进行修复
            const x = (i / 4) % canvas.width;
            const y = Math.floor((i / 4) / canvas.width);
            
            // 简单的修复：使用邻近像素的颜色
            if (x > 0 && y > 0) {
              const leftPixel = (y * canvas.width + (x - 1)) * 4;
              const topPixel = ((y - 1) * canvas.width + x) * 4;
              
              data[i] = (data[leftPixel] + data[topPixel]) / 2;
              data[i + 1] = (data[leftPixel + 1] + data[topPixel + 1]) / 2;
              data[i + 2] = (data[leftPixel + 2] + data[topPixel + 2]) / 2;
            }
          }
        }
        
        // 应用处理后的图像数据
        ctx.putImageData(imageData, 0, 0);
        
        // 转换为base64
        const processedImage = canvas.toDataURL('image/png');
        setEditedImage(processedImage);
        toast.success('文字去除完成（简单处理）');
      };
      
      img.src = uploadedImage;
    } catch (error) {
      console.error('文字去除失败:', error);
      toast.error('文字去除失败');
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedImage]);

  // 添加新文字
  const addTextToImage = useCallback(() => {
    if (!newText.trim()) {
      toast.error('请输入要添加的文字');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseImage = editedImage || uploadedImage;
    if (!baseImage) return;

    const img = new Image();
    img.onload = () => {
      // 设置画布尺寸
      canvas.width = img.width;
      canvas.height = img.height;
      
      // 绘制基础图片
      ctx.drawImage(img, 0, 0);
      
      // 设置文字样式
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      
      // 计算文字位置
      const x = (textPosition.x / 100) * canvas.width;
      const y = (textPosition.y / 100) * canvas.height;
      
      // 绘制文字（先描边再填充，产生轮廓效果）
      ctx.strokeText(newText, x, y);
      ctx.fillText(newText, x, y);
      
      // 更新编辑后的图片
      const finalImage = canvas.toDataURL('image/png');
      setEditedImage(finalImage);
      toast.success('文字添加成功');
    };
    
    img.src = baseImage;
  }, [newText, textPosition, fontSize, editedImage, uploadedImage]);

  // 下载编辑后的图片
  const downloadImage = useCallback(() => {
    if (!editedImage) {
      toast.error('没有可下载的图片');
      return;
    }

    const link = document.createElement('a');
    link.href = editedImage;
    link.download = `edited-meme-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('图片已下载');
  }, [editedImage]);

  // 重置编辑器
  const resetEditor = useCallback(() => {
    setUploadedImage(null);
    setEditedImage(null);
    setNewText('');
    setTextPosition({ x: 50, y: 80 });
    setFontSize(24);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">🎨 表情包编辑器</h3>
        <p className="text-sm text-muted-foreground">
          上传表情包，去除原有文字，添加新的文字内容
        </p>
      </div>

      {/* 文件上传区域 */}
      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        {!uploadedImage ? (
          <div className="space-y-4">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <p className="text-lg font-medium">上传表情包图片</p>
              <p className="text-sm text-muted-foreground">支持 JPG、PNG、GIF 格式</p>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary hover:bg-primary/80"
            >
              选择图片
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <img
              src={editedImage || uploadedImage}
              alt="上传的图片"
              className="max-w-full max-h-64 mx-auto rounded-lg border border-border"
            />
            <div className="flex gap-2 justify-center flex-wrap">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs px-3 py-1"
              >
                <Upload className="h-3 w-3 mr-1" />
                重新上传
              </Button>
              <Button
                onClick={removeTextFromImage}
                disabled={isProcessing}
                className="text-xs px-3 py-1 bg-orange-500 hover:bg-orange-600"
              >
                <Eraser className="h-3 w-3 mr-1" />
                {isProcessing ? '处理中...' : '去除文字'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 文字编辑区域 */}
      {uploadedImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 p-4 bg-muted rounded-lg border border-border"
        >
          <h4 className="font-medium flex items-center">
            <Type className="h-4 w-4 mr-2" />
            添加新文字
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">文字内容</label>
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="输入要添加的文字..."
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  水平位置: {textPosition.x}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={textPosition.x}
                  onChange={(e) => setTextPosition(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  垂直位置: {textPosition.y}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={textPosition.y}
                  onChange={(e) => setTextPosition(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                字体大小: {fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="48"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={addTextToImage}
                disabled={!newText.trim()}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                添加文字
              </Button>
              
              {editedImage && (
                <Button
                  onClick={downloadImage}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Download className="h-4 w-4 mr-2" />
                  下载
                </Button>
              )}
              
              <Button
                onClick={resetEditor}
                className="bg-gray-500 hover:bg-gray-600"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 隐藏的Canvas用于图像处理 */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />

      <div className="text-xs text-muted-foreground text-center">
        💡 提示：文字去除功能使用简单的图像处理算法，效果可能有限。
        建议选择文字区域较为简单的表情包进行编辑。
      </div>
    </div>
  );
}

export function MemeEditorSection() {
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  // 使用示例图片
  const useExampleMeme = (url: string) => {
    setSelectedExample(url);
  };

  // 清除选中的示例（当用户上传新图片时）
  const clearSelectedExample = () => {
    setSelectedExample(null);
  };

  return (
    <section id="meme-editor-section" className="py-16 bg-background">
      <div className="container px-4">
        <div className="mb-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-chakra mb-2">
            <span className="text-primary">表情包</span> 编辑器
          </h2>
          <p className="text-muted-foreground">自定义编辑表情包，去除原文字，添加新内容</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 表情包示例 */}
          <div className="tech-card">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <ImageIcon className="h-5 w-5 text-primary mr-2" />
              <span>表情包示例</span>
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {EXAMPLE_MEMES.map((meme) => (
                <motion.div
                  key={meme.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                    selectedExample === meme.url 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => useExampleMeme(meme.url)}
                >
                  <img
                    src={meme.url}
                    alt={meme.name}
                    className="w-full aspect-square object-cover rounded-md"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors rounded-md flex items-center justify-center">
                    <span className="text-white text-xs font-medium opacity-0 hover:opacity-100 transition-opacity text-center px-2">
                      {meme.name}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>💡 点击示例图片可以快速开始编辑</p>
              <p>🎨 这些是基础模板，您也可以上传自己的图片</p>
              <p>✨ 支持去除原有文字并添加新的文字内容</p>
            </div>
          </div>

          {/* 编辑器 */}
          <div className="tech-card">
            <InlineMemeEditor 
              className="h-full" 
              selectedImage={selectedExample}
              onImageUpload={clearSelectedExample}
            />
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-muted rounded-lg border border-border">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-bold mb-2">1. 选择图片</h4>
            <p className="text-sm text-muted-foreground">
              选择示例图片或上传您自己的表情包图片
            </p>
          </div>
          
          <div className="text-center p-6 bg-muted rounded-lg border border-border">
            <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eraser className="h-6 w-6 text-orange-500" />
            </div>
            <h4 className="font-bold mb-2">2. 去除文字</h4>
            <p className="text-sm text-muted-foreground">
              使用智能算法去除图片中的原有文字内容
            </p>
          </div>
          
          <div className="text-center p-6 bg-muted rounded-lg border border-border">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Type className="h-6 w-6 text-green-500" />
            </div>
            <h4 className="font-bold mb-2">3. 添加文字</h4>
            <p className="text-sm text-muted-foreground">
              输入新的文字内容，调整位置和大小，生成专属表情包
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}