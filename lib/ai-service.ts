'use client';

import { generateUniqueId } from './utils';
import type { ComebackRecord } from './local-storage';

// API configuration
const API_URL = 'https://vip.apiyi.com/v1/chat/completions';
const API_KEY = 'sk-uaQsMm3KtFu9iTXcF1E7944c112b4b1b9232E3225579Fe8d'; // 文字生成
const IMAGE_API_KEY = 'sk-v8Vs0HHjVDZVSmEA1859F600006b41469f9084669c3f8234'; // 图片生成专属KEY

// Text generation using real API - 使用豆包模型
export async function generateComebacks({
  originalText,
  style,
  intensity,
  language,
}: {
  originalText: string;
  style: string;
  intensity: number;
  language: string;
}): Promise<string[]> {
  try {
    // 根据强度等级构建不同的语气描述
    const getIntensityDescription = (level: number): string => {
      if (level <= 2) return "温和礼貌，点到为止";
      if (level <= 4) return "稍有不满，但保持克制";
      if (level <= 6) return "明显不悦，语气较重";
      if (level <= 8) return "相当愤怒，言辞犀利";
      return "极度愤怒，火力全开，毫不留情";
    };

    const intensityDesc = getIntensityDescription(intensity);

    // 构建系统提示词
    const systemPrompt = `你是一个专业的回怼助手。根据用户选择的风格和愤怒程度生成高质量的回应。

风格说明：
- 文艺风：优雅、有诗意、引用经典，但要根据愤怒程度调整用词的尖锐度
- 律师风：逻辑严密、有理有据、专业术语，愤怒时更加咄咄逼人
- 东北杠精风：幽默风趣、接地气、东北方言，愤怒时更加直接粗暴
- 哲学家风：深度思考、引用哲学观点、思辨性强，愤怒时更加尖锐讽刺
- 冷嘲热讽风：讽刺幽默、不留情面、机智犀利，愤怒时更加毒舌
- 老板式发言：权威感、商业思维、指导性强，愤怒时更加霸道
- 敷衍风：应付式回应、不太在意、轻松随意，愤怒时变得不耐烦

当前愤怒程度：${intensity}/10 - ${intensityDesc}
语言：${language}

重要：必须严格按照愤怒程度调整语气！
- 1-2级：温和客气，用词礼貌
- 3-4级：略显不满，但仍克制
- 5-6级：明显愤怒，语气加重，开始使用更强烈的词汇
- 7-8级：相当愤怒，言辞犀利，不留情面
- 9-10级：极度愤怒，火力全开，用词激烈，毫不客气

请生成3个不同的回应，每个回应都必须体现出${intensity}/10的愤怒程度。回应要简洁有力，每个回应不超过200字。`;

    const userPrompt = `对方说："${originalText}"

请按照${style}的风格，严格以${intensity}/10的愤怒程度（${intensityDesc}），生成3个不同的回怼回应。

要求：
- 直接给出回怼句子，不要任何格式标记
- 每个回应独立成段
- 简洁有力，符合${style}特色
- 必须体现出${intensity}/10的愤怒程度，语气要与愤怒等级匹配
- 愤怒程度越高，用词越激烈，语气越不客气`;

    console.log('🚀 开始调用豆包AI API...');
    console.log('参数：', { style, intensity, language, originalText: originalText.substring(0, 50) + '...' });

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-v3-250324', // 改回deepseek模型
        stream: false,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    console.log('📡 API响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API请求失败:', response.status, errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ API响应成功:', data);
    
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('❌ API返回内容为空');
      throw new Error('No content in API response');
    }

    console.log('📝 生成的内容:', content);

    // 解析回应 - 针对deepseek模型优化
    let responses: string[] = [];
    
    // 清理content，移除多余的空格和换行
    const cleanContent = content.trim();
    
    console.log('🔍 开始解析内容:', cleanContent);
    
    // 先尝试按换行分割
    let lines = cleanContent
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 5); // 确保每行有内容
    
    console.log('📋 分割后的行:', lines);
    
    // 过滤掉编号和格式标记
    responses = lines
      .filter((line: string) => !line.match(/^[0-9]+[\.\)：:\s]/)) // 过滤编号
      .filter((line: string) => !line.match(/^[回应答案ABC]+[\s：:]/)) // 过滤"回应A:"等
      .filter((line: string) => !line.match(/^[\-\*\+]\s/)) // 过滤列表标记
      .filter((line: string) => line.length > 10) // 确保有足够内容
      .slice(0, 3); // 只取前3个

    console.log('🎯 过滤后的回应:', responses);

    // 如果换行分割不够，尝试按句号分割
    if (responses.length < 2) {
      console.log('⚠️ 换行分割不够，尝试句号分割');
      const sentences = cleanContent
        .split(/[。！？]/)
        .map((sentence: string) => sentence.trim())
        .filter((sentence: string) => sentence.length > 15)
        .filter((sentence: string) => !sentence.match(/^[0-9]+[\.\)：:\s]/))
        .filter((sentence: string) => !sentence.match(/^[回应答案ABC]+[\s：:]/));
      
      responses = sentences
        .map((sentence: string) => {
          // 补回标点符号
          if (!sentence.match(/[。！？]$/)) {
            return sentence + '。';
          }
          return sentence;
        })
        .slice(0, 3);
    }

    // 如果还是解析失败，直接使用原内容
    if (responses.length === 0) {
      console.log('⚠️ 解析失败，使用原内容');
      responses = [cleanContent];
    }

    // 确保有3个回应，避免undefined
    while (responses.length < 3) {
      if (responses.length > 0) {
        // 基于已有回应生成变体
        const baseResponse = responses[responses.length - 1];
        const variations = [
          baseResponse.replace(/。$/, '！'),
          baseResponse.replace(/你/, '您'),
          baseResponse + '（换个说法）'
        ];
        responses.push(variations[responses.length - 1] || baseResponse);
      } else {
        responses.push('生成回应时出现问题，请重试。');
      }
    }

    // 最终清理，确保没有undefined
    const finalResponses = responses
      .slice(0, 3)
      .map((response: string, index: number) => {
        // 严格检查和清理
        if (!response || 
            response === 'undefined' || 
            response.trim() === '' || 
            response.includes('undefined') ||
            response.toLowerCase().includes('undefined') ||
            typeof response !== 'string') {
          return `${style}回应${index + 1}：请重新生成`;
        }
        
        // 移除任何包含undefined的部分
        let cleanResponse = String(response).trim();
        
        // 多重清理undefined
        cleanResponse = cleanResponse.replace(/undefined/gi, '');
        cleanResponse = cleanResponse.replace(/\bundefined\b/gi, '');
        cleanResponse = cleanResponse.replace(/UNDEFINED/g, '');
        cleanResponse = cleanResponse.replace(/Undefined/g, '');
        
        // 清理多余空格
        cleanResponse = cleanResponse.replace(/\s+/g, ' ').trim();
        
        // 移除可能的格式标记
        cleanResponse = cleanResponse.replace(/^[回应答案ABC]+[\s：:]/gi, '');
        cleanResponse = cleanResponse.replace(/^[0-9]+[\.\)：:\s]/g, '');
        
        // 再次清理空格
        cleanResponse = cleanResponse.trim();
        
        // 如果清理后为空或太短，提供默认回应
        if (!cleanResponse || cleanResponse.length < 5) {
          return `${style}回应${index + 1}：请重新生成`;
        }
        
        return cleanResponse;
      })
      .filter(response => {
        // 最终过滤：确保没有undefined且有有效内容
        return response && 
               typeof response === 'string' && 
               !response.includes('undefined') && 
               !response.toLowerCase().includes('undefined') &&
               response.trim().length > 5;
      });

    // 确保有3个有效回应
    while (finalResponses.length < 3) {
      finalResponses.push(`${style}回应${finalResponses.length + 1}：请重新生成`);
    }

    // 最后一次验证
    const verifiedResponses = finalResponses.map((response, index) => {
      if (!response || response.includes('undefined')) {
        return `${style}回应${index + 1}：请重新生成`;
      }
      return response;
    });

    console.log('✅ 最终验证后的回应:', verifiedResponses);
    
    return verifiedResponses;
  } catch (error) {
    console.error('❌ AI API调用出错:', error);
    
    // 备用方案：返回基于风格的模板回应
    console.log('🔄 使用备用方案...');
    const fallbackResponses = getFallbackResponses(originalText, style, intensity);
    return fallbackResponses;
  }
}

