# ADR-0004：公开失败只描述事实，不按状态猜来源

状态：已采用，适用于 [#129](https://github.com/nonhana/hana-music-api/issues/129)。实施基线 `2e14409`。

## 原因与决定

请求层、模块层和上传层本来就知道失败来源：业务拒绝、限流、返回结构变化、期限、取消、本地输入/目标拒绝、传输和解码失败由不同的内部错误产生。既有公开边界只保留 `{ status, body, cookie }`，调用者只能按状态码和正文键集合推断，业务 502 与传输 502、业务 405 与限流 405 无法稳定区分。

现在由唯一的 `normalizeFailure` 边界在仍掌握来源时生成可序列化的 `failure`，挂在被拒绝对象的顶层。它不新增执行链，不改变 Promise resolve/reject，不改变既有 status/body/cookie，也不改变成功响应。根入口公开 `NcmApiFailure`、`NcmFailureInfo`、`isNcmApiResponse` 和 `getNcmFailureInfo`；内部错误类和 Effect 仍然不导出。

八类失败：

| kind             | 事实                                                                          |
| ---------------- | ----------------------------------------------------------------------------- |
| `business`       | 已确认的上游业务拒绝；code 和公开 message 来自正文                            |
| `rateLimited`    | SDK 已确认的限流；code 与 retryAfter 秒                                       |
| `upstreamShape`  | 模块返回体校验失败；module/path/expected/actual                               |
| `timeout`        | 调用总期限耗尽                                                                |
| `cancelled`      | 调用者取消                                                                    |
| `invalidRequest` | 输入、执行配置或目标检查在本地拒绝                                            |
| `transport`      | 网络、响应消费/解码、协议或无法确认业务码的 HTTP 失败                         |
| `unknown`        | 历史三字段响应、无法归类的异常，以及 `ModuleInvariantFailed` 这类本地执行失败 |

## 关键边界

- **业务码事实来自正文，不来自状态。** `interpretResponse` 在把 `code` 归一成数字前记录“数字或非空数字字符串”的确认结果。非 2xx 的 `ProtocolFailed` 只有带这个事实才是 `business`；HTTP 502/405 本身不参与分类。
- **plain 协议没有业务码约定。** NOS 上传等 plain 请求的非 2xx 一律是 `transport`，即使正文碰巧有 `code`。
- **历史响应不补猜。** `normalizeFailure` 收到没有元数据的三字段响应时补 `unknown`；`getNcmFailureInfo` 对原始无元数据对象返回 `undefined`。读取函数只验证结构，不声称能证明对象来源。
- **部分完成保留。** `PartialUpload` 继续合并 `partialCompletion`/`completedStages`，并保留底层失败分类；分类不承诺重试安全，也不触发任何请求或重试。
- **最小数据。** 元数据只复制已经公开的业务 code/message、限流秒数和结构位置，不携带 cause、stack、请求/响应头、Cookie、token、手机号或设备值。
- **HTTP 不暴露元数据。** Hono 响应仍只写 `body`；`failure` 只属于 SDK Promise 拒绝对象。

## 后果

- 严格按对象形状比较拒绝结果的消费者会看到新增的 `failure` 字段；旧的三字段读取方式保持。这项兼容影响记录在 changeset 和公开文档中。
- 失败分类由共享内核测试覆盖全部模块；模块特有分支（512 fallback、多请求、上传部分完成、本地二维码不变式、resolve 非 2xx）由领域测试和 `docs/acceptance/issue-129/failures.md` 逐项登记。
- `isNcmApiResponse` 只验证 `status` 为有限数值、`cookie` 为字符串数组且存在 `body`；它不判断业务成功，也不把结构合法的伪造对象当成来源证明。
