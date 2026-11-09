# #116 当次运行记录

基线为 `feature/refactor` / `a9ecac4e94f571193a987f087cea32e76f023819`，初始工作区干净且远端相同。授权、适用性与15条AC见[验收依据](../issue-116.md)。只实施本票；未执行真实网易云、账号、发布、合并或部署。

## 实施与原生断言

配置、动作装配、唯一策略来源与消费者迁移连续完成。ModuleCallConfig独立列字段，移除crypto/ua/domain/e_r/acceptGzip/headers及顶层deviceId；原始CreateRequestOptions从根导出，设备改用state.deviceId。动态程序入口也分开query/config。普通入口验证原对象后才复制，配置失败通过原runPublicEffect交给core/runtime映射，错误映射拥有者不扩张。动作声明必需，本地空集不能发送请求；API动作的method/response只能省略或明确POST/json，plain维持自己的模式。

保留低层默认协议/目标/原始头与安全校验，低层不猜URI读写或自动重放。缓存、重试、上传期限和HTTP上传准入来自动作。#122身份与#115阶段业务没有改；匿名注册和身份池的原IP优先级保留，state.cnIp仍作兜底。

第一批`bun scripts/test.mts module-config`真实执行34条原生断言red，旧键、缺动作及低层旧重试均与预期不符；`red-config.stdout`指向原JUnit/子进程日志，后续35条green。早期local-0/1/2的旧消费者失败已保留并逐项迁移，没有skip、放宽ledger或更换未迁移模块。

独立初审发现两项P2：非枚举旧键在复制前未校验、非plain动作接受非法method/response。新增12条先得到35 pass / 12 fail的原生red，生成/动态loader/运行装配均曾接受非法声明。修复后`green-review`为47 pass / 0 fail / 0 skip。见`.artifacts/testing/issue-116/red-review.json`、`green-review.json`及各自stdout指向的原JUnit。

定向mutation最初两份补丁产生编译错误，记为invalid，不计killed；修正补丁后6项有效killed。审查修复又增加两项，`mutation-config-2`的8项全部有效killed；随后补充静态/动态直接invoke类型和非法重试数组故障，当前module-config的11项全部有效killed（mutation-config-4）。新tsc控制的临时目录在隔离副本中曾缺父目录，记为baseline tool-error；补齐自有目录后通过，没有计为killed。最终仍须跑全部登记目标。移除顶层alias后，其旧mutation改为已有匿名凭据切换runtime设备的缓存指纹回归，不保留无消费者的补丁。

复核又发现直接动态invoke的query类型未收窄、动作枚举会String转换数组后接受。增加正向真实tsc控制与两种负向query控制，以及三个数组非法声明、非法retry零重放，共5条先得到47 pass / 5 fail的原生red；正向编译先通过，非法query原来同样编译成功，被原生断言检出。修复后52条全部green，原架构断言49条通过且ledger未修改。非法retry的red确实进入连接重试并返回502，修复后在发送前400且零发送。

## 候选与完整门禁

`source-audit.json`逐项核对352模块/389动作及route与固定起点相同，151 eapi、227 web、2 clientlogOsx、9 plain；937个原netease/request文件字节未变。新增证据均为离线合成入口和严格fake，不证明网易云当次可用性，不改历史来源或Schema，#38/8821缺口独立保留。

final-0：模块生成检查通过；verify中8132 pass / 1 fail，失败是新包消费者的独立EAPI解密密钥误多一个字符，报Invalid key length。该轮已经停止，没有继续后续门禁，不作为最终绿灯。修正后`package-green-0`同包SDK集合32 pass；随后独立审查修复使候选再次失效，最终将全部重冻重跑。

final-1：模块生成检查通过；verify中8144 pass / 1 fail，唯一失败是架构原断言发现SDK/app直接调用normalizeFailure扩大映射拥有者。没有放宽ledger；已改为原runPublicEffect失败入口，保持执行/错误映射原拥有者。该轮停止，不作最终绿灯。

最终采用final-4冻结候选，以下记录同候选完整门禁结果；失败/失效轮原证据均保留。

final-2：前四门禁通过，local为8150 pass、SDK为32 pass；fixtures校验761条，另4条无ModuleBody明确排除。smoke选择146条通过，但实际负载只执行305次就因HTTP取消失败退出，不计完成500次，mutation-all未启动。定位为debug低层入口丢失CallServices、实例fetcher及时钟。新增3条行为断言得到18 pass / 3 fail，另有离线守卫捕获缺fetcher造成的原生网络尝试，未访问真实上游；三个行为失败分别为服务缺失、返回502、推进实例时钟后仍未超时。补齐原有服务/依赖后21条green，回归不放宽fake或离线守卫，并登记3项定向mutation。所有最终门禁重新冻结运行。debug-mutation首轮发现新增测试的Response/Promise类型错误，记tool-error；改为Promise.resolve后第二轮14项均有原生AssertionError有效killed，但运行中矩阵格式化改变候选，整体仍记失败而非最终通过。debug-load专项已实际完成500次且upstreamActive/inflight归零，仍由最终同候选门禁重验。

final-3前五门禁通过，完整500次load资源归零；随后复核发现client专属cache/identityPool在运行时拒绝，但动态query类型仍放行。新增真实tsc控制分别得到52 pass / 2 fail，两个负向都实际编译退出0；正向client配置独立编译成功。补入DisallowExecutionKeys并登记两个类型回退mutation。该轮候选因此失效，该轮mutation自然结束，106项实际有效killed，但原runner以Original candidate changed整体失败退出，不能替代下一轮完整验收。

## 最终候选 final-4

