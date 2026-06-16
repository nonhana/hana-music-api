# 编程式调用

如果准备在自己的项目里直接接入 `hana-music-api`，常用入口只有 3 个：`createHanaMusicApi()`、原始模块函数、`invokeModule()`。

## createHanaMusicApi

适合连续调用多个接口。

```ts
import { createHanaMusicApi } from 'hana-music-api'

export const hana = createHanaMusicApi({
  cookie: 'MUSIC_U=your-cookie',
})

const searchResult = await hana.search({
  keywords: '周杰伦',
  limit: 5,
})

const detailResult = await hana.songUrl({
  id: '347230',
  br: 320000,
})
```

## 原始模块函数

适合按需导入少量接口。

```ts
import { search, songUrl } from 'hana-music-api'

const searchResult = await search(
  {
    keywords: '林俊杰',
    limit: 3,
  },
  {
    cookie: 'MUSIC_U=your-cookie',
  },
)

const songUrlResult = await songUrl(
  {
    id: '347230',
  },
  {
    cookie: 'MUSIC_U=your-cookie',
  },
)
```

## invokeModule

适合模块名来自运行时字符串的场景。

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

## 怎么传配置

业务参数和执行配置要分开：

- `query`：接口本身的业务参数
- `config`：`cookie`、`proxy`、`fetcher` 这类执行配置

推荐这样写：

```ts
await songUrl(
  {
    id: '347230',
    br: 320000,
  },
  {
    cookie: 'MUSIC_U=your-cookie',
  },
)
```

## 想更进一步

`config` 能传的远不止 `cookie`。要完整了解请求层的控制点，包括加密模式、自定义 fetcher、重试与超时、缓存与身份池，见 [请求层架构总览](/guide/request-layer-overview) 及「请求层进阶」分组。
