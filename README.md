# hana-music-api

HTTP 模块请求默认每个连接 IP 每秒 2 次、突发 10 次，最多同时执行 32 个模块及 2 个上传。
超频返回 429，容量耗尽返回 503，并附带 `Retry-After`。仅显式 `traffic.trustedProxyIps` 中的连接地址可转发客户端 IP。
HTTP 只接受业务参数及传统 `cookie` / `noCookie`；`domain`、`proxy`、`headers`、`retry` 等执行配置请迁移到受信任 SDK config。
请求体默认限制为 10 MiB；multipart 文件总量按此上限计算，完整请求另预留 64 KiB 容纳表单字段、边界和头。读取超过 5 秒返回 408；服务端可通过 `maxBodyBytes` / `bodyTimeoutMs` 调整，更大的音频文件需相应提高上限。
调试执行入口默认关闭；本地调用 `startServer({ hostname: '127.0.0.1', debugApiRequests: true })` 才可开启。

`hana-music-api` 是一个第三方网易云音乐 API 库，可直接在代码里调用，也可以作为 Bun 服务自行部署。

## 安装

```bash
npm install hana-music-api
```

SDK 运行环境：

- Node.js `>=24`
- ESM 项目

## 直接调用

最省事的方式是先创建一个 client：

```ts
import { createHanaMusicApi } from 'hana-music-api';

const hana = createHanaMusicApi({
  cookie: 'MUSIC_U=your-cookie',
});

const result = await hana.search({
  keywords: '周杰伦',
  limit: 5,
});

console.log(result.body);
```

如果你只想调少量接口，也可以直接导入单个函数：

```ts
import { songUrl } from 'hana-music-api';

const result = await songUrl(
  {
    id: '347230',
  },
  {
    cookie: 'MUSIC_U=your-cookie',
  },
);

console.log(result.body);
```

如果模块名来自运行时字符串，可以用 `invokeModule()`：

```ts
import { invokeModule } from 'hana-music-api';

const result = await invokeModule(
  'user_account',
  {},
  {
    cookie: 'MUSIC_U=your-cookie',
  },
);

console.log(result.body);
```

## 启动 HTTP 服务

如果你想自己部署服务，可以直接运行仓库里的 Bun 服务：

```bash
bun install --frozen-lockfile
bun start
```

默认地址：

- 服务首页：`http://127.0.0.1:3021/`
- 文档：`http://127.0.0.1:3021/docs`
- 健康检查：`http://127.0.0.1:3021/health`

快速试一下：

```bash
curl "http://127.0.0.1:3021/search?keywords=周杰伦&limit=5"
```

## 常用入口

- `createHanaMusicApi()`：适合连续调用多个接口
- camelCase 原始函数：适合按需导入少量接口
- `invokeModule()`：适合动态模块名场景

## 常见注意事项

- 账号信息、歌单管理、云盘、私信、签到这类接口通常需要有效 Cookie
- SDK 调用时，把 `cookie`、`proxy`、`fetcher` 这类执行配置放到 `config`，不要混进业务参数
- 轮询二维码状态、刷新登录状态这类请求，建议带上时间戳，避免拿到缓存结果
- 如果遇到区域限制或 `460` 一类问题，可以尝试 `proxy` 或 `realIP`
- 这是第三方非官方实现，少数接口会跟着网易云上游变化

## 文档

- 快速开始：[docs/guide/getting-started.md](docs/guide/getting-started.md)
- 编程式调用：[docs/guide/programmatic-api.md](docs/guide/programmatic-api.md)
- 认证机制：[docs/guide/authentication.md](docs/guide/authentication.md)
- 调用约定：[docs/guide/request-convention.md](docs/guide/request-convention.md)
- API 参考：[docs/api/index.md](docs/api/index.md)
