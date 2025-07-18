# DDD Page Builder

一个基于 Next.js、React、TailwindCSS 和 GrapeJS 构建的现代化页面编辑器。

## 功能特性

### 🎨 可视化页面编辑

- 基于 GrapeJS 的可视化页面编辑器
- 拖拽式组件编辑
- 实时预览功能
- 支持 TailwindCSS 样式

### 💾 数据管理

- 本地存储保存/加载
- 导入/导出 HTML 文件
- 项目状态持久化
- 自动保存功能

### 🛠️ 编辑器功能

- 组件拖拽添加
- 样式实时编辑
- 图层管理
- 属性面板
- 响应式设计支持

### 🎯 用户界面

- 现代化 UI 设计
- 基于 shadcn/ui 组件库
- 响应式布局
- 中文界面

## 技术栈

- **前端框架**: Next.js 15.4.1
- **UI 库**: React 19.1.0
- **样式**: TailwindCSS 4
- **编辑器**: GrapeJS Studio SDK
- **组件库**: shadcn/ui
- **图标**: Lucide React
- **语言**: TypeScript

## 快速开始

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 启动开发服务器

```bash
npm run dev
# 或
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 访问编辑器

编辑器位于 `/editor` 路径：
[http://localhost:3000/editor](http://localhost:3000/editor)

## 使用指南

### 基本操作

1. **添加组件**: 从左侧面板拖拽组件到画布
2. **编辑内容**: 点击组件进行编辑
3. **调整样式**: 使用右侧属性面板调整样式
4. **预览页面**: 点击"预览"按钮查看效果
5. **保存项目**: 点击"保存"按钮保存到本地存储

### 工具栏功能

- **保存**: 将当前页面保存到本地存储
- **预览**: 在新窗口中预览页面
- **导出**: 导出为 HTML 文件
- **导入**: 导入 HTML 或 JSON 文件
- **重置**: 清空编辑器内容

### 支持的组件

- 文本组件
- 图片组件
- 按钮组件
- 卡片组件
- 容器组件
- 自定义 HTML

### TailwindCSS 支持

编辑器内置了常用的 TailwindCSS 类名支持：

```css
/* 布局 */
.container, .flex, .grid
/* 间距 */
.p-4, .m-4, .gap-4
/* 颜色 */
.bg-blue-500, .text-white
/* 边框 */
.rounded-lg, .border
/* 阴影 */
.shadow-md
/* 响应式 */
.md:flex, lg:grid
```

## 项目结构

```
src/
├── app/
│   ├── editor/
│   │   ├── page.tsx          # 编辑器页面
│   │   └── editor.css        # 编辑器样式
│   ├── globals.css           # 全局样式
│   ├── layout.tsx            # 根布局
│   └── page.tsx              # 首页
├── components/
│   └── ui/
│       └── button.tsx        # 按钮组件
├── lib/
│   └── utils.ts              # 工具函数
└── types/
    └── editor.ts             # 编辑器类型定义
```

## 开发指南

### 添加新组件

1. 在编辑器中定义组件结构
2. 添加相应的 TailwindCSS 样式
3. 更新类型定义（如需要）

### 自定义样式

编辑 `src/app/editor/editor.css` 文件来自定义编辑器界面样式。

### 扩展功能

- 添加新的工具栏按钮
- 集成后端 API
- 添加更多组件类型
- 实现协作编辑功能

## 部署

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
