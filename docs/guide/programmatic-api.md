# 编程式调用

除了直接访问 HTTP 接口，`hana-music-api` 也提供了程序化调用入口，适合 Bun / Node.js / TypeScript 场景。

## 主要入口

你可以使用以下 API：

- `createModuleApi()`：创建按接口调用名访问的 API 客户端
- `invokeModule()`：直接调用单个接口
- `NeteaseCloudMusicApi`：开箱即用的默认 API 对象

## createModuleApi

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.search({
  keywords: '周杰伦',
})

console.log(result.body)
```

## invokeModule

```ts
import { invokeModule } from 'hana-music-api'

const result = await invokeModule('song_url', {
  id: '347230',
})

console.log(result.body)
```

## 默认 API 对象

```ts
import { NeteaseCloudMusicApi } from 'hana-music-api'

const result = await NeteaseCloudMusicApi.user_account({
  cookie: 'MUSIC_U=your-cookie',
})

console.log(result.body)
```

## Cookie 自动归一化

程序化调用会在内部对字符串形式的 Cookie 做归一化处理，因此你可以直接复用 HTTP 场景中的 `cookie` 字符串。

## 推荐用法

- 需要大量调用多个模块时：优先 `createModuleApi()`
- 只调用单个模块时：`invokeModule()` 足够直接
- 想要最少样板代码时：使用 `NeteaseCloudMusicApi`

## 与 HTTP 文档如何对应

每个 API 文档页面都会同时给出：

- HTTP 请求示例
- 程序化调用示例
- 对应调用名

调用名通常使用与接口路径对应的下划线形式，例如：

- `/login/cellphone` → `api.login_cellphone()`
- `/song/url` → `api.song_url()`
- `/playlist/detail` → `api.playlist_detail()`
