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
