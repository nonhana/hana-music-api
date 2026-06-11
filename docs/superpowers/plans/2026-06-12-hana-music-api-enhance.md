# hana-music-api Request-Layer Enhance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不破坏既有 HTTP server / SDK 契约的前提下,补齐 hana-music-api 请求层相对旧项目偏弱或缺失的防御与伪装能力(SDK 注入 cnIp、匿名 token 懒刷新、weapi e_r 解密),并新增高频爬取所需的健壮性与伪装(默认超时、安全瞬态重试、eapi gzip、SDK 缓存+去重、匿名身份池轮换、PAC 代理)。

**Architecture:** 改动严格分层 —— 请求核心(`src/core/request.ts`)只做单请求级别的加密/超时/重试/IP 注入;匿名 token 与身份池原语放在新文件 `src/core/anonymous.ts` / `src/core/identity.ts`(core→core,不反向依赖 app/server);SDK 级别的懒刷新、缓存、身份轮换统一接入 `src/sdk/runtime.ts` 的 `invokeStaticModule` / `createModuleInvoker`(所有 SDK 入口的唯一汇聚点)。`src/app/generate-config.ts` 的 `registerAnonymous` 是 sdk-release-contract 锁定的契约导出,全程不触碰。

**Tech Stack:** Bun + TypeScript 6(strict)、Hono、bun:test、oxlint/oxfmt。新增运行时依赖仅 Phase 2 的 `pac-resolver`(可选,PAC 代理)。

**遵循 AGENTS.md:** 最小实现、不做未请求的功能、不顺手重命名/重排、按现有代码风格(具名导出、`readonly` 接口、early-return、中文注释解释"为什么")。每个 feature 控制在小 diff;抽象只在出现 3+ caller 时引入。

**前置约定(每个 Task 通用):**
- 测试命令:`bun test <file>`(单文件)。
- 风格闸:`bun run typecheck && bun run lint && bun run fmt`(改动后跑)。
- Phase 收尾:`bun run verify`(全量)。
- 提交:Conventional Commit,scope 用 `request` / `anonymous` / `sdk` / `proxy`。

---

## File Structure

| 文件 | 动作 | 职责 |
|---|---|---|
| `src/core/request.ts` | Modify | weapi e_r 解密、cnIp 默认注入、默认超时、安全瞬态重试、eapi gzip、PAC 解析接入 |
| `src/core/options.ts` | Modify | 透传 `acceptGzip` |
| `src/types/request.ts` | Modify | `CreateRequestOptions` 增 `acceptGzip` |
| `src/core/anonymous.ts` | Create | 匿名注册原语 `registerAnonymousToken` + 单飞懒刷新 `ensureRuntimeAnonymousToken` |
| `src/core/identity.ts` | Create | 匿名身份池(deviceId/cnIp/token 轮换),opt-in |
| `src/core/utils.ts` | Modify | 抽出 `stableStringify`(供 SDK 缓存 key 与 server 复用) |
| `src/server/routes.ts` | Modify | 复用 `stableStringify`(消除重复实现) |
| `src/sdk/runtime.ts` | Modify | SDK 入口接入:懒刷新 token、缓存+single-flight、身份轮换 |
| `src/types/sdk.ts` | Modify | `CreateHanaMusicApiConfig` 增 `cache` / `identityPool`(SDK-only,不污染请求层) |
| `src/types/index.ts` | Modify | re-export 新增 SDK 类型 |
| `tests/request.test.ts` | Modify | e_r / cnIp / 超时 / 安全重试 / gzip 用例 |
| `tests/anonymous.test.ts` | Create | 懒刷新单飞用例 |
| `tests/sdk-enhance.test.ts` | Create | 缓存+去重、身份池轮换用例 |
| `package.json` | Modify | (仅 Phase 2)新增 `pac-resolver` |

---

# PHASE 0 — 请求核心:回归修复与健壮性(全部落在 `src/core/request.ts`)

> 本阶段每个 Task 独立可发布,互不依赖。完成后请求核心即达到"单请求级"与旧项目对齐并略强。

## Task 0.1: 修复 weapi 加密响应(e_r)解密回归

**背景:** 旧项目 `use_e_r = (crypto==='eapi' || crypto==='weapi') && data.e_r`,两种加密都支持请求并解密加密响应。hana 当前只在 `crypto==='eapi'` 分支设置 `payload.e_r` 并仅对 eapi 解密(`request.ts:176`),weapi 传 `e_r=true` 会把加密二进制 body 当 JSON 解析而崩溃。

**Files:**
- Modify: `src/core/request.ts`(将 e_r 解析上提到 switch 前;解密条件扩到 weapi)
- Test: `tests/request.test.ts`

- [ ] **Step 1: 写失败测试**

在 `tests/request.test.ts` 顶部 import 增加 `aesEncrypt`:

```ts
import { aesEncrypt } from '../src/core/crypto.ts'
```

在 `describe('createRequest', ...)` 内新增用例:

```ts
test('should decrypt weapi encrypted responses when e_r is enabled', async () => {
  const EAPI_KEY = 'e82ckenh8dichen8'
  const encryptedHex = aesEncrypt(
    JSON.stringify({ code: 200, lrc: { lyric: 'demo' } }),
    'ecb',
    EAPI_KEY,
    '',
    'hex',
  )
  const fetcher: FetchLike = async () => {
    return new Response(Buffer.from(encryptedHex, 'hex'), {
      status: 200,
    })
  }

  const response = await createRequest(
    '/api/song/lyric',
    {},
    {
      crypto: 'weapi',
      e_r: true,
      fetcher,
      state: {
        anonymousToken: 'anonymous-token',
        deviceId: 'DEVICE_ID',
      },
    },
  )

  expect(response.status).toBe(200)
  expect(response.body).toMatchObject({
    code: 200,
    lrc: {
      lyric: 'demo',
    },
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `bun test tests/request.test.ts -t "weapi encrypted responses"`
Expected: FAIL(当前 weapi 分支不设 e_r、不解密,body 会是把二进制当文本/JSON 的乱码或 parse 异常)

- [ ] **Step 3: 实现 —— 把 e_r 解析上提到 switch 之前**

在 `src/core/request.ts`,定位当前(约 60-66 行):

```ts
  const csrfToken = String(cookie['__csrf'] ?? '')
  const crypto = resolveCrypto(options.crypto)
  const payload = {
    ...data,
  }

  let url = ''
  let requestBody: Record<string, string>
```

替换为(新增 `encryptResponse` 解析并写入 payload,与旧项目"所有 crypto 都带 e_r"对齐):

```ts
  const csrfToken = String(cookie['__csrf'] ?? '')
  const crypto = resolveCrypto(options.crypto)
  const payload = {
    ...data,
  }
  // e_r 决定服务端是否返回加密响应。旧项目对所有 crypto 统一注入该标记,
  // 并对 eapi / weapi 两种加密都做响应解密,这里保持同样语义。
  const encryptResponse = toBoolean(
    options.e_r !== undefined
      ? options.e_r
      : (readBooleanLike(payload.e_r) ?? APP_CONF.encryptResponse),
  )
  payload.e_r = encryptResponse

  let url = ''
  let requestBody: Record<string, string>
