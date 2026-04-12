# hana-music-api

`hana-music-api` 是基于 Bun、TypeScript 与 Hono 构建的网易云音乐第三方 API，实现了可直接部署的 HTTP 服务，也保留了程序化调用入口。

## 环境要求

- Bun 最新稳定版
- Git
- `curl`
- 生产环境建议准备 PM2
- 默认 HTTP 端口为 `3021`

## 本地启动

首次拉取后，先按锁文件安装依赖：

```bash
bun install --frozen-lockfile
```

启动服务：

```bash
bun start
```

开发模式：

```bash
bun dev
```

如果需要本地预览文档站，先显式构建：

```bash
bun run docs:build
```

服务启动后可访问：

- 首页：`http://127.0.0.1:3021/`
- 文档：`http://127.0.0.1:3021/docs`
- 健康检查：`http://127.0.0.1:3021/health`

快速验证示例：

```bash
curl "http://127.0.0.1:3021/search?keywords=周杰伦&limit=5"
```

## 生产部署

推荐按发布标签部署源码版本：

```bash
git clone https://github.com/<owner>/hana-music-api.git
cd hana-music-api
git checkout v0.1.0

bun install --frozen-lockfile
bun run docs:build

cp .env.example .env
mkdir -p logs data/runtime
```

如果环境变量已经通过系统或 PM2 注入，可以跳过 `.env` 文件。

## PM2 托管

使用仓库中的 PM2 配置启动服务：

```bash
pm2 start ecosystem.config.cjs
pm2 save
```

建议使用单实例 fork 模式，保留 Bun 作为运行时。若服务器上的 `bun` 不在 PATH 中，请把 PM2 配置里的 interpreter 改成绝对路径。

常用操作：

```bash
pm2 status hana-music-api
pm2 logs hana-music-api
pm2 reload hana-music-api
pm2 stop hana-music-api
```

## 健康检查

部署完成后，先检查服务存活，再检查业务接口：

```bash
curl -f http://127.0.0.1:3021/health
curl "http://127.0.0.1:3021/search?keywords=周杰伦&limit=5"
```

## 升级

切换到新标签后，重新安装锁定依赖并构建文档，再重载进程：

```bash
git fetch --tags
git checkout v0.1.1

bun install --frozen-lockfile
bun run docs:build
pm2 reload hana-music-api
curl -f http://127.0.0.1:3021/health
```

## 回滚

回滚流程与升级一致，只是切换回旧标签：

```bash
git checkout v0.1.0

bun install --frozen-lockfile
bun run docs:build
pm2 reload hana-music-api
curl -f http://127.0.0.1:3021/health
```

## 环境变量

- `HOST`：覆盖默认监听主机
- `PORT`：覆盖默认监听端口
- `ANONYMOUS_TOKEN_FILE`：指定匿名 token 的持久化路径，适合长期运行
- `NODE_ENV`：建议生产环境设置为 `production`

## 程序化调用

如果在代码中直接调用接口，可以先确保匿名 token 已生成：

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
bun run docs:dev
```

构建与预览静态文档：

```bash
bun run docs:build
bun run docs:preview
```

如果 `/docs` 返回“文档静态资源尚未生成”，请先执行 `bun run docs:build`。

## 常用命令

```bash
bun run verify
bun run test
bun run typecheck
bun run lint
bun run lint:fix
bun run fmt
bun run fmt:check
bun run docs:build
bun run docs:preview
```

## 使用说明

- 涉及账户信息、歌单管理、云盘、私信、签到等接口时，通常需要有效 Cookie
- 轮询二维码状态、刷新登录状态等请求，建议追加时间戳参数以避免缓存影响
- 如果遇到区域限制或 `460` 一类异常，可尝试通过 `proxy` 或 `realIP` 参数调整请求环境

## 已知限制

- 这是第三方非官方实现，接口可用性会受到网易云音乐上游策略变化影响
- 少数接口可能因上游调整出现参数、返回字段或登录要求变化
- 当前版本不支持 PAC 代理
