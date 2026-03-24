#!/usr/bin/env node
/**
 * build.js — 扫描 posts/ 目录，自动读取 YAML front matter，生成 posts.json
 * 用法: node build.js
 */

const fs = require('fs')
const path = require('path')

const POSTS_DIR = path.join(__dirname, 'posts')
const OUTPUT = path.join(__dirname, 'posts.json')

// 解析 YAML front matter
function parseFrontMatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/)
  if (!match) return null

  const meta = {}
  match[1].split('\n').forEach(line => {
    const idx = line.indexOf(':')
    if (idx === -1) return
    const key = line.slice(0, idx).trim()
    let val = line.slice(idx + 1).trim()
    // 去掉引号
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    meta[key] = val
  })
  return meta
}

// 估算阅读时间（分钟）
function estimateReadTime(content) {
  // 去掉 front matter
  const body = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, '')
  // 中文按字数，英文按词数，取较大值
  const chineseChars = (body.match(/[\u4e00-\u9fff]/g) || []).length
  const englishWords = body.replace(/[\u4e00-\u9fff]/g, '').split(/\s+/).filter(w => w.length > 0).length
  const totalWords = chineseChars + englishWords
  return Math.max(1, Math.ceil(totalWords / 400))
}

// 主逻辑
function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error('❌ posts/ 目录不存在')
    process.exit(1)
  }

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md')).sort()
  const posts = []

  for (const file of files) {
    const slug = file.replace(/\.md$/, '')
    const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8')
    const meta = parseFrontMatter(content)

    if (!meta) {
      console.warn(`⚠️  跳过 ${file} — 没有找到 front matter (---)`)
      continue
    }

    if (!meta.title || !meta.date) {
      console.warn(`⚠️  跳过 ${file} — 缺少 title 或 date`)
      continue
    }

    posts.push({
      slug,
      title: meta.title,
      date: meta.date,
      tag: meta.tag || '未分类',
      tagColor: meta.tagColor || '#667eea',
      excerpt: meta.excerpt || '',
      readTime: parseInt(meta.readTime) || estimateReadTime(content),
    })
  }

  // 按日期降序排列（新的在前）
  posts.sort((a, b) => new Date(b.date) - new Date(a.date))

  fs.writeFileSync(OUTPUT, JSON.stringify(posts, null, 2) + '\n', 'utf-8')
  console.log(`✅ 生成 posts.json — ${posts.length} 篇文章`)
  posts.forEach(p => console.log(`   ${p.date}  ${p.slug}  「${p.title}」`))
}

main()