// 备用回应生成器
function getFallbackResponses(originalText: string, style: string, intensity: number): string[] {
  const styleResponses: Record<string, string[]> = {
    '文艺风': [
      `我能理解你的困惑，如同冬日雪花落在温水中的短暂存在。然而，"${originalText}"这种观点，就像是在岁月的画布上用蜡笔作画，终将被时间的雨水冲刷。`,
      `若将你的言论比作一首诗，那便是缺乏韵律与意境的无病呻吟。"${originalText}"？不过是浮云掠过天空，未留痕迹。`,
      `听着你说"${originalText}"，我仿佛看见一位画家执着于用单色描绘彩虹的徒劳。思想的丰富性不该被如此简单的框架所束缚。`
    ],
    '律师风': [
      `根据现有事实和逻辑推理，"${originalText}"的论点存在明显漏洞。首先，缺乏具体证据支持；其次，违反基本因果关系；最后，与已建立的先例相矛盾。`,
      `就您提出的"${originalText}"，本人不得不指出，该主张在法理上站不住脚。如继续坚持此类毫无依据的言论，将面临逻辑与理性的双重审判。`,
      `对方所述"${originalText}"，属于未经证实的主观臆断。我方保留要求对方提供确凿证据的权利，同时强调，在缺乏事实支持的情况下，任何结论都是站不住脚的。`
    ],
    '东北杠精风': [
      `嘿！你搁这儿跟我整"${originalText}"这套啊？咋地，你寻思我缺心眼啊？别搁这儿跟我抖机灵，你那点小九九，我老远就瞅见了！`,
      `哎呀我去！"${originalText}"？您这不是扯犊子吗！我给您讲，这玩意儿就跟东北的鸡架子似的，光剩骨头没肉了！`,
      `得嘞，你接着搁这儿"${originalText}"吧！我站这儿等着，等你整明白了，咱再唠！你这理由跟二月份的冰棍似的，不够硬啊老铁！`
    ],
    '哲学家风': [
      `"${originalText}"，此言论犹如尼采所言的"上帝已死"般具有冲击力，却缺乏深度。若以海德格尔的存在主义审视，我们会发现，这不过是一种对本真性存在的逃避。`,
      `从笛卡尔的二元论出发，"${originalText}"这一观点实际上暴露了思维与存在之间的深刻矛盾。若康德在世，恐怕会将此视为典型的先验错觉。`,
      `以维特根斯坦的语言游戏理论观之，"${originalText}"这一表述陷入了语言的迷宫。它并非事实陈述，而是情感宣泄，因此不具备真假判断的条件。`
    ],
    '冷嘲热讽风': [
      `噢，"${originalText}"？真是个绝妙的发现呢！我真该把这个写进日记，标题就叫《今天又听到了一个天才的想法》。`,
      `哇，说出"${originalText}"时，你脸上那认真的表情真是太珍贵了！简直应该被录下来，放在"自信与事实背道而驰"的教科书里作为经典案例。`,
      `当你说"${originalText}"的时候，我差点就信了，直到我想起来你的观点一贯如此... 独特。不过没关系，每个人都有权拥有自己的幻想世界。`
    ],
    '老板式发言': [
      `关于"${originalText}"这个问题，我认为你需要跳出思维局限，从更高维度思考。建议你回去再深入分析，下周一给我一份详细报告。`,
      `我们公司不提倡"${originalText}"这种思维方式。要知道，市场是瞬息万变的，我们需要的是积极创新的解决方案，而不是一味地固守陈规。`,
      `说实话，听到你说"${originalText}"，我有些失望。作为一个有潜力的人才，我期待看到更有深度、更具战略眼光的分析。记住，我们要的是结果，不是借口。`
    ],
    '敷衍风': [
      `嗯...关于"${originalText}"啊，确实，你说得有道理...不过吧，这个嘛，也要看情况的，对吧？`,
      `"${originalText}"？哦，这个啊...行吧，随你怎么说。反正我这会儿正忙着呢，咱改天再聊？`,
      `你说"${originalText}"是吧？挺有意思的观点...嗯，对，可能是这样吧。你继续，我听着呢。`
    ]
  };
  
  return styleResponses[style] || styleResponses['冷嘲热讽风'];
}