六道门禁串行完成，全部退出0，且每步结束后源码/矩阵指纹与冻结值一致。`collect-final.mts final-4`再次核对全部原生结果、包与fixture字节，退出0。完整工件见[acceptance.json](../../../.artifacts/testing/issue-116/final-4/acceptance.json)，命令数组、起止与stdout/stderr见[gates.json](../../../.artifacts/testing/issue-116/final-4/gates.json)。

- 实际testedHead：`a9ecac4e94f571193a987f087cea32e76f023819`，不改写为交付后的commit。
- 源码/矩阵contentSha256：`bcaf0b2d3f4e9723c9ed9f6a5b15b3cf1f0f35c840439850cc1879f4a707182d`。
- 未提交候选diffSha256：`5ad6557b0384954877e5e983757498640d02ebb2cab2a6f8a6012af120046179`。
- bun.lock SHA-256：`68762384acdb3b96e20542b15eec10ea70a1d560b9b5d43f2f41966dbfb10ded`。
- 同一tarball SHA-256：`318af87f001c3e6a1298dfc67ae4773c2b746ae665e57337e5b93cac0e7e4ac6`。Node 26.13.0与Bun 1.4.4均消费该包；713个包文件逐项核对，声明类型正负控制通过。

| 实际命令                              | 结果                                                                                           | 原始证据                                                                 |
| ------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `bun run types:modules:check`         | PASS                                                                                           | [log](../../../.artifacts/testing/issue-116/final-4/modules-check.log)   |
| `bun run verify`                      | PASS，local 8157，0 fail / 0 skip；类型、lint零警告零错误、拼写、格式、文档构建通过            | [log](../../../.artifacts/testing/issue-116/final-4/verify.log)          |
| `bun run verify:sdk`                  | PASS，包含build:check和test:sdk-contract；SDK 32，0 fail / 0 skip                              | [log](../../../.artifacts/testing/issue-116/final-4/verify-sdk.log)      |
| `bun run verify:fixtures`             | PASS，761条结构校验；4条无ModuleBody明确排除，未冒称已校验                                     | [log](../../../.artifacts/testing/issue-116/final-4/verify-fixtures.log) |
| `bun run test:load:smoke`             | PASS，smoke 149，0 fail / 0 skip；完整500次loopback、upstreamActive/inflight均0、failures为空  | [log](../../../.artifacts/testing/issue-116/final-4/load-smoke.log)      |
| `bun scripts/mutation-test.mts --all` | PASS，全部108项有效killed；每项关联非空用例、原生AssertionError与类型检查，无超时/工具错误冒充 | [log](../../../.artifacts/testing/issue-116/final-4/mutation-all.log)    |

同包Node/Bun分别验证7个旧键的42次普通调用拒绝、42次非枚举拒绝、14次无效client构造，零取token；3次业务请求和1次原始请求完整核对。身份消费者各完成24次请求。`cache`/`identityPool`仍是合法client默认值，安装包类型拒绝把它们放进query。

| AC    | 当次实现与决定性证据                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------------------ |
| AC-01 | PASS，56条module-config行为/真实tsc控制及同包Node/Bun纯JS拒绝矩阵；原始config复制前验证。                    |
| AC-02 | PASS，低层api/weapi/eapi/linuxapi独立编码/解码、默认目标/原始头和安全边界回归；无声明原始请求单次失败。      |
| AC-03 | PASS，生成器/loader/运行装配真实缺声明、非法声明控制；本地显式空动作集拒绝发请求。                           |
| AC-04 | PASS，352模块389动作及route逐项等于固定起点，旧判定扫描零引用；模块实现未改。                                |
| AC-05 | PASS，共享读取/取消/完整正文/重试与上传准入回归及500次load，资源归零。                                       |
| AC-06 | PASS，身份与匿名/池/设备隔离回归，同包每runtime24请求；有效设备指纹mutation检出。                            |
| AC-07 | PASS，check-token全协议、provider失败/期限/取消/逐次取值和零共享重放回归，登记mutation有效。                 |
| AC-08 | PASS，HTTP/动态loader与debug回归；debug保留同CallServices、实例fetcher及时钟，三个新增故障均有效检出。       |
| AC-09 | PASS，特殊链路/上传/原始bytes与非JSON成功后提交等既有回归保留，未放宽ledger或更换业务入口。                  |
| AC-10 | PASS，全回归、761条结构审计与937个原fixture字节指纹；未改Schema或历史来源。                                  |
| AC-11 | PASS，major changeset、迁移文档/ADR及同包类型消费者、文档构建。                                              |
| AC-12 | PASS，所有新行为原生red/green与16项module-config故障、全108项有效mutation；失败轮未计通过。                  |
| AC-13 | PASS，以上六门禁同候选串行完成，collector核对实际testedHead/锁/包/原日志/JUnit。                             |
| AC-14 | PASS，独立终审规范轴/需求轴均PASS，无未解决发现；原文见下节。                                                |
| AC-15 | 授权内提交、普通推送、completed关票读回及本票后暂停的真实结果统一写入closeout.json；不预填commit或远端结果。 |

所有证据仅证明离线控制面与固定基线合同。真实网易云、账号、npm/Release、远端CI及soak均未执行；live与soak适用性没有在失败后降级。

## 独立审查与交付

独立[最终审查](../../../.artifacts/testing/issue-116/review-final.md)规范轴PASS、需求轴PASS，无未解决发现。此前全部发现及debug回归已修复复核，原始审查轮次保留。授权内提交、普通推送、completed关票读回及暂停结果由[closeout.json](../../../.artifacts/testing/issue-116/closeout.json)统一记录；不把交付commit改写成原testedHead，不创建后继。

用户最新明确要求“本任务完成后先暂停接力”，已持state.lock记录pauseAfterCurrentTicket=#116，并更新本票AC-15；提交/普通推送/关票授权继续，后继创建授权暂停。
