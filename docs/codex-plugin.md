# Codex 插件安装说明

这个分支把 Matt Pocock 的 skills 打包成可安装的 Codex 插件，供个人多台电脑复用。

## 当前约定

- 工作分支：`personal-skills-plugin`
- 插件名：`mattpocock-skills`
- marketplace 名：`cheniverse-skills`
- 可安装产物：`dist/codex-marketplace`
- 打包来源：`.claude-plugin/plugin.json`

插件内的真实 skill 名保持原样，例如 `$tdd`、`$grill-me`、`$implement`。Codex UI 中通过 `agents/openai.yaml` 显示为 `Matt: tdd`、`Matt: grill-me`、`Matt: implement`。

原仓库的 `disable-model-invocation: true` 不会进入 Codex 产物；打包时会转换成：

```yaml
policy:
  allow_implicit_invocation: false
```

这表示该 skill 只能由用户显式调用，不会被模型自动隐式触发。

## 个人行为适配

`skills/` 保留上游原文。构建默认使用 `codex/overrides/<skill>/SKILL.md` 替换指定技能的入口，再生成 Codex 产物；同名技能的其他资源继续从上游复制。覆盖文件沿用技能源码的英文风格，本说明使用中文。

| 技能 | 个人版采用方式 |
| --- | --- |
| `research` | 收窄为实质性调查；默认在聊天交付，按任务需要写文件或委派，研究子代理不再递归派工 |
| `code-review` | 覆盖请求范围内的已提交、暂存、未暂存和未跟踪内容；小改动单代理审查，按价值委派并核实汇总发现 |
| `tdd` | 用户指定或有独立行为预期时采用；复用既有测试边界，取消逐次确认，按风险选择测试层级 |
| `diagnosing-bugs` | 先检查已有错误、代码和日志，证据不足时升级实验，不再强制复现先于所有分析或固定重复次数 |
| `implement` | 按需选择 TDD 和审查，完成要求的检查；提交需要用户已授权 |
| `ask-matt` | 按任务需要推荐流程，允许直接完成明确小任务；同步以上技能的新行为 |

名称保持不变。用户指定的手动触发名单维护在 `codex/invocation.json`：`wizard`、`writing-for-agents`、`resolving-merge-conflicts` 设置 `allow_implicit_invocation: false`，仍可通过 `$skill` 显式调用。其他技能沿用上游调用模式。当前共 25 个技能：17 个手动、8 个自动。

其他技能仍使用上游实现，这不是对整套技能都完成了适配，也没有测得 GPT-6 的 token 节省比例。采用原则参考 [GPT-6 Astra 官方提示指南](https://developers.openai.com/api/docs/guides/latest-model#prompting-best-practices) 和 [Codex 技能文档](https://learn.chatgpt.com/docs/build-skills)。

`codex/overrides/manifest.json` 登记覆盖来源及其上游 `SKILL.md` 的 SHA-256（统一为 LF 后计算）。每次同步上游后，构建会拒绝未经重新审查的入口变化；对照上游更新覆盖文件后再更新摘要。它不锁定上游辅助资源，辅助资源的更新仍需在同步 diff 中审查。

不要手改 `dist/` 或已安装缓存来维护行为。构建和检查会验证覆盖内容、调用模式，以及可安装 marketplace 与中间产物的整树一致性。适配代码的回归检查使用 `node --test scripts/codex-overrides.test.mjs`。

## 从 GitHub 安装

在新电脑上，从这个 fork 的 `personal-skills-plugin` 分支添加 marketplace：

```powershell
codex plugin marketplace add cheniverse/skills --ref personal-skills-plugin --sparse .agents --sparse dist/codex-marketplace/plugins/mattpocock-skills
```

然后安装插件：

```powershell
codex plugin add mattpocock-skills@cheniverse-skills
```

安装后开启一个新线程测试。当前线程通常不会加载刚安装的插件技能。

## 本地开发和重新打包

修改源 skills 或打包脚本后，运行：

```powershell
npm run build:codex-plugin
npm run check:codex-plugin
```

构建会生成两个目录：

- `dist/codex-plugin`：中间验证产物，不提交
- `dist/codex-marketplace`：可安装 marketplace，需要提交

本地安装当前工作区产物：

```powershell
codex plugin marketplace add D:\project\AI\skills\dist\codex-marketplace
codex plugin add mattpocock-skills@cheniverse-skills
```

如果插件已经安装过，重新运行 `codex plugin add mattpocock-skills@cheniverse-skills` 会刷新缓存中的插件版本。更新后同样开启新线程测试。

## 分支和 manifest 的关系

分支名不写进 `.codex-plugin/plugin.json`，也不写进 marketplace manifest。分支只在安装 marketplace 时通过 `--ref personal-skills-plugin` 指定。

这样 `main` 可以继续用于同步 upstream，`personal-skills-plugin` 则长期保存个人 Codex 插件化工作。
