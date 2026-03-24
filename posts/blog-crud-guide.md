## 前言

这个博客是纯静态架构，没有后台管理系统。所有文章以 Markdown 文件存储，项目作品以 JSON 数据存储，均通过 GitHub 仓库直接管理。本文详细说明**文章**和**项目作品**的增删改查操作方式。

---

## 项目结构

```
luckey-ke.github.io/
├── index.html          # 博客首页（博客卡片、项目展示、关于页的主页面）
├── post.html           # 文章详情页（根据 URL 参数加载对应 .md 文件并渲染）
├── posts.json          # 文章索引文件（存储所有文章的元数据：标题、日期、标签等）
├── posts/              # 文章目录（每篇文章一个 .md 文件）
│   ├── java8-syntactic-sugar.md   # 示例：Java 8 语法糖
│   ├── git-cheatsheet.md          # 示例：Git 常用命令
│   └── ...                        # 更多文章...
├── projects.json       # 项目作品列表（存储所有项目的元数据：名称、描述、链接等）
├── style.css           # 全局样式（导航栏、卡片、布局、动画等）
├── post.css            # 文章详情页专用样式（文章排版、代码高亮区域等）
├── main.js             # 交互逻辑（打字机效果、滚动动画、导航高亮、主题切换）
├── physics.js          # 物理引擎（背景粒子动画：重力、碰撞、流场）
├── markdown.js         # Markdown 渲染器（将 .md 内容转为 HTML）
└── build.js            # 构建脚本（可选，用于本地构建和优化）
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
# 第一步：将远程仓库克隆到本地（只需执行一次，之后直接 pull 更新即可）
git clone https://github.com/luckey-ke/luckey-ke.github.io.git

# 第二步：进入项目目录
cd luckey-ke.github.io

# 第三步：查看 posts/ 目录下的所有文章文件
ls posts/

# 第四步：查看某篇文章的具体内容（用 cat 输出到终端）
cat posts/java8-syntactic-sugar.md

# 第五步：查看文章索引文件，python3 -m json.tool 用于格式化 JSON 方便阅读
cat posts.json | python3 -m json.tool
```

**本地预览**：

因为是纯静态文件（HTML/CSS/JS），用任意 HTTP 服务器都能跑。

```bash
# ===== 方式一：Node.js（推荐，你的技术栈） =====

# npx serve — 最简洁的静态服务器，自动打开浏览器，默认端口 3000
# "." 表示服务当前目录下的所有文件
npx serve .

# npx http-server — 功能更多的静态服务器
# -p 8080  指定端口为 8080
# -o       启动后自动在浏览器中打开页面
npx http-server -p 8080 -o

# npx live-server — 带热更新的开发服务器
# --port=8080  指定端口为 8080
# 当文件发生修改时，会自动刷新浏览器，无需手动刷新
npx live-server --port=8080

# ===== 方式二：Python（零安装，系统自带） =====

# Python 3 — 启动一个简单的 HTTP 服务器，监听 8080 端口
# -m http.server  调用 Python 内置的 http.server 模块
python3 -m http.server 8080

# Python 2（老系统，如 CentOS 6）— 使用 SimpleHTTPServer 模块
python -m SimpleHTTPServer 8080

# ===== 方式三：PHP（装了 PHP 就能用） =====
# -S  启动内置的 Web 服务器
# localhost:8080  监听本地 8080 端口
php -S localhost:8080

# ===== 方式四：Ruby =====
# -run        使用 Ruby 内置的 HTTP 服务器模块
# -ehttpd     指定使用 httpd 服务
# "."         服务当前目录
# -p8080      监听 8080 端口
ruby -run -ehttpd . -p8080

# ===== 方式五：VS Code 插件（开发体验最好） =====
# 1. 在 VS Code 扩展商店搜索安装 "Live Server" 插件（发布者：ritwickdey）
# 2. 安装完成后，在文件资源管理器中右键 index.html
# 3. 选择 "Open with Live Server"
# 4. 浏览器会自动打开，保存文件后自动刷新，支持 CSS 热更新
```

启动后浏览器打开 `http://localhost:8080` 即可。

**推荐**：日常开发用 VS Code + Live Server（改文件自动刷新），快速预览用 `npx serve .`。

### 增（Create）

新增一篇文章需要两步：创建 `.md` 文件 + 更新 `posts.json`。

**第一步：创建 Markdown 文件**

```bash
# 在 posts/ 目录下创建一个新的 .md 文件
# 文件名就是 slug（URL 标识符），用于 post.html?slug=xxx 定位文章
touch posts/my-new-article.md
```

slug 命名规范：全小写、`-` 连接、简短有描述性。示例：`docker-guide`、`linux-perf-tuning`

编写内容：

