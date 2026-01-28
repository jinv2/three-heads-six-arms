// netlify/functions/understand-and-match.js
const { createClient } = require('@supabase/supabase-js');

// 初始化Supabase客户端
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  // 设置CORS头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // 处理预检请求
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // 只允许POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: '只允许POST请求' })
    };
  }

  try {
    // 解析用户输入
    let userInput = '';
    try {
      const body = JSON.parse(event.body || '{}');
      userInput = body.userInput || '';
    } catch (e) {
      userInput = event.body || '';
    }

    if (!userInput.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: '请输入内容' 
        })
      };
    }

    console.log('📥 收到用户输入:', userInput);

    // ==================== 核心理解引擎 ====================
    // 1. 定义"理解规则"：将用户输入映射到问题场景
    const understandingRules = [
      { 
        pattern: ['悬疑', '悬念', '推理', '侦探', '神秘', '伏笔', '反转'], 
        scenarios: ['如何制造悬念', '如何抓住观众注意力', '如何设计故事节奏'],
        domains: ['文学', '影视', '编剧'],
        tags: ['悬念', '叙事', '节奏']
      },
      { 
        pattern: ['音乐', '作曲', '制作人', '节奏', '旋律', '和声', '编曲', '歌曲'], 
        scenarios: ['如何设计重复的记忆点', '如何规划情绪节奏', '如何制造对比效果', '如何建立结构'],
        domains: ['音乐', '声音设计', '音频'],
        tags: ['节奏', '结构', '情绪']
      },
      { 
        pattern: ['品牌', '设计', '视觉', 'UI', 'UX', '平面', '包装', 'logo', '标志'], 
        scenarios: ['如何引导观众视线', '如何突出视觉重点', '如何建立品牌叙事', '如何传递品牌价值'],
        domains: ['设计', '营销', '品牌'],
        tags: ['视觉', '构图', '叙事']
      },
      { 
        pattern: ['写作', '文案', '文章', '小说', '故事', '剧本', '内容'], 
        scenarios: ['如何清晰表达', '如何结构化思考', '如何说服他人', '如何构建叙事'],
        domains: ['文学', '内容', '传播'],
        tags: ['结构', '叙事', '表达']
      },
      { 
        pattern: ['产品', '创新', '创业', '项目', '开发', '从零开始'], 
        scenarios: ['如何突破常规思考', '如何从零创新', '如何集中资源', '如何找到突破口'],
        domains: ['产品', '创业', '管理'],
        tags: ['创新', '战略', '规划']
      },
      { 
        pattern: ['演讲', '表达', '沟通', '说服', '演讲', 'presentation'], 
        scenarios: ['如何清晰表达', '如何结构化思考', '如何说服他人', '如何吸引注意力'],
        domains: ['沟通', '管理', '个人成长'],
        tags: ['表达', '结构', '说服']
      },
      { 
        pattern: ['营销', '推广', '广告', '销售', '转化', '客户'], 
        scenarios: ['如何抓住观众注意力', '如何建立品牌叙事', '如何传递价值主张'],
        domains: ['营销', '销售', '品牌'],
        tags: ['叙事', '沟通', '转化']
      },
      { 
        pattern: ['空间', '展览', '陈列', '店铺', '环境', '体验'], 
        scenarios: ['如何引导观众视线', '如何设计空间动线', '如何营造体验氛围'],
        domains: ['设计', '空间', '体验'],
        tags: ['空间', '动线', '体验']
      }
    ];

    // 2. 分析用户输入，提取关键意图
    const matchedScenarios = [];
    const matchedDomains = [];
    const matchedTags = [];
    
    const inputLower = userInput.toLowerCase();
    
    understandingRules.forEach(rule => {
      const hasMatch = rule.pattern.some(keyword => 
        inputLower.includes(keyword.toLowerCase())
      );
      
      if (hasMatch) {
        matchedScenarios.push(...rule.scenarios);
        matchedDomains.push(...rule.domains);
        matchedTags.push(...rule.tags);
        console.log(`✅ 匹配规则: ${rule.pattern[0]}...`);
      }
    });

    // 去重
    const uniqueScenarios = [...new Set(matchedScenarios)];
    const uniqueDomains = [...new Set(matchedDomains)];
    const uniqueTags = [...new Set(matchedTags)];

    console.log('🎯 识别场景:', uniqueScenarios);
    console.log('🎯 识别领域:', uniqueDomains);
    console.log('🎯 识别标签:', uniqueTags);

    // ==================== 智能查询逻辑 ====================
    let genes = [];
    let queryMethod = '';

    if (uniqueScenarios.length > 0) {
      // 方法1：基于问题场景查询
      queryMethod = '场景匹配';
      const { data: scenarioData, error: scenarioError } = await supabase
        .from('method_gene_core')
        .select('*')
        .overlaps('problem_scenarios', uniqueScenarios)
        .limit(5);
      
      if (!scenarioError && scenarioData && scenarioData.length > 0) {
        genes = scenarioData;
      }
    }

    if (genes.length === 0 && uniqueDomains.length > 0) {
      // 方法2：基于领域查询
      queryMethod = '领域匹配';
      const { data: domainData, error: domainError } = await supabase
        .from('method_gene_core')
        .select('*')
        .overlaps('applicable_domains', uniqueDomains)
        .limit(5);
      
      if (!domainError && domainData && domainData.length > 0) {
        genes = domainData;
      }
    }

    if (genes.length === 0 && uniqueTags.length > 0) {
      // 方法3：基于标签查询
      queryMethod = '标签匹配';
      const { data: tagData, error: tagError } = await supabase
        .from('method_gene_core')
        .select('*')
        .overlaps('tags', uniqueTags)
        .limit(5);
      
      if (!tagError && tagData && tagData.length > 0) {
        genes = tagData;
      }
    }

    if (genes.length === 0) {
      // 方法4：降级方案 - 全文搜索
      queryMethod = '关键词搜索';
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('method_gene_core')
        .select('*')
        .or(`title.ilike.%${userInput}%,description.ilike.%${userInput}%`)
        .limit(5);
      
      if (!fallbackError) {
        genes = fallbackData || [];
      }
    }

    // ==================== 格式化响应 ====================
    const response = {
      success: true,
      analysis: {
        user_input: userInput,
        matched_scenarios: uniqueScenarios,
        matched_domains: uniqueDomains,
        matched_tags: uniqueTags,
        query_method: queryMethod,
        intelligence_level: uniqueScenarios.length > 0 ? '高级理解' : '基础匹配'
      },
      data: genes,
      recommendations: genes.length > 0 ? [
        `基于您的描述，我们为您匹配了 ${genes.length} 个高相关方法基因`,
        `这些方法可帮助您解决：${uniqueScenarios.slice(0, 3).join('、')}`,
        `建议将这些方法应用到：${uniqueDomains.slice(0, 3).join('、')}领域`
      ] : ['未找到高度匹配的方法基因，建议调整描述或探索通用方法论']
    };

    console.log(`📊 匹配结果: ${genes.length} 个基因，方法: ${queryMethod}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('❌ 函数错误:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '智能分析失败',
        details: error.message,
        fallback: '系统正在维护，请稍后再试'
      })
    };
  }
};
