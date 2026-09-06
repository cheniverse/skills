---
name: nushell
description: "手动使用 Nushell 编写、解释和排查命令、管道及 .nu 脚本。"
disable-model-invocation: true
---

# Nushell

在用户显式调用后，帮助完成当前 Nushell 任务。用户的工具选择和项目约定优先；本技能不把其他 JSON、CSV 或数据分析任务自动转成 Nushell 工作流。

## 执行方式

- 按已知环境选择可用入口。终端可用 `nu -c '<code>'` 执行短命令；较长或引号复杂的代码写入 `.nu` 文件，再用 `nu <script.nu>` 执行。外层引号遵循当前 PowerShell、Bash 等宿主 shell 的规则。
- 普通 `nu` 进程之间不共享变量。只有实际可用且说明支持持久状态的 Nushell MCP 才按 REPL 使用；参数名、输出捕获和状态生命周期以该工具当前文档为准。
- 对不确定的命令或版本差异，查看 `nu --version`、`help <command>`，或当前 MCP 的帮助工具。已有证据足够时直接执行，不要求每次先做环境调查，也不为短任务安装额外插件。

## 容易混淆的语义

- 管道在 Nushell 内部传递表、记录、列表等值。外部 CLI 的 JSON 文本通常需要 `from json`；先筛选字段、行数或汇总，再输出结果，避免整份大数据进入对话。
- 字符串插值为 `$"hello ($name)"`；环境变量为 `$env.NAME`；路径组合可用 `path join`。
- 不照搬 Bash 的 `$(...)`、`export`、`2>&1`。`;` 仅分隔命令，不能用来保证前一步成功。外部命令需要按结果分支时，用 `complete` 获取 `exit_code`、`stdout`、`stderr`。
- `where` 中对行的复杂计算优先使用显式闭包，如 `where {|row| $row.a > 1 and $row.b > 2 }`，避免重复 `$in` 带来的绑定混淆。
- MCP 的结果优先通过最后一个表达式返回；不要假定 `print` 或 stderr 一定被服务捕获。终端中的 `print` 不受这条 MCP 限制。

## 按需参考与交付

只读取解决当前问题需要的部分。参考资料保留自原本地技能，可能包含旧版命令和特定 MCP 实现的行为；遇到不一致时，以当前命令帮助和实际工具定义为准。

| 资料 | 适用内容 |
| --- | --- |
| [commands.md](references/commands.md) | 查找具体筛选、转换、文件、日期等命令 |
| [types-and-syntax.md](references/types-and-syntax.md) | 类型、字符串、变量、闭包和控制流 |
| [data-analysis.md](references/data-analysis.md) | 格式转换、聚合、SQLite；确有需要且插件可用时使用 Polars |
| [advanced.md](references/advanced.md) | 自定义命令、模块、错误处理和外部命令 |
| [bash-equivalents.md](references/bash-equivalents.md) | 用户需要把 Bash 逻辑迁移到 Nushell 时对照 |
| [http-transport.md](references/http-transport.md) | 仅核对匹配的旧 MCP 实现，不作为所有 Nushell MCP 的通用规范 |

一次性查询直接返回结果。需要保留的小工具或 demo 按项目约定放入 `.scratch/<task>/`，使用有含义的文件名；已有工具则优先复用。按实际用途检查输出或代表性样例，验证通过后不额外展开无关测试或流程。
