# 自定义 fetcher

所有 RequestIntent 最终都由 transport 发送。默认用的是运行时全局的 `fetch`，用户可以用 `fetcher` 字段更换为自己的实现。

## `FetchLike` 长什么样

`fetcher` 的类型是 `FetchLike`，签名和标准 `fetch` 一致：

```ts
type FetchLike = (
  input: Request | URL | string,
  init?: RequestInit,
) => Promise<Response>;
```

只要实现符合这个签名，就能传进去：

```ts
import { createHanaMusicApi, type FetchLike } from 'hana-music-api';

const myFetcher: FetchLike = (input, init) => {
  return fetch(input, init);
};

const hana = createHanaMusicApi({ fetcher: myFetcher });
```

Promise fetcher 只在 transport 的 Effect.tryPromise 中接入。Effect 持有出口许可，直到响应正文全部读完或执行被中断；
自定义 fetcher 返回的 Response 不会直接逃出 RequestEffect。输入不受信任时先校验目标，fetcher 不改变目标与身份策略。

`fetcher` 在公开 SDK 入口都能传：`createHanaMusicApi`、模块函数、`invokeModule`、`createRequest`。

## 场景一：注入代理 agent

`config.proxy` 能满足基础的 HTTP 代理需求，但它**不支持 PAC**，也无法做更复杂的连接控制（连接池、mTLS、SOCKS 等）。这些场景下，用自定义 fetcher 接入像 `undici` 这样的客户端：

```ts
import { Agent, fetch as undiciFetch } from 'undici';
import { createHanaMusicApi, type FetchLike } from 'hana-music-api';

const dispatcher = new Agent({
  connect: { timeout: 10_000 },
  connections: 64,
});

const pooledFetcher: FetchLike = (input, init) => {
  return undiciFetch(input as any, { ...init, dispatcher }) as any;
};

const hana = createHanaMusicApi({ fetcher: pooledFetcher });
```

## 场景二：请求拦截与日志

想在每个出网请求前后插一段逻辑（打日志、改头、统计耗时），包一层就行：

```ts
import { createHanaMusicApi, type FetchLike } from 'hana-music-api';

const loggingFetcher: FetchLike = async (input, init) => {
  const url = typeof input === 'string' ? input : input.toString();
  const start = Date.now();

  const res = await fetch(input, init);

  console.log(`[fetch] ${res.status} ${url} ${Date.now() - start}ms`);
  return res;
};

const hana = createHanaMusicApi({ fetcher: loggingFetcher });
```

> 如果只是想观测请求的尝试 / 重试 / 失败，不必自己包 fetcher，
> 请求层已经内置了 `onRequestEvent` 回调，见 [调试与可观测性](/guide/observability)。
> 两者的区别：`onRequestEvent` 是请求层的语义事件，自定义 fetcher 是更底层的原始网络层。

## 场景三：测试桩

在单元测试里，通常不想真的打网易云的接口。传一个返回固定响应的 fetcher 即可：

```ts
import { test, expect } from 'bun:test';
import { songUrl, type FetchLike } from 'hana-music-api';

const stub: FetchLike = async () => {
  return new Response(JSON.stringify({ code: 200, data: [] }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};

test('songUrl 走桩不发真实请求', async () => {
  const res = await songUrl(
    { id: '1' },
    { fetcher: stub, cookie: 'MUSIC_A=test-token' },
  );
  expect(res.status).toBe(200);
});
```

身份注册也会走 `fetcher`。若测试不覆盖注册，请显式提供测试 Cookie；若覆盖注册，响应必须包含 MUSIC_A Cookie。
调用返回的响应仍由 RequestEffect 解释，普通 JSON 保留未知字段，需要消费的字段由模块本地 decoder 校验。

## `fetcher` 和 `proxy` 怎么选

| 需求                        | 推荐             |
| --------------------------- | ---------------- |
| 简单 HTTP 代理              | `config.proxy`   |
| PAC / SOCKS / 连接池 / mTLS | 自定义 `fetcher` |
| 请求拦截、改写、日志        | 自定义 `fetcher` |
| 测试桩                      | 自定义 `fetcher` |

同时传入 `proxy` 和自定义 `fetcher` 会明确失败。Bun 默认传输使用原生 proxy，Node 24 使用固定版本 undici 的 ProxyAgent；代理不可用时不会静默直连。

自定义 fetcher 必须遵守传入的 `init.signal`，并让正文读取响应取消。Effect 的总期限包含 fetch 和完整 body 消费。
库能释放自己的许可，无法强制停止不遵守信号的第三方 Promise 或其私自发送的请求。
