/**
 * markdown.js — 轻量 Markdown → HTML 渲染器
 * 支持：标题、段落、加粗、代码块、行内代码、列表、表格、引用、分割线、链接
 */
function renderMarkdown(md) {
  let html = md

  // 代码块 ```lang ... ```
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return `<pre><code class="language-${lang || 'text'}">${escaped.trim()}</code></pre>`
  })

  // 行内代码
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // 表格
  html = html.replace(/((?:^\|.+\|$\n?)+)/gm, (match) => {
    const rows = match.trim().split('\n').filter(r => r.trim())
    if (rows.length < 2) return match

    // 检测分隔行 |---|---|
    const sepIdx = rows.findIndex(r => /^\|[\s\-:|]+\|$/.test(r.trim()))
    if (sepIdx === -1) return match

    const headers = rows[0].split('|').filter(c => c.trim()).map(c => c.trim())
    const dataRows = rows.slice(sepIdx + 1).map(r =>
      r.split('|').filter(c => c.trim()).map(c => c.trim())
    )

    let table = '<table><thead><tr>'
    headers.forEach(h => { table += `<th>${h}</th>` })
    table += '</tr></thead><tbody>'
    dataRows.forEach(row => {
      table += '<tr>'
      row.forEach(cell => { table += `<td>${cell}</td>` })
      table += '</tr>'
    })
    table += '</tbody></table>'
    return table
  })

  // 标题 h2-h4
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')

  // 引用
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')

  // 分割线
  html = html.replace(/^---$/gm, '<hr>')

  // 无序列表
  html = html.replace(/(^- .+$\n?)+/gm, (match) => {
    const items = match.trim().split('\n').map(line => {
      const content = line.replace(/^- /, '')
      return `<li>${content}</li>`
    }).join('')
    return `<ul>${items}</ul>`
  })

  // 有序列表
  html = html.replace(/(^\\d+\\. .+$\n?)+/gm, (match) => {
    const items = match.trim().split('\n').map(line => {
      const content = line.replace(/^\d+\. /, '')
      return `<li>${content}</li>`
    }).join('')
    return `<ol>${items}</ol>`
  })

  // 链接 [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')

  // 加粗 **text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // 斜体 *text*
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')

  // 段落：将连续的非标签文本包裹在 <p> 中
  const lines = html.split('\n')
  let result = []
  let para = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const isBlock = /^<(h[2-6]|pre|ul|ol|table|blockquote|hr|div)/.test(line.trim())

    if (isBlock || line.trim() === '') {
      if (para.trim()) {
        result.push(`<p>${para.trim()}</p>`)
        para = ''
      }
      if (isBlock) result.push(line)
    } else {
      para += line + '\n'
    }
  }
  if (para.trim()) result.push(`<p>${para.trim()}</p>`)

  return result.join('\n')
}
