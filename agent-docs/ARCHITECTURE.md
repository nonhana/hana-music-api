# 架构边界

在修改核心请求链路、运行时服务、HTTP 层、模块加载或共享状态前阅读本文件。

## 当前执行链

SDK 的 client、具名函数和 root invoke，以及动态程序入口，都把原始配置交给 `runCall`。共同入口先检查原对象，再浅合并已验证的 client 默认值并分离 signal，随后解码业务输入、准备一次不可变身份。HTTP 先完成准入和参数解析，只提供允许的 Cookie、来源 IP 和请求 signal。

模块只调用 `request(actionName, args)`。绑定能力按冻结动作声明验证参数和目标，取得自有业务数据快照，再构造 `ResolvedRequest`。执行链为：

业务输入 → 模块 → 绑定的 RequestCapability → ResolvedRequest → requestEffect → prepareRequest → transport → 模块结果。

全部 352 模块声明 389 动作；本地模块声明空集。生成的 SDK registry、HTTP loader 和手工装配共用声明验证，冻结自有动作快照并推导 shared/upload 资格。请求时仍检查动作名、未知参数、动态边界和最终 URL；声明不能被源对象突变改变。

API 参数为 data/headers，动态 API 另提供 path；固定 plain 提供原始 query，动态 plain 提供受限 target 与原始 body。profile 决定协议、域名、UA 和平台 Cookie，会话与设备来自调用身份。业务头保留，受控头由内核处理；业务模块不复制协议、方法或重试政策。

## 每份数据由谁持有

| 模型            | 持有内容                                                                                 | 生命周期                  |
| --------------- | ---------------------------------------------------------------------------------------- | ------------------------- |
| ProcessServices | 内存运行时状态读取                                                                       | 进程                      |
| CallServices    | ReadStore、可选匿名池、默认 execution 依赖                                               | client/HTTP/动态 API 实例 |
| Call            | 模块标识、输入、身份、动作、派生策略、token 来源/计数、IP/retry、上传进度                | 一次模块调用              |
| ExecutionScope  | 实际 fetcher/proxy/连接策略、熵/事件、开始时间和绝对期限                                 | 实际执行任务              |
| ResolvedRequest | 已确定的 API/plain 目标、客户端编码规则、自有数据或原始正文、头、响应和 token/retry 规则 | 一次逻辑请求              |
| RequestPlan     | 最终 URL、method、headers、编码 body 与身份指纹                                          | 一次逻辑请求及其重试      |

`Call` 不保存整份 config、重复 Cookie、执行依赖或期限。raw/debug 与内部匿名注册不构造 Call；它们各自解析入口后，把 ResolvedRequest 交给同一内核。requestEffect 只依赖 ExecutionScope，prepareRequest 是接收显式熵的纯编码函数，不读全局状态或发送网络。

API 数据在异步 token 等待前捕获为自有 JSON 值树，保留原生 JSON 的值、键序、getter/toJSON 与异常阶段，不先 stringify/parse 整体，也不冻结用户对象。plain 原始字节不增加大文件复制。上传绑定请求成功后原子追加原 logicalTarget，uploadWork 按本次区间报告部分完成；总期限和阶段上限由公共内核执行。

## 共享读取与取消

只有明确声明 shared 的 search、lyric、song_detail、playlist_detail 获得共享资格。配置 checkToken 后禁共享、缓存和自动重试；provider 逐个获准的 API 请求取值，字符串在同一 Call 限一次，外部 plain 与内部注册不消费业务 token。

ReadStore 持有实际共享任务，每个等待者仍有自己的 signal 和期限。实际任务使用独立 ExecutionScope，最后一个等待者离开才中断它；完整模块结果校验属于共享任务。局部 keyConfig 保留原有效配置的字段与缺省差异，只剔除事件、等待超时和 signal，使用原 execute 与实际 fetcher 的稳定引用；绑定闭包、Scope、时点和熵不进入键。

普通调用默认总期限 8 秒，非正值关闭普通总期限；上传总上限 300 秒、单阶段 60 秒，正配置只能缩短。输入、身份、provider、退避与完整正文消费都计入期限。重试复用同一 RequestPlan，不再取 token 或生成 nonce。

## 入口与依赖边界

- `index.ts` 和 `src/sdk/` 组合公开 Promise API；Effect 和内部错误由 core/runtime 在唯一公开执行边界封口。
- `src/modules/` 处理业务输入、动作选择和返回检查；`src/plugins/` 组合上传步骤。模块不直接 fetch 或 runPromise。
- `src/core/` 负责请求、身份、纯编码、transport 和 ReadStore，不依赖 Hono。
- `src/server/` 负责 Hono、准入、Cookie/body、路由和发现；不从 HTTP 输入取得 execution。内部 createServer/startServer runtime 参数提供网络、Clock/熵与实际 ReadStore reader。
- `src/app/` 负责 CLI、服务启动和匿名文件；core/SDK 加载与调用不读写本地文件，CLI 注册保留 raw weapi 和原状态/文件时序。
- `src/browser/watchman.ts` 是独立浏览器子路径，不依赖业务 SDK 或核心请求链，见 ADR-0003。

生产装配不接受 requestHandler 替换内核。完整链测试只在 fetcher 替换网络，模块组合测试直接提供 fake capability；内部 execution 不从根包导出。显式 runCall Clock 优先于实例 Clock；公开有效 fetcher 优先于实例依赖。见 [ADR-0002](../docs/adr/0002-testing-runtime-and-evidence.md)。

SDK 不在本地限制出口频率；HTTP 只按来访 IP 和容量做入口准入，多进程需要反向代理提供共享限流。SDK 不创建登录 Cookie jar，调用者保存设备和会话；取消自定义 fetcher 时，它仍需遵守 AbortSignal。

## 历史迁移依据

各批次的协议、身份与录制来源保留在 [ADR-0001](../docs/adr/0001-request-actions-and-profiles.md) 及 issue-105/109–116 的验收记录。早期 weapiPc/PC Cookie 是当时基线；当前身份以 #122 和[389 动作清单](../docs/acceptance/issue-122-actions.md)为准，不能把历史默认组合当成当前行为。

测试分层和交付门禁见 [TESTING.md](./TESTING.md)，模块合同见 [API_CONVENTIONS.md](./API_CONVENTIONS.md)，根导出边界见 [PUBLIC_API.md](./PUBLIC_API.md)。
