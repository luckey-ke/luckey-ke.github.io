## 前言

Git 是每个开发者必备的版本控制工具。本文整理了日常开发中最常用的 Git 命令，随时查阅。

---

## 仓库初始化与克隆

```bash
# 初始化新仓库
git init

# 克隆远程仓库
git clone https://github.com/user/repo.git
git clone https://github.com/user/repo.git my-folder  # 指定目录名

# 克隆指定分支
git clone -b develop https://github.com/user/repo.git
```

---

## 日常操作

```bash
# 查看状态
git status
git status -s          # 简洁模式

# 添加文件
git add file.txt       # 添加指定文件
git add .              # 添加所有变更
git add -p             # 交互式选择要添加的修改块

# 提交
git commit -m "描述"
git commit -am "描述"   # add + commit 一步完成（仅已跟踪文件）
git commit --amend     # 修改上一次提交

# 查看差异
git diff               # 工作区 vs 暂存区
git diff --cached      # 暂存区 vs 最后一次提交
git diff HEAD          # 工作区 vs 最后一次提交
git diff branch1..branch2  # 两个分支对比
```

---

## 分支管理

```bash
# 查看分支
git branch             # 本地分支
git branch -a          # 所有分支（含远程）
git branch -v          # 带最新提交信息

# 创建与切换
git branch feature-x   # 创建分支
git checkout feature-x # 切换分支
git checkout -b feature-x  # 创建并切换
git switch feature-x   # 新版切换命令
git switch -c feature-x    # 新版创建并切换

# 合并
git merge feature-x    # 合并分支到当前分支
git merge --no-ff feature-x  # 保留合并历史

# 删除分支
git branch -d feature-x      # 已合并的分支
git branch -D feature-x      # 强制删除

# 重命名分支
git branch -m old-name new-name
```

---

## 远程操作

```bash
# 查看远程
git remote -v
git remote show origin

# 添加远程仓库
git remote add upstream https://github.com/original/repo.git

# 拉取
git fetch origin       # 只下载不合并
git pull origin main   # 下载并合并
git pull --rebase origin main  # rebase 方式拉取

# 推送
git push origin main
git push -u origin feature-x  # 首次推送并建立跟踪
git push origin --delete branch-name  # 删除远程分支
```

---

## 撤销与回退

```bash
# 撤销工作区修改
git checkout -- file.txt
git restore file.txt           # 新版命令

# 撤销暂存
git reset HEAD file.txt
git restore --staged file.txt  # 新版命令

# 回退提交
git reset --soft HEAD~1   # 保留工作区和暂存区
git reset --mixed HEAD~1  # 保留工作区，撤销暂存（默认）
git reset --hard HEAD~1   # 全部撤销（危险！）

# 反转提交（创建新提交来撤销）
git revert <commit-hash>
git revert HEAD           # 撤销最后一次提交
```

---

## 暂存工作区

```bash
# 暂存
git stash
git stash push -m "描述信息"
git stash push -p         # 交互式选择要暂存的内容

# 查看暂存列表
git stash list

# 恢复
git stash pop             # 恢复并删除最新暂存
git stash apply           # 恢复但不删除
git stash apply stash@{2} # 恢复指定暂存

# 删除
git stash drop stash@{0}
git stash clear           # 清空所有暂存
```

---

## 日志查看

```bash
# 基础日志
git log
git log --oneline        # 单行模式
git log --oneline -20    # 最近 20 条

# 图形化日志
git log --graph --oneline --all

# 带统计
git log --stat           # 显示文件变更统计
git log -p               # 显示具体修改内容

# 搜索
git log --author="名字"   # 按作者
git log --since="2026-01-01"  # 按时间
git log --grep="fix"     # 按提交信息搜索
git log -- path/to/file  # 某文件的变更历史
```

---

## 标签管理

```bash
# 创建标签
git tag v1.0.0                       # 轻量标签
git tag -a v1.0.0 -m "第一个版本"     # 附注标签
git tag -a v1.0.0 <commit-hash>      # 给指定提交打标签

# 查看标签
git tag
git show v1.0.0

# 推送标签
git push origin v1.0.0      # 推送单个
git push origin --tags      # 推送所有

# 删除标签
git tag -d v1.0.0
git push origin --delete v1.0.0
```

---

## 实用技巧

```bash
# 找出谁修改了某行
git blame file.txt
git blame -L 10,20 file.txt  # 只看 10-20 行

# 二分查找引入 bug 的提交
git bisect start
git bisect bad           # 当前版本有问题
git bisect good v1.0.0   # 这个版本没问题
# Git 会自动切到中间的提交，测试后标记 good/bug，直到找到问题提交
git bisect reset         # 结束查找

# 清理未跟踪文件
git clean -n             # 预览（不实际删除）
git clean -fd            # 删除未跟踪文件和目录

# cherry-pick 选取提交
git cherry-pick <commit-hash>
git cherry-pick A..B     # 选取范围（不含 A）

# 变基
git rebase main
git rebase -i HEAD~3     # 交互式变基（合并/编辑/删除最近 3 个提交）
```

---

## .gitignore 常用模板

```bash
# 依赖
node_modules/
vendor/

# 构建产物
dist/
build/
*.class
*.jar

# 系统文件
.DS_Store
Thumbs.db

# IDE
.idea/
.vscode/
*.swp

# 环境变量
.env
.env.local
```

---

## 总结

记住这几个核心场景的命令就够了：

- **日常开发**: `add` → `commit` → `push`
- **分支协作**: `checkout -b` → 开发 → `merge` / `pull request`
- **出问题了**: `stash` 暂存 → `reset` 回退 → `revert` 反转
- **找问题**: `log` → `bisect` → `blame`

Git 的命令虽然多，但 80% 的场景用不到 20% 的命令。先把这些练熟，遇到特殊需求再查。
