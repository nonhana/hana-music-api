---
'hana-music-api': minor
---

公开失败增加稳定分类：被拒绝的 Promise 仍保留 `{ status, body, cookie }`，顶层新增可序列化的 `failure`，`kind` 为 `business`、`rateLimited`、`upstreamShape`、`timeout`、`cancelled`、`invalidRequest`、`transport` 或 `unknown`。根入口新增 `NcmApiFailure`、`NcmFailureInfo`、`isNcmApiResponse` 和 `getNcmFailureInfo`；成功响应、HTTP 业务正文、Cookie、resolve 非 2xx 的模块和重试次数不变。旧的三字段读取方式继续可用；按对象形状严格比较拒绝结果的消费者会看到新增字段，需要同步调整。
