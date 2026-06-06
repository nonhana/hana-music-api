# 编程式调用

除了直接访问 HTTP 接口，`hana-music-api` 也提供了程序化调用入口，适合 Bun / Node.js / TypeScript 场景。

## 主要入口

你可以使用以下 API：

- `createModuleApi()`：创建按接口调用名访问的 API 客户端
- `invokeModule()`：直接调用单个接口
- `NeteaseCloudMusicApi`：开箱即用的默认 API 对象

## 模块可发现性与类型精度

程序化调用现在区分两个概念：

- **模块可发现性**：只要某个模块能被当前 `src/modules` 运行时注册表加载，TypeScript 就能静态看到它的调用名。
- **类型精度**：只有一部分高价值模块会提供精确的 query typing；其余长尾模块仍然使用兼容层 query 类型。

这意味着：

- `api.search()`、`api.song_url()`、`api.login_cellphone()` 这类模块会有更强的参数提示。
- `api.top_song()`、`api.ugc_detail()` 这类长尾模块同样可以被静态发现和调用，但参数通常停留在 compatibility fallback，而不是伪装成已经完全精确建模。

这种分层的目标是让 SDK 同时满足两件事：

1. 不再因为某个模块还没手写进白名单就“看不见”它。
2. 不强行把所有模块都包装成同等精度的类型契约。

## createModuleApi

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.search({
  keywords: '周杰伦',
})

console.log(result.body)
```

长尾模块也可以直接通过同一个 API 对象调用：

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.top_song({
  type: 96,
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
- 需要 strongest typing 时：优先使用已经有精确 query 契约的高价值模块
- 调用长尾模块时：把它视为“可发现 + 兼容层参数”，不要默认假设它已经拥有同等级的精确类型

## 与 HTTP 文档如何对应

每个 API 文档页面都会同时给出：

- HTTP 请求示例
- 程序化调用示例
- 对应调用名

调用名通常使用与接口路径对应的下划线形式，例如：

- `/login/cellphone` → `api.login_cellphone()`
- `/song/url` → `api.song_url()`
- `/playlist/detail` → `api.playlist_detail()`
