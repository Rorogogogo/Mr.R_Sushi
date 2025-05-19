# Mr. R Sushi 🍣

现代化的日本料理餐厅网站，专注于提供优质的寿司体验。

## 特点

- 响应式设计，适配移动端和桌面端
- 现代化 UI 设计，符合 Gen Z 审美
- 流畅的动画效果
- 优化的性能

## 快速开始

我们提供了一个简便的设置脚本来帮助您快速启动项目：

```bash
# 确保脚本有执行权限
chmod +x setup.sh

# 运行设置脚本
./setup.sh
```

设置脚本提供以下选项：

1. 启动开发服务器（本地访问）
2. 启动开发服务器和 ngrok（远程访问）
3. 仅启动 ngrok（适用于开发服务器已经运行的情况）
4. 检查 ngrok 状态

## 技术栈

- React (v19+)
- TypeScript
- Tailwind CSS
- Framer Motion
- Vite

## 开发指南

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
# 在默认端口运行
npm run dev

# 或在指定端口运行（推荐）
npm run dev:port  # 使用端口 5175
```

访问 `http://localhost:5175` 查看网站。

### 使用 ngrok 进行远程访问

先开启开发服务器：

```bash
npm run dev:port  # 使用端口 5175
```

然后在另一个终端中运行 ngrok：

```bash
npm run ngrok:5175  # 连接到端口 5175
```

或者使用组合命令一次启动所有服务：

```bash
npm run start:all
```

ngrok 将提供一个公共 URL，可以从任何设备访问你的本地开发服务器。这个 URL 将显示在终端中，格式如：`https://xxxx-xxx-xxx-xxx-xxx.ngrok-free.app`

> 注意：首次运行 ngrok 时，可能需要注册一个免费的 ngrok 账户并按照提示进行身份验证。

### 构建生产版本

```bash
npm run build
```

## 常见问题解决

### 白屏/黑屏问题

如果遇到网站加载后显示白屏或黑屏：

1. 检查浏览器控制台是否有错误
2. 确保使用了固定的端口（如 5175）：`npm run dev:port`
3. 尝试清除浏览器缓存或使用隐身模式
4. 如果使用开发模式仍有问题，尝试构建并预览：
   ```
   npm run build
   npm run preview
   ```

### ngrok 相关问题

1. 确保 ngrok 已正确安装：`npm i -g ngrok`
2. 如果遇到授权问题，请按照终端提示进行操作
3. 确保指定的端口与开发服务器匹配

## 项目结构

```
mr-r-sushi/
├── public/          # 静态资源
├── src/
│   ├── assets/      # 图片、字体等资源
│   ├── components/  # React 组件
│   ├── App.tsx      # 主应用组件
│   └── main.tsx     # 应用入口
├── index.html       # HTML 模板
├── setup.sh         # 设置脚本
└── package.json     # 项目配置
```

## 移动端优化

- 针对移动设备的特殊布局和组件
- 优化的触摸交互
- 响应式字体大小和间距
- 特殊的移动端导航体验

## 自定义字体

网站使用了多种现代字体：

- 'Be Vietnam Pro' - 主要正文文本
- 'Noto Serif JP' - 日式标题和强调文本
- 'Montserrat' - 辅助文本和按钮

## 动画效果

使用 Framer Motion 实现了多种动画效果：

- 页面元素的平滑淡入
- 悬停和点击交互
- 滚动触发的动画
- 精美的过渡效果

## Features

- Fully responsive design for mobile and desktop
- Interactive menu with filtering capabilities
- Reservation form for customers
- Contact information and opening hours
- Beautiful, modern UI with animations

## Technologies Used

- React
- TypeScript
- TailwindCSS for styling
- Framer Motion for animations

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Customization

- Update the menu items in `src/components/Menu.tsx`
- Change the restaurant information in various components as needed
- Modify the styling by editing the Tailwind configuration in `tailwind.config.js`
- Add real images by replacing the placeholder references

## Building for Production

To build the app for production, run:

```
npm run build
```

This creates a `build` folder with optimized files ready for deployment.

## License

MIT
