# 构建与运行

在安装依赖、启动服务、构建产物、生成模块类型、发布包或部署文档前阅读本文件。

## 环境与安装

- 仓库使用 Bun `1.4.2`，以 `bun.lock` 为唯一锁文件；安装使用 `bun install --frozen-lockfile`。
- SDK 面向 Node.js `>=24` 的 ESM 项目；仓库的开发、测试和服务运行时均为 Bun。
- 包声明为公开包，构建入口由 `tsdown.config.ts` 管理，产物输出到 `dist/`。

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

PM2 使用 `ecosystem.config.cjs`，默认写入 `logs/`，并将匿名令牌保存到 `data/runtime/anonymous_token`。Netlify 使用 `netlify.toml` 中的 `DOCS_BASE=/ bun run docs:build`，发布 `docs/.vitepress/dist`。

## 发布

- 版本变更使用 `bun run version-packages`，发布使用 `bun run release`。
- 发布前先执行 `bun run verify:sdk`；发布演练还会执行 `npm pack`。
- 构建、测试和发布共用 `dist/`，需要按 [TESTING.md](./TESTING.md) 的顺序串行执行相关检查。

相关实现：`package.json`、`tsdown.config.ts`、`src/app/cli.ts`、`ecosystem.config.cjs`、`netlify.toml`。
