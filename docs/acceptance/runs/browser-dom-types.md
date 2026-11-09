# 浏览器 DOM 类型配置当次验收

当前状态：完成。实现、所有适用门禁和独立双轴审查均通过，无未解决阻断项。

基线为既有已暂存 #107 工作区，HEAD `d03260f7bf2f015311031898b689ff7340b52e6e`；原有暂存内容保存在 `.artifacts/testing/browser-dom-types/baseline/`，本次不改暂存区。

本次按类型/构建调整选择门禁；不执行新的真实上游或账号操作，不用旧候选结果报本轮通过。TDD、最终命令、候选/包 hash 和独立审查在实际执行后记录。

## TDD 与开发阶段

证据路径相对 `.artifacts/testing/browser-dom-types/`；runner 输出中的 report 指向实际候选、子进程日志与原生 JUnit。

| 步骤                 | 实际命令                                     | 结果与含义                                                                                                                                                              |
| -------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 双环境控制样本 red   | `bun scripts/test.mts browser-types`         | `01-typecheck-red.log`：期望合法两环境通过，实际浏览器 Window/Document/HTMLScriptElement 不可用且 Bun 负向断言失效；1 fail / 2 pass                                     |
| 双环境控制样本 green | 同上                                         | `02-typecheck-green.log`：两个工程正向/负向控制共 3 pass，任一侧错误命令均非零                                                                                          |
| 原生 DOM 实现        | `bun run typecheck`、`bun run test:watchman` | `04-native-dom-typecheck.log`、`05-native-dom-behavior.log` 通过；原有 16 个公开生命周期用例有效复用，不为已有行为制造 red                                              |
| 声明构建适配         | `bun run build`、`bun run test:sdk-contract` | `06` 至 `09` 为失败的工具配置调试记录，文件名含 green 也不算通过：旧服务端配置未发射 browser 声明，分阶段后生成器将嵌套配置目录当根，导致外部类型用例超出 rootDir       |
| 双消费者与声明 green | `bun run test:sdk-contract`                  | `11-package-consumers-green.log`：32 pass / 0 fail / 0 skip，含同 tarball 两种类型环境与 Node/Bun/Chromium；根构建配置继承 DOM 且只包含生产源码后，未再产生源码目录声明 |

声明适配的配置失败不冒充公开业务行为 red。编译器异常曾生成一个仅含 `export {};` 的类型用例声明；该本轮生成文件已清理，改用只包含生产源码的根声明配置，并在现有包合同中加入构建前后候选指纹一致断言，阻止构建向源码写入。

`10-typecheck-mutation.log` 的两个关联故障都触发断言，但该次最终候选校验因开发时生成文件出现而失败，整条命令不计通过。已在最终冻结后重新执行登记变异，实际结果见下文。全局 DOM 注入会导致编译错误，不用这种 invalid 变异充当 killed。

暂存区补丁 hash 已与起始 manifest 对比一致；本轮变更仅在工作区追加。文档、ADR、同一未发布 changeset 已同步。最终门禁和独立审查结果记录在下文。

## 最终候选与门禁

分支 `feature/refactor`，HEAD `d03260f7bf2f015311031898b689ff7340b52e6e`。内容指纹 `1b80ea339f74ffc039667a1743470ec341de78778126dd40b553ac77a8cbb2c4`，diff 指纹 `2063d99b82befccf58027fa9cf8828347662101011a24eb676b779631df74552`；每条门禁前与全部结束后均比对一致。原暂存补丁 SHA-256 `eddb2d6f7ad9248b31a1ee8c166a25419b5e8df98503c7246f9d328c0f57278f`，与本次起始完全相同；本轮只追加工作区改动。已暂存基线补丁、未暂存差异、状态和证据索引在 `.artifacts/testing/browser-dom-types/`；非忽略未跟踪文件按状态清单读取当前原文。

| 实际命令                              | 退出码/状态 | 原始日志                                                    |
| ------------------------------------- | ----------- | ----------------------------------------------------------- |
| `bun run verify`                      | 0 / PASS    | `.artifacts/testing/browser-dom-types/final-verify.log`     |
| `bun run verify:sdk`                  | 0 / PASS    | `.artifacts/testing/browser-dom-types/final-verify-sdk.log` |
| `bun run verify:fixtures`             | 0 / PASS    | `.artifacts/testing/browser-dom-types/final-fixtures.log`   |
| `bun scripts/mutation-test.mts --all` | 0 / PASS    | `.artifacts/testing/browser-dom-types/final-mutation.log`   |

local 实际 3565 pass / 0 fail / 0 skip，SDK 32 / 0 / 0。新增配置控制样本 3 项、既有浏览器生命周期 16 项及包合同 5 项均执行到断言。lint 为 0 warning / 0 error，两个 TypeScript 工程都通过；spell、fmt 和文档构建通过。

