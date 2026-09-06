# 仓库工作约定

开始工作前读取 [CLAUDE.md](./CLAUDE.md)，遵循其中的上游技能维护规则。

## 个人 Codex 分发

本分支保留 Codex plugin 打包支持，按 [ADR-0002](./docs/adr/0002-personal-skills-plugin-branch.md) 执行。这是个人分支对上游暂缓 Codex plugin 决策的扩展。

源技能清单使用 `.claude-plugin/plugin.json`。修改源技能或打包脚本后，运行 `npm run build:codex-plugin` 和 `npm run check:codex-plugin`，同步提交 `dist/codex-marketplace` 分发产物。

## Issue tracker

Issues 和 PRD 使用本地 Markdown，约定见 [issue-tracker.md](./docs/agents/issue-tracker.md)。

## Triage labels

Triage 角色使用 `needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human` 和 `wontfix`，约定见 [triage-labels.md](./docs/agents/triage-labels.md)。

## Domain docs

读取根 `CONTEXT.md`，以及 `.agents/adr/` 和 `docs/adr/` 中与任务相关的 ADR。领域文档约定见 [domain.md](./docs/agents/domain.md)。
