# #122 统一SDK请求身份

来源：[#122](https://github.com/nonhana/hana-music-api/issues/122)、[#80](https://github.com/nonhana/hana-music-api/issues/80)，完整正文及评论存于`.artifacts/testing/issue-122/sources/`。当前票唯一前置#115已completed关闭，#122阻塞#116，后者八个原生前置；2026-11-08已核对。

基线：feature/refactor，697958982360dc0e5d29726366385ce01da0d2b9，远端同提交、工作区干净。使用当前检出。授权：更新AC、实施离线测试、独立subagent审查、通过后提交/普通推送/关票；用户后续明确要求本票完成后暂停，不创建后继聊天；不授权真实上游、账号、发布或部署。自动接力原文与state位于`.artifacts/testing/auto-ticket-chain/hana-80-2026-11-08/`。

范围：每Call设备、核心纯投影、全部实际身份默认及匿名/CLI/低层消费者；保持协议/目标/业务数据/返回Schema/执行链。#116继续删除通用旧控制面。本次实际清单352模块389动作，详情见本目录动作清单；旧新组合是明确批准的行为变化，历史基线不改。

| AC ID | 来源与内容摘要       | 入口与预期                    | 测试标题或独立证据                                     | 适用性与理由 | 必要条件                         | 最终状态   |
| ----- | -------------------- | ----------------------------- | ------------------------------------------------------ | ------------ | -------------------------------- | ---------- |
| AC-01 | 设备唯一来源         | 生成SDK/HTTP/低层/CLI实际入口 | 身份边界专项、既有全域wire/回放/控制测试及原生mutation | 离线适用     | 严格fake/包/loopback；无真实上游 | 见运行记录 |
| AC-02 | 所有匿名入口         | 生成SDK/HTTP/低层/CLI实际入口 | 身份边界专项、既有全域wire/回放/控制测试及原生mutation | 离线适用     | 严格fake/包/loopback；无真实上游 | 见运行记录 |
| AC-03 | 纯投影               | 生成SDK/HTTP/低层/CLI实际入口 | 身份边界专项、既有全域wire/回放/控制测试及原生mutation | 离线适用     | 严格fake/包/loopback；无真实上游 | 见运行记录 |
| AC-04 | 播放先通             | 生成SDK/HTTP/低层/CLI实际入口 | 身份边界专项、既有全域wire/回放/控制测试及原生mutation | 离线适用     | 严格fake/包/loopback；无真实上游 | 见运行记录 |
| AC-05 | 全量动作迁移         | 生成SDK/HTTP/低层/CLI实际入口 | 身份边界专项、既有全域wire/回放/控制测试及原生mutation | 离线适用     | 严格fake/包/loopback；无真实上游 | 见运行记录 |
| AC-06 | 隐式与低层清零       | 生成SDK/HTTP/低层/CLI实际入口 | 身份边界专项、既有全域wire/回放/控制测试及原生mutation | 离线适用     | 严格fake/包/loopback；无真实上游 | 见运行记录 |
| AC-07 | 隔离                 | 生成SDK/HTTP/低层/CLI实际入口 | 身份边界专项、既有全域wire/回放/控制测试及原生mutation | 离线适用     | 严格fake/包/loopback；无真实上游 | 见运行记录 |
| AC-08 | 执行边界             | 生成SDK/HTTP/低层/CLI实际入口 | 身份边界专项、既有全域wire/回放/控制测试及原生mutation | 离线适用     | 严格fake/包/loopback；无真实上游 | 见运行记录 |
| AC-09 | 测试装配与来源       | 生成SDK/HTTP/低层/CLI实际入口 | 身份边界专项、既有全域wire/回放/控制测试及原生mutation | 离线适用     | 严格fake/包/loopback；无真实上游 | 见运行记录 |
| AC-10 | 决定性失败证据       | 生成SDK/HTTP/低层/CLI实际入口 | 身份边界专项、既有全域wire/回放/控制测试及原生mutation | 离线适用     | 严格fake/包/loopback；无真实上游 | 见运行记录 |
| AC-11 | 同候选门禁与独立审查 | 生成SDK/HTTP/低层/CLI实际入口 | 身份边界专项、既有全域wire/回放/控制测试及原生mutation | 离线适用     | 严格fake/包/loopback；无真实上游 | 见运行记录 |
| AC-12 | 文档与交付边界       | 生成SDK/HTTP/低层/CLI实际入口 | 身份边界专项、既有全域wire/回放/控制测试及原生mutation | 离线适用     | 严格fake/包/loopback；无真实上游 | 见运行记录 |

unit验证纯投影及稳定输入；behavior验证SDK/HTTP/匿名/CLI与全动作最终请求；replay继续已有原响应；transport执行取消/完整正文/500loopback；package实际同包Node/Bun消费者及类型边界；mutation检验新判定和原责任。live不适用本子票且未授权，父票下游另记；soak按需手动，不作为本票门禁。最终六项命令按AC-11串行执行，不在失败后缩小范围。可运行切片为设备与播放→全动作及隐式入口→同候选验收，每次提交必须已满足当次完整门禁和审查，禁止提交半成品。

当次运行记录：[runs/issue-122.md](./runs/issue-122.md)。

## 决定性证据映射

- AC-01/02：request-identity中的显式五类设备用例、四类隐式注册、standalone优先级、CLI独立解密、并发匿名设备；包消费者request-identity.mjs从client/具名/invoke覆盖四种设备输入。Hono只接受Cookie，不增加state输入通道。
- AC-03/04：同文件的projection deterministic、SDK/Hono Ficus exhigh/sky、-460单次及低层api/eapi/Linux/web；最终Cookie与独立EAPI内头逐字段比较。旧response Schema由原playability/song-url回放覆盖可播放、试听、空URL和业务拒绝。
- AC-05/06：[389动作清单](./issue-122-actions.md)逐行比对起点，除profile外合同相同；既有五个领域与special行为测试保持原fixture的URL/方法/业务数据/顺序，仅按明示新组合核对身份。registry no mixed profiles用例、编译期profile键和真实发现守护清零，CLI/匿名及四种低层协议另测。
- AC-07/08：request-identity的shared reads和并发匿名，special cloud import使用A/B不同账号、设备、输入、token和结果并在暂停期间修改凭据/设备；已有check-token/shared-reads/upload/HTTP/socket专项覆盖取消、期限、完整正文、固定字符串、多动作和部分失败。纯本地带identityPool时仍零注册/零token，plain外部无身份继续由特殊链路证明。
- AC-09/10：同步真实模块发现、上传plugin、live控制fake及同包消费者。新request-identity mutation九项分别破坏设备优先级、UA、大小写清理、无依据buildver、隐式username、身份池设备优先级和低层部分OS覆盖；其相关用例必须原生AssertionError，不能以工具失败计kill。原mutation责任保持。
- AC-11/12：最终六门禁、原始输出与各子runner的JUnit、同tarball Node/Bun证据、500次loopback与全部mutation；独立reviewer从来源和完整diff给双轴结论。ADR/changeset/迁移指南及本清单说明来源与外部边界。用户已撤回后继创建授权，关票后暂停。

各专项路径均相对于tests/behavior/runtime、tests/behavior/modules或tests/fixtures/consumers；完整命令与原始证据指针写入runs，不把本表当作通过结果。

独立初审指出身份池覆盖旧Cookie设备及低层部分os覆盖时生成冲突默认值；两项均补最终wire red。调用方已提供有效设备时绕过匿名池并沿普通匿名初始化，池只提供无调用方设备时的兜底。低层按显式已知os选择相应默认组合；明确原始UA/字段保持，未知os不猜版本或UA。最终复核与新候选证据见runs。

身份池返回的有效设备不会被空白或undefined的state.deviceId抹掉；注册等待期间其他调用更新runtime时，username、注册Cookie和后续业务Cookie仍用同一池设备。对应回退故障也登记定向mutation。

旧顶层deviceId只在本次确实需要隐式匿名初始化且尚无runtime匿名会话时提供兼容兜底，已有匿名会话继续沿用其设备，不被仅注册选项覆盖；对应单业务请求wire断言与回退mutation已登记。
