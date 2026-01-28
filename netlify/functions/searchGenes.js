// netlify/functions/searchGenes.js
const { createClient } = require('@supabase/supabase-js');

// 初始化 Supabase 客户端
// 这些环境变量需要在 Netlify 网站后台设置
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  // 设置 CORS 头，允许你的前端域名访问
  const headers = {
    'Access-Control-Allow-Origin': '*', // 上线后可替换为你的具体域名
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // 处理预检请求
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // 1. 从请求中获取查询参数
    const { query, domain, tag, limit = 10 } = event.queryStringParameters || {};
    
    // 2. 构建 Supabase 查询
    let supabaseQuery = supabase
      .from('method_gene_core')
      .select('*');

    // 3. 根据参数应用过滤器
    if (query) {
      // 在标题和描述中搜索关键词（使用全文搜索或模糊匹配）
      supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }
    if (domain) {
      // 搜索可应用领域数组中包含指定领域的记录
      supabaseQuery = supabaseQuery.contains('applicable_domains', [domain]);
    }
    if (tag) {
      // 搜索标签数组中包含指定标签的记录
      supabaseQuery = supabaseQuery.contains('tags', [tag]);
    }

    // 4. 执行查询并限制返回数量
    const { data, error } = await supabaseQuery.limit(parseInt(limit));

    if (error) throw error;

    // 5. 返回查询结果
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: '查询基因库失败',
        details: error.message 
      }),
    };
  }
};
