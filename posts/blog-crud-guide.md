## 前言

这个博客是纯静态架构，没有后台管理系统。所有文章以 Markdown 文件存储，项目作品以 JSON 数据存储，均通过 GitHub 仓库直接管理。本文详细说明**文章**和**项目作品**的增删改查操作方式。

---

## 项目结构

```
luckey-ke.github.io/
├── index.html          # 博客首页
├── post.html           # 文章详情页
├── posts.json          # 文章索引（核心配置）
├── posts/              # 文章目录（.md 文件）
│   ├── java8-syntactic-sugar.md
│   ├── git-cheatsheet.md
│   └── ...
├── projects.json       # 项目作品列表（核心配置）
├── style.css           # 全局样式
├── post.css            # 文章页样式
├── main.js             # 交互逻辑
├── physics.js          # 物理引擎
├── markdown.js         # Markdown 渲染器
└── build.js            # 构建脚本
```

**两套数据，两种管理方式**：
- **文章**：`posts/xxx.md`（内容）+ `posts.json`（索引）→ 两个文件
- **项目**：`projects.json`（全部数据）→ 一个文件

---

## 一、文章管理

### 查（Read）

**在线阅读**：首页文章卡片从 `posts.json` 读取，点击跳转 `post.html?slug=xxx` 自动加载对应的 `.md` 文件渲染。

**本地查看**：

```bash
git clone https://github.com/luckey-ke/luckey-ke.github.io.git
cd luckey-ke.github.io

ls posts/                           # 查看所有文章
cat posts/java8-syntactic-sugar.md  # 查看文章内容
cat posts.json | python3 -m json.tool  # 查看文章索引
```

**本地预览**：

因为是纯静态文件（HTML/CSS/JS），用任意 HTTP 服务器都能跑。

```bash
# ===== 方式一：Node.js（推荐，你的技术栈） =====

# npx serve — 最简洁，自动打开浏览器
npx serve .

# npx http-server — 功能更多，支持缓存控制、CORS 等
npx http-server -p 8080 -o

# npx live-server — 文件改动自动刷新浏览器
npx live-server --port=8080

# ===== 方式二：Python（零安装，系统自带） =====

# Python 3
python3 -m http.server 8080

# Python 2（老系统）
python -m SimpleHTTPServer 8080

# ===== 方式三：PHP（装了 PHP 就能用） =====
php -S localhost:8080

# ===== 方式四：Ruby =====
ruby -run -ehttpd . -p8080

# ===== 方式五：VS Code 插件（开发体验最好） =====
# 安装 "Live Server" 插件（ritwickdey.LiveServer）
# 右键 index.html → "Open with Live Server"
# 支持：自动刷新、热更新、CSS 注入
```

启动后浏览器打开 `http://localhost:8080` 即可。

**推荐**：日常开发用 VS Code + Live Server（改文件自动刷新），快速预览用 `npx serve .`。

### 增（Create）

**第一步：创建 Markdown 文件**

```bash
touch posts/my-new-article.md
```

slug 命名规范：全小写、`-` 连接、简短有描述性。示例：`docker-guide`、`linux-perf-tuning`

编写内容：

```markdown
## 前言

简要说明这篇文章要讲什么。

---

## 第一节

正文内容...

```java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
```

---

## 总结

总结全文要点。
```

**支持的 Markdown 语法**：

| 语法 | 示例 |
|------|------|
| 标题 | `## H2` / `### H3` / `#### H4` |
| 加粗 | `**文字**` |
| 斜体 | `*文字*` |
| 行内代码 | `` `code` `` |
| 代码块 | ` ```语言 ` + 内容 + ` ``` ` |
| 列表 | `- 列表项` / `1. 列表项` |
| 引用 | `> 引用内容` |
| 链接 | `[文字](URL)` |
| 表格 | `\| 列1 \| 列2 \|` |
| 分割线 | `---` |

**第二步：更新 posts.json**

在数组最前面加一条：

```json
{
  "slug": "my-new-article",
  "title": "文章标题",
  "date": "2026-03-24",
  "tag": "分类标签",
  "tagColor": "#667eea",
  "excerpt": "一句话描述文章内容",
  "readTime": 5
}
```

**字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| slug | string | 必须和文件名一致（不含 .md） |
| title | string | 文章标题 |
| date | string | 发布日期 YYYY-MM-DD |
| tag | string | 分类标签 |
| tagColor | string | 标签颜色 hex，如 `#667eea` |
| excerpt | string | 文章摘要 |
| readTime | number | 预估阅读分钟数 |

**常用标签颜色**：

| 分类 | 颜色 |
|------|------|
| 前端 | `#42b883`（Vue 绿） |
| Java | `#f89820`（Java 橙） |
| Python | `#3776ab` |
| AI | `#4facfe` |
| 工具 | `#43e97b` |
| 设计 | `#f093fb` |
| 运维 | `#2496ed`（Docker 蓝） |

