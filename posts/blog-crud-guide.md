## 前言

这个博客是纯静态架构，没有后台管理系统。所有文章以 Markdown 文件的形式存储在 GitHub 仓库中，通过 `posts.json` 索引文件统一管理。本文详细说明文章的增删改查四种操作方式。

---

## 项目结构

```
luckey-ke.github.io/
├── index.html          # 博客首页
├── post.html           # 文章详情页
├── posts.json          # 文章索引（核心配置）
├── posts/              # 文章目录
│   ├── java8-syntactic-sugar.md
│   ├── git-cheatsheet.md
│   └── ...
├── style.css           # 全局样式
├── post.css            # 文章页样式
├── main.js             # 交互逻辑
├── physics.js          # 物理引擎
├── markdown.js         # Markdown 渲染器
├── build.js            # 构建脚本
└── projects.json       # 项目列表
```

**核心原理**：`post.html` 根据 URL 参数 `?slug=xxx` 去 `posts/` 目录找对应的 `.md` 文件，再用 `markdown.js` 渲染成 HTML。`posts.json` 负责提供文章的标题、日期、标签等元数据。

---

## 查（Read）

### 在线阅读

访问博客地址，首页的文章卡片就是从 `posts.json` 读取的。点击卡片跳转到 `post.html?slug=xxx`，页面会自动加载对应的 Markdown 文件并渲染。

### 本地查看源码

```bash
# 克隆仓库
git clone https://github.com/luckey-ke/luckey-ke.github.io.git
cd luckey-ke.github.io

# 查看所有文章列表
ls posts/

# 查看某篇文章内容
cat posts/java8-syntactic-sugar.md

# 查看文章索引
cat posts.json | python3 -m json.tool
```

### 本地预览

因为是纯静态文件，用任意 HTTP 服务器即可预览：

```bash
# 方法一：Python
python3 -m http.server 8080

# 方法二：Node.js
npx serve .

# 方法三：VS Code 安装 Live Server 插件，右键 index.html → Open with Live Server
```

浏览器打开 `http://localhost:8080` 即可看到完整博客。

---

## 增（Create）

新增一篇文章需要两步：创建 `.md` 文件 + 更新 `posts.json`。

### 第一步：创建 Markdown 文件

在 `posts/` 目录下新建文件，文件名即 slug（URL 标识符）：

```bash
touch posts/my-new-article.md
```

slug 命名规范：
- 全小写英文
- 单词之间用 `-` 连接
- 简短有描述性
- 示例：`docker-guide`、`linux-perf-tuning`、`spring-boot-start`

编写文章内容：

```markdown
## 前言

简要说明这篇文章要讲什么。

---

## 第一节

正文内容...

### 小标题

更多内容...

```java
// 代码块支持语言标识
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
| 无序列表 | `- 列表项` |
| 有序列表 | `1. 列表项` |
| 引用 | `> 引用内容` |
| 链接 | `[文字](URL)` |
| 表格 | `\| 列1 \| 列2 \|` |
| 分割线 | `---` |

### 第二步：更新 posts.json

在 `posts.json` 数组**最前面**添加一条元数据：

```json
{
  "slug": "my-new-article",
  "title": "文章标题",
  "date": "2026-03-24",
  "tag": "分类标签",
  "tagColor": "#667eea",
  "excerpt": "一句话描述文章内容，会显示在卡片上",
  "readTime": 5
}
```

**字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| slug | string | 必须和文件名一致（不含 .md） |
| title | string | 文章标题 |
| date | string | 发布日期，格式 YYYY-MM-DD |
| tag | string | 分类标签，如 前端、Java、工具、AI |
| tagColor | string | 标签颜色，hex 格式，如 `#667eea` |
| excerpt | string | 文章摘要，显示在博客卡片上 |
| readTime | number | 预估阅读时间（分钟） |

**常用标签颜色参考**：

| 分类 | 推荐颜色 |
|------|----------|
| 前端 | `#42b883`（Vue 绿）或 `#61dafb`（React 蓝） |
| Java | `#f89820`（Java 橙） |
| Python | `#3776ab`（Python 蓝） |
| AI | `#4facfe` |
| 工具 | `#43e97b` |
| 设计 | `#f093fb` |
| 运维 | `#2496ed`（Docker 蓝） |
| 数据库 | `#336791`（PostgreSQL 蓝） |

### 第三步：提交推送

```bash
git add posts/my-new-article.md posts.json
git commit -m "Add article: my-new-article"
git push origin main
```

