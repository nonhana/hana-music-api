# 浏览器入口独立 DOM 类型环境

来源：本 chat 在 #107 实现后的后续要求：独立配置完整 DOM 类型，替换手写浏览器类型与固定全局字段反射，接好 typecheck、声明构建和包消费者，沿用 TDD、0 warning/0 error 门禁。

基线：`feature/refactor`，HEAD `d03260f7bf2f015311031898b689ff7340b52e6e`。已有 #107 实现与用户补充修改已暂存，当前起始无未暂存差异；完整暂存补丁、状态与关键文件原文保存在 `.artifacts/testing/browser-dom-types/baseline/`。本轮只追加工作区改动，不改变暂存区、不覆盖此前实现或字段注释。

目标：让标准浏览器 API 在独立 TypeScript 工程中完整检查，服务端不获得 DOM 全局；Node/SSR 安全导入、Watchman 生命周期、公开 Promise 和不要求 DOM/Node 类型的子路径声明继续保持。

范围：TypeScript 配置、构建配置/命令、浏览器实现类型与环境读取、测试/清单/有限变异、相关文档与现有 changeset。非目标：请求内核、上游协议/参数、设备模拟、业务功能、账号或发布操作。

授权：本次实施、TDD、本地门禁和独立审查；不包含提交、推送、PR、关票、发布或新的真实上游验证。

| AC     | 入口与预期                                                                                              | 决定性证据                                                                                | 适用性与必要条件                                    |
| ------ | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------- |
| DOM-01 | 服务端保留 ESNext/Bun；浏览器加载 ESNext/DOM/DOM.Iterable，不自动加载 Bun/Node；共用严格选项            | 实际 typecheck 命令的隔离配置控制样本、服务端与浏览器负向类型用例                         | 适用，真实 TypeScript 子进程，不仅断言 JSON 字段    |
| DOM-02 | Watchman 使用 Window/Document/HTMLScriptElement，直接读取固定 window/document，动态 Symbol 状态逻辑保留 | 原有 16 项公开浏览器行为与 Node/Bun 导入陷阱回归；源码与类型检查                          | 适用，标准 DOM 类型内部使用，不暴露到公共声明       |
| DOM-03 | 单一 typecheck 命令检查两个工程；任一工程出错整体非零                                                   | 原生命令在最小隔离消费者上验证正向、服务端错误、浏览器错误；定向变异省略任一阶段须 killed | 适用，控制样本沿用当前配置与命令，不复制一套 runner |
| DOM-04 | 构建分别使用对应配置/平台生成运行时与声明，串行共享 dist，包检查在全部产物生成后执行                    | 实际 build/build:check 与 tarball 两入口文件、公开类型和浏览器执行                        | 适用，防止二次清理丢失根产物或提前检查不完整包      |
| DOM-05 | 同 tarball 在 Node/Bun 导入；子路径类型消费者在无 DOM/Node 和完整 DOM 两种环境都可用                    | package/release 的独立安装、严格声明检查、CSP/nonce、依赖图和 serverless                  | 适用，新包 hash/当前候选，不复用旧 tarball          |
| DOM-06 | 测试登记、文档/ADR 与声明说明同步，0 warning/0 error；保留暂存内容；独立双轴审查无阻断                  | verify、verify:sdk、fixtures、定向变异、实际日志/JUnit/摘要、暂存补丁 hash 和独立审查     | 全部适用，最终同候选证据                            |

切片：实际双环境 typecheck 控制样本 red/green → 标准 DOM 与既有浏览器回归 → 分环境声明构建和双类型消费者 → 有限变异/文档 → 同候选完整门禁与独立审查。

适用门禁：串行 `bun run verify`、`bun run verify:sdk`、`bun run verify:fixtures`、`bun scripts/mutation-test.mts --all`；浏览器行为与包消费者已在 local/sdk 中登记。保留原有回放与 transport 回归，不额外编写重复测试。

smoke/soak 专项与真实上游不适用于本轮：没有改变请求、缓存、取消、重试或流量策略，也没有新的上游行为合同；浏览器改为等价的原生全局读取，按原入口与 Node/Bun/SSR/CSP 回归验证。#107 先前真实 origin 结果仅为历史证据，不声称覆盖新候选，不复用之前两次取值授权。远端 CI 运行、发布 preflight 和账号读写同样不适用。

当次结果：[runs/browser-dom-types.md](runs/browser-dom-types.md)。原始证据 `.artifacts/testing/browser-dom-types/`。
