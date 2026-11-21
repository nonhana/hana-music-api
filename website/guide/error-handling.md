# 返回值与错误处理

SDK 的全部接口调用（`createClient` 方法、`createHanaMusicApi` 方法、单模块具名函数、`invokeModule` 与 `createRequest`）均返回标准化响应对象。

## 响应对象结构

| 字段      | 类型             | 出现时机     | 说明                                                         |
| --------- | ---------------- | ------------ | ------------------------------------------------------------ |
| `status`  | `number`         | 成功与失败   | 请求层或模块映射后的状态码，不一定等同于上游原始 HTTP 状态码 |
| `body`    | `Body`           | 成功与失败   | 接口返回的 JSON 正文（未建模接口为 `UnknownJson`）           |
| `cookie`  | `Array<string>`  | 成功与失败   | 服务端本次下发的 `Set-Cookie` 字符串数组                     |
| `failure` | `NcmFailureInfo` | 仅 reject 时 | 结构化的失败原因事实，成功响应（resolve）不含该字段          |

## 成功与失败判断

- **成功与失败边界**：请求成功时 Promise 会 resolve，失败时 Promise 会 reject 并抛出 `NcmApiFailure` 对象。抛出的对象**不是** `Error` 实例（`instanceof Error` 为 `false`），不能只读取 `error.message`。
- **非 2xx resolve 情况**：极少数接口在特定业务分支下会 resolve 非 `200` 状态（例如 `playlistCoverUpdate` 参数冲突时 resolve `status: 400`，`topList` 传入 `idx` 时 resolve `status: 500`）。此类 resolve 对象不含 `failure` 字段，调用方在 `await` 后仍应检查 `result.status`。

使用官方导出守卫 `isNcmApiResponse` 与 `getNcmFailureInfo` 处理失败响应：

```ts
import { getNcmFailureInfo, isNcmApiResponse, search } from 'hana-music-api';

try {
  const result = await search({ keywords: '海阔天空' });
  if (result.status !== 200) {
    console.error('调用完成但状态非 200:', result.status, result.body);
  } else {
    console.log(result.body);
  }
} catch (error: unknown) {
  if (!isNcmApiResponse(error)) {
    throw error;
  }
  const failure = getNcmFailureInfo(error);
  if (failure?.kind === 'business') {
    console.error('服务端业务拒绝:', failure.code, failure.message);
  } else if (failure?.kind === 'rateLimited') {
    console.error('触发限流，建议等待秒数:', failure.retryAfter);
  } else {
    console.error('请求失败:', error.status, error.body, failure?.kind);
  }
}
```

- **`isNcmApiResponse(value)`**：校验对象是否包含有限数字 `status`、字符串数组 `cookie` 以及 `body` 属性。
- **`getNcmFailureInfo(value)`**：从响应对象提取已校验的 `failure` 信息。对于普通 `Error`、成功响应或缺少合法失败元数据的对象安全返回 `undefined`。

## 失败类型分类

`failure.kind` 固定包含 8 种枚举值，附加字段均只反映本次请求确认的客观事实：

| `failure.kind`   | 含义说明                                             | 附加字段                                     |
| ---------------- | ---------------------------------------------------- | -------------------------------------------- |
| `business`       | 已确认的网易云业务拒绝（正文含数字 `code`）          | `code`（`number \| null`）、可选 `message`   |
| `rateLimited`    | 已确认的服务端限流                                   | `code`（`429` 或 `405`）、`retryAfter`（秒） |
| `upstreamShape`  | 已建模返回体的运行时结构校验失败                     | `module`、`path`、`expected`、`actual`       |
| `timeout`        | 调用总超时时间耗尽                                   | —                                            |
| `cancelled`      | 调用方通过 `AbortSignal` 主动取消                    | —                                            |
| `invalidRequest` | 入参、执行配置或请求目标在本地校验被拒绝             | —                                            |
| `transport`      | 网络连接、响应读取解码、协议异常或无确认业务码的失败 | —                                            |
| `unknown`        | 无法归类的本地执行异常或缺少失败元数据的响应         | —                                            |

## 失败场景与状态码映射

| 失败场景                    | 响应 `status`      | `failure.kind`   | `body` 内容                                                             |
| --------------------------- | ------------------ | ---------------- | ----------------------------------------------------------------------- |
| 网易云业务拒绝              | 业务 `code` 映射值 | `business`       | 网易云原样返回的正文                                                    |
| 服务端限流                  | `429` 或 `405`     | `rateLimited`    | 原正文或 `{ code, msg }`，额外附加 `retryAfter`（秒）                   |
| 返回体结构不符合预期        | `502`              | `upstreamShape`  | `{ code: 502, msg, upstreamShape: { module, path, expected, actual } }` |
| 本地参数或配置错误          | `400` 或模块指定值 | `invalidRequest` | `{ code, msg }`                                                         |
| 请求超时                    | `504`              | `timeout`        | `{ code: 504, msg: 'Request timed out' }`                               |
| 调用方取消（`AbortSignal`） | `499`              | `cancelled`      | `{ code: 499, msg: 'Request cancelled' }`                               |
| 传输或协议失败              | `502`              | `transport`      | `{ code: 502, msg }`                                                    |
| 未归类本地执行失败          | 按异常状态映射     | `unknown`        | 保留异常消息或原有正文                                                  |
| 分段上传中途失败            | 保留底层失败状态   | 保留底层失败类型 | 额外附加 `partialCompletion: true` 与 `completedStages`（已完成阶段数） |