**第三步：提交推送**

```bash
git add posts/my-new-article.md posts.json
git commit -m "Add article: my-new-article"
git push origin main
```

### 改（Update）

**修改文章内容**：

```bash
vim posts/my-new-article.md   # 或 code posts/my-new-article.md
git add posts/my-new-article.md
git commit -m "Update article: my-new-article"
git push origin main
```

**修改元数据**：编辑 `posts.json` 中对应条目的字段，然后 push。

**修改 slug（重命名）**：

```bash
mv posts/old-slug.md posts/new-slug.md
# 同步修改 posts.json 中的 slug 字段
git add posts/old-slug.md posts/new-slug.md posts.json
git commit -m "Rename article: old-slug → new-slug"
git push origin main
```

### 删（Delete）

```bash
rm posts/my-article.md
# 从 posts.json 中删除对应条目
git add posts/my-article.md posts.json
git commit -m "Remove article: my-article"
git push origin main
```

临时下线：不删 `.md` 文件，只从 `posts.json` 移除条目即可。

---

## 二、项目作品管理

项目作品比文章更简单——所有数据都在 `projects.json` 一个文件里，没有单独的内容文件。

### projects.json 结构

```json
[
  {
    "icon": "🔬",
    "title": "Physics.js",
    "desc": "轻量级 2D 物理引擎，支持刚体碰撞、弹簧和约束求解",
    "tags": ["JavaScript", "Canvas"],
    "link": "https://github.com/luckey-ke"
  }
]
```

**字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| icon | string | 项目图标，用 emoji，如 🚀 🤖 🎨 |
| title | string | 项目名称 |
| desc | string | 一句话描述 |
| tags | array | 技术标签数组，如 `["React", "Node.js"]` |
| link | string | 项目链接，GitHub 仓库地址或在线演示地址 |

### 增（Create）

编辑 `projects.json`，在数组中添加一个新对象：

```json
{
  "icon": "🐳",
  "title": "Docker Toolkit",
  "desc": "常用 Docker 部署模板和脚本集合",
  "tags": ["Docker", "DevOps", "Shell"],
  "link": "https://github.com/luckey-ke/docker-toolkit"
}
```

```bash
git add projects.json
git commit -m "Add project: Docker Toolkit"
git push origin main
```

项目会自动显示在首页「项目作品」区域。

### 改（Update）

直接编辑 `projects.json` 中对应项目的字段：

```bash
vim projects.json
# 修改 title / desc / tags / link / icon

git add projects.json
git commit -m "Update project: Docker Toolkit"
git push origin main
```

### 删（Delete）

从 `projects.json` 数组中删除对应的 JSON 对象：

```bash
vim projects.json
# 删除对应的 { ... } 整个对象

git add projects.json
git commit -m "Remove project: Docker Toolkit"
git push origin main
```

### 查（Read）

```bash
cat projects.json | python3 -m json.tool   # 查看所有项目
```

首页滚动到「项目作品」区域即可看到卡片展示。

---

## 三、常见问题

**Q: 新文章首页不显示？**
检查 `posts.json` 中的 slug 是否和文件名完全一致。

**Q: 文章页面显示 404？**
确认 `posts/xxx.md` 文件已推送到 GitHub，可在网页端检查。

**Q: Markdown 渲染异常？**
本博客使用轻量渲染器，语法支持有限。检查表格分隔行 `|---|---|` 是否规范。

**Q: 中文文件名可以吗？**
可以但不推荐，不同系统可能有编码问题。

**Q: 项目支持图片吗？**
目前项目卡片用 emoji 图标，不支持自定义图片。

**Q: 文章和项目的显示顺序？**
- 文章：按 `posts.json` 中的数组顺序，第一条显示在最前面
- 项目：按 `projects.json` 中的数组顺序

---

## 四、操作速查

### 文章

| 操作 | 步骤 |
|------|------|
| 增 | 创建 `.md` → 更新 `posts.json` → push |
| 改 | 编辑 `.md`（内容）或 `posts.json`（元数据） → push |
| 删 | 删除 `.md` → 从 `posts.json` 移除 → push |
| 查 | 首页浏览 / `cat posts/xxx.md` |

### 项目

| 操作 | 步骤 |
|------|------|
| 增 | 在 `projects.json` 加对象 → push |
| 改 | 编辑 `projects.json` 对应字段 → push |
| 删 | 从 `projects.json` 移除对象 → push |
| 查 | 首页滚动到项目区域 / `cat projects.json` |

整个博客零依赖、零构建，所有操作就是**编辑 JSON/Markdown 文件 + git push**。
