# 🚀 个人博客 — luckey-ke.github.io

基于 GitHub Pages 的纯静态个人博客，带物理粒子背景引擎。

## 本地预览

纯静态文件，用任意 HTTP 服务器都能跑：

```bash
# Node.js（推荐）
npx serve .

# 或者带热更新的开发服务器（文件修改自动刷新浏览器）
npx live-server --port=8080

# 或者 Python（系统自带，零安装）
python3 -m http.server 8080
```

浏览器打开 `http://localhost:8080` 即可。

## 写文章

两步：创建 `.md` 文件 + 更新 `posts.json`。

### 1. 在 `posts/` 下创建 `.md` 文件

```bash
# 文件名即 slug（URL 标识符），用英文短横线命名
touch posts/my-new-article.md
```

### 2. 更新 `posts.json`

在数组最前面加一条元数据：

```json
{
  "slug": "my-new-article",       // 必须和文件名一致（不含 .md）
  "title": "文章标题",
  "date": "2026-03-24",           // 格式：YYYY-MM-DD
  "tag": "前端",                   // 分类标签
  "tagColor": "#42b883",          // 标签颜色（hex）
  "excerpt": "一句话文章摘要",      // 显示在首页卡片上
  "readTime": 5                    // 预估阅读分钟数
}
```

### 3. 提交推送

```bash
git add posts/my-new-article.md posts.json
git commit -m "Add article: my-new-article"
git push origin main
```

等待 1-2 分钟 GitHub Pages 部署完成。

## 管理项目作品

项目数据在 `projects.json` 中，结构如下：

```json
{
  "icon": "🚀",                    // emoji 图标
  "title": "项目名称",
  "desc": "一句话描述",
  "tags": ["JavaScript", "Vue"],   // 技术标签
  "link": "https://github.com/luckey-ke/xxx"
}
```

增删改直接编辑 `projects.json`，然后 `git push` 即可。

## 文件结构

```
├── index.html      # 博客首页（文章卡片、项目展示、关于我）
├── post.html       # 文章详情页（根据 ?slug=xxx 加载 .md 并渲染）
├── posts.json      # 文章索引（手动维护）
├── posts/          # 文章目录（每篇一个 .md 文件）
│   ├── java8-syntactic-sugar.md
│   ├── git-cheatsheet.md
│   └── ...
├── projects.json   # 项目作品列表（手动维护）
├── style.css       # 全局样式（暗色/亮色主题）
├── post.css        # 文章页样式
├── physics.js      # 2D 物理引擎 + 粒子背景
├── main.js         # 交互逻辑（打字机、滚动动画、主题切换）
├── markdown.js     # Markdown → HTML 渲染器
└── build.js        # 构建脚本（可选）
```

## 自定义

### 修改打字机文字

在 `main.js` 中修改 `roles` 数组：

```js
const roles = [
  '全栈开发者',
  '开源爱好者',
  // 添加更多...
]
```

### 调整物理效果

在 `physics.js` 中修改 `CFG` 对象：

```js
const CFG = {
  count: 45,             // 粒子数量
  gravity: 0.04,         // 重力强度
  buoyancy: -0.02,       // 浮力（负值 = 向上）
  airDensity: 0.0008,    // 空气阻力系数
  noiseStrength: 0.12,   // 流场噪声强度
  restitution: 0.65,     // 弹性系数 (0-1)
  mouseRepel: 1.2,       // 鼠标斥力
  mouseVortex: 0.3,      // 鼠标涡旋力
  trailLength: 6,        // 粒子拖尾长度
}
```

### 调整分页数量

在 `index.html` 的 `<script>` 中修改 `PER_PAGE`：

```js
const PER_PAGE = 6  // 每页显示几篇文章
```

## 特性

- ⚡ 高级物理引擎（重力 + 浮力、空气阻力、Perlin 噪声流场、角动量碰撞）
- 🌟 粒子拖尾 + 碰撞脉冲发光 + 鼠标涡旋交互
- 🎨 暗色 / 亮色主题切换
- 📱 响应式设计
- ✨ 打字机效果
- 🎭 卡片 3D 倾斜悬停效果
- 🔮 滚动渐显动画
- 📄 Markdown 自动渲染
- 📖 分页功能
- 🐳 项目作品展示
