# 请求 profile

请求 profile 把协议、客户端身份、User-Agent 和 `checkToken` 策略绑成一个整体。模块只能选择已存在的 profile，不能再用零散的 `crypto`、`os`、`ua` 字段拼出“eapi 协议 + 浏览器 UA + 没有客户端身份支撑”的混合请求。

## 已注册的 profile

| 名称      | 协议    | 客户端    | Cookie 身份                         | 用途                                      |
| --------- | ------- | --------- | ----------------------------------- | ----------------------------------------- |
| `web`     | `weapi` | `web`     | `os=web`，不携带 eapi 版本/设备字段 | 官方现代 web player；新模块的默认 profile |
| `desktop` | `eapi`  | `desktop` | `os=osx`、`appver=3.1.13`           | 官方 Mac 客户端抓包得到的 eapi 身份       |

`iphone` 和 `android` 只是客户端类型枚举，目前没有足够抓包证据建立 profile。没有证据前不新增 profile，也不把移动端字段硬塞进 web 请求。

## 模块元数据

新模块用 `defineModule` 声明请求形态：

```ts
import { defineModule } from '../core/module-metadata.ts';

const example: ModuleEffect<ModuleInput, ModuleBody> = defineModule(
  { profile: 'web', checkToken: 'optional' },
  (query, request) => Effect.gen(/* ... */),
);
```

- `profile` 决定协议、UA 和 Cookie 身份。模块不再调用 `Effect.updateService(Call, ...)` 改这些字段。
- 每个 profile 还声明 `cache.reads` 和 `retry.read`：前者决定该 profile 的读模块是否进入共享读取缓存，后者决定读请求是否允许按重试策略重放。当前 `web` 和 `desktop` 都允许读取缓存与读重试；写请求仍不自动重试。
- `checkToken` 取 `none`、`optional` 或 `required`。`optional` 表示模块声明“需要时使用调用方的 provider”，没有 provider 时按官方网页回退路径发送；`required` 表示缺少 provider 时在发送前拒绝。
- 不写 `profile` 时默认 `web`；不写 `checkToken` 时使用 profile 的默认策略。已迁移模块都显式写出两者，便于审查。

内部注册表 `moduleRequestProfiles` 会枚举全部模块的 `{ profile, checkToken }`。未迁移模块明确标为 `legacy`，保留原有模块级协议选择，直到按抓包证据逐个迁移。

## 请求层如何应用

1. 模块构造 `RequestIntent`，只描述路径、业务正文和“本次是否需要 token”。
2. 请求层按模块元数据解析 profile，覆盖调用方的 `crypto`、`ua` 和 Cookie 客户端字段。
3. 如果本次需要 token，请求层调用 `checkToken` provider 一次，并按协议放置；模块和调用方传入的 `X-antiCheatToken` 头会被丢弃。
4. 目标校验、重试、期限和 transport 仍走同一条请求链路。

| 协议    | token 位置                                                           |
| ------- | -------------------------------------------------------------------- |
| `weapi` | 正文 `checkToken` + HTTP 头 `X-antiCheatToken`                       |
| `eapi`  | 正文 `checkToken` + 加密 header `X-antiCheatToken` + HTTP 头同名字段 |
| 其他    | 不支持；请求层在发送前返回 400，不会静默丢掉 token                   |

## 已迁移模块

| 模块                   | profile | token 策略 | 说明                             |
| ---------------------- | ------- | ---------- | -------------------------------- |
| `playlist_subscribe`   | `web`   | `optional` | 收藏时请求 token；取消收藏不请求 |
| `playlist_create`      | `web`   | `optional` | 官方 web 新建歌单时携带 token    |
| `playlist_desc_update` | `web`   | `optional` | 官方 web 更新描述时携带 token    |
| `playlist_name_update` | `web`   | `none`     | 官方 web 更新歌单名不带 token    |
| `playlist_tags_update` | `web`   | `none`     | 官方 web 更新标签不带 token      |

迁移顺序按抓包证据推进：先写接口，再普通读接口；eapi-only 接口保留例外并标注原因。`createRequest` 仍是底层逃生口，不经过模块 profile。

## 测试约定

契约测试至少断言：

- 协议和最终 URL；
- Cookie `os`、客户端版本字段是否存在；
- User-Agent；
- 是否需要 token，以及 token 放在哪里；
- 读接口和不带 token 的写接口不发送 token；
- 模块源码不出现 `Effect.updateService(Call, ...)`、`USER_AGENT_MAP`、`OS_PROFILES` 或手写 `X-antiCheatToken`。

相关实现：`src/core/request-profile.ts`、`src/core/module-metadata.ts`、`src/core/request.ts`、`src/sdk/module-profiles.ts`。
