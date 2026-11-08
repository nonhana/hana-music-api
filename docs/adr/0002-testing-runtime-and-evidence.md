# ADR-0002：测试从实例装配网络、时间与请求熵

状态：已采用。适用于测试系统实施计划 Slice 3。

公开 SDK 与 HTTP 仍进入 runCall、模块、requestEffect、prepareRequest、transport。测试在网络边界替换上游，让参数准备、加密、响应消费、取消和错误映射继续运行。模块级 capability 测试与响应回放保留各自证据边界。

CallServices 接受第三个内部 execution 参数，保存冻结的 fetcher、Clock 和 RequestEntropy factory。公开 config 的 fetcher 优先；最终实际 fetcher 进入原有读取身份键。显式 runCall clock 优先于实例 Clock，未提供时仍用 Effect 默认时钟。ExecutionScope 冻结实际任务的依赖和绝对期限；共享任务不继承首等待者的期限或 signal，Call 只保留模块数据；请求准备复用已有熵输入，不另建加密或执行实现。内部 fetcher 也不能绕过 proxy/custom-fetcher 互斥。

生成器把 config/context 装配函数写入独立 client-factory.generated.ts；公开一参数 createHanaMusicApi 只创建默认 context 后调用该函数。根入口不导出它。受控装配测试和公开 client、具名函数、invokeModule 回归分别保留，包消费者与负向类型检查守住边界。

HTTP 只从 createServer 的内部 runtimeOptions 取得 execution，真实 loader 发现模块。query/body/header 不取得这些依赖，也不打开通用 fetcher 或 token 输入。阶段信号在调用提前结束时直接失败；TestClock 只控制 Effect 时间，socket 继续使用有界真实时间。

严格假上游用独立 ledger 捕获被产品错误映射吞掉的断言，finally 同时核对期待与清理。录制不伪装请求证据，真实 socket 不冒称真实网易云；运行证据绑定 testedHead、当前内容指纹和包 hash。规则与完成条件统一由 agent-docs/TESTING.md 管理。

内部 execution 还可提供默认事件观察者，公开调用观察者优先。startServer 的内部第二参数透传这些依赖；inspectReadStore 仅交付同实例 reads.snapshot 的读取函数，负载证据从该函数取得真实在飞数量，不替换请求内核。

动态程序入口的 execution 也只用于实例装配，不接受 requestHandler。原始 config 直接交给 runCall；直接入口保留非枚举/继承 signal 的原解构语义，具名/client 默认值沿用原浅合并规则。测试从实际 fetcher 验证取消；Scope 与绑定闭包不参与共享键。
