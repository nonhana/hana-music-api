# 构建与运行

在安装依赖、启动服务、构建产物、生成模块类型、发布包或部署文档前阅读本文件。

## 环境与安装

- 仓库使用 Bun `1.4.4`，以 `bun.lock` 为唯一锁文件；安装使用 `bun install --frozen-lockfile`。
- SDK 面向 Node.js `>=24` 的 ESM 项目；仓库的开发、测试和服务运行时均为 Bun。
- 包声明为公开包，构建入口由 `tsdown.config.ts` 管理，产物输出到 `dist/`。
- `tsconfig.base.json` 保存共同严格选项；根 `tsconfig.json` 检查 Bun/Node 代码，`src/browser/tsconfig.json` 检查标准 DOM 浏览器源码与对应类型用例。`bun run typecheck` 串行执行两者，任一失败均返回非零。
- `bun run build` 先用 `tsdown.config.ts` 生成服务端入口并清理旧 dist，再用 `tsdown.browser.config.ts` 生成浏览器入口及声明。浏览器声明使用根目录的 `tsconfig.browser.build.json` 继承 DOM 配置并只包含生产源码，兼容当前声明生成器按配置目录确定发射根的行为。第二阶段保留服务端产物，全部入口齐全后统一运行 publint/attw；`build:check` 继续执行严格包检查。
- 首次执行测试前用 `bunx playwright install chromium` 安装与锁文件匹配的浏览器；Linux CI 使用 `bunx playwright install --with-deps chromium`。默认回归和包消费者都包含离线浏览器验证，缺浏览器不能跳过报绿。

## 常用命令

| 目的         | 命令                                       |
| ------------ | ------------------------------------------ |
| 开发服务     | `bun run dev`                              |
| 启动服务     | `bun run start`                            |
| 生产启动     | `bun run start:prod`                       |
| 构建 SDK     | `bun run build`                            |
| SDK 构建检查 | `bun run build:check`                      |
| 本地文档     | `bun run docs:dev`、`bun run docs:preview` |
| 文档构建     | `bun run docs:build`                       |
| 生成模块表面 | `bun run types:modules:generate`           |
| 检查模块表面 | `bun run types:modules:check`              |

模块生成器会从 `src/modules/` 读取本地 `ModuleInput`、decoder 和 `ModuleEffect`，并更新 `src/types/generated/`、`src/sdk/generated/` 与 `src/sdk/api/`；生成文件应通过生成器更新。

## 服务配置

`src/app/cli.ts` 从环境变量读取 `HOST`、`PORT` 和 `ANONYMOUS_TOKEN_FILE`；默认监听 `0.0.0.0:3021`，匿名令牌缺省写入系统临时目录。`NODE_ENV=production` 只用于生产启动配置。

PM2 使用 `ecosystem.config.cjs`，默认写入 `logs/`，并将匿名令牌保存到 `data/runtime/anonymous_token`。Netlify 使用 `netlify.toml` 中的 `DOCS_BASE=/ bun run docs:build`，发布 `website/.vitepress/dist`。

## 发布

- 下一 major 候选先用 `bun run changeset pre enter next`，再用 `bun run version-packages`。Changesets 3 将已消费的说明移入 `.changeset/pre/`，保留给后续稳定版；不要手改生成的版本或 changelog。
- 经当次明确授权后，可从候选分支手动运行 `release.yml` 的 `mode=candidate`，同时传入 `candidate_version` 与本地已验收 tarball 的 `candidate_sha256`。入口核对 next 版本、预发布状态、没有未消费 changeset、provenance 和实际 pack hash，再发布该 run 实际验过的 tarball；此模式关闭 GitHub Release 和远端 git tag 推送，不创建稳定版。缺失或不符时停止，不自动改用其他包。

- 版本变更使用 `bun run version-packages`，发布使用 `bun run release`。
- 最后一次 `bun run version-packages` 后，执行 `bun scripts/release-preflight.mts`。它串行运行 TESTING 的正确性门禁、定向变异与候选包匿名 live，确认 tarball、包文件集合和内容未变；它本身不发布。按需手动运行的 soak 见 TESTING。
- CI 只用 Changesets 创建版本 PR。真正发布时，在受信任的候选提交上复用 verify；包消费者构建、打包并实际安装，匿名 live 使用同一包。seal 核对文件集合、逐文件摘要、源码和 live 的 tarball 摘要。全部 mutation target 和 verify 均通过后，发布 job 下载本次 run 的归档，验证 SHA-256 和包内元数据，执行 `npm publish <tgz> --ignore-scripts`。稳定版保留 provenance、v 版本 tag 和 GitHub Release；next 不推 tag。手动 dry-run 只有读权限；在 runner 演练升版，用同一补丁对齐所有 job，最终调用 npm 的 dry-run，不改 registry。
- 构建、测试和发布共用 `dist/`，需要按 [TESTING.md](./TESTING.md) 的顺序串行执行相关检查。

相关实现：`package.json`、`tsdown.config.ts`、`src/app/cli.ts`、`ecosystem.config.cjs`、`netlify.toml`。
