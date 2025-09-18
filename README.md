# MobieTV

基于 Vue3 + TypeScript + Vite + Tailwind CSS + Vant UI 的移动端电视应用

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - JavaScript 的超集，提供静态类型检查
- **Vite** - 下一代前端构建工具
- **@vitejs/plugin-legacy** - 兼容旧版浏览器
- **Tailwind CSS** - 实用程序优先的 CSS 框架
- **Vant UI** - 轻量、可靠的移动端 Vue 组件库

## 开发

```bash
# 安装依赖
pnpm install

# 开发服务器
pnpm dev

# 构建
pnpm build

# 预览构建结果
pnpm preview

# 代码检查
pnpm lint

# 类型检查
pnpm type-check
```

## 项目结构

```
src/
├── components/     # 复用组件
├── views/         # 页面组件
├── router/        # 路由配置
├── assets/        # 静态资源
│   └── styles/    # 样式文件
├── types/         # TypeScript 类型定义
└── utils/         # 工具函数
```