```markdown
## 前言
<!-- 简要说明这篇文章要讲什么，让读者快速了解文章主题 -->

简要说明这篇文章要讲什么。

---
<!-- 分割线，用于分隔不同章节 -->

## 第一节
<!-- 正文的主体部分，使用 ## 二级标题作为章节标题 -->

正文内容...

### 小标题
<!-- 使用 ### 三级标题作为章节内的小节 -->

更多内容...

​```java
// 代码块：用 ```语言名 开头，``` 结尾
// 语言名用于标识代码类型（java、python、bash、javascript 等）
// 博客的渲染器会根据语言名进行基础的语法高亮
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
​```

---
<!-- 分割线，标识章节结束 -->

## 总结
<!-- 总结全文要点，给读者一个清晰的收尾 -->

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

在 `posts.json` 数组最前面添加一条元数据记录：

```json
{
  "slug": "my-new-article",       // slug：必须和 posts/ 下的文件名一致（不含 .md 后缀）
  "title": "文章标题",              // title：显示在博客卡片和文章页顶部的标题
  "date": "2026-03-24",           // date：发布日期，格式为 YYYY-MM-DD
  "tag": "分类标签",               // tag：文章分类，显示为卡片上的彩色标签
  "tagColor": "#667eea",          // tagColor：标签的背景颜色，hex 格式
  "excerpt": "一句话描述文章内容",  // excerpt：文章摘要，显示在博客卡片下方
  "readTime": 5                    // readTime：预估阅读时间（单位：分钟）
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
# 第一步：将新增/修改的文件添加到暂存区
# posts/my-new-article.md  新创建的文章文件
# posts.json               更新后的索引文件
git add posts/my-new-article.md posts.json

# 第二步：提交到本地仓库
# -m "Add article: my-new-article"  提交信息，简要说明本次修改内容
git commit -m "Add article: my-new-article"

# 第三步：推送到远程仓库（GitHub）
# origin  远程仓库的默认名称
# main    要推送的目标分支
git push origin main
```

### 改（Update）

**修改文章内容**：

```bash
# 第一步：用编辑器打开文章文件进行修改
# vim 是终端文本编辑器；code 是 VS Code 的命令行工具
vim posts/my-new-article.md
# 或者用 VS Code 打开
code posts/my-new-article.md

# 第二步：将修改后的文件添加到暂存区
git add posts/my-new-article.md

# 第三步：提交修改
git commit -m "Update article: my-new-article"

# 第四步：推送到远程仓库
git push origin main
```

**修改元数据**：编辑 `posts.json` 中对应条目的字段，然后 push。

**修改 slug（重命名）**：

```bash
# 第一步：重命名 .md 文件（将旧 slug 改为新 slug）
mv posts/old-slug.md posts/new-slug.md

# 第二步：同步修改 posts.json 中的 slug 字段
# 用编辑器打开 posts.json，找到旧 slug 的条目，改为新 slug
vim posts.json

# 第三步：将重命名的文件（旧文件删除 + 新文件添加）和索引文件一起添加
git add posts/old-slug.md posts/new-slug.md posts.json

# 第四步：提交并推送
git commit -m "Rename article: old-slug → new-slug"
git push origin main
```

### 删（Delete）

```bash
# 第一步：删除文章的 .md 文件
rm posts/my-article.md

# 第二步：从 posts.json 中删除对应的 JSON 对象
# 用编辑器打开 posts.json，删除该文章的 { ... } 整个条目
vim posts.json

# 第三步：将删除操作和索引变更添加到暂存区
# posts/my-article.md  已删除的文件（git 会记录删除操作）
# posts.json           更新后的索引文件
git add posts/my-article.md posts.json

# 第四步：提交并推送
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
    "icon": "🔬",                                            // 项目图标，使用 emoji 表情符号
    "title": "Physics.js",                                   // 项目名称
    "desc": "轻量级 2D 物理引擎，支持刚体碰撞、弹簧和约束求解",  // 一句话描述
    "tags": ["JavaScript", "Canvas"],                        // 技术标签数组，每个元素是一个标签
    "link": "https://github.com/luckey-ke"                   // 项目链接，点击跳转到 GitHub 仓库或在线演示
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

编辑 `projects.json`，在数组中添加一个新项目对象：

```json
{
  "icon": "🐳",                                              // 图标：使用 Docker 鲸鱼 emoji
  "title": "Docker Toolkit",                                 // 项目名称
  "desc": "常用 Docker 部署模板和脚本集合",                     // 项目描述
  "tags": ["Docker", "DevOps", "Shell"],                     // 技术标签：Docker、DevOps、Shell 脚本
  "link": "https://github.com/luckey-ke/docker-toolkit"      // 项目对应的 GitHub 仓库地址
}
```

```bash
# 将修改后的 projects.json 添加到暂存区
git add projects.json

# 提交，信息中说明新增了哪个项目
git commit -m "Add project: Docker Toolkit"

# 推送到远程仓库
git push origin main
```

项目会自动显示在首页「项目作品」区域。

### 改（Update）

直接编辑 `projects.json` 中对应项目的字段：

```bash
# 用编辑器打开项目配置文件
# 修改目标项目的 title / desc / tags / link / icon 字段
vim projects.json

# 将修改添加到暂存区
git add projects.json

# 提交修改
git commit -m "Update project: Docker Toolkit"

# 推送到远程仓库
git push origin main
```

### 删（Delete）

从 `projects.json` 数组中删除对应的 JSON 对象：

```bash
# 用编辑器打开项目配置文件
# 找到要删除的项目，删除整个 { ... } 对象（包括花括号和逗号）
vim projects.json

# 将修改添加到暂存区
git add projects.json

# 提交删除操作
git commit -m "Remove project: Docker Toolkit"

# 推送到远程仓库
git push origin main
```

### 查（Read）

```bash
# 查看所有项目，python3 -m json.tool 用于将 JSON 格式化输出（带缩进，方便阅读）
cat projects.json | python3 -m json.tool
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