- **业务码状态映射规则**：业务 `code` 位于 `101`–`599` 区间时直接作为 `status`，超出该范围时钳位为 `400`。例如短信登录触发风控返回 `code: 10004` 时，`status` 为 `400`。
- **限流识别规则**：收到 HTTP `429`、正文 `code: 429`（或正文 `status: 429`）、或正文 `code: 405` 且消息包含“操作频繁”/“操作过于频繁”时，判定为 `rateLimited`。`retryAfter` 区间为 `1`–`300` 秒（缺少或无法解析 `Retry-After` 响应头时默认为 `30` 秒）。SDK 不会对限流结果自动重试，详见 [超时、重试与连接策略](/guide/resilience)。
- **分阶段上传失败**：如云盘上传或封面上传在完成部分步骤后失败，除保留原始失败状态与 `failure` 外，会在 `body` 中附加 `partialCompletion: true` 与 `completedStages` 计数。

## 业务状态码与成功判定

### 已建模返回体接口

315 个已建模返回体的接口严格校验返回码：仅当 `body.code` 命中该模块允许的成功码列表且通过结构校验时才会 resolve，否则以 `business`（或 `upstreamShape`）拒绝。

- **默认成功码**：`[200]`，适用于绝大多数已建模接口。
- **多成功码例外**：`loginQrCheck` 的允许码为 `[800, 801, 802, 803]`，对应二维码过期、待扫码、待确认与授权成功，resolve 时 `status` 均为 `200`。

### 未建模接口

37 个未建模接口由请求层依据正文 `code`（若缺失 `code` 则取上游 HTTP 状态码）映射状态并决定成功或拒绝：

- **特殊状态码映射**：`code` 为 `201`、`302`、`400`、`502`、`800`–`803` 之一时，映射为 `status: 200` 并 resolve。
- **2xx 状态码**：`code` 在 `200`–`299` 之间的其他数值时，`status` 取 `code` 原值并 resolve。
- **其余业务码**：一律 reject，`status` 取业务码（`101`–`599` 外钳位为 `400`）。

> 对于未建模接口，resolve `status: 200` 不代表 `body.code` 必定为 `200`（可能为 `400` 或 `502`）。业务代码中应同时检查 `body.code`。

## 返回体建模与运行时校验

### 字段语义分层

已建模返回体在类型声明与运行时校验中区分三类字段约束，未在模型中声明的其余 JSON 字段仍保留在对象中，类型为 `UnknownJson`：

- **必填字段**：接口正常语义依赖的核心字段（如返回码、主体记录 ID 等）。若缺失或类型不符，Promise 将以 `status: 502` 拒绝。
- **可选字段**：非核心附加信息，可能缺失或为 `null`。若上游返回了非预期类型的值，SDK 会将其过滤为缺失（`undefined`），不触发报错。
- **可空路径**：正常业务场景下可能整体缺失或为 `null` 的容器路径（例如无匹配结果时的 `search` 结果列表）。缺失或为 `null` 时正常返回，但一旦存在该路径，内部记录仍需满足自身的必填字段约束。

### 读取返回体类型

全部 315 个已建模返回体类型均可通过 `import type` 从根入口导入，零运行时开销：

```ts
import type { LoginQrCheckBody, UserAccountBody } from 'hana-music-api';

const describeQr = (body: LoginQrCheckBody) =>
  body.code === 802 ? `${body.nickname ?? '用户'} 已扫码` : body.code;

const isVip = (body: UserAccountBody) => (body.account?.vipType ?? 0) > 0;
```

### Standard Schema 同步校验

导出的返回体校验器实现 [Standard Schema v1](https://standardschema.dev/) 规范（公开类型 `BodySchema<T>`），可在外部同步调用 `['~standard'].validate(...)`，无需引入 Effect 运行时：

```ts
import { UserAccountBody } from 'hana-music-api/schemas/user_account';

const result = UserAccountBody['~standard'].validate(savedBody);
if (result.issues) {
  console.error(result.issues);
} else {
  console.log(result.value.profile?.nickname);
}
```

### 失败正文结构校验

部分高频业务拒绝场景导出了专用结构校验器（例如手机号登录 `10004` 风控拦截对应的 `LoginCellphoneRiskBody`），可按需在 `catch` 分支中解析：

```ts
import { isNcmApiResponse } from 'hana-music-api';
import {
  loginCellphone,
  LoginCellphoneRiskBody,
} from 'hana-music-api/api/login_cellphone';

try {
  await loginCellphone({ phone: 'your-phone', captcha: 'your-captcha' });
} catch (error: unknown) {
  if (!isNcmApiResponse(error)) throw error;
  const risk = LoginCellphoneRiskBody['~standard'].validate(error.body);
  if (!('issues' in risk) || !risk.issues) {
    console.log('触发风控:', risk.value.message, risk.value.redirectUrl);
  }
}
```

### 上游结构变更处理（`upstreamShape`）

当接口返回了预期成功码、但必填字段缺失或类型不匹配时，SDK 会拒绝 Promise（`status: 502`、`failure.kind === 'upstreamShape'`），并在 `body.upstreamShape` 与 `failure` 中标明具体路径：

```json
{
  "code": 502,
  "msg": "Unexpected upstream shape in album at body.album.id: expected present, got missing",
  "upstreamShape": {
    "module": "album",
    "path": "body.album.id",
    "expected": "present",
    "actual": "missing"
  }
}
```

- **判断方式**：优先检查 `failure.kind === 'upstreamShape'` 或 `body.upstreamShape`，不要依赖解析 `msg` 字符串。
- **处理建议**：此类错误表明上游网易云接口结构已发生变化，重试无法解决，应升级 `hana-music-api` 或提交 Issue 反馈。
