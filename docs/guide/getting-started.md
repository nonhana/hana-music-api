# 快速开始

`hana-music-api` 主要有两种用法：

- 在自己的项目里直接调用
- 启动一个 Bun HTTP 服务，对外提供接口

## 直接调用

先安装包：

```bash
npm install hana-music-api
```

SDK 运行环境：

- Node.js `>=24`
- ESM 项目

最省事的方式是先创建一个 client：

```ts
import { createHanaMusicApi } from 'hana-music-api'

const hana = createHanaMusicApi({
  cookie: 'MUSIC_U=your-cookie',
})

const result = await hana.search({
  keywords: '周杰伦',
  limit: 5,
})

console.log(result.body)
```

如果你只想调少量接口，也可以直接导入单个函数：

```ts
import { songUrl } from 'hana-music-api'

const result = await songUrl(
  {
    id: '347230',
  },
  {
    cookie: 'MUSIC_U=your-cookie',
  },
)

console.log(result.body)
```

如果模块名来自运行时字符串，可以用 `invokeModule()`：

```ts
import { invokeModule } from 'hana-music-api'

const result = await invokeModule(
  'user_account',
  {},
  {
    cookie: 'MUSIC_U=your-cookie',
  },
)

console.log(result.body)
```

## 配置怎么传

SDK 调用时，业务参数和执行配置要分开：

- `query`：接口本身的业务参数
- `config`：`cookie`、`proxy`、`fetcher` 这类执行配置

例如：

```ts
const result = await songUrl(
  {
    id: '347230',
  },
  {
    cookie: 'MUSIC_U=your-cookie',
  },
)
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

## 什么时候用哪种入口

- 需要连续调多个接口：用 `createHanaMusicApi()`
- 只调用少量接口：直接导入单个函数
- 模块名来自运行时字符串：用 `invokeModule()`

## 推荐阅读

1. 如果要调登录态接口，先看 [认证机制](/guide/authentication)
2. 如果遇到缓存、代理、Cookie 问题，再看 [调用约定](/guide/request-convention)
3. 想看不同调用方式的区别，再看 [编程式调用](/guide/programmatic-api)
