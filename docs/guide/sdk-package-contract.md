# SDK 使用边界

这一页只回答两个问题：

1. 这个包主要提供什么能力
2. 什么时候应该直接启动 Bun 服务

## 这个包主要提供什么

如果你是在自己的项目里接入网易云音乐 API，通常只会用到这 3 类入口：

1. `createHanaMusicApi()`
2. `invokeModule()`
3. camelCase 原始模块函数

最常见的写法是：

```ts
import { createHanaMusicApi } from 'hana-music-api'

const api = createHanaMusicApi({
  cookie: 'MUSIC_U=your-cookie',
})

const account = await api.userAccount({})
```

如果你要动态传模块名，可以用：

```ts
import { invokeModule } from 'hana-music-api'

const account = await invokeModule(
  'user_account',
  {},
  {
    cookie: 'MUSIC_U=your-cookie',
  },
)
```

## 配置怎么传

业务参数和执行配置要分开：

- `query`：接口本身的业务参数
- `config`：`cookie`、`proxy`、`fetcher` 这类执行配置

例如：

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
```

## 什么时候直接启动 Bun 服务

如果你需要一个 HTTP 接口服务，而不是在代码里直接调用 SDK，就直接运行仓库里的 Bun 服务：

```bash
bun install --frozen-lockfile
bun start
```

适合这几种场景：

- 你要给别的服务或前端统一提供 HTTP 接口
- 你已经有一套基于 URL 的调用方式
- 你更习惯把 Cookie、代理和部署放在服务端处理

## 怎么选

- 在自己的 Node.js / TypeScript 项目里直接接入：优先用 SDK
- 想快速搭一个可访问的接口服务：直接启动 Bun 服务
- 需要连续调多个接口：用 `createHanaMusicApi()`
- 只调用少量接口：直接导入函数
- 模块名来自运行时字符串：用 `invokeModule()`