等待 1-2 分钟 GitHub Pages 自动部署完成，刷新博客即可看到新文章。

---

## 改（Update）

### 修改文章内容

直接编辑 `posts/` 下对应的 `.md` 文件：

```bash
# 编辑文章
vim posts/my-new-article.md
# 或用 VS Code
code posts/my-new-article.md
```

修改完提交：

```bash
git add posts/my-new-article.md
git commit -m "Update article: my-new-article"
git push origin main
```

### 修改文章元数据

如果需要改标题、标签、摘要等，编辑 `posts.json` 中对应的条目即可：

```bash
vim posts.json
# 修改 title / tag / excerpt / readTime 等字段

git add posts.json
git commit -m "Update metadata for my-new-article"
git push origin main
```

### 修改文章 slug（重命名）

需要同时改两处：

```bash
# 1. 重命名文件
mv posts/old-slug.md posts/new-slug.md

# 2. 更新 posts.json 中的 slug 字段
vim posts.json
# 把 "slug": "old-slug" 改成 "slug": "new-slug"

git add posts/old-slug.md posts/new-slug.md posts.json
git commit -m "Rename article: old-slug → new-slug"
git push origin main
```

**注意**：改 slug 后旧链接会失效（404），如果文章已经被搜索引擎收录，建议保留旧 slug。

---

## 删（Delete）

### 删除文章

两步操作：删除 `.md` 文件 + 从 `posts.json` 移除对应条目。

```bash
# 1. 删除文件
rm posts/my-article.md

# 2. 编辑 posts.json，删除对应的 JSON 对象
vim posts.json

# 3. 提交
git add posts/my-article.md posts.json
git commit -m "Remove article: my-article"
git push origin main
```

### 临时下线（不删除文件）

如果只是想暂时隐藏文章，不删除文件，只需从 `posts.json` 中移除对应条目。文章文件还在，但首页不会显示，直接访问 URL 也找不到（因为索引里没有了）。

---

## 常见问题

**Q: 新文章首页不显示？**
检查 `posts.json` 中的 slug 是否和文件名完全一致，包括大小写。

**Q: 文章页面显示 404？**
确认 `posts/xxx.md` 文件存在且已推送到 GitHub。可以在 GitHub 网页端检查文件是否存在。

**Q: Markdown 渲染异常？**
本博客使用自研的轻量渲染器，支持的语法有限。如果表格、列表渲染不对，检查格式是否规范（如表格的分隔行 `|---|---|`）。

**Q: 中文文件名可以吗？**
可以但不推荐。slug 建议用英文，中文文件名在不同系统间可能有编码问题。

**Q: 支持图片吗？**
目前不支持文章内嵌图片。如需图片，可以上传到 `posts/images/` 目录，然后用链接引用：`![描述](posts/images/xxx.png)`。但需要确保 `markdown.js` 渲染器支持图片语法（当前版本未实现）。

---

## 自动化建议

如果文章多了，手动编辑 `posts.json` 比较麻烦，可以写一个简单的脚本自动生成索引：

```bash
#!/bin/bash
# gen-index.sh — 自动扫描 posts/ 目录生成 posts.json
# 使用方式: bash gen-index.sh

echo "扫描 posts/ 目录..."
files=$(ls posts/*.md 2>/dev/null | sort -r)

echo "["
first=true
for f in $files; do
  slug=$(basename "$f" .md)
  if [ "$first" = true ]; then
    first=false
  else
    echo ","
  fi
  echo "  {"
  echo "    \"slug\": \"$slug\","
  echo "    \"title\": \"$slug\","
  echo "    \"date\": \"$(date +%Y-%m-%d)\","
  echo "    \"tag\": \"未分类\","
  echo "    \"tagColor\": \"#667eea\","
  echo "    \"excerpt\": \"文章摘要待补充\","
  echo "    \"readTime\": 3"
  echo "  }"
done
echo ""
echo "]"
```

运行后会输出一个基础版的 `posts.json`，再手动补充标题和摘要即可。

---

## 总结

| 操作 | 步骤 |
|------|------|
| 增 | 创建 `.md` 文件 → 更新 `posts.json` → push |
| 改 | 编辑 `.md` 文件（内容）或 `posts.json`（元数据） → push |
| 删 | 删除 `.md` 文件 → 从 `posts.json` 移除条目 → push |
| 查 | 首页浏览 / `cat posts/xxx.md` / 浏览器直接访问 |

整个博客零依赖、零构建，所有操作就是**文件的增删改查 + git push**。
