# hana-music-api

`hana-music-api` 是基于 Bun、TypeScript 与 Hono 构建的网易云音乐第三方 API 实现，支持 HTTP 调用与程序化集成。

## 特性

- 提供 `366` 个公开接口，覆盖搜索、歌曲、歌单、专辑、用户、评论、视频等常见能力
- 支持 HTTP 服务与 Bun / Node.js / TypeScript 程序化调用
- 支持 Cookie、缓存、代理、自定义 `User-Agent` 等常见调用场景

## 环境要求

- 建议使用最新稳定版 [Bun](https://bun.sh/)
- Windows、macOS、Linux 均可运行
- 默认 HTTP 服务监听 `3021` 端口

## 快速开始

安装依赖：

```bash
bun i
```

启动服务：

```bash
bun start
```

开发模式：

```bash
bun dev
```

服务启动后，默认可以访问：

- 首页：`http://127.0.0.1:3021/`
- 文档：`http://127.0.0.1:3021/docs`
- 健康检查：`http://127.0.0.1:3021/health`

可以先用一个无需登录的接口做快速验证：

```bash
curl "http://127.0.0.1:3021/search?keywords=周杰伦&limit=5"
```

## 程序化调用

如果你在代码中直接调用接口，建议先确保匿名 token 已生成：

```ts
import {
  NeteaseCloudMusicApi,
  createModuleApi,
  ensureAnonymousToken,
  invokeModule,
} from 'hana-music-api'

await ensureAnonymousToken()

const search = await NeteaseCloudMusicApi.search({
  keywords: '周杰伦',
})

const api = createModuleApi()
const detail = await api.song_url({
  id: '347230',
})

const account = await invokeModule('user_account', {
  cookie: 'MUSIC_U=your-cookie',
})
```

可按使用场景选择：

- 需要最少样板代码时，使用 `NeteaseCloudMusicApi`
- 需要按调用名访问多个接口时，使用 `createModuleApi()`
- 只调用单个接口时，使用 `invokeModule()`

## 文档

本项目使用 VitePress 提供文档站。

本地单独预览文档：

```bash
bun docs:dev
```

构建与预览静态文档：

```bash
bun docs:build
bun docs:preview
```

如果 `/docs` 返回“文档静态资源尚未生成”，请先执行 `bun docs:build`。

## 常用命令

```bash
bun test
bun typecheck
bun lint
bun lint:full
bun lint:fix
bun fmt
bun fmt:check
bun docs:build
bun docs:preview
```

## 环境变量

- `HOST`：覆盖默认监听主机
- `PORT`：覆盖默认监听端口

## 使用说明

- 涉及账户信息、歌单管理、云盘、私信、签到等接口时，通常需要有效 Cookie
- 轮询二维码状态、刷新登录状态等请求，建议追加时间戳参数以避免缓存影响
- 如果遇到区域限制或 `460` 一类异常，可尝试通过 `proxy` 或 `realIP` 参数调整请求环境

## 已知限制

- 这是第三方非官方实现，接口可用性会受到网易云音乐上游策略变化影响
- 少数接口可能因上游调整出现参数、返回字段或登录要求变化
- 当前版本不支持 PAC 代理