```

- [ ] **Step 4: 实现 —— 删除 eapi 分支里重复的 e_r 设置**

定位当前 eapi 分支(约 96-104 行):

```ts
      if (crypto === 'eapi') {
        payload.header = header
        payload.e_r = toBoolean(
          options.e_r !== undefined
            ? options.e_r
            : (readBooleanLike(payload.e_r) ?? APP_CONF.encryptResponse),
        )
        requestBody = eapi(uri, payload)
        url = `${options.domain || APP_CONF.apiDomain}/eapi/${uri.slice(5)}`
      } else {
```

替换为:

```ts
      if (crypto === 'eapi') {
        payload.header = header
        requestBody = eapi(uri, payload)
        url = `${options.domain || APP_CONF.apiDomain}/eapi/${uri.slice(5)}`
      } else {
```

- [ ] **Step 5: 实现 —— 解密条件扩到 weapi**

定位当前(约 176 行):

```ts
      if (crypto === 'eapi' && payload.e_r) {
```

替换为:

```ts
      if ((crypto === 'eapi' || crypto === 'weapi') && encryptResponse) {
```

- [ ] **Step 6: 跑测试确认通过(含回归)**

Run: `bun test tests/request.test.ts`
Expected: PASS(新用例通过;原有 api/weapi/special-code/retry/timeout/close 用例全绿)

- [ ] **Step 7: 风格闸**

Run: `bun run typecheck && bun run lint && bun run fmt`
Expected: 0 error

- [ ] **Step 8: 提交**

```bash
git add src/core/request.ts tests/request.test.ts
git commit -m "fix(request): decrypt weapi encrypted responses (e_r)"
```

---

## Task 0.2: SDK 路径默认注入 cnIp(可被显式 ip 覆盖)

**背景:** SDK 链路从不传 ip,`request.ts:46` 的 `?? ''` 导致请求不带 `X-Forwarded-For`/`X-Real-IP`,本机真实出口 IP 直接暴露。改为未显式传 ip 时回退到 `runtime.cnIp`。HTTP server 始终显式传 ip(`routes.ts` 的 `resolveClientIp`),不受影响。

**Files:**
- Modify: `src/core/request.ts`(state 上移、ip 回退 cnIp)
- Test: `tests/request.test.ts`

- [ ] **Step 1: 写失败测试**

在 `tests/request.test.ts` 新增:

```ts
test('should fall back to runtime cnIp when no ip is provided', async () => {
  let init: RequestInit | undefined
  const fetcher: FetchLike = async (_requestInput, requestInit) => {
    init = requestInit

    return new Response(JSON.stringify({ code: 200 }), {
      status: 200,
    })
  }

  await createRequest(
    '/api/test',
    {},
    {
      crypto: 'api',
      fetcher,
      state: {
        anonymousToken: 'anonymous-token',
        cnIp: '116.25.123.45',
        deviceId: 'DEVICE_ID',
      },
    },
  )

  expect(getHeader(init, 'X-Real-IP')).toBe('116.25.123.45')
  expect(getHeader(init, 'X-Forwarded-For')).toBe('116.25.123.45')
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `bun test tests/request.test.ts -t "fall back to runtime cnIp"`
Expected: FAIL(当前 X-Real-IP 为空字符串,header 未设置)

- [ ] **Step 3: 实现 —— state 上移并让 ip 回退到 cnIp**

定位当前(约 43-58 行):

```ts
  const headers: Record<string, string> = {
    ...options.headers,
  }
  const ip = options.realIP ?? options.ip ?? ''

  if (ip) {
    headers['X-Forwarded-For'] = ip
    headers['X-Real-IP'] = ip
  }

  const fetcher: FetchLike = options.fetcher ?? fetch
  const state = getRuntimeState(options.state)
```

替换为:

```ts
  const headers: Record<string, string> = {
    ...options.headers,
  }
  const fetcher: FetchLike = options.fetcher ?? fetch
  const state = getRuntimeState(options.state)
  // 调用方未显式给 ip/realIP 时回退到进程级 cnIp。SDK 链路据此默认获得中国区伪装 IP,
  // HTTP server 始终显式传 ip,不受影响。
  const ip = options.realIP ?? options.ip ?? state.cnIp

  if (ip) {
    headers['X-Forwarded-For'] = ip
    headers['X-Real-IP'] = ip
  }
```

- [ ] **Step 4: 跑测试确认通过(含回归)**

Run: `bun test tests/request.test.ts`
Expected: PASS(新用例通过;原有用例不依赖 X-Real-IP 缺失,全绿)

- [ ] **Step 5: 跑 SDK 转发与 server 回归**

Run: `bun test tests/sdk-config-forwarding.test.ts tests/server.test.ts`
Expected: PASS(显式 ip='1.2.3.4' 仍优先;server 用例不变)

- [ ] **Step 6: 风格闸**

Run: `bun run typecheck && bun run lint && bun run fmt`
Expected: 0 error

- [ ] **Step 7: 提交**

```bash
git add src/core/request.ts tests/request.test.ts
git commit -m "feat(request): default outbound ip to runtime cnIp on SDK path"
```

---

## Task 0.3: 默认每次尝试超时(可禁用)

**背景:** `timeoutMs` 未传时不建 `AbortController`(`request.ts:136-137`),高并发下挂死 socket 拖垮吞吐且永不返回。给一个保守默认(8s),显式传 `0`/负数仍可禁用(`normalizeTimeoutMs` 已对 `<=0` 返回 `undefined`)。

**Files:**
- Modify: `src/core/request.ts`(新增常量 + 默认值注入)
- Test: `tests/request.test.ts`

- [ ] **Step 1: 写失败测试**

在 `tests/request.test.ts` 新增(验证不传 timeoutMs 也会下发 AbortSignal):

```ts
test('should attach an abort signal using the default timeout', async () => {
  let sawSignal = false
  const fetcher: FetchLike = async (_requestInput, requestInit) => {
    sawSignal = requestInit?.signal instanceof AbortSignal

    return new Response(JSON.stringify({ code: 200 }), {
      status: 200,
    })
  }

  await createRequest(
    '/api/test',
    {},
    {
      crypto: 'api',
      fetcher,
      state: {
        anonymousToken: 'anonymous-token',
        deviceId: 'DEVICE_ID',
      },
    },
  )

  expect(sawSignal).toBe(true)
})

test('should allow disabling the timeout with timeoutMs 0', async () => {
  let sawSignal = true
  const fetcher: FetchLike = async (_requestInput, requestInit) => {
    sawSignal = requestInit?.signal instanceof AbortSignal

    return new Response(JSON.stringify({ code: 200 }), {
      status: 200,
    })
  }

  await createRequest(
    '/api/test',
    {},
    {
      crypto: 'api',
      fetcher,
      state: {
        anonymousToken: 'anonymous-token',
        deviceId: 'DEVICE_ID',
      },
      timeoutMs: 0,
    },
  )

  expect(sawSignal).toBe(false)
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `bun test tests/request.test.ts -t "default timeout"`
Expected: FAIL(当前不传 timeoutMs 不会建 controller,sawSignal=false)

- [ ] **Step 3: 实现 —— 新增默认常量**

在 `src/core/request.ts` 顶部常量区(`const MAX_RETRIES = 5` 附近)新增:

```ts
const DEFAULT_TIMEOUT_MS = 8_000
```

- [ ] **Step 4: 实现 —— 注入默认值**

定位当前(约 136 行):

```ts
    const timeoutMs = normalizeTimeoutMs(options.timeoutMs)
```

替换为:

```ts
    // 未显式配置时给一个保守默认超时,避免高并发下挂死连接拖垮整体吞吐;
    // 显式传 0 / 负数仍按禁用处理(normalizeTimeoutMs 对 <=0 返回 undefined)。
    const timeoutMs = normalizeTimeoutMs(options.timeoutMs ?? DEFAULT_TIMEOUT_MS)
```

- [ ] **Step 5: 跑测试确认通过(含回归)**

Run: `bun test tests/request.test.ts`
Expected: PASS(新用例通过;原 `timeoutMs:1` abort 用例仍绿)

- [ ] **Step 6: 风格闸**

Run: `bun run typecheck && bun run lint && bun run fmt`
Expected: 0 error

- [ ] **Step 7: 提交**

```bash
git add src/core/request.ts tests/request.test.ts
git commit -m "feat(request): apply a conservative default per-attempt timeout"
```

---

## Task 0.4: 对"连接从未建立"类瞬态传输错误默认重试

**背景:** 当前 POST 默认不重试(`retryNonIdempotent` 不开)。直接对所有传输错误重试会有 POST 重复提交风险(旧项目正因此完全不重试)。安全折中:仅对**连接从未建立**(DNS 失败 / 连接超时 / 连接被拒)这类"请求确定未到达服务端、零重复提交风险"的错误默认重试。"socket 中途断开"等歧义错误仍需显式 opt-in,既有用例不受影响。

**Files:**
- Modify: `src/core/request.ts`(新增安全错误判定 + 默认尝试次数;调整重试判定)
- Test: `tests/request.test.ts`

- [ ] **Step 1: 写失败测试**

在 `tests/request.test.ts` 新增:

```ts
test('should retry connection-never-established errors by default', async () => {
  let calls = 0
  const fetcher: FetchLike = async () => {
    calls += 1
    if (calls === 1) {
      throw new Error('connect UND_ERR_CONNECT_TIMEOUT')
    }

    return new Response(JSON.stringify({ code: 200, ok: true }), {
      status: 200,
    })
  }

  const response = await createRequest(
    '/api/test',
    {},
    {
      crypto: 'api',
      fetcher,
      retry: {
        backoffMs: 0,
        jitter: false,
      },
      state: {
        anonymousToken: 'anonymous-token',
        deviceId: 'DEVICE_ID',
      },
    },
  )

  expect(response.status).toBe(200)
  expect(calls).toBe(2)
})
```

> 既有用例 `'should not retry post requests unless explicitly allowed'` 用的是 `'The socket connection was closed unexpectedly'`(歧义错误),不在安全集合内,应继续 `calls===1`——本 Task 不得让其变红。

- [ ] **Step 2: 跑测试确认失败**

Run: `bun test tests/request.test.ts -t "connection-never-established"`
Expected: FAIL(当前不开 retryNonIdempotent 时 maxAttempts=1,calls=1)

- [ ] **Step 3: 实现 —— 新增安全错误判定 + 常量**

在 `src/core/request.ts` 常量区新增:

```ts
const DEFAULT_SAFE_RETRIES = 2
```

在 `isSocketCloseText` 函数附近新增判定函数(只匹配"连接从未建立"):

```ts
// 仅匹配连接从未建立的错误:此时请求确定没到达服务端,重试无重复提交风险。
// 中途断开(socket closed 等歧义错误)不在此列,需调用方显式 opt-in。
function isConnectionNeverEstablished(error: unknown): boolean {
  const text = collectErrorText(error).toLowerCase()
  return (
    text.includes('eai_again') ||
    text.includes('econnrefused') ||
    text.includes('und_err_connect_timeout') ||
    text.includes('connect etimedout')
  )
}
```

- [ ] **Step 4: 实现 —— 让 maxAttempts 容纳默认安全重试**

定位 `normalizeRetryOptions` 当前 return 中的 `maxAttempts`:

```ts
    maxAttempts: retryNonIdempotent ? retries + 1 : 1,
```

替换为(默认也给安全重试预留尝试次数;具体是否真重试由错误类型决定):

```ts
    maxAttempts: retryNonIdempotent ? retries + 1 : DEFAULT_SAFE_RETRIES + 1,
```

- [ ] **Step 5: 实现 —— 拆分两类重试判定**

定位 catch 分支当前(约 268-273 行):

```ts
      const isRetryableError = didTimeout || isTransientTransportError(error)
      if (isRetryableError && (didTimeout || shouldUseFreshConnection(error))) {
        forceFreshConnection = true
      }

      if (isRetryableError && canRetry(retry, attempt)) {
```

替换为:

```ts
      // 显式 opt-in:超时 + 所有瞬态传输错误;默认:仅"连接从未建立"类。
      const isExplicitlyRetryable = didTimeout || isTransientTransportError(error)
      const isRetryableError = retry.retryNonIdempotent
        ? isExplicitlyRetryable
        : isConnectionNeverEstablished(error)
      if (isRetryableError && (didTimeout || shouldUseFreshConnection(error))) {
        forceFreshConnection = true
      }

      if (isRetryableError && attempt < retry.maxAttempts) {
```

> 注意:把原 `canRetry(retry, attempt)` 替换为 `attempt < retry.maxAttempts`,因为默认安全重试不依赖 `retryNonIdempotent`。`canRetry` 仍用于 try 分支的业务状态码重试(下一步保持不变)。

- [ ] **Step 6: 实现 —— 业务状态码重试维持显式 opt-in**

确认 try 分支的状态码重试(约 209 行)仍为:

```ts
      if (canRetry(retry, attempt) && retry.statusCodes.has(answer.status)) {
```

保持不变(业务状态码重试有重复提交风险,继续要求 `retryNonIdempotent`)。无需修改,仅核对。

- [ ] **Step 7: 跑测试确认通过(关键回归)**

Run: `bun test tests/request.test.ts`
Expected: PASS。重点确认:
- 新 "connection-never-established" 用例 → `calls===2`
- 既有 "should not retry post requests unless explicitly allowed"(socket closed)→ 仍 `calls===1`
- 既有 "retry transient transport errors with a fresh connection path"(显式 retryNonIdempotent)→ 仍绿

- [ ] **Step 8: 风格闸**

Run: `bun run typecheck && bun run lint && bun run fmt`
Expected: 0 error

- [ ] **Step 9: 提交**

```bash
git add src/core/request.ts tests/request.test.ts
git commit -m "feat(request): retry connection-never-established errors by default"
```

---

## Task 0.5: eapi gzip 响应(opt-in `acceptGzip`)

**背景:** 解密侧已支持 `headers['x-aeapi']==='true'` 的 gzip 解压(`request.ts:181` + `crypto.ts`),但从不发送该头。新增 `acceptGzip` 开关(默认关,与旧项目一致),开启后对 eapi 请求带 `x-aeapi: true`,大列表接口省带宽且更像真客户端。

**Files:**
- Modify: `src/types/request.ts`(`CreateRequestOptions` 增字段)
- Modify: `src/core/options.ts`(透传)
- Modify: `src/core/request.ts`(eapi 分支按需设头)
- Test: `tests/request.test.ts`

- [ ] **Step 1: 写失败测试**

在 `tests/request.test.ts` 顶部 import 增加(若尚未引入)`aesEncrypt` 已在 Task 0.1 引入;新增 import `gzipSync`:

```ts
import { gzipSync } from 'node:zlib'
```

新增用例:

```ts
test('should request gzipped eapi responses when acceptGzip is enabled', async () => {
  const EAPI_KEY = 'e82ckenh8dichen8'
  let sawHeader = ''
  const zippedHex = aesEncrypt(
    gzipSync(JSON.stringify({ code: 200, gz: true })).toString('binary'),
    'ecb',
    EAPI_KEY,
    '',
    'hex',
  )
  const fetcher: FetchLike = async (_requestInput, requestInit) => {
    sawHeader = getHeader(requestInit, 'x-aeapi')

    return new Response(Buffer.from(zippedHex, 'hex'), {
      status: 200,
    })
  }

  const response = await createRequest(
    '/api/song/lyric',
    {},
    {
      acceptGzip: true,
      crypto: 'eapi',
      e_r: true,
      fetcher,
      state: {
        anonymousToken: 'anonymous-token',
        deviceId: 'DEVICE_ID',
      },
    },
  )

  expect(sawHeader).toBe('true')
  expect(response.body).toMatchObject({
    code: 200,
    gz: true,
  })
})
```

> 注意:gzip 字节经 `aesEncrypt(text, 'ecb', ...)` 时按 utf8 处理会损坏二进制。为避免在测试里复刻加密细节,改用 crypto.test.ts 同款写法。**若上面 `aesEncrypt(gzipSync(...).toString('binary'))` 在运行时无法正确往返,请改用下面的等价写法**(与 `tests/crypto.test.ts:74-82` 一致):

```ts
  const { createCipheriv } = await import('node:crypto')
  const cipher = createCipheriv('aes-128-ecb', Buffer.from(EAPI_KEY, 'utf8'), null)
  cipher.setAutoPadding(true)
  const zippedHex = Buffer.concat([
    cipher.update(gzipSync(JSON.stringify({ code: 200, gz: true }))),
    cipher.final(),
  ])
    .toString('hex')
    .toUpperCase()
```

实现 Task 时优先采用此 `createCipheriv` 版本生成 `zippedHex`(确定可往返),删除上面 `aesEncrypt(...binary...)` 那行。

- [ ] **Step 2: 跑测试确认失败**

Run: `bun test tests/request.test.ts -t "gzipped eapi responses"`
Expected: FAIL(`acceptGzip` 类型不存在 / 未设头 → sawHeader='' 或编译错误)

- [ ] **Step 3: 实现 —— 类型字段**

在 `src/types/request.ts` 的 `CreateRequestOptions` 接口内,按字母序插入:

```ts
  readonly acceptGzip?: boolean
```

(插在 `readonly checkToken?` 之前)

- [ ] **Step 4: 实现 —— options 透传**

在 `src/core/options.ts` 的 `OptionSource` 接口顶部加入:

```ts
  readonly acceptGzip?: unknown
```

在 `createOption` 返回对象顶部加入:

```ts
    acceptGzip: query.acceptGzip === undefined ? undefined : toBooleanLike(query.acceptGzip) === true,
```

(放在 `checkToken:` 之前)

- [ ] **Step 5: 实现 —— eapi 分支按需设头**

在 `src/core/request.ts` 的 eapi 分支,定位:

```ts
      if (crypto === 'eapi') {
        payload.header = header
        requestBody = eapi(uri, payload)
        url = `${options.domain || APP_CONF.apiDomain}/eapi/${uri.slice(5)}`
      } else {
```

替换为:

```ts
      if (crypto === 'eapi') {
        payload.header = header
        // 真客户端会以 x-aeapi 声明可接受 gzip 压缩响应;按需开启以省带宽。
        if (options.acceptGzip) {
          headers['x-aeapi'] = 'true'
        }
        requestBody = eapi(uri, payload)
        url = `${options.domain || APP_CONF.apiDomain}/eapi/${uri.slice(5)}`
      } else {
```

> 解密侧 `eapiResDecrypt(encryptedBody, headers['x-aeapi'] === 'true')` 已存在,无需改动。

- [ ] **Step 6: 跑测试确认通过**

Run: `bun test tests/request.test.ts`
Expected: PASS(gzip 用例通过;eapi 普通用例不受影响)

- [ ] **Step 7: 风格闸**

Run: `bun run typecheck && bun run lint && bun run fmt`
Expected: 0 error

- [ ] **Step 8: 提交**

```bash
git add src/types/request.ts src/core/options.ts src/core/request.ts tests/request.test.ts
git commit -m "feat(request): support opt-in gzip eapi responses via acceptGzip"
```

---

## Phase 0 收尾验证

- [ ] **Run full verify**

Run: `bun run verify`
Expected: 全绿(types:modules:check → build → test → typecheck → lint → fmt:check → docs:build)

---

# PHASE 1 — SDK 层:懒刷新 token、缓存去重、身份轮换

> 接入点统一为 `src/sdk/runtime.ts`,覆盖 `createHanaMusicApi`、裸导出(`lyric` 等)与 `invokeModule`。

## Task 1.1: 匿名注册原语 + 单飞懒刷新(SDK 即开即用 MUSIC_A)

**背景:** SDK 链路从不主动获取匿名 token,匿名接口可能因无 MUSIC_A 被限流/301。新增 core 原语并接入 SDK 入口:当一次调用既未带 MUSIC_U/MUSIC_A、进程也无 token 时,单飞获取一次匿名 token 并缓存到 runtime。`generate-config.ts` 的契约导出全程不动。

**Files:**
- Create: `src/core/anonymous.ts`
- Modify: `src/sdk/runtime.ts`(`invokeStaticModule` 接入懒刷新)
- Test: `tests/anonymous.test.ts`

- [ ] **Step 1: 写失败测试**

Create `tests/anonymous.test.ts`:

```ts
import { describe, expect, test } from 'bun:test'

import type { FetchLike } from '../src/types/index.ts'

import { ensureRuntimeAnonymousToken } from '../src/core/anonymous.ts'
import { getRuntimeState, setRuntimeState } from '../src/core/runtime.ts'

function anonymousFetcher(token: string): { calls: () => number; fetcher: FetchLike } {
  let calls = 0
  const fetcher: FetchLike = async () => {
    calls += 1

    const response = new Response(JSON.stringify({ code: 200 }), {
      status: 200,
    })
    ;(
      response.headers as Headers & {
        getSetCookie?: () => string[]
      }
    ).getSetCookie = () => [`MUSIC_A=${token}; Path=/`]

    return response
  }

  return {
    calls: () => calls,
    fetcher,
  }
}

describe('ensureRuntimeAnonymousToken', () => {
  test('should register and cache an anonymous token when runtime has none', async () => {
    setRuntimeState({
      anonymousToken: '',
    })
    const { calls, fetcher } = anonymousFetcher('lazy-token')

    const token = await ensureRuntimeAnonymousToken({
      fetcher,
    })

    expect(token).toBe('lazy-token')
    expect(getRuntimeState().anonymousToken).toBe('lazy-token')
    expect(calls()).toBe(1)
  })

  test('should reuse the cached token without re-registering', async () => {
    setRuntimeState({
      anonymousToken: 'existing-token',
    })
    const { calls, fetcher } = anonymousFetcher('should-not-be-used')

    const token = await ensureRuntimeAnonymousToken({
      fetcher,
    })

    expect(token).toBe('existing-token')
    expect(calls()).toBe(0)
  })

  test('should single-flight concurrent callers', async () => {
    setRuntimeState({
      anonymousToken: '',
    })
    const { calls, fetcher } = anonymousFetcher('shared-token')

    const [a, b] = await Promise.all([
      ensureRuntimeAnonymousToken({ fetcher }),
      ensureRuntimeAnonymousToken({ fetcher }),
    ])

    expect(a).toBe('shared-token')
    expect(b).toBe('shared-token')
    expect(calls()).toBe(1)
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `bun test tests/anonymous.test.ts`
Expected: FAIL(`src/core/anonymous.ts` 不存在)

- [ ] **Step 3: 实现 —— `src/core/anonymous.ts`**

Create `src/core/anonymous.ts`:

```ts
import { createHash } from 'node:crypto'

import type { FetchLike } from '../types/index.ts'

import { createRequest } from './request.ts'
import { getRuntimeState, setRuntimeState } from './runtime.ts'
import { cookieToJson, generateDeviceId, generateRandomChineseIP } from './utils.ts'

const ID_XOR_KEY = '3go8&$8*3*3h0k(2)2'

export interface AnonymousRegistration {
  readonly anonymousToken: string
  readonly cnIp: string
  readonly deviceId: string
}

export interface EnsureAnonymousTokenOptions {
  readonly fetcher?: FetchLike
}

let inflight: Promise<string> | null = null

// register/anonimous 的 username:deviceId XOR 固定 key 后 md5(base64),再与原 deviceId 拼接 base64。
function createAnonymousUsername(deviceId: string): string {
  let xored = ''
  for (let index = 0; index < deviceId.length; index += 1) {
    xored += String.fromCharCode(
      deviceId.charCodeAt(index) ^ ID_XOR_KEY.charCodeAt(index % ID_XOR_KEY.length),
    )
  }
  const digest = createHash('md5').update(xored, 'utf8').digest('base64')

  return Buffer.from(`${deviceId} ${digest}`, 'utf8').toString('base64')
}

export async function registerAnonymousToken(
  options: {
    readonly cnIp?: string
    readonly deviceId?: string
    readonly fetcher?: FetchLike
  } = {},
): Promise<AnonymousRegistration> {
  const deviceId = options.deviceId ?? generateDeviceId()
  const cnIp = options.cnIp ?? generateRandomChineseIP()
  const result = await createRequest(
    '/api/register/anonimous',
    {
      username: createAnonymousUsername(deviceId),
    },
    {
      cnIp,
      crypto: 'weapi',
      fetcher: options.fetcher,
      ip: cnIp,
      state: {
        cnIp,
        deviceId,
      },
    },
  )
  const cookie = cookieToJson(result.cookie.join('; '))

  return {
    anonymousToken: String(cookie.MUSIC_A ?? ''),
    cnIp,
    deviceId,
  }
}

export async function ensureRuntimeAnonymousToken(
  options: EnsureAnonymousTokenOptions = {},
): Promise<string> {
  const current = getRuntimeState().anonymousToken
  if (current) {
    return current
  }

  if (inflight) {
    return inflight
  }

  inflight = registerAnonymousToken({
    fetcher: options.fetcher,
  })
    .then((registration) => {
      if (registration.anonymousToken) {
        setRuntimeState({
          anonymousToken: registration.anonymousToken,
          cnIp: registration.cnIp,
          deviceId: registration.deviceId,
        })
      }

      return registration.anonymousToken
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}
```

> `cnIp` 不是 `CreateRequestOptions` 字段,这里通过 `ip` 与 `state.cnIp` 携带即可;`createRequest` 调用里把 `cnIp` 顶层属性删掉(只保留 `ip` 与 `state`)。**实现时请删除上面 `createRequest` 选项中的顶层 `cnIp,` 一行**,最终选项为 `{ crypto: 'weapi', fetcher, ip: cnIp, state: { cnIp, deviceId } }`。

- [ ] **Step 4: 修正 Step 3 的选项(去掉非法顶层 cnIp)**

确保 `registerAnonymousToken` 内 `createRequest` 的第三参数为:

```ts
    {
      crypto: 'weapi',
      fetcher: options.fetcher,
      ip: cnIp,
      state: {
        cnIp,
        deviceId,
      },
    },
```

- [ ] **Step 5: 跑 anonymous 测试确认通过**

Run: `bun test tests/anonymous.test.ts`
Expected: PASS

- [ ] **Step 6: 接入 SDK 入口 —— `invokeStaticModule`**

在 `src/sdk/runtime.ts` 顶部 import 增加:

```ts
import { ensureRuntimeAnonymousToken } from '../core/anonymous.ts'
import { cookieToJson, isRecord } from '../core/utils.ts'
```

> 若 `src/core/utils.ts` 未导出 `cookieToJson`/`isRecord` 以外内容,无需新增;它们已存在。

新增一个判定 helper(放在文件底部):

```ts
// 调用方已带身份(MUSIC_U/MUSIC_A 或 state.anonymousToken)时,不应再触发懒刷新。
function hasConfiguredIdentity(config: ModuleCallConfig | undefined): boolean {
  if (!config) {
    return false
  }

  if (config.state?.anonymousToken) {
    return true
  }

  const cookie = config.cookie
  if (typeof cookie === 'string') {
    const parsed = cookieToJson(cookie)
    return Boolean(parsed.MUSIC_U || parsed.MUSIC_A)
  }

  if (isRecord(cookie)) {
    return Boolean(cookie.MUSIC_U || cookie.MUSIC_A)
  }

  return false
}
```

定位 `invokeStaticModule`:

```ts
async function invokeStaticModule<K extends ModuleIdentifier>(
  identifier: K,
  moduleImplementation: SdkModuleImplementation<K>,
  query: SdkQueryOf<K>,
  config?: ModuleCallConfig,
): Promise<ModuleResponseOf<K>> {
  void identifier
  return moduleImplementation(
    mergeQueryAndConfig(query, config) as ModuleQueryOf<K>,
    createRequest as ModuleRequest,
  )
}
```

替换为:

```ts
async function invokeStaticModule<K extends ModuleIdentifier>(
  identifier: K,
  moduleImplementation: SdkModuleImplementation<K>,
  query: SdkQueryOf<K>,
  config?: ModuleCallConfig,
): Promise<ModuleResponseOf<K>> {
  void identifier
  // 未携带任何身份时,惰性确保进程持有一个匿名 token(单飞,仅首次付费)。
  if (!hasConfiguredIdentity(config)) {
    await ensureRuntimeAnonymousToken({
      fetcher: config?.fetcher,
    })
  }

  return moduleImplementation(
    mergeQueryAndConfig(query, config) as ModuleQueryOf<K>,
    createRequest as ModuleRequest,
  )
}
```

- [ ] **Step 7: 跑 SDK 回归确认懒刷新不破坏既有契约**

Run: `bun test tests/sdk-config-forwarding.test.ts tests/sdk-release-contract.test.ts tests/module-api.test.ts`
Expected: PASS(sdk-config-forwarding 的 config 带 `state.anonymousToken`,`hasConfiguredIdentity` 为真 → 跳过懒刷新,不会触发额外 fetch)

- [ ] **Step 8: 风格闸**

Run: `bun run typecheck && bun run lint && bun run fmt`
Expected: 0 error

- [ ] **Step 9: 提交**

```bash
git add src/core/anonymous.ts src/sdk/runtime.ts tests/anonymous.test.ts
git commit -m "feat(sdk): lazily ensure an anonymous token on SDK calls"
```

---

## Task 1.2: 抽出 `stableStringify` 到 utils(供 SDK 缓存复用)

**背景:** `src/server/routes.ts` 内有私有 `stableSerialize`,Task 1.3 的 SDK 缓存 key 也需要稳定序列化。按 AGENTS.md"3+ caller 才抽象"——届时 caller = routes + sdk cache key + (potential) ≥2,先抽出共享实现并让 routes 复用,消除重复。

**Files:**
- Modify: `src/core/utils.ts`(新增导出 `stableStringify`)
- Modify: `src/server/routes.ts`(改用 `stableStringify`,删私有实现)
- Test: `tests/request.test.ts`(轻量单测 utils 不必单开文件;此处给 utils 直接断言)

- [ ] **Step 1: 写失败测试**

Create `tests/utils.test.ts`:

```ts
import { describe, expect, test } from 'bun:test'

import { stableStringify } from '../src/core/utils.ts'

describe('stableStringify', () => {
  test('should produce key-order-independent output for objects', () => {
    expect(stableStringify({ a: 1, b: 2 })).toBe(stableStringify({ b: 2, a: 1 }))
  })

  test('should serialize nested arrays and records deterministically', () => {
    expect(stableStringify({ list: [{ y: 2, x: 1 }] })).toBe('{list:[{x:1,y:2}]}')
  })

  test('should encode File by name/size/type', () => {
    const file = new File(['abc'], 'a.txt', { type: 'text/plain' })
    expect(stableStringify(file)).toBe('File(a.txt:3:text/plain)')
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `bun test tests/utils.test.ts`
Expected: FAIL(`stableStringify` 未导出)

- [ ] **Step 3: 实现 —— 在 `src/core/utils.ts` 末尾新增**

```ts
// 稳定序列化:对象 key 排序后输出,使得字段顺序不同也得到相同字符串。
// 供 SDK 缓存 key 与 server 缓存 key 共用。
export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`
  }

  if (value instanceof File) {
    return `File(${value.name}:${value.size}:${value.type})`
  }

  if (isRecord(value)) {
    const entries = Object.entries(value).toSorted(([left], [right]) => left.localeCompare(right))

    return `{${entries.map(([key, entryValue]) => `${key}:${stableStringify(entryValue)}`).join(',')}}`
  }

  return JSON.stringify(value)
}
```

- [ ] **Step 4: 跑 utils 测试确认通过**

Run: `bun test tests/utils.test.ts`
Expected: PASS

- [ ] **Step 5: 重构 routes.ts 复用(删除私有实现)**

在 `src/server/routes.ts`:
1. import 增加 `stableStringify`(与 `cookieToJson` 同一处 `from '../core/utils.ts'`)。
2. 定位 `createReqCacheKey`:

```ts
function createReqCacheKey(method: string, route: string, query: ModuleQuery): string {
  return `${method.toUpperCase()}:${route}:${stableSerialize(query)}`
}
```

改为:

```ts
function createReqCacheKey(method: string, route: string, query: ModuleQuery): string {
  return `${method.toUpperCase()}:${route}:${stableStringify(query)}`
}
```

3. 删除文件中的私有 `stableSerialize` 函数与其仅服务于它的私有 `isRecordLike`(若 `isRecordLike` 别处仍被引用则保留)。

- [ ] **Step 6: 跑 server 回归**

Run: `bun test tests/server.test.ts`
Expected: PASS(缓存命中行为不变)

- [ ] **Step 7: 风格闸**

Run: `bun run typecheck && bun run lint && bun run fmt`
Expected: 0 error

- [ ] **Step 8: 提交**

```bash
git add src/core/utils.ts src/server/routes.ts tests/utils.test.ts
git commit -m "refactor(core): share stableStringify between server and sdk"
```

---

## Task 1.3: SDK opt-in 响应缓存 + single-flight 去重

**背景:** `MemoryResponseCache` 只挂在 HTTP server,SDK 重复打同一接口全部真发。给 `createHanaMusicApi(config)` 增加可选 `cache`,命中返回缓存、并发相同 key 去重(只发一次)。默认关闭,零行为变更。

**Files:**
- Modify: `src/types/sdk.ts`(`CreateHanaMusicApiConfig` 增 `cache`)
- Modify: `src/types/index.ts`(re-export 新类型)
- Modify: `src/sdk/runtime.ts`(`createModuleInvoker` 接入缓存+去重)
- Test: `tests/sdk-enhance.test.ts`

- [ ] **Step 1: 写失败测试**

Create `tests/sdk-enhance.test.ts`:

```ts
import { describe, expect, test } from 'bun:test'

import type { FetchLike } from '../src/types/index.ts'

import { createHanaMusicApi } from '../index.ts'

function countingLyricFetcher(): { calls: () => number; fetcher: FetchLike } {
  let calls = 0
  const fetcher: FetchLike = async () => {
    calls += 1

    return new Response(JSON.stringify({ code: 200, lrc: { lyric: 'demo' } }), {
      status: 200,
    })
  }

  return {
    calls: () => calls,
    fetcher,
  }
}

describe('sdk response cache', () => {
  test('should serve identical calls from cache within ttl', async () => {
    const { calls, fetcher } = countingLyricFetcher()
    const hana = createHanaMusicApi({
      cache: {
        ttlMs: 60_000,
      },
      cookie: 'MUSIC_U=cached-user',
      fetcher,
    })

    await hana.lyric({ id: '1' })
    await hana.lyric({ id: '1' })

    expect(calls()).toBe(1)
  })

  test('should not cache across different queries', async () => {
    const { calls, fetcher } = countingLyricFetcher()
    const hana = createHanaMusicApi({
      cache: {
        ttlMs: 60_000,
      },
      cookie: 'MUSIC_U=cached-user',
      fetcher,
    })

    await hana.lyric({ id: '1' })
    await hana.lyric({ id: '2' })

    expect(calls()).toBe(2)
  })

  test('should single-flight concurrent identical calls', async () => {
    const { calls, fetcher } = countingLyricFetcher()
    const hana = createHanaMusicApi({
      cache: {
        ttlMs: 60_000,
      },
      cookie: 'MUSIC_U=cached-user',
      fetcher,
    })

    await Promise.all([hana.lyric({ id: '1' }), hana.lyric({ id: '1' })])

    expect(calls()).toBe(1)
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `bun test tests/sdk-enhance.test.ts`
Expected: FAIL(`cache` 不是合法 config 字段 / 无缓存行为)

- [ ] **Step 3: 实现 —— 类型**

在 `src/types/sdk.ts` 顶部(`ModuleCallConfig` 定义后)新增并扩展 `CreateHanaMusicApiConfig`:

```ts
export interface SdkCacheConfig {
  readonly enabled?: boolean
  readonly ttlMs?: number
}

export interface CreateHanaMusicApiConfig extends ModuleCallConfig {
  readonly cache?: SdkCacheConfig
}
```

(替换原 `export interface CreateHanaMusicApiConfig extends ModuleCallConfig {}`)

在 `src/types/index.ts` 的 sdk re-export 块加入 `SdkCacheConfig`:

```ts
export type {
  CreateHanaMusicApiConfig,
  LegacyCompatibleSdkModuleInvoker,
  ModuleCallConfig,
  SdkCacheConfig,
  SdkModuleImplementation,
  SdkModuleInvoker,
  SdkModuleRegistry,
  SdkQueryOf,
} from './sdk.ts'
```

- [ ] **Step 4: 实现 —— `createModuleInvoker` 接入缓存+去重**

在 `src/sdk/runtime.ts` import 增加:

```ts
import { MemoryResponseCache } from '../core/cache.ts'
import { stableStringify } from '../core/utils.ts'
```

> 同时把 import 里的类型 `CreateHanaMusicApiConfig` 已存在;确保 `ModuleResponseOf`、`NcmApiResponse` 在类型 import 中可用(`NcmApiResponse` 需新增到类型 import)。

定位现有 `createModuleInvoker`:

```ts
export function createModuleInvoker<K extends ModuleIdentifier>(
  identifier: K,
  moduleImplementation: SdkModuleImplementation<K>,
  baseConfig: CreateHanaMusicApiConfig = {},
): SdkModuleInvoker<K> {
  return (async (query?: SdkQueryOf<K>, config?: ModuleCallConfig) => {
    const resolvedQuery = (query ?? {}) as SdkQueryOf<K>

    return invokeStaticModule(identifier, moduleImplementation, resolvedQuery, {
      ...baseConfig,
      ...config,
    })
  }) as SdkModuleInvoker<K>
}
```

替换为:

```ts
export function createModuleInvoker<K extends ModuleIdentifier>(
  identifier: K,
  moduleImplementation: SdkModuleImplementation<K>,
  baseConfig: CreateHanaMusicApiConfig = {},
): SdkModuleInvoker<K> {
  const { cache, ...requestConfig } = baseConfig
  const cacheStore =
    cache && cache.enabled !== false ? new MemoryResponseCache(cache.ttlMs ?? 120_000) : null
  const inflight = new Map<string, Promise<ModuleResponseOf<K>>>()

  return (async (query?: SdkQueryOf<K>, config?: ModuleCallConfig) => {
    const resolvedQuery = (query ?? {}) as SdkQueryOf<K>
    const callConfig: ModuleCallConfig = {
      ...requestConfig,
      ...config,
    }

    if (!cacheStore) {
      return invokeStaticModule(identifier, moduleImplementation, resolvedQuery, callConfig)
    }

    // 缓存 key 取决于模块标识、query 与本次调用的 cookie(不同账号互不串)。
    const key = `${identifier}:${stableStringify(resolvedQuery)}:${stableStringify(callConfig.cookie ?? '')}`
    const cached = cacheStore.get(key)
    if (cached) {
      return cached as ModuleResponseOf<K>
    }

    const existing = inflight.get(key)
    if (existing) {
      return existing
    }

    const pending = invokeStaticModule(identifier, moduleImplementation, resolvedQuery, callConfig)
      .then((response) => {
        if (response.status === 200) {
          cacheStore.set(key, response)
        }

        return response
      })
      .finally(() => {
        inflight.delete(key)
      })

    inflight.set(key, pending)

    return pending
  }) as SdkModuleInvoker<K>
}
```

> `MemoryResponseCache.get/set` 以 `NcmApiResponse` 为单位,`ModuleResponseOf<K>` 与其结构兼容,使用处用 `as` 收敛类型。

- [ ] **Step 5: 跑测试确认通过**

Run: `bun test tests/sdk-enhance.test.ts`
Expected: PASS(命中缓存 calls=1;不同 query calls=2;并发去重 calls=1)

- [ ] **Step 6: SDK 回归**

Run: `bun test tests/sdk-config-forwarding.test.ts tests/sdk-release-contract.test.ts`
Expected: PASS(未配置 cache 时 `cacheStore=null`,行为与原先一致)

- [ ] **Step 7: 风格闸**

Run: `bun run typecheck && bun run lint && bun run fmt`
Expected: 0 error

- [ ] **Step 8: 提交**

```bash
git add src/types/sdk.ts src/types/index.ts src/sdk/runtime.ts tests/sdk-enhance.test.ts
git commit -m "feat(sdk): add opt-in response cache with single-flight dedup"
```

---

## Task 1.4: opt-in 匿名身份池 + 轮换(deviceId / cnIp / token)

**背景:** 进程内单一固定 `{deviceId, cnIp, token}` 对高频爬取是强可关联指纹。新增可选身份池:首次惰性注册 N 个匿名身份,按调用轮询注入。默认关闭,仅 `createHanaMusicApi({ identityPool: { size } })` 时启用。

**Files:**
- Create: `src/core/identity.ts`
- Modify: `src/types/sdk.ts`(`CreateHanaMusicApiConfig` 增 `identityPool`)
- Modify: `src/types/index.ts`(re-export)
- Modify: `src/sdk/runtime.ts`(`createModuleInvoker` 在 dispatch 前注入身份)
- Test: `tests/sdk-enhance.test.ts`(追加)

- [ ] **Step 1: 写失败测试**

在 `tests/sdk-enhance.test.ts` 追加:

```ts
import { cookieToJson } from '../src/core/utils.ts'

describe('sdk identity pool', () => {
  test('should rotate registered anonymous identities across calls', async () => {
    const registered: string[] = []
    const sentTokens: string[] = []
    const fetcher: FetchLike = async (_input, init) => {
      const cookieHeader =
        init?.headers instanceof Headers
          ? (init.headers.get('Cookie') ?? '')
          : ((init?.headers as Record<string, string> | undefined)?.Cookie ?? '')
      const parsed = cookieToJson(decodeURIComponent(cookieHeader))

      // register/anonimous: 下发新的 MUSIC_A;其它调用: 记录其使用的 MUSIC_A。
      const url = typeof _input === 'string' ? _input : String(_input)
      if (url.includes('register/anonimous')) {
        const token = `pool-token-${registered.length + 1}`
        registered.push(token)

        const response = new Response(JSON.stringify({ code: 200 }), {
          status: 200,
        })
        ;(
          response.headers as Headers & {
            getSetCookie?: () => string[]
          }
        ).getSetCookie = () => [`MUSIC_A=${token}; Path=/`]

        return response
      }

      if (parsed.MUSIC_A) {
        sentTokens.push(String(parsed.MUSIC_A))
      }

      return new Response(JSON.stringify({ code: 200, lrc: { lyric: 'demo' } }), {
        status: 200,
      })
    }

    const hana = createHanaMusicApi({
      fetcher,
      identityPool: {
        size: 2,
      },
    })

    await hana.lyric({ id: '1' })
    await hana.lyric({ id: '2' })
    await hana.lyric({ id: '3' })

    expect(registered.length).toBe(2)
    // 三次调用轮询使用两个身份: t1, t2, t1
    expect(sentTokens).toEqual([registered[0], registered[1], registered[0]])
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `bun test tests/sdk-enhance.test.ts -t "identity pool"`
Expected: FAIL(`identityPool` 非法字段 / 无轮换)

- [ ] **Step 3: 实现 —— `src/core/identity.ts`**

Create `src/core/identity.ts`:

```ts
import type { FetchLike, ModuleCallConfig } from '../types/index.ts'

import { registerAnonymousToken } from './anonymous.ts'

export interface IdentityPoolConfig {
  readonly size: number
}

export interface IdentityPool {
  next: () => Promise<Partial<ModuleCallConfig>>
}

// 惰性注册 size 个匿名身份,按调用轮询。每个身份携带自己的 cnIp / deviceId / MUSIC_A。
export function createIdentityPool(
  config: IdentityPoolConfig,
  fetcher: FetchLike | undefined,
): IdentityPool {
  const size = Math.max(1, Math.floor(config.size))
  const identities: Array<Partial<ModuleCallConfig>> = []
  let ready: Promise<void> | null = null
  let cursor = 0

  const register = async (): Promise<void> => {
    for (let index = 0; index < size; index += 1) {
      const registration = await registerAnonymousToken({
        fetcher,
      })
      identities.push({
        cookie: {
          MUSIC_A: registration.anonymousToken,
        },
        ip: registration.cnIp,
        state: {
          anonymousToken: registration.anonymousToken,
          cnIp: registration.cnIp,
          deviceId: registration.deviceId,
        },
      })
    }
  }

  return {
    async next() {
      if (!ready) {
        ready = register()
      }
      await ready

      const identity = identities[cursor % identities.length]
      cursor += 1

      return identity ?? {}
    },
  }
}
```

- [ ] **Step 4: 实现 —— 类型**

在 `src/types/sdk.ts`:

```ts
export interface IdentityPoolConfig {
  readonly size: number
}

export interface CreateHanaMusicApiConfig extends ModuleCallConfig {
  readonly cache?: SdkCacheConfig
  readonly identityPool?: IdentityPoolConfig
}
```

(扩展 Task 1.3 已建的 `CreateHanaMusicApiConfig`;`IdentityPoolConfig` 与 `core/identity.ts` 同名,二者保持结构一致,类型层以 `src/types/sdk.ts` 为准——`core/identity.ts` 改为从 types 导入该类型以免重复定义)

调整 `src/core/identity.ts` 的 import 与定义:删除其内部 `export interface IdentityPoolConfig`,改为:

```ts
import type { FetchLike, IdentityPoolConfig, ModuleCallConfig } from '../types/index.ts'
```

在 `src/types/index.ts` sdk re-export 块加入 `IdentityPoolConfig`。

- [ ] **Step 5: 实现 —— `createModuleInvoker` 注入身份**

在 `src/sdk/runtime.ts` import 增加:

```ts
import { createIdentityPool } from '../core/identity.ts'
```

在 Task 1.3 改造后的 `createModuleInvoker` 内,`const { cache, ...requestConfig } = baseConfig` 改为同时解构 `identityPool`:

```ts
  const { cache, identityPool, ...requestConfig } = baseConfig
  const cacheStore =
    cache && cache.enabled !== false ? new MemoryResponseCache(cache.ttlMs ?? 120_000) : null
  const pool = identityPool ? createIdentityPool(identityPool, requestConfig.fetcher) : null
  const inflight = new Map<string, Promise<ModuleResponseOf<K>>>()
```

把 `callConfig` 的构造改为异步合入身份:

```ts
  return (async (query?: SdkQueryOf<K>, config?: ModuleCallConfig) => {
    const resolvedQuery = (query ?? {}) as SdkQueryOf<K>
    const identity = pool ? await pool.next() : {}
    const callConfig: ModuleCallConfig = {
      ...requestConfig,
      ...config,
      ...identity,
    }
    // ...(其余 cache / single-flight 逻辑保持 Task 1.3 不变)
```

> 身份注入优先级:`identity` 放在最后覆盖,确保轮换的 cookie/ip/state 生效;若调用方在 per-call `config` 里显式给了 cookie,身份池会覆盖它——这是池模式的预期语义(整池统一伪装)。

> 注意:启用 `identityPool` 时,`hasConfiguredIdentity` 会因 `state.anonymousToken` 为真而跳过 Task 1.1 的懒刷新——符合预期(池自带 token)。

- [ ] **Step 6: 跑测试确认通过**

Run: `bun test tests/sdk-enhance.test.ts`
Expected: PASS(注册 2 次;三次调用 token 轮询为 t1,t2,t1)

- [ ] **Step 7: SDK 回归**

Run: `bun test tests/sdk-config-forwarding.test.ts tests/sdk-release-contract.test.ts tests/module-api.test.ts`
Expected: PASS(未配置 identityPool 时 `pool=null`,行为不变)

- [ ] **Step 8: 风格闸**

Run: `bun run typecheck && bun run lint && bun run fmt`
Expected: 0 error

- [ ] **Step 9: 提交**

```bash
git add src/core/identity.ts src/types/sdk.ts src/types/index.ts src/sdk/runtime.ts tests/sdk-enhance.test.ts
git commit -m "feat(sdk): add opt-in anonymous identity pool with rotation"
```

---

## Phase 1 收尾验证

- [ ] **Run full verify**

Run: `bun run verify`
Expected: 全绿

---

# PHASE 2 — 代理:回补 PAC 支持

## Task 2.1: PAC 代理解析(`pac-resolver`,opt-in)

**背景:** 旧项目用 `pac-proxy-agent` 支持 PAC;hana 当前对含 `pac` 的 proxy 直接 throw(`request.ts:442`)。Bun 的 `fetch` 只接受字符串 proxy(不接受 Node Agent),故无法直接移植旧实现。改为:用纯 JS 的 `pac-resolver` 求值 PAC 脚本,得到 `PROXY host:port` 后转成 `http://host:port` 字符串再交给 Bun。编译后的 resolver 按 PAC URL 缓存。

> 风险提示:`pac-resolver` 依赖 `node:vm`(Bun 支持)。若实现阶段发现 Bun 运行时不兼容,本 Task 可整体回退(只需保留"含 pac 抛错"的现状),不影响 Phase 0/1 成果。

**Files:**
- Modify: `package.json`(新增 `pac-resolver`)
- Modify: `src/core/request.ts`(PAC 解析:抛错改为解析后注入 `init.proxy`)
- Test: `tests/request.test.ts`(追加)

- [ ] **Step 1: 安装依赖**

Run: `bun add pac-resolver`
Expected: `package.json` dependencies 出现 `pac-resolver`

- [ ] **Step 2: 写失败测试**

在 `tests/request.test.ts` 追加(用 data: URL 承载 PAC 脚本,避免网络):

```ts
test('should resolve a pac proxy to a concrete proxy url', async () => {
  let usedProxy: string | undefined
  const fetcher: FetchLike = async (input, init) => {
    const url = typeof input === 'string' ? input : String(input)
    // PAC 脚本本身也通过 fetcher 拉取;识别 data: 直接返回脚本内容。
    if (url.startsWith('data:pac')) {
      return new Response('function FindProxyForURL(u, h){ return "PROXY 127.0.0.1:8888"; }', {
        status: 200,
      })
    }

    usedProxy = (init as { proxy?: string }).proxy

    return new Response(JSON.stringify({ code: 200 }), {
      status: 200,
    })
  }

  await createRequest(
    '/api/test',
    {},
    {
      crypto: 'api',
      fetcher,
      proxy: 'data:pac+https,FindProxyForURL',
      state: {
        anonymousToken: 'anonymous-token',
        deviceId: 'DEVICE_ID',
      },
    },
  )

  expect(usedProxy).toBe('http://127.0.0.1:8888')
})
```

> 实现细节(PAC 拉取方式)可能影响此测试的精确写法。**实现者可在 Step 4 确定 PAC 拉取通道后,调整本测试的 PAC URL 与拉取分支,使其与实现一致**;保持断言"最终 `init.proxy === 'http://127.0.0.1:8888'`"不变。

- [ ] **Step 3: 跑测试确认失败**

Run: `bun test tests/request.test.ts -t "pac proxy"`
Expected: FAIL(当前含 pac 抛 `PAC proxy is not supported ...`)

- [ ] **Step 4: 实现 —— PAC 解析模块函数**

在 `src/core/request.ts` 顶部 import 增加:

```ts
import { createPacResolver } from 'pac-resolver'
```

在文件内新增(按 PAC URL 缓存编译结果 + 解析结果转 proxy URL):

```ts
const pacResolverCache = new Map<string, (url: string, host: string) => Promise<string>>()

// 拉取并编译 PAC 脚本,求值后把 "PROXY host:port" 转成 Bun fetch 可用的 http 代理 URL。
async function resolvePacProxy(
  pacUrl: string,
  targetUrl: string,
  fetcher: FetchLike,
): Promise<string | undefined> {
  let resolver = pacResolverCache.get(pacUrl)
  if (!resolver) {
    const pacScript = await fetcher(pacUrl).then((response) => response.text())
    resolver = createPacResolver(pacScript)
    pacResolverCache.set(pacUrl, resolver)
  }

  const host = new URL(targetUrl).host
  const result = await resolver(targetUrl, host)
  // 结果形如 "PROXY 1.2.3.4:8080" / "DIRECT" / "SOCKS5 ...",取第一个可用条目。
  const first = result.split(';')[0]?.trim() ?? 'DIRECT'
  if (first === 'DIRECT' || first === '') {
    return undefined
  }

  const [scheme, hostPort] = first.split(/\s+/, 2)
  if (!hostPort) {
    return undefined
  }

  const protocol = scheme === 'SOCKS' || scheme === 'SOCKS5' ? 'socks5' : 'http'

  return `${protocol}://${hostPort}`
}
```

- [ ] **Step 5: 实现 —— 在请求前解析 PAC,替换抛错**

PAC 解析是异步,需在进入 attempt 循环前完成,再把解析出的具体 proxy 交给 `createFetchInit`。

在 `createRequest` 内,`const retry = normalizeRetryOptions(options.retry)` 之前新增:

```ts
  // PAC 代理需异步求值出具体 proxy,提前解析一次,供后续每次尝试复用。
  let resolvedProxy = options.proxy
  if (options.proxy?.includes('pac')) {
    resolvedProxy = await resolvePacProxy(options.proxy, url, fetcher)
  }
```

把 attempt 循环里 `createFetchInit(... options.proxy ...)` 的传参由 `options.proxy` 改为 `resolvedProxy`:

定位:

```ts
        createFetchInit(
          headers,
          requestBody,
          options.proxy,
          controller?.signal,
          connectionStrategy,
        ),
```

替换为:

```ts
        createFetchInit(
          headers,
          requestBody,
          resolvedProxy,
          controller?.signal,
          connectionStrategy,
        ),
```

在 `createFetchInit` 内删除"含 pac 抛错"分支:

定位:

```ts
  if (proxy) {
    if (proxy.includes('pac')) {
      throw new Error('PAC proxy is not supported by the current Bun fetch adapter')
    }

    init.proxy = proxy
  }
```

替换为:

```ts
  if (proxy) {
    init.proxy = proxy
  }
```

- [ ] **Step 6: 跑测试确认通过**

Run: `bun test tests/request.test.ts -t "pac proxy"`
Expected: PASS(`init.proxy === 'http://127.0.0.1:8888'`)

> 若因 `pac-resolver` 在 Bun 下不兼容导致无法通过,按 Step 顶部风险提示回退本 Task(恢复抛错分支、移除依赖),并在提交说明中记录 Bun 不兼容。

- [ ] **Step 7: 请求层全量回归**

Run: `bun test tests/request.test.ts`
Expected: PASS(非 pac 的 proxy 直传不变)

- [ ] **Step 8: 风格闸**

Run: `bun run typecheck && bun run lint && bun run fmt`
Expected: 0 error

- [ ] **Step 9: 提交**

```bash
git add package.json bun.lock src/core/request.ts tests/request.test.ts
git commit -m "feat(proxy): resolve pac proxies via pac-resolver"
```

---

## Phase 2 收尾验证

- [ ] **Run full verify**

Run: `bun run verify`
Expected: 全绿

---

# 自检清单(写计划后已核对)

**Spec 覆盖:** 三个用户方向 + P0–P2 优先级全部落到 Task:
- weapi e_r → Task 0.1;cnIp 注入 → Task 0.2;匿名 token 刷新 → Task 1.1;PAC → Task 2.1。
- 速度:默认超时 0.3、安全重试 0.4、gzip 0.5、SDK 缓存+去重 1.3。
- 进一步伪装:身份池轮换 1.4(deviceId/cnIp/token)。

**契约保护:** `src/app/generate-config.ts` 的 `registerAnonymous`(sdk-release-contract 锁定)全程未触碰;新原语另置于 `src/core/anonymous.ts`。

**类型一致性:** `registerAnonymousToken` 返回 `AnonymousRegistration {anonymousToken,cnIp,deviceId}` 在 1.1/1.4 一致使用;`IdentityPoolConfig` 以 `src/types/sdk.ts` 为单一定义源,`core/identity.ts` 从 types 导入;`stableStringify`(1.2)在 routes 与 sdk cache key(1.3)同名复用;`createModuleInvoker` 的缓存/身份逻辑在 1.3→1.4 累加不冲突。

**无占位符:** 每个 code step 均为可直接落地的完整代码;两处实现相关的测试夹具(0.5 的 gzip 加密、2.1 的 PAC 拉取通道)已显式标注"以实现为准的微调点"并给出确定可用的等价写法。

**分层:** core 不依赖 app/server;SDK 接入点统一 `src/sdk/runtime.ts`;Hono 不渗入 core。