// 分析文字内容，生成对应的表情包风格
function analyzeMemeStyle(text: string, style: string): {
  description: string;
  visual: string;
  expression: string;
  special: string;
} {
  const lowerText = text.toLowerCase();
  
  // 关键词分析
  const keywords = {
    animals: ['狗', '猪', '驴', '牛', '羊', '鸡', '鸭'],
    sarcasm: ['呵呵', '哦', '是吗', '真的吗', '厉害', '牛逼'],
    anger: ['滚', '死', '蠢', '傻', '笨', '垃圾'],
    dismissive: ['随便', '无所谓', '算了', '懒得', '不想'],
    superior: ['我', '老子', '爷', '本人', '在下'],
    questioning: ['？', '吗', '呢', '啊', '吧']
  };
  
  let description = '一般讽刺内容';
  let visual = 'standard panda head with neutral background';
  let expression = 'smug and dismissive look';
  let special = 'Standard meme layout with text at bottom';
  
  // 动物相关
  if (keywords.animals.some(animal => text.includes(animal))) {
    description = '涉及动物比喻的讽刺';
    visual = 'panda head with animal-related background elements';
    expression = 'disgusted and superior look, as if looking down on animals';
    special = 'Add subtle animal silhouettes in background';
  }
  
  // 强烈讽刺
  if (keywords.sarcasm.some(word => text.includes(word))) {
    description = '强烈讽刺和嘲笑';
    visual = 'panda head with exaggerated features';
    expression = 'eye-rolling with obvious sarcasm, raised eyebrow';
    special = 'Emphasize the sarcastic expression with dramatic eye-roll';
  }
  
  // 愤怒内容
  if (keywords.anger.some(word => text.includes(word))) {
    description = '愤怒和攻击性内容';
    visual = 'panda head with angry red background';
    expression = 'furious and aggressive look with furrowed brows';
    special = 'Add angry visual effects like steam or red background';
  }
  
  // 不屑内容
  if (keywords.dismissive.some(word => text.includes(word))) {
    description = '不屑和敷衍的态度';
    visual = 'panda head with bored/tired appearance';
    expression = 'completely uninterested and dismissive, half-closed eyes';
    special = 'Show extreme boredom and disinterest';
  }
  
  // 优越感
  if (keywords.superior.some(word => text.includes(word))) {
    description = '展现优越感和自信';
    visual = 'panda head with confident posture';
    expression = 'extremely confident and superior, chin up';
    special = 'Add confident body language like crossed arms or pointing';
  }
  
  // 疑问讽刺
  if (keywords.questioning.some(word => text.includes(word))) {
    description = '疑问式讽刺';
    visual = 'panda head with questioning gesture';
    expression = 'fake confused look with obvious sarcasm';
    special = 'Add question marks or confused gesture while maintaining sarcastic undertone';
  }
  
  // 根据风格调整
  switch (style) {
    case '东北杠精风':
      expression += ', with northeastern Chinese attitude';
      special += ' Add northeastern Chinese cultural elements';
      break;
    case '文艺风':
      visual = 'elegant panda head with artistic background';
      expression = 'sophisticated and cultured disdain';
      break;
    case '律师风':
      visual = 'professional panda head with formal appearance';
      expression = 'serious and authoritative look';
      special += ' Add professional/legal elements';
      break;
    case '哲学家风':
      visual = 'thoughtful panda head with philosophical background';
      expression = 'deep thinking with subtle superiority';
      break;
  }
  
  return { description, visual, expression, special };
}

