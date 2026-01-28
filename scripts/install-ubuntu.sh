#!/bin/bash
echo "================================"
echo "三头六臂创世系统 - 安装向导"
echo "================================"

# 安装Node.js
if ! command -v node &> /dev/null; then
    echo "安装Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# 检查安装
node --version
npm --version

echo "安装完成！"
echo "下一步："
echo "1. 安装项目依赖: npm install"
echo "2. 启动开发: npm run dev"
