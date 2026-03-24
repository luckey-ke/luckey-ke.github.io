# 🚀 个人博客 — GitHub Pages 部署指南

## 本地预览

```bash
# 起个本地服务器
python3 -m http.server 8080
# 访问 http://localhost:8080
```

## 写文章流程

### 1. 在 `posts/` 下创建 `.md` 文件

文件名即 slug（URL 路径），用英文短横线命名，例如：`my-first-post.md`。

### 2. 文件开头写 YAML front matter

```markdown
---
title: "文章标题"
date: "2026-03-24"
tag: "分类标签"
tagColor: "#667eea"
excerpt: "文章摘要，会显示在首页卡片上"
---

正文内容从这里开始...
```

**必填字段：** `title`、`date`
**可选字段：** `tag`（默认"未分类"）、`tagColor`、`excerpt`、`readTime`（不填会自动估算）

### 3. 运行构建脚本

```bash
node build.js
```

自动扫描 `posts/` 目录，读取每篇文章的 front matter，生成 `posts.json`。

### 4. 提交并推送

```bash
git add -A && git commit -m "add new post" && git push
```

## 文件结构

```
├── index.html      # 主页面（含分页）
├── post.html       # 文章详情页
├── style.css       # 样式（暗色/亮色主题）
├── post.css        # 文章页样式
├── physics.js      # 2D 物理引擎 + 粒子系统
├── main.js         # 交互逻辑
├── markdown.js     # Markdown 渲染器
├── build.js        # 🔧 自动生成 posts.json 的脚本
├── posts.json      # 文章索引（由 build.js 自动生成，不要手动编辑）
├── posts/          # 📝 文章目录
│   ├── xxx.md
│   └── yyy.md
└── README.md       # 本文件
```

## 自定义

### 修改打字机文字

在 `main.js` 中修改 `roles` 数组：

```js
const roles = [
  '你的身份 1',
  '你的身份 2',
]
```

### 调整物理效果

在 `physics.js` 中修改 `CFG` 对象：

```js
const CFG = {
  count: 50,        // 粒子数量
  gravity: 0.15,    // 重力强度
  friction: 0.99,   // 摩擦力
  restitution: 0.7, // 弹性系数 (0-1)
  mouseRadius: 120, // 鼠标影响范围
  mouseForce: 0.8,  // 鼠标力强度
}
```

### 调整分页数量

在 `index.html` 的 `<script>` 中修改 `PER_PAGE`：

```js
const PER_PAGE = 6  // 每页显示几篇文章
```

## 特性

- ⚡ 真实物理引擎（重力、弹性碰撞、摩擦力）
- 🎨 暗色/亮色主题切换
- 📱 响应式设计
- ✨ 打字机效果
- 🎭 卡片 3D 倾斜悬停效果
- 🔮 滚动渐显动画
- 🌟 鼠标交互粒子系统
- 📄 Markdown 自动渲染
- 📖 分页功能
- 🔧 自动构建（node build.js）