// Generate memes using image generation API - 逐个生成表情包，支持实时回调
export async function generateMemes({
  originalText,
  responseTexts,
  style,
  onImageGenerated, // 新增回调函数，每生成一张图立即调用
}: {
  originalText: string;
  responseTexts: string[];
  style: string;
  onImageGenerated?: (index: number, imageUrl: string) => void;
}): Promise<string[]> {
  try {
    console.log('🎨 开始逐个生成表情包，支持实时展示...');
    console.log('回应文本数量:', responseTexts.length);

    const memeUrls: string[] = [];

    // 为每个回应文本单独生成对应的表情包
    for (let i = 0; i < Math.min(responseTexts.length, 3); i++) {
      const responseText = responseTexts[i];
      console.log(`🎯 开始生成第${i + 1}个表情包，内容:`, responseText.substring(0, 50) + '...');

      try {
        // 立即生成单张图片
        const imageUrl = await generateSingleMeme(responseText, style, i);
        memeUrls.push(imageUrl);
        
        // 立即回调通知前端显示这张图片
        if (onImageGenerated) {
          onImageGenerated(i, imageUrl);
        }
        
        console.log(`✅ 第${i + 1}个表情包生成成功:`, imageUrl);
        
      } catch (error) {
        console.error(`❌ 第${i + 1}个表情包生成出错:`, error);
        const fallbackUrl = generateSingleFallbackMeme(i);
        memeUrls.push(fallbackUrl);
        
        // 即使是备用图片也要立即回调
        if (onImageGenerated) {
          onImageGenerated(i, fallbackUrl);
        }
      }

      // 短暂延迟避免API限制，但不影响用户体验
      if (i < Math.min(responseTexts.length, 3) - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // 确保返回3个表情包
    while (memeUrls.length < 3) {
      const fallbackUrl = generateSingleFallbackMeme(memeUrls.length);
      memeUrls.push(fallbackUrl);
      if (onImageGenerated) {
        onImageGenerated(memeUrls.length - 1, fallbackUrl);
      }
    }

    console.log('✅ 所有表情包生成完成:', memeUrls);
    return memeUrls.slice(0, 3);
    
  } catch (error) {
    console.error('❌ 表情包生成出错:', error);
    console.log('🔄 使用备用表情包...');
    return generateFallbackMemes();
  }
}

// 生成单张表情包的函数
async function generateSingleMeme(responseText: string, style: string, index: number): Promise<string> {
  try {
    // 根据文字内容分析情感和关键词，生成更符合的表情包
    const memeStyle = analyzeMemeStyle(responseText, style);
    
    const prompt = `Generate a classic WeChat meme in the style of "Panda Head" memes.

Text to include: "${responseText}"

Content analysis: ${memeStyle.description}
Visual style: ${memeStyle.visual}
Expression: ${memeStyle.expression}

Style requirements:
1. Simple cartoon character with round face and expressive features (like classic panda head memes)
2. Clean design with black and white as main colors
3. Bold, readable Chinese text positioned appropriately
4. Character expression should match the content: ${memeStyle.expression}
5. 1:1 square aspect ratio, suitable for WeChat stickers
6. Minimalist background to highlight the character and text
7. Similar to classic internet meme templates
8. ${memeStyle.special}

Create a meme that perfectly matches the tone and content of the text.`;

    console.log(`📡 第${index + 1}个表情包开始API调用...`);

    // 使用gpt-4o-image模型通过聊天API生成图片
    const response = await fetch('https://vip.apiyi.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer sk-v8Vs0HHjVDZVSmEA1859F600006b41469f9084669c3f8234`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-image',
        stream: false,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates meme images based on text descriptions.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    console.log(`📡 第${index + 1}个表情包响应状态:`, response.status);

    if (response.ok) {
      const data = await response.json();
      console.log(`📡 第${index + 1}个表情包响应数据:`, data);
      
      // 从聊天API响应中提取图片URL
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        console.log(`📝 第${index + 1}个表情包响应内容:`, content);
        
        // 尝试从响应中提取图片URL（支持Markdown格式）
        let imageUrl = null;
        
        // 首先尝试提取Markdown格式的图片链接 ![图片](URL)
        const markdownRegex = /!\[.*?\]\((https?:\/\/[^\s\)]+)\)/gi;
        const markdownMatch = content.match(markdownRegex);
        
        if (markdownMatch && markdownMatch[0]) {
          const urlMatch = markdownMatch[0].match(/\((https?:\/\/[^\s\)]+)\)/);
          if (urlMatch && urlMatch[1]) {
            imageUrl = urlMatch[1];
          }
        }
        
        // 如果没有找到Markdown格式，尝试直接提取URL
        if (!imageUrl) {
          const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+\.(jpg|jpeg|png|gif|webp)/gi;
          const match = content.match(urlRegex);
          if (match && match[0]) {
            imageUrl = match[0];
          }
        }
        
        if (imageUrl) {
          console.log(`🖼️ 第${index + 1}个表情包生成成功:`, imageUrl);
          return imageUrl;
        } else {
          console.log(`⚠️ 第${index + 1}个表情包响应中未找到图片URL，内容:`, content);
          // 如果没有找到URL，可能是文本描述，使用备用方案
          throw new Error('No image URL found in response content');
        }
      } else {
        console.log(`⚠️ 第${index + 1}个表情包响应中无内容`);
        throw new Error('No content in response');
      }
    } else {
      const errorText = await response.text();
      console.error(`❌ 第${index + 1}个表情包生成失败:`, response.status, errorText);
      throw new Error(`Image generation failed: ${response.status}`);
    }
  } catch (error) {
    console.error(`❌ 第${index + 1}个表情包生成异常:`, error);
    throw error;
  }
}

