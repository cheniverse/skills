# 仓库工作约定

开始工作前读取 [CLAUDE.md](./CLAUDE.md)。上游 `skills/` 的维护遵循其中的规则；个人 Codex 适配按下述约定执行。这是维护本仓库的入口，不随插件分发。

本文件在 Git 中应记录为普通文件（`100644`），不要恢复成指向 `CLAUDE.md` 的符号链接。

## 个人 Codex 分发

本分支保留 Codex plugin 打包支持，按 [ADR-0002](./docs/adr/0002-personal-skills-plugin-branch.md) 执行。这是个人分支对上游暂缓 Codex plugin 决策的扩展。

源技能清单使用 `.claude-plugin/plugin.json`。个人行为覆盖维护在 `codex/overrides/`，由构建应用；上游 `skills/` 保持原文，不直接编辑生成产物。

覆盖入口保留上游名称和 frontmatter 调用模式，具体触发条件可以收窄。用户明确要求的手动触发名单维护在 `codex/invocation.json` 的 `manualOnly` 中，由构建设置 `allow_implicit_invocation: false`。最终 Codex 调用模式以该名单及构建结果为准；这是个人分发对上游跨平台调用模式一致性约定的例外，其他技能沿用原模式。

仅修改个人适配时，同步检查个人版 `codex/overrides/ask-matt/SKILL.md` 的路由说明和 `docs/codex-plugin.md`，不反向修改上游源码、路由或技能文档。上游入口内容变化导致摘要校验失败时，先比较并审查对应覆盖文件，再更新 `codex/overrides/manifest.json` 的摘要，不可仅刷新摘要绕过检查。

## 验证与提交

- 修改源技能内容或清单、个人覆盖文件、调用开关、版本元数据或打包逻辑后，运行 `npm run build:codex-plugin` 和 `npm run check:codex-plugin`，同步提交 `dist/codex-marketplace` 分发产物。
- 修改打包或校验逻辑时，再运行 `node --test scripts/codex-overrides.test.mjs` 验证适配和分发检查。
- 仅修改维护说明时，检查内容和引用，不必重建插件或递增插件版本。

## Issue tracker

Issues 和 PRD 使用本地 Markdown，约定见 [issue-tracker.md](./docs/agents/issue-tracker.md)。

## Triage labels

Triage 角色使用 `needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human` 和 `wontfix`，约定见 [triage-labels.md](./docs/agents/triage-labels.md)。

## Domain docs

读取根 `CONTEXT.md`，以及 `.agents/adr/` 和 `docs/adr/` 中与任务相关的 ADR。领域文档约定见 [domain.md](./docs/agents/domain.md)。
