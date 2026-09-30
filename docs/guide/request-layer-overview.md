# 请求层架构总览

SDK client、具名函数、`invokeModule` 和 `createRequest` 返回 Promise。内部模块统一使用 Effect；Hono 只负责 HTTP 边界，不进入 Core。

## 唯一请求路径

入口拆开业务输入和执行配置，建立不可变的 Call。
模块将本地输入编译为 RequestIntent，再调用同一个 `requestEffect`：API 协议、网页文本和 NOS 字节请求都经过目标校验、协议准备、重试、出口许可、transport 和完整正文消费。

RequestIntent 明确目标、协议、方法、头、正文、响应类型和操作语义。模块不直接发送 fetch，不启动 Promise 执行器，也不接收第二套网络能力。
动态加载和自定义 ModuleDefinition 同样提供 `execute: ModuleEffect`。

| 文件                          | 职责                                                                  |
| ----------------------------- | --------------------------------------------------------------------- |
| `call.ts`                     | 建立 Call、输入解码、身份快照、模块总期限与共享读键                   |
| `runtime.ts`                  | 显式 ProcessServices Layer；唯一 `runPublicEffect` 执行和公开错误映射 |
| `read-store.ts`               | Effect 时钟驱动的缓存，以及 Ref、Deferred、Fiber 管理的共享执行       |
| `request.ts`                  | RequestEffect 流程和统一的请求期限计算                                |
| `request-plan.ts`             | 纯函数准备 Cookie、URL、头和加密正文                                  |
| `response.ts`                 | 协议解释、速率限制分类和公开失败形状                                  |
| `transport.ts`                | 唯一上游发送位置、代理、完整正文消费与资源释放                        |
| `anonymous.ts`、`identity.ts` | 匿名注册和 client 身份池                                              |
| `server/admission.ts`         | 读取 HTTP body 前的准入与可信代理身份                                 |

## 进程、client 与调用范围

ProcessServices 持有进程出口 Governor、运行时状态读取和内部流量事件。SDK、HTTP、程序化 API 和 CLI 匿名注册通过显式 Layer 使用它；
transport 必须接收运行时服务，不能自行创建默认运行时。

每个 SDK client、HTTP 服务实例和程序化 API 实例有自己的 ReadStore，SDK client 还可持有身份池。一次 Call 冻结业务输入、配置、Cookie、身份指纹和总期限。
共享读只共享执行，等待者仍各自拥有取消与期限。

公开 `createRequest` 在包边缘取得进程 Layer，然后调用同一 RequestEffect。所有内部 Effect 最终通过 `runPublicEffect` 映射到 Promise；
模块组合和 transport 不执行 `Effect.runPromise`。

## 输入、响应和错误归属

每个模块在自己的文件声明 ModuleInput。需要规范化的模块提供本地 decoder；输入在身份初始化和共享读键生成前完成解码。公共类型由这些声明生成，不反向决定模块输入。

普通响应体保留 UnknownJson，包括未知嵌套字段。只有确实读取字段的模块提供局部解码器；缺失或错误的字段返回 UnexpectedUpstreamShape，并说明模块和字段路径。

请求层负责 InvalidRequest、TargetRejected、AdmissionRejected、UpstreamRateLimited、
DeadlineExceeded、TransportFailed、ResponseDecodeFailed 和 ProtocolFailed。
模块负责 InvalidModuleInput、UnexpectedUpstreamShape、UpstreamBusinessFailed 与 PartialUpload 等业务错误。
运行时只在公开边缘将错误转换为既有的 `{ status, body, cookie }`。

## 安全与运行边界

HTTP 执行配置在服务器边界拒绝。携带身份的 API 只允许已知 HTTPS 网易云目标；网页与 NOS 只允许已知网页域名和合法上传域名，并拒绝重定向。

压力测试只连接 loopback。多进程配额不自动共享。上传已完成的写入不能回滚，模块负责报告 `partialCompletion` 和 `completedStages`。

参见 [调用约定](/guide/request-convention)、[重试与超时](/guide/retry-timeout-resilience)、[缓存与身份池](/guide/sdk-cache-and-identity-pool)。
