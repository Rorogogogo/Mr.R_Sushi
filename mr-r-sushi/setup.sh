#!/bin/bash

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=======================================${NC}"
echo -e "${GREEN}    Mr. R Sushi 网站设置助手工具    ${NC}"
echo -e "${GREEN}=======================================${NC}"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}未检测到 Node.js! 请先安装 Node.js${NC}"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}正在安装依赖项...${NC}"
    npm install
fi

# Show menu
echo "请选择一个选项:"
echo "1) 启动开发服务器 (本地访问)"
echo "2) 启动开发服务器和 ngrok (远程访问)"
echo "3) 仅启动 ngrok (假设开发服务器已在运行)"
echo "4) 检查 ngrok 状态"
echo "q) 退出"
echo ""

read -p "请输入选项 [1-4/q]: " choice

case $choice in
    1)
        echo -e "${GREEN}启动开发服务器...${NC}"
        npm run dev:port
        ;;
    2)
        echo -e "${GREEN}启动开发服务器和 ngrok...${NC}"
        echo -e "${YELLOW}请注意: 需要在浏览器中确认 ngrok 授权${NC}"
        npm run start:all
        ;;
    3)
        echo -e "${GREEN}启动 ngrok (连接到端口 5175)...${NC}"
        npm run ngrok:5175
        ;;
    4)
        echo -e "${GREEN}检查 ngrok 状态...${NC}"
        ps -ef | grep ngrok | grep -v grep
        ;;
    q|Q)
        echo -e "${GREEN}再见!${NC}"
        exit 0
        ;;
    *)
        echo -e "${YELLOW}无效选项${NC}"
        ;;
esac 