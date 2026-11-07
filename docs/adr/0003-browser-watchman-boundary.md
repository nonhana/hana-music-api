# ADR-0003：Watchman 独立于业务 SDK

状态：已采用，适用于 [#107](https://github.com/nonhana/hana-music-api/issues/107) 与父票 #80 的浏览器包边界。

浏览器从 `hana-music-api/watchman` 调用 `initializeWatchman`，封装运行时加载官方脚本，以 Promise 包装初始化和每次 `getToken` 回调。根 SDK 不转导出该入口，浏览器入口不依赖请求内核、Hono、Effect 或 Node 运行时。服务端只接收应用转交的当次字符串，继续走既有唯一请求链。

初始化状态存放在 document 的非枚举 Symbol 属性中，模块导入时不读 DOM。同页不同模块副本共享相同配置的初始化 Promise 和 client；配置不同则明确失败。失败清除状态、所属脚本、计时器与事件监听；迟到回调不修改后续尝试。按页共享的是初始化，不共享 token 或取值 Promise。

浏览器实现由 `src/browser/tsconfig.json` 加载完整 DOM/DOM.Iterable，使用标准 Window、Document 和 HTMLScriptElement；仅官方 Watchman 扩展保留私有接口描述。根 TypeScript 工程继续使用 Bun/Node，排除浏览器源码与专属类型用例，两者继承同一严格配置。initializer 在调用时通过 typeof 检查后读取 window/document；按动态 Symbol 读取页面状态的反射保留。DOM 全局不会进入服务端工程，也不穿过子路径公开声明。

类型检查分别执行两个工程；声明构建串行执行服务端和浏览器两阶段，再统一校验完整包。浏览器构建配置在仓库根继承 DOM 配置且只包含生产源码，避免当前生成器按配置目录设置发射根时将 tests 下的类型用例发射到源码目录。构建前后核对候选指纹，同包消费者分别检查无 DOM/Node 类型和完整 DOM 两种环境。

错误只提供稳定 code 和脱敏消息，不携带上游异常或设备元数据。超时覆盖加载/初始化与各次取值，失败不后台重试、不重放业务请求。

当前候选 tarball 的同包 Node/Bun 消费者、无 DOM/Node 的类型消费者和真实 Chromium/CSP 测试证明包合同；受控脚本证明生命周期，不证明官方 origin 可用。真实 origin 的当次双次取值证据独立记录，条件缺失则阻塞。相关门禁以 TESTING.md 和 issue-107 验收矩阵为准。
