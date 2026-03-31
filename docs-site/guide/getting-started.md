# 快速开始

`hana-music-api` 是对旧版 `netease-music-api` 的 Bun + TypeScript + Hono 重写版本。本页聚焦两件事：先把服务跑起来，再把文档站跑起来。

## 环境要求

- 建议使用最新稳定版 [Bun](https://bun.sh/)
- Windows、macOS、Linux 均可运行
- 默认 HTTP 服务监听 `3000` 端口，文档开发站默认监听 `5173` 端口

## 安装依赖

```bash
bun install
```

## 启动 API 服务

```bash
bun run start
```

开发模式可使用：

```bash
bun run dev
```

## 启动文档站

```bash
bun run docs:dev
```

这会先自动扫描公开模块与文档资料，再启动 VitePress 本地开发服务。

## 常用命令

```bash
bun run test
bun run typecheck
bun run lint:full
bun run docs:generate
bun run docs:build
bun run docs:preview
```

## 运行时环境变量

- `HOST`：覆盖默认监听主机
- `PORT`：覆盖默认监听端口

## 本地访问路径

- API 服务根路径：`http://localhost:3000/`
- 文档开发站：`http://localhost:5173/`
- 文档预览站：执行 `bun run docs:preview` 后按终端输出访问

## 推荐工作流

1. 运行 `bun run dev` 启动 API 服务
2. 另开终端运行 `bun run docs:dev`
3. 修改 `src/modules/` 或脚本后重新执行 `bun run docs:generate`
4. 在部署流水线中执行 `bun run docs:build`，发布 `docs-site/.vitepress/dist/`

## 版本管理约定

- 提交 `docs-site/` 下的文档源码、配置与生成脚本
- 不提交 `docs-site/.vitepress/dist/` 等构建产物
- 不再保留旧 `public/` 目录下的历史发布产物或静态调试页

## 迁移说明

历史接口说明提供了大量背景信息，但旧的运行时文档站结构已经不再保留。当前文档站会：

- 以 `src/modules/` 的真实模块作为公开接口基准
- 以整理后的接口说明作为参数、示例和注意事项来源
- 自动生成 API 页面与侧边栏，避免手工维护数百个条目
