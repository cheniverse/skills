# 0002. 通过 personal-skills-plugin 分支分发 Codex plugin

## 状态

Accepted

## 背景

这个仓库是 `mattpocock/skills` 的 fork。我们希望继续把 upstream 当作来源，同时维护一个个人可用的 Codex plugin，并能在多台电脑之间安装。

如果把所有个人 Codex 打包工作都放在 `main`，后续同步 upstream 会更吵。如果只保留本地构建产物，多电脑安装又不方便。

## 决策

维护一个长期个人分支：`personal-skills-plugin`。

这个分支把选定的 skills 打包成 Codex plugin：

- Marketplace 名：`cheniverse-skills`
- Plugin 名：`mattpocock-skills`
- 可安装 marketplace manifest：`.agents/plugins/marketplace.json`
- 可安装 plugin artifact：`dist/codex-marketplace/plugins/mattpocock-skills`

采用以下打包和提交策略：

- 提交根目录 marketplace manifest，让 Codex 可以直接从 GitHub 分支发现 marketplace。
- 提交 `dist/codex-marketplace` 下的可安装 plugin artifact。
- 不提交 `dist/codex-plugin`；它只是本地中间验证产物。

面向 upstream 的 `main` 可以尽量贴近 `mattpocock/skills`；个人 Codex 打包工作和未来个人 skill 工作都放在 `personal-skills-plugin`。

个人 Codex 行为调整放在 `codex/overrides/`，构建时替换选定技能的入口，保留 `skills/` 上游原文。用登记的源码摘要检测被覆盖入口的上游变化，重新审查后才更新摘要。这样避免直接修改上游文件带来的合并冲突，同时承担少量完整入口覆盖文件的维护成本。部署仍使用生成后的 Codex plugin，不直接修改已安装缓存。

## 后果

其他电脑可以直接从 GitHub 安装：

```powershell
codex plugin marketplace add cheniverse/skills --ref personal-skills-plugin --sparse .agents --sparse dist/codex-marketplace/plugins/mattpocock-skills
codex plugin add mattpocock-skills@cheniverse-skills
```

每次修改源 skills 或打包逻辑后，运行：

```powershell
npm run build:codex-plugin
npm run check:codex-plugin
```

然后一起提交更新后的脚本、文档、marketplace manifest 和 `dist/codex-marketplace` artifact。

这个分支会有意携带生成后的可安装 plugin 产物。这样会增加一些重复内容，但安装更简单，也避免每台电脑都必须先 clone 仓库并本地构建后才能安装。
