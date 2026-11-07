# #110 当次验收

来源：[#110](https://github.com/nonhana/hana-music-api/issues/110) AC-01～AC-14、父票#80和本次实施指令；[验收依据](../issue-110.md)固定基线、77模块/实际分支与证据边界。

最终结论：完成。AC-01～AC-14均通过，全部适用门禁与独立双轴审查通过，无未解决阻断项。所有最终门禁针对下列同一候选，旧轮次不计通过。

## 实现与工作区

- 基线与当前分支：feature/refactor；HEAD均为 `c2c8fa1352578f146d3630b760b5de546f2ee3c7`，启动时工作区干净，当前改动全部为本票；未切分支、reset或创建worktree。
- 77模块接入82个本地动作，38个weapiPc保持浏览器UA+PC Cookie，39个复用eapi；总模块352、已迁84、pending268。没有业务/Schema重写、token业务分类、共享读取扩张或第二执行器。
- 红心/取消、导入四动作、sky/普通音质及动态路径显式表达；其余数据分支按固定基线逐项断言。全部cache=none，保留八个read/never与三条read重试资格，其余读取connect，写/poll不重放。
- 唯一共享产品接缝为新增weapiPc；另同步生成器输出、发现测试、同包消费者、负载手工definition和严格loopback，以及必要文档/ADR/major changeset。负载测试装配提供固定熵，只为独立解码，不改变产品执行器。
- 源码内容SHA-256：`6df33ed642d5e0368dca514da027b6e2e01e1374e49427336626092642a4f15d`；diff SHA-256：`c0eaa1af829eaf97248de9b891b4bc28fa3487699a1764021f3f08ed17ca8833`。
- 锁文件SHA-256：`68762384acdb3b96e20542b15eec10ea70a1d560b9b5d43f2f41966dbfb10ded`，bun.lock未修改；tarball SHA-256：`6dcc231036fc31fefb702880f6281ae7f55d053ff6b2b100af1e3cf2281ef115`。

## 逐项结论

| AC    | 当前决定性证据                                                                                                        | 状态                        |
| ----- | --------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| AC-01 | 固定HEAD源码/issue快照、77行矩阵、迁移前122份最终请求对照、独立基线审查                                               | 通过                        |
| AC-02 | 122个client冲突配置最终wire、两profile身份/会话、完整77模块diff独立核对                                               | 通过                        |
| AC-03 | client与HTTP各122分支；真正编排、独立weapi/eapi解码、严格ledger                                                       | 通过                        |
| AC-04 | 动态prefix及零发送越界、年榜、initial/before、导入优先级/默认名称、br/level/sky                                       | 通过                        |
| AC-05 | 每模块连接/正文前socket失败资格、成功并发/连续/异账号不缓存；写/poll正文中途失败单发；原四共享读取回归；500次loopback | 通过                        |
| AC-06 | 两profile无token/字符串/provider；现有统一token、取消/期限、纯本地/外部上传、低层原始参数、目标安全及HTTP拒绝回归     | 通过                        |
| AC-07 | weapiPc写/eapi读/poll的provider/完整正文期间取消499与总期限504、迟到provider零发送、交错账号输入/Cookie快照           | 通过                        |
| AC-08 | 矩阵逐模块已有回放引用与最终local，含成功/空/拒绝/重复/结构；云盘删除明确合成200/400样本；fixtures结构审计单列        | 通过                        |
| AC-09 | 原播放/下载/版权/试听/混合列表/顺序回放与br/八level/sky精确wire，check_music固定首项合同                              | 通过                        |
| AC-10 | 所有write/poll分支请求与单次策略；列表read保留原禁重试，无P1/P5/P11/P12越界                                           | 通过                        |
| AC-11 | generate/check与发现一致性，独立导入registry核对77模块82动作，352/84/268；三SDK入口及真实HTTP                         | 通过                        |
| AC-12 | 当前tarball同包Node26.13.0/Bun1.4.4；各122case/77模块/366请求/122provider，退出0；类型/导出/serverless/浏览器边界     | 通过                        |
| AC-13 | 原生red/green、suites登记、全量mutation32/32有效killed；新增8个关联用例原生AssertionError                             | 通过                        |
| AC-14 | 下列六条同候选串行门禁、500次负载资源归零、日志/JUnit/hash齐全；独立最终审查通过                                      | 通过，规范轴PASS/需求轴PASS |

## 最终门禁

完整命令数组、UTC起止时间、退出码、每条前后指纹在 `.artifacts/testing/issue-110/gates.json`，汇总在 `final-evidence.json`。每条stdout/stderr均完整保留，不仅保留末尾摘要。

| 命令                                  | 退出码 | 指纹保持 | 原始日志（同目录有stderr）                         |
| ------------------------------------- | ------ | -------- | -------------------------------------------------- |
| `bun run types:modules:check`         | 0      | 是       | `.artifacts/testing/issue-110/modules-check.log`   |
| `bun run verify`                      | 0      | 是       | `.artifacts/testing/issue-110/verify.log`          |
| `bun run verify:sdk`                  | 0      | 是       | `.artifacts/testing/issue-110/verify-sdk.log`      |
| `bun run verify:fixtures`             | 0      | 是       | `.artifacts/testing/issue-110/verify-fixtures.log` |
| `bun run test:load:smoke`             | 0      | 是       | `.artifacts/testing/issue-110/load-smoke.log`      |
| `bun scripts/mutation-test.mts --all` | 0      | 是       | `.artifacts/testing/issue-110/mutation-all.log`    |

verify:sdk内部实际执行build:check与test:sdk-contract，不将它们改标为额外的独立命令。verify含生成检查、结构规则、构建、全local、双工程typecheck、lint、spell、fmt与文档构建；lint零warning/error。构建工具打印TypeScript7.0生成器弃用提示，构建/严格包检查仍退出0，未降低检查强度或升级任务范围外依赖。

各runner摘要下保留原生JUnit、逐子进程命令/原始日志；计数只说明执行情况，不能替代逐AC证据：

- local：4149pass / 0fail / 0skip；`.artifacts/testing/local/1794073228819-5d7bd17e-3611-4415-ad7c-6a1fd6e2ba60/summary.json`。
- sdk：32pass / 0fail / 0skip；`.artifacts/testing/sdk/1794073346957-df1f23ca-b297-4fda-a008-bb461038fbc3/summary.json`。
- package：1pass / 0fail / 0skip；`.artifacts/testing/package/9b0ec9af-fdf6-4d50-a9d9-b726bcbd8790/summary.json`。
- smoke：146pass / 0fail / 0skip；`.artifacts/testing/smoke/1794073377077-5ee2de6c-9aaa-4c6a-8d0f-2f3e0ce45d4a/summary.json`。
- load：1pass / 0fail / 0skip；`.artifacts/testing/load/smoke-1794073380940/summary.json`。
- mutation：32pass / 0fail / 0skip；`.artifacts/testing/mutation/1794073381253-8aad79ba-b2fc-4531-aad7-6b428900a3aa/summary.json`。

同包Node/Bun消费者使用实际安装tarball，details.libraryPlayback记录两条真实命令/退出码/计数，合成403拒绝用于请求/入口边界；eapi独立解码，weapi密文正文由源码受控熵集合证明，消费者另验证目标/方法/UA/PC Cookie/可选token头。保留既有严格类型、导出、无文件系统serverless及Chromium/CSP边界。包哈希由独立reviewer重新计算。

500次真实HTTP仅连接loopback；read-write场景三次写和一次合并读，顺序true/false/true。最终upstreamActive=0、inflight=0、failures=[]，全32个HTTP模块permit被实际覆盖。当前smoke146个原生断言用例亦通过。未执行十分钟soak。

全量变异32/32有效killed，包含本票八类故障：PC身份丢失、协议替换、动态边界放宽、sky编码、导入链接优先级、写入重试、保守读取重试和额外缓存。基线/普通变异typecheck均通过，新增八项关联标题在各原生XML中出现AssertionError，不以编译/工具异常/超时计killed；旧浏览器类型控制按既有专用合同验收。原工作区指纹保持。

## Red / green与修复历史

迁移前capture-baseline.mts通过真实生成client/请求链、严格fake和独立解码保存77模块122份请求，baseline-wire.log退出0；合成身份/拒绝只证明请求来源。首次误用仅测试runner可用的afterAll preload属于工具失败，改用offline-process后成功，不计red。

red-profile.log与原生JUnit为132pass/122fail，具体断言是旧实现仍接受冲突协议/身份配置；green-profile.log为254pass。其余已满足责任直接回归，不人为破坏实现制造red。补流量/期限/云盘合成返回后511专项通过。负载接缝新回归red-loopback.xml为4pass/1fail（resolved缺失），修复后146个smoke与500次负载通过。

- attempt-1：types:modules:check退出0；verify退出1，local4136pass/10fail/0skip。special-actions旧album覆盖期望1项、live-runner控制自测旧artist_detail/user_playlist api目标9项，已逐项同步严格目标，无放松ledger/跳过。旧结果不计通过。
- attempt-2：完整verify、verify:sdk、fixtures退出0，但load只201次而在read-write HTTP400失败，整体未完成。原因是负载手工like definition缺actions及fake仍认旧api目标；补声明与受控熵，fake改为精确weapi目标并独立解码，保留原测试强度。
- 独立审查发现正文中途失败单发证据缺口，已补weapiPc写/eapi poll回归；响应索引已区分可用录制全集、实际模块回放和结构审计，不把未直接回放的录制标为已回放。
- mutation-library-initial.log记录五个有效killed后第六patch匹配like/unlike两处的tool-error，已加缩进限定，重新专项8/8及本次全量32/32有效通过；旧错误不计killed。
- 初轮测试tuple期望类型、lint遮蔽/命名空间访问与拼写问题已修复，最终完整门禁复核通过。

## 独立审查

review_110未参与实现，只读完整工作区（base...HEAD、cached、diff与全部9个非忽略untracked原文）、来源/AC/规范、实际日志/原生JUnit/包与负载报告。独立核对77模块82动作，复算tarball hash，审查修复后重新核验。最终结论已保存 `.artifacts/testing/issue-110/review-final.md`：规范轴PASS、需求轴PASS，无未解决actionable findings/阻断项。独立reviewer解析全部32份变异原生XML，关联用例均为AssertionError且退出1，七组基线非空、0fail/0skip；39份前置typecheck没有编译错误。末尾独立源码指纹与全部门禁一致。

## 证据边界与授权

所有新验证使用本仓库fake/loopback和当前包，原录制保持原recordedAt/viewer/region/来源。云盘删除无历史录制；三项无成功录制的流量用例合成成功体只证明当前本地合同。矩阵列可用录制全集，实际模块回放以测试引用与JUnit为准，未直接回放项只有fixtures结构审计；请求断言与响应回放不互相替代。

live与十分钟soak按实施前范围不适用，未运行，不计通过。未调用真实上游，不读取或沿用#109账号/目标/token/写入恢复授权。验收结束时工作区尚未提交，保留在原分支供审阅；后续交付授权见下节。

最终运行记录更新后另执行fmt:check与spell并通过；只修改排除于候选指纹的runs，复核源码仍为6df33ed642d5e0368dca514da027b6e2e01e1374e49427336626092642a4f15d。

## 提交与关票

用户已确认本任务完成，并在当前聊天明确授权提交、推送和关闭#110。提交信息遵循单行 `<type>: <message>`；保留原feature/refactor分支，不创建PR、合并或发布。实际提交、远端分支和关闭回执登记在 [#110](https://github.com/nonhana/hana-music-api/issues/110)。本文保留原testedHead、候选内容指纹与包hash，不把提交后的HEAD改标为测试基线。
