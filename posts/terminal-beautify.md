---
title: "我的终端美化方案"
date: "2026-03-10"
tag: "工具"
tagColor: "#43e97b"
excerpt: "从 Starship 到 Tmux，一套让终端赏心悦目的配置方案"
---

## ✨ 效果预览

先看最终效果。我的终端每天面对超过 8 小时，好看 = 心情好 = 效率高。

```
╭─ yueke@archlinux ~/projects/blog ‹main●› [16:32:04]
╰─➤ git status
On branch main
nothing to commit, working tree clean
```

这个效果由 **Starship** 提示符 + **Kitty** 终端 + **Nerd Font** + 自定义配色方案组合实现。

## 1. 🖥️ 终端模拟器选择

| 终端 | 平台 | 特点 | 推荐 |
|------|------|------|------|
| Kitty | Linux/macOS | GPU 加速，配置灵活 | ⭐⭐⭐⭐⭐ |
| Alacritty | 全平台 | Rust 写的，极速 | ⭐⭐⭐⭐ |
| WezTerm | 全平台 | Lua 配置，功能丰富 | ⭐⭐⭐⭐ |
| Windows Terminal | Windows | 微软官方 | ⭐⭐⭐⭐ |

Kitty 配置文件 `~/.config/kitty/kitty.conf`：

```bash
# 字体
font_family      JetBrainsMono Nerd Font
font_size        13.0

# 光标
cursor_shape     beam

# 窗口
window_padding_width 8
background_opacity 0.92

# 配色 — Catppuccin Mocha
background #1e1e2e
foreground #cdd6f4
```

## 2. ⭐ Starship 提示符

Starship 是用 Rust 写的跨 shell 提示符工具，速度快，配置简单：

```bash
# 安装
curl -sS https://starship.rs/install.sh | sh

# 加到 shell
echo 'eval "$(starship init zsh)"' >> ~/.zshrc
```

配置文件 `~/.config/starship.toml`：

```toml
format = """
[  $username](bg:#89b4fa fg:#1e1e2e)
[ $directory](bg:#a6e3a1 fg:#1e1e2e)
[ $git_branch $git_status](bg:#f9e2af fg:#1e1e2e)
[ $time](bg:#45475a fg:#cdd6f4)
$character"""

[username]
show_always = true
format = "[$user]($style)"

[directory]
truncation_length = 3

[git_branch]
symbol = ""
```

## 3. 🐚 Zsh + 插件

```bash
# 安装 Oh My Zsh
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# 必装插件
git clone https://github.com/zsh-users/zsh-autosuggestions \
  ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

git clone https://github.com/zsh-users/zsh-syntax-highlighting \
  ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

启用插件（`~/.zshrc`）：

```bash
plugins=(git zsh-autosuggestions zsh-syntax-highlighting)
```

## 4. 📟 Tmux 会话管理

Tmux 让你在断开 SSH 后保持终端状态，还能分屏。

```bash
# 前缀键改为 Ctrl+a
unbind C-b
set -g prefix C-a
bind C-a send-prefix

# 分屏快捷键
bind | split-window -h
bind - split-window -v

# vim 风格切换面板
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R

# 鼠标支持
set -g mouse on
```

## 5. 🎨 推荐配色方案

- **Catppuccin** — 柔和温暖，护眼首选 ⭐ 我在用
- **Tokyo Night** — 经典暗色，社区最火
- **Dracula** — 高对比度，代码清晰
- **Nord** — 北欧风，冷静克制
- **Rose Pine** — 玫瑰色调，优雅独特

## 6. 🔤 Nerd Font 安装

Nerd Font 在普通编程字体基础上加入了图标支持：

```bash
mkdir -p ~/.local/share/fonts
cd ~/.local/share/fonts
curl -fLo "JetBrainsMono.zip" \
  https://github.com/ryanoasis/nerd-fonts/releases/latest/download/JetBrainsMono.zip
unzip JetBrainsMono.zip && rm JetBrainsMono.zip
fc-cache -fv
```

## 🚀 总结

终端美化的核心是**一致性**：所有工具用同一套配色、同一套字体、同一种风格。不需要每个都换，先从 Starship 开始，效果立竿见影。

> 💡 **快速上手：**只做两件事就能让你的终端好看 10 倍 — ① 安装 Nerd Font，② 安装 Starship。5 分钟搞定。
