// 测试API的脚本
import fetch from 'node-fetch';

const API_URL = 'https://vip.apiyi.com/v1/chat/completions';
const API_KEY = 'sk-uaQsMm3KtFu9iTXcF1E7944c112b4b1b9232E3225579Fe8d';

async function testDoubaoModel() {
  console.log('🧪 开始测试豆包模型...');
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'doubao-1.5-pro-256k',
        stream: false,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的回怼助手。按照东北杠精风格生成回应。',
          },
          {
            role: 'user',
            content: '对方说："你是不是傻？"，请用东北杠精风格回怼，直接给出3个不同的回应，每个回应独立成段。',
          },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    console.log('📡 豆包模型响应状态:', response.status);

    const data = await response.json();
    console.log('✅ 豆包模型响应:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('💥 豆包模型测试出错:', error);
  }
}

async function testImageAPI() {
  console.log('🧪 开始测试图片生成API...');
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-image',
        stream: false,
        messages: [
          {
            role: 'user',
            content: '生成一个简单的表情包图片，内容是"测试"两个字',
          },
        ],
      }),
    });

    console.log('📡 响应状态:', response.status);

    const data = await response.json();
    console.log('✅ 完整响应:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('💥 测试出错:', error);
  }
}

async function testTextAPI() {
  console.log('🧪 开始测试文字生成API...');
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-v3-250324',
        stream: false,
        messages: [
          {
            role: 'user',
            content: '请说"你好"',
          },
        ],
      }),
    });

    console.log('📡 文字API响应状态:', response.status);

    const data = await response.json();
    console.log('✅ 文字API响应:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('💥 文字测试出错:', error);
  }
}

// 运行测试
await testTextAPI();
await testDoubaoModel();
await testImageAPI(); 