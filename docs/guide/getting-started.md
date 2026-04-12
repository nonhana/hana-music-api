# 快速开始

`hana-music-api` 是基于 Bun + TypeScript + Hono 现代技术栈构建的网易云音乐第三方 API 实现，适合本地自部署、接口调试与程序化集成。

## 环境要求

- 建议使用最新稳定版 [Bun](https://bun.sh/)
- Windows、macOS、Linux 均可运行
- 默认 HTTP 服务监听 `3021` 端口，文档开发站默认监听 `5173` 端口

## 安装依赖

```bash
bun install --frozen-lockfile
```

## 启动 API 服务

```bash
bun start
```

开发模式可使用：

```bash
bun run dev
```

服务启动后，默认可以访问：

- API 服务首页：`http://127.0.0.1:3021/`
- 内嵌文档：`http://127.0.0.1:3021/docs`
- 健康检查：`http://127.0.0.1:3021/health`

## 验证服务是否可用

可以先用一个无需登录的接口做快速验证，例如：

```bash
curl "http://127.0.0.1:3021/search?keywords=周杰伦&limit=5"
```

## 本地预览文档（可选）

如果你希望在本地单独预览文档站，可运行：

```bash
bun run docs:dev
```

如需构建或预览静态文档，可运行：

```bash
bun run docs:build
bun run docs:preview
```

执行 `bun run docs:build` 后，主服务会通过 `/docs` 提供最新构建产物。

## 常用命令

```bash
bun run test
bun run typecheck
bun run lint
bun run docs:build
bun run docs:preview
```

## 运行时环境变量

- `HOST`：覆盖默认监听主机
- `PORT`：覆盖默认监听端口

## 本地访问路径

- API 服务根路径：`http://127.0.0.1:3021/`
- 文档开发站：`http://localhost:5173/`
- 文档预览站：执行 `bun run docs:preview` 后按终端输出访问
- 主服务内嵌文档：执行 `bun run docs:build` 后访问 `http://127.0.0.1:3021/docs`

## 推荐阅读

1. 先阅读 [认证机制](/guide/authentication)，了解登录与 Cookie 的使用方式
2. 再阅读 [调用约定](/guide/request-convention)，避免缓存、代理与参数传递问题
3. 需要在代码中集成时，继续阅读 [编程式调用](/guide/programmatic-api)
