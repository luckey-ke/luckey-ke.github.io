# 🚀 个人博客 — GitHub Pages 部署指南

## 本地预览

直接用浏览器打开 `index.html` 即可，纯静态无需构建。

```bash
# 或者用 Python 起个本地服务器
cd blog
python3 -m http.server 8080
# 访问 http://localhost:8080
```

## GitHub Pages 部署

### 方法一：用户站点（推荐）

1. 创建仓库，名称为 `你的用户名.github.io`
2. 把 `blog/` 目录下的所有文件推送到仓库根目录
3. 进入仓库 Settings → Pages → Source 选择 `main` 分支
4. 等待几分钟，访问 `https://你的用户名.github.io`

### 方法二：项目站点

1. 在任意仓库中创建 `docs/` 目录，把文件放进去
2. Settings → Pages → Source 选择 `main` 分支 + `/docs` 目录
3. 访问 `https://你的用户名.github.io/仓库名`

## 自定义

### 必须修改的地方

打开 `index.html`，搜索 `{{` 替换以下内容：

| 占位符 | 替换为 |
|--------|--------|
| `{{你的名字}}` | 你的名字/昵称 |
| `{{username}}` | GitHub 用户名 |
| `{{email}}` | 你的邮箱 |

### 添加博客文章

在 `index.html` 的 `.blog-grid` 中复制 `.blog-card` 模板：

```html
<article class="blog-card" data-physics="hover">
  <div class="blog-card-image" style="background: linear-gradient(135deg, #颜色1, #颜色2);">
    <span class="blog-tag">标签</span>
  </div>
  <div class="blog-card-body">
    <time class="blog-date">2026-03-24</time>
    <h3 class="blog-title">文章标题</h3>
    <p class="blog-excerpt">文章摘要...</p>
    <a href="post-url" class="blog-link">阅读全文 →</a>
  </div>
</article>
```

### 修改打字机文字

在 `main.js` 中修改 `roles` 数组：

```js
const roles = [
  '你的身份 1',
  '你的身份 2',
  // ...
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

## 文件结构

```
blog/
├── index.html    # 主页面
├── style.css     # 样式（暗色/亮色主题）
├── physics.js    # 2D 物理引擎 + 粒子系统
├── main.js       # 交互逻辑
└── README.md     # 本文件
```

## 特性

- ⚡ 真实物理引擎（重力、弹性碰撞、摩擦力）
- 🎨 暗色/亮色主题切换
- 📱 响应式设计
- ✨ 打字机效果
- 🎭 卡片 3D 倾斜悬停效果
- 🔮 滚动渐显动画
- 🌟 鼠标交互粒子系统（点击空白处生成粒子）
- 🚀 纯静态，零依赖，秒开
