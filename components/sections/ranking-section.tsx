'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowUp, Upload, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

type RankingUser = {
  name: string;
  winRate: number;
  favoriteStyle: string;
  classicQuote: string;
  avatarUrl: string;
};

const DEMO_RANKINGS: RankingUser[] = [
  {
    name: '怼王9527',
    winRate: 98,
    favoriteStyle: '律师风',
    classicQuote: '您的发言不仅缺乏逻辑基础，更是对基本常识的挑战。',
    avatarUrl: 'https://picsum.photos/100/100?random=1'
  },
  {
    name: '东北小福贵',
    winRate: 92,
    favoriteStyle: '东北杠精风',
    classicQuote: '你这话说的，跟咸鱼翻身似的，又臭又没用！',
    avatarUrl: 'https://picsum.photos/100/100?random=2'
  },
  {
    name: '文艺青年不搞艺术',
    winRate: 87,
    favoriteStyle: '文艺风',
    classicQuote: '你的观点如同冬日的阳光，看似温暖却毫无实质热度。',
    avatarUrl: 'https://picsum.photos/100/100?random=3'
  },
  {
    name: '哲学系饮水机管理员',
    winRate: 85,
    favoriteStyle: '哲学家风',
    classicQuote: '以海德格尔的存在主义视角，你的言论不过是对本真性的逃避。',
    avatarUrl: 'https://picsum.photos/100/100?random=4'
  },
  {
    name: '职场小韭菜',
    winRate: 82,
    favoriteStyle: '老板式发言',
    classicQuote: '我们需要的是解决方案，不是借口。下班前把报告发我邮箱。',
    avatarUrl: 'https://picsum.photos/100/100?random=5'
  },
];

export function RankingSection() {
  const [rankings, setRankings] = useState<RankingUser[]>(DEMO_RANKINGS);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 生成随机用户名
  const generateRandomUsername = (): string => {
    const prefixes = ['怼王', '杠精', '辩论家', '口才王', '回怼大师', '吵架之神', '论战高手', '嘴炮专家'];
    const suffixes = ['9527', '666', '2024', '888', '520', '1314', '007', '999'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${randomPrefix}${randomSuffix}`;
  };

  // 生成随机头像URL
  const generateRandomAvatar = (): string => {
    const randomSeed = Math.floor(Math.random() * 1000);
    return `https://picsum.photos/100/100?random=${randomSeed}`;
  };

  // 生成随机胜率
  const generateRandomWinRate = (): number => {
    return Math.floor(Math.random() * 30) + 70; // 70-99%
  };

  // 生成随机风格
  const generateRandomStyle = (): string => {
    const styles = ['文艺风', '律师风', '东北杠精风', '哲学家风', '冷嘲热讽风', '老板式发言', '敷衍风'];
    return styles[Math.floor(Math.random() * styles.length)];
  };

  // 生成随机经典语录
  const generateRandomQuote = (): string => {
    const quotes = [
      '这波操作我给满分！',
      '论战场上，我从未败过！',
      '你的逻辑漏洞比筛子还大',
      '我用事实说话，你用什么？',
      '这就是传说中的降维打击',
      '不好意思，我又赢了',
      '你的观点很有创意，但不符合现实',
      '建议你回去再想想'
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  // Handle screenshot upload
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }
    
    // 读取并显示图片
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      toast.success('截图上传成功！点击"提交我的战绩"添加到排行榜');
    };
    reader.readAsDataURL(file);
  };

  // 提交战绩到排行榜
  const handleSubmitRecord = () => {
    if (!uploadedImage) {
      toast.error('请先上传对骂截图');
      return;
    }

    setIsSubmitting(true);

    // 模拟提交延迟
    setTimeout(() => {
      const newUser: RankingUser = {
        name: generateRandomUsername(),
        winRate: generateRandomWinRate(),
        favoriteStyle: generateRandomStyle(),
        classicQuote: generateRandomQuote(),
        avatarUrl: generateRandomAvatar(),
      };

      // 添加到排行榜并重新排序
      const updatedRankings = [...rankings, newUser]
        .sort((a, b) => b.winRate - a.winRate)
        .slice(0, 10); // 只保留前10名

      setRankings(updatedRankings);
      setUploadedImage(null);
      setIsSubmitting(false);

      toast.success(`🎉 恭喜！${newUser.name} 以 ${newUser.winRate}% 胜率成功上榜！`);
      
      // 重置文件输入
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }, 2000);
  };
  
  return (
    <section className="py-16 bg-muted/30">
      <div className="container px-4">
        <div className="mb-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-chakra mb-2">
            战绩<span className="text-primary">榜</span>
          </h2>
          <p className="text-muted-foreground">
            看看谁是最强吵架王
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rankings */}
          <div className="tech-card lg:col-span-2">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Trophy className="h-5 w-5 text-accent_orange mr-2" />
              <span>吵架排行榜</span>
            </h3>
            
            <div className="space-y-4">
              {rankings.map((user, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg border border-border"
                >
                  <div className="flex-shrink-0 font-bold text-xl text-center w-8">
                    {index + 1}
                  </div>
                  
                  <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold">{user.name}</h4>
                      <div className="flex items-center text-primary">
                        <span className="text-sm font-medium">{user.winRate}%</span>
                        <ArrowUp className="h-3 w-3 ml-1" />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                      <span>最爱风格：{user.favoriteStyle}</span>
                    </div>
                    
                    <Progress value={user.winRate} className="h-1" />
                    
                    <p className="text-xs text-foreground/80 mt-2 italic line-clamp-1">
                      "{user.classicQuote}"
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Screenshot Analysis */}
          <div className="tech-card">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Upload className="h-5 w-5 text-accent_green mr-2" />
              <span>对骂截图分析</span>
            </h3>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                上传与他人的对骂截图，直接添加到排行榜
              </p>
              
              <div className="relative">
                {uploadedImage ? (
                  <div className="bg-muted/50 border border-border rounded-lg overflow-hidden">
                    <img
                      src={uploadedImage}
                      alt="上传的截图"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-2 bg-muted/80 text-center">
                      <p className="text-xs text-muted-foreground">
                        截图已上传，点击下方按钮提交战绩
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/50 border border-dashed border-border rounded-lg h-48 flex items-center justify-center">
                    <div className="text-center p-4">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground text-sm">
                        点击上传或拖放截图至此处
                      </p>
                    </div>
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={isSubmitting}
                />
              </div>
              
              {isSubmitting && (
                <div className="text-center py-4">
                  <div className="inline-block relative w-12 h-12 mb-2">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                    <div className="absolute inset-2 bg-primary/40 rounded-full animate-pulse animation-delay-150"></div>
                    <Zap className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse animation-delay-300" />
                  </div>
                  <p className="text-sm">正在添加到排行榜...</p>
                </div>
              )}
              
              <div className="pt-2">
                <Button
                  disabled={isSubmitting || !uploadedImage}
                  className="w-full bg-accent_green hover:bg-accent_green/90"
                  onClick={handleSubmitRecord}
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2">提交中...</span>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    </>
                  ) : (
                    <>
                      <span className="mr-2">提交我的战绩</span>
                      <Trophy className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}