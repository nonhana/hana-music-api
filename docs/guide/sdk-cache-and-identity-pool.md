# SDK 缓存与身份池

一个 `createHanaMusicApi(config)` client 持有一组 client 服务，包括 ReadStore 的读缓存、在飞表和可选匿名身份池。
具名函数与 `invokeModule` 保留 Promise API，但不持有 client 缓存。

## 明确读接口

```ts
const hana = createHanaMusicApi({
  cookie: 'MUSIC_U=your-token',
  cache: { ttlMs: 120_000 },
});
```

SDK 缓存默认关闭。开启后只对 `search`、`lyric`、`song_detail`、`playlist_detail` 缓存；HTTP 默认对同一清单缓存 120 秒。
这些读取即使关闭缓存也会合并同时执行的相同请求，完成后的下一次调用仍会发送上游请求。具名函数、SDK 与程序化 `invokeModule` 都支持并发合并。

只有规范化 status 为 200，且存在的 body.code 也为 200 时才写缓存。写入、登录、轮询、批量、上传和未知模块每次执行。
比如 `like(true) → like(false) → like(true)` 会发送三次写请求。

缓存键包含规范化参数、调用快照的有效身份、目标相关配置、协议、headers 和 fetcher/handler 标识，并散列保存。不同账号或传输配置不共享结果，返回内容为副本。
ReadStore 直接读取调用提供的 Effect 时钟来判断 TTL，测试可使用虚拟时钟。缓存条目有 TTL 和数量上限。

## 共享读取的取消

多个相同读取共享上游执行，每个等待者独立接受 AbortSignal。一个等待者取消不影响其余等待者；最后一个等待者取消会中断上游并清理在飞表。
ReadStore 使用 Ref 保存状态、Deferred 传递执行结果、Fiber 管理共享工作；各等待者的 退出清理 负责退出和最后一次中断。

## 匿名身份池

```ts
const hana = createHanaMusicApi({ identityPool: { size: 2 } });
```

首次使用惰性注册两套身份，整个 client 的所有模块共用该池。注册通过同一 ReadStore 合并并发初始化。注册失败可以重试，完成的身份保留；最后一个初始化等待者取消时中断尚未完成的注册。
调用方已经提供 MUSIC_U、MUSIC_A 或 state.anonymousToken 时优先使用显式身份，不会被池覆盖。
Cookie 来源按 `config.cookie` 优先、`config.headers.Cookie` 次之解析，头名不区分大小写；API 和 NOS 请求据此使用同一身份冷却。

身份注册同样经过出口预算和冷却。身份轮换只改变协议身份，不改变实际出口 IP，也不能绕过 host 冷却。
