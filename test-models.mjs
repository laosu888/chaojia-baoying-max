// 测试不同图片模型
import fetch from 'node-fetch';

const API_URL = 'https://vip.apiyi.com/v1/chat/completions';
const API_KEY = 'sk-uaQsMm3KtFu9iTXcF1E7944c112b4b1b9232E3225579Fe8d';

const imageModels = [
  'dall-e-2',
  'dall-e-3'
];

async function testModel(model) {
  console.log(`\n🧪 测试模型: ${model}`);
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        stream: false, // 确保不使用流式
        messages: [
          {
            role: 'user',
            content: '生成一个简单的表情包图片，内容是"哎呦我去"三个字，背景是红色渐变',
          },
        ],
      }),
    });

    console.log(`📡 ${model} 响应状态: ${response.status}`);

    const responseText = await response.text();
    console.log(`📄 ${model} 原始响应:`, responseText.substring(0, 500));

    // 尝试解析JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log(`✅ ${model} 成功解析JSON!`);
      console.log('响应:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      // 如果是流式数据，尝试提取JSON部分
      if (responseText.includes('data: {')) {
        const jsonMatch = responseText.match(/data: ({.*?})\n/);
        if (jsonMatch) {
          try {
            data = JSON.parse(jsonMatch[1]);
            console.log(`✅ ${model} 从流式数据中解析成功!`);
            console.log('响应:', JSON.stringify(data, null, 2));
          } catch (streamParseError) {
            console.log(`❌ ${model} 流式数据解析失败:`, streamParseError.message);
          }
        }
      } else {
        console.log(`❌ ${model} JSON解析失败:`, parseError.message);
      }
    }

  } catch (error) {
    console.error(`💥 ${model} 测试出错:`, error.message);
  }
}

// 测试所有模型
for (const model of imageModels) {
  await testModel(model);
  await new Promise(resolve => setTimeout(resolve, 2000)); // 等2秒避免频率限制
} 