现有工具提示保留：TypeScript 7.0 的 tsgo 声明生成器弃用提示、Rolldown 的构建耗时提示，以及 VitePress >500kB chunk 建议。它们不是 lint warning；未关闭规则、增加忽略或调整阈值来掩盖，适用门禁退出码均为 0。fixtures failures=0；4 份无 ModuleBody 的既有录制未结构校验，不声称全部录制已校验。

全部 13 项登记故障有效 killed，无 survived/invalid/timeout/tool-error。最终摘要 `.artifacts/testing/mutation/1794058824479-d8e3c167-fdb1-4450-9780-7db4dc446453/summary.json`；同目录保留编译日志、运行日志和原生关联 JUnit，补丁定义见 `tests/mutation/targets/`。新增两个故障的实际 typecheck 都通过编译，再由控制用例的预期断言识别省略阶段后错误被放行；没有把编译失败充当 killed。

两份同候选 tarball SHA-256 均为 `7ad38a3e5343af6c8567214c6f786fb065e86d267188ae510c4db5819d5c47bf`，报告 `.artifacts/testing/package/13b90bcf-a8f0-462d-b706-c9a763fbe479/summary.json` 与 `.artifacts/testing/package/07e9a06d-8b64-4b26-807c-96497ca0574a/summary.json`。实际消费者 Node 26.13.0、Bun 1.4.4、Chromium 158.0.8127.18；同包声明在无 DOM/Node 和完整 DOM 两环境以 strict/skipLibCheck=false 检查，DOM 与 Bun/Node 的负向断言也有效。浏览器依赖图仅消费者入口与 dist/watchman.js，根 SDK 单文件 serverless 合同保持。

构建前后候选指纹一致，未向源码或类型用例目录发射文件。生产声明的根配置只包含 src/browser；源码检查仍覆盖 tests 下的浏览器类型用例。未执行本轮不适用的真实上游、负载专项、远端 CI 或发布，也未把先前候选通过结果作为本次证据。

## 逐项结论

| AC     | 状态 | 证据                                                                                                      |
| ------ | ---- | --------------------------------------------------------------------------------------------------------- |
| DOM-01 | PASS | 实际两环境命令、3 个配置控制样本与正/负类型用例，共享严格配置                                             |
| DOM-02 | PASS | 手写 DOM 类型和固定字段反射已删除，16 项浏览器行为及 Node/Bun DOM 导入陷阱通过                            |
| DOM-03 | PASS | 两工程串行，任一侧 TS2322 均使整体失败，省略任一阶段都被关联断言 killed                                   |
| DOM-04 | PASS | 分阶段 build/build:check、对应声明配置、整包 publint/attw 与构建指纹一致                                  |
| DOM-05 | PASS | 同包两种严格类型环境，Node/Bun、Chromium/CSP、依赖图和 serverless                                         |
| DOM-06 | PASS | 全门禁、原始日志/JUnit、文档/ADR/changeset 与索引 hash，独立 reviewer 核对完整工作区与原始证据，双轴 PASS |

## 审查输入

独立 reviewer 按 HEAD→完整当前工作区读取已暂存、未暂存及非忽略未跟踪文件；起始 #107 已暂存内容与本轮追加范围分别记录。源码、TDD 和最终日志均已提供，审查者直接核对原始结果。独立 reviewer 已完成报告与实际证据的最终复核，结论见下文。报告位于 runs，按规范不计入候选指纹，交付前另执行格式与拼写检查。

## 独立审查与交付

未参与实现的独立 agent `browser_dom_review` 全程只读，核对 HEAD 到完整工作区的所有差异和未跟踪原文、TDD 原生 JUnit、最终实际日志、同包消费者及变异关联断言，并重新计算两份 tarball hash、候选指纹和起始暂存补丁 hash。最终规范轴 PASS、需求轴 PASS，DOM-01 至 DOM-06 全部满足，无未解决 actionable finding。审查发现的报告路径事实与过期未来时措辞已修正，格式与拼写检查重新通过。

本轮新增调整保留在工作区，起始暂存区完整保留；未提交、推送、创建 PR、关票或发布。最终报告更新后再次运行格式、拼写和差异检查，并确认源码候选与原暂存补丁仍未改变。

## 收尾核验

2026-11-07，用户在完成解释与审阅后，明确授权提交、推送和关闭 #107。提交前重新核对当前内容指纹，仍为 `1b80ea339f74ffc039667a1743470ec341de78778126dd40b553ac77a8cbb2c4`，与全部最终门禁及独立审查一致。当前暂存状态与实施阶段不同，故 diff 指纹变为 `15cccf2fde26b2a758eecd6984cde8f9204b3a3c1ded045ac753900be26be58d`；文件内容没有变化，不据此重复执行已经通过的相同候选门禁。

本节仅补充收尾授权和提交前核验，以上“未提交、未推送”等表述均保留为实施阶段的历史状态；实际交付提交、远端检查和关票结果记录在 [#107 收尾评论](https://github.com/nonhana/hana-music-api/issues/107)。