// 生成单个备用表情包
function generateSingleFallbackMeme(index: number): string {
  const seeds = ['angry', 'smug', 'sarcastic'];
  const colors = ['3b82f6', 'ef4444', '10b981'];
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${seeds[index] || 'default'}&backgroundColor=${colors[index] || '6b7280'}&size=300`;
}

// 备用表情包生成器
function generateFallbackMemes(): string[] {
  return [
    generateSingleFallbackMeme(0),
    generateSingleFallbackMeme(1),
    generateSingleFallbackMeme(2)
  ];
}

// Create a complete record with real-time image generation
export async function createComebackResponse({
  originalText,
  style,
  intensity,
  language,
  enableImageGeneration = false,
  onImageGenerated, // 新增回调参数，支持实时图片展示
  onTextGenerated, // 新增回调参数，文字生成完成后立即回调
}: {
  originalText: string;
  style: string;
  intensity: number;
  language: string;
  enableImageGeneration?: boolean;
  onImageGenerated?: (index: number, imageUrl: string) => void;
  onTextGenerated?: (responses: string[]) => void;
}): Promise<ComebackRecord> {
  console.log('🚀 开始生成回怼回应，图片生成:', enableImageGeneration ? '开启' : '关闭');
  
  // 先生成文字回应
  const responses = await generateComebacks({
    originalText,
    style,
    intensity,
    language,
  });
  
  // 文字生成完成后立即回调，让前端先显示文字
  if (onTextGenerated) {
    console.log('📝 文字生成完成，立即回调前端显示');
    onTextGenerated(responses);
  }
  
  let memeUrls: string[] = [];
  
  if (enableImageGeneration) {
    console.log('🎨 开始异步生成表情包（不阻塞文字显示）...');
    // 异步生成表情包，不阻塞文字显示
    generateMemes({
      originalText,
      responseTexts: responses,
      style,
      onImageGenerated, // 传递回调给图片生成函数
    }).then(urls => {
      memeUrls = urls;
      console.log('🎨 所有表情包异步生成完成');
    }).catch(error => {
      console.error('❌ 异步表情包生成失败:', error);
      // 使用备用表情包
      memeUrls = generateFallbackMemes();
      if (onImageGenerated) {
        memeUrls.forEach((url, index) => {
          onImageGenerated(index, url);
        });
      }
    });
    
    // 立即返回占位符，不等待图片生成
    memeUrls = [
      'https://via.placeholder.com/300x300/6b7280/ffffff?text=正在生成中...',
      'https://via.placeholder.com/300x300/ef4444/ffffff?text=正在生成中...',
      'https://via.placeholder.com/300x300/10b981/ffffff?text=正在生成中...'
    ];
  } else {
    console.log('⚡ 跳过表情包生成，使用占位符');
    // 使用占位符表情包，不消耗API
    memeUrls = [
      'https://via.placeholder.com/300x300/6b7280/ffffff?text=表情包生成已关闭',
      'https://via.placeholder.com/300x300/ef4444/ffffff?text=开启后可生成',
      'https://via.placeholder.com/300x300/10b981/ffffff?text=AI表情包'
    ];
    
    // 即使是占位符也要回调，保持UI一致性
    if (onImageGenerated) {
      memeUrls.forEach((url, index) => {
        onImageGenerated(index, url);
      });
    }
  }
  
  return {
    id: generateUniqueId(),
    originalText,
    responses,
    memeUrls,
    style,
    intensity,
    language,
    timestamp: Date.now(),
  };
}

// Analyze conversation to mimic user style
export function analyzeConversation(text: string): {
  suggestedStyle: string;
  suggestedIntensity: number;
} {
  // In a real implementation, this would analyze the text
  // and suggest an appropriate style and intensity
  
  // Simple demo implementation
  const textLength = text.length;
  let suggestedStyle = '文艺风';
  let suggestedIntensity = 5;
  
  if (text.includes('?') || text.includes('？')) {
    suggestedStyle = '律师风';
    suggestedIntensity = 7;
  } else if (text.includes('!') || text.includes('！')) {
    suggestedStyle = '东北杠精风';
    suggestedIntensity = 8;
  } else if (textLength > 100) {
    suggestedStyle = '哲学家风';
    suggestedIntensity = 6;
  } else if (textLength < 20) {
    suggestedStyle = '冷嘲热讽风';
    suggestedIntensity = 9;
  }
  
  return {
    suggestedStyle,
    suggestedIntensity,
  };
}

// Determine winner of argument
export function analyzeArgumentWinner(screenshot: File): Promise<{
  winner: 'user' | 'opponent' | 'tie';
  confidence: number;
  reason: string;
}> {
  // In a real implementation, this would analyze the screenshot
  // For demo purposes, we'll simulate a response
  
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        winner: Math.random() > 0.3 ? 'user' : 'opponent',
        confidence: Math.random() * 40 + 60, // 60-100%
        reason: '根据表情、措辞和论点完整性分析，您占据了主动权。',
      });
    }, 2000);
  });
}