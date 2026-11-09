# #122 当次验收

基线：feature/refactor，697958982360dc0e5d29726366385ce01da0d2b9，远端起点相同，初始工作区干净。授权与原文见需求矩阵及接力控制目录。用户后续要求本票完成后暂停，不创建后继聊天；已持state.lock合并更新接力状态。

## 已完成的调查与实施

阶段一读取当前票全部正文/评论、父合同、仓库适用文档及skill，核对原生#115→#122→#116依赖后用gh仅更新AC。固定352模块389动作，旧220个weapiPc浏览器动作改web，151个eapi动作使用已有iPhone四项，原7个web与9个plain动作保持，clientlog两条日志对齐macOS UA。协议、目标、语义/cache/retry及业务字段不变，完整清单见issue-122-actions。原937份netease/request文件与起点逐字节相同，未改写录制来源或Schema。

按设备与播放先打通，再完成全动作和隐含入口；共有profile影响全部消费者，因此在可运行完整候选上统一验收后提交，不提交未完成的中间态。低层显式原始选项保留，部分已知os覆盖时自行生成的字段按该os配套；无来源字段省略。已有设备绕过匿名池，缺少设备时池中选定的设备不被无效或undefined状态抹掉。

## 失败、修复与专项证据

原始命令、起止/退出码、源码指纹、stdout/stderr和原生JUnit在`.artifacts/testing/issue-122/`：

- red-identity：13个用例中12个原生断言失败，确认Cookie抢过显式设备、匿名username漂移、iPhone UA夹带Windows字段及无依据默认值。随后identity-3为25通过，后续新增审查回归不把此数字称为最终数量。
- behavior-0：全量发现阶段7893通过、183失败，暴露共享上传plugin旧profile、旧identity期待和测试装配；已修复，无失败豁免。regression-1对相关SDK/Hono/特殊链路/发现/live控制fake通过。
- typecheck/lint/spell保留全部失败轮次，未关闭规则或缩选择。mutation-identity-0因类型基线失败属于tool-error，没有算有效kill。
- final-0：独立初审发现身份池盖掉调用方Cookie设备，以及低层部分PC覆盖仍补iPhone默认值；当前verify精确进程树被中止，exit130，未继续后续门禁，abort.json保留真实原因与进程清单。red-review的3项网络边界原生失败随后green-review28通过。
- final-1：复核发现空白/undefined设备抹掉池设备，注册等待期间runtime变化造成漂移；同样中止并保留abort.json，不作为最终通过。red-pool-late两项都实际发出later-runtime而断言期待initial-runtime；修复后green-pool-late为33通过，包含注册username独立解密和后续业务设备同值。
- mutation-identity-3：8项均有效killed，覆盖设备优先级、池覆盖、无效状态抹设备、低层部分os、混合UA、大小写清理、无依据buildver和隐式username。关联用例的原生AssertionError与正常类型基线保存在stdout所指的原生mutation目录，不以编译或工具错误当kill。

源码、矩阵和测试在最终重冻后不再更改。final-0/1/2均为已中止的旧候选，只保留历史，不承接它们的绿灯。

final-2又经负向复核发现旧顶层deviceId会覆盖已有runtime匿名会话设备，已中止，red-existing-anonymous实际单业务请求失败。修复后green-existing-anonymous为34通过；96种runtime/池/state/Cookie/legacy/注册等待变化组合由独立wire解密探针通过。mutation-identity-4为9项有效killed，保留原生报告。生成检查中止留下178个check-tmp，按工具精确清单、对应已跟踪原输出与SHA核对后清理，清单保存在final-2/check-tmp-cleanup.json。另按生成器五个明确TEMP_FILE常量核对并清理5个具名.tmp.ts，独立清单在generated-temp-cleanup.json；最终重冻前没有生成临时文件。

## 最终同候选门禁

最终轮final-3；此前final-0/1/2保留中止与失败事实，不承接绿灯。唯一索引为`.artifacts/testing/issue-122/final-3/acceptance.json`，原始命令/起止/退出码/stdout/stderr在同目录gates.json及各log/stderr，原生JUnit和子进程日志沿索引指向实际runner目录。

testedHead仍为`697958982360dc0e5d29726366385ce01da0d2b9`（提交前真实HEAD），不冒称提交后重跑。最终contentSha256=`3ba9516bee9d651b1beb8523324e26aa51d5eb98665c5432506b0b5acbe43aeb`，diffSha256=`857e2ab854e1a9671929e7d37e356796c1a84378d4a3e67f0cecda4d8877c15d`，bun.lock SHA256=`68762384acdb3b96e20542b15eec10ea70a1d560b9b5d43f2f41966dbfb10ded`。六项before/after均相同，源码/矩阵/测试未变化。

| 实际命令                              | 结果                   | 原始日志前缀                                                           |
| ------------------------------------- | ---------------------- | ---------------------------------------------------------------------- |
| `bun run types:modules:check`         | PASS / exit 0 / 同候选 | `.artifacts/testing/issue-122/final-3/modules-check.log`、对应stderr   |
| `bun run verify`                      | PASS / exit 0 / 同候选 | `.artifacts/testing/issue-122/final-3/verify.log`、对应stderr          |
| `bun run verify:sdk`                  | PASS / exit 0 / 同候选 | `.artifacts/testing/issue-122/final-3/verify-sdk.log`、对应stderr      |
| `bun run verify:fixtures`             | PASS / exit 0 / 同候选 | `.artifacts/testing/issue-122/final-3/verify-fixtures.log`、对应stderr |
| `bun run test:load:smoke`             | PASS / exit 0 / 同候选 | `.artifacts/testing/issue-122/final-3/load-smoke.log`、对应stderr      |
| `bun scripts/mutation-test.mts --all` | PASS / exit 0 / 同候选 | `.artifacts/testing/issue-122/final-3/mutation-all.log`、对应stderr    |

verify:sdk实际包含build:check和test:sdk-contract，这两个内层步骤没有冒称独立执行。

- 本地：8097通过、0失败、0跳过；原生摘要`/Users/nonhana/workspace/code_life/Campanula/hana-music-api/.artifacts/testing/local/1794121560782-ca146bd0-dd15-4145-b253-b94f74d281dc/summary.json`。
- SDK：32通过、0失败、0跳过；原生摘要`/Users/nonhana/workspace/code_life/Campanula/hana-music-api/.artifacts/testing/sdk/1794121708038-6bcb7c0d-b4fd-4cfb-9d93-caa77baba9ca/summary.json`。
- smoke选择：146通过、0失败、0跳过；原生摘要`/Users/nonhana/workspace/code_life/Campanula/hana-music-api/.artifacts/testing/smoke/1794121751523-e6789414-fc95-4e30-9499-bbe173419913/summary.json`。
- 真实loopback：完整500样本，upstreamActive=0、inflight=0，failures为空；原始`/Users/nonhana/workspace/code_life/Campanula/hana-music-api/.artifacts/testing/load/smoke-1794121755775.json`，不连接网易云。
- 全量变异：92项全为有效killed，本票9项在同一候选重新执行，每项关联原生AssertionError、类型基线正常、无空选择/skip/timeout/工具错误；原始`/Users/nonhana/workspace/code_life/Campanula/hana-music-api/.artifacts/testing/mutation/1794121756122-94e9c234-c7d3-467c-bf3d-4ff1f4b01883/summary.json`。
- 同包消费者：tarball SHA256=`1696844ae7aad55bd5e33ec3077697b2cd5568dd7fe27025b4342e0356060bdb`，原生包摘要`.artifacts/testing/package/1f680560-cafd-4081-a6cb-f093a1bfdf4e/summary.json`；Node26.13.0和Bun1.4.4各自完成24个新增身份请求，含client/具名/invoke、两音质、四种设备输入，同时保留五个历史领域的全量包消费者及浏览器/类型/serverless验证。
- fixtures原始审计为validated761，另4份无ModuleBody按既定规则排除（nos_upload三份、voice_detail一份），不把这些排除项称为已结构验证。全部937个原netease/request文件的字节/hash保持，Schema没有改写。
- 独立审查另在最终指纹重放96种设备/会话/池/legacy/并发组合，结果见review-input-matrix-final.json；另以同client/账号/输入/transport只变runtime设备R1→R2，实际两次上游和第三次R2缓存命中，见review-runtime-device-cache.json。原旧指纹的探针仅作历史，不充当最终证据。

## AC与独立审查

| AC       | 当前结论与决定性证据                                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| AC-01/02 | PASS；34项身份用例覆盖显式/旧Cookie/缺省/非法设备、显隐匿名、CLI、池及旧alias；独立解密username/EAPI，包消费者与96组合补证。               |
| AC-03/04 | PASS；纯投影固定输入同输出；SDK/Hono的Ficus exhigh/sky和-460单次，原可播放/试听/空URL/拒绝Schema回放保持。                                 |
| AC-05/06 | PASS；389动作除profile外合同无变化，旧weapiPc产品引用归零，全领域SDK/HTTP最终wire及实际api/linuxapi/匿名/CLI入口覆盖。                     |
| AC-07/08 | PASS；A/B不同账号、设备、业务输入、token、结果及快照改变，设备缓存隔离、取消/期限/完整正文、上传部分失败、plain字节/凭据与保守重试均执行。 |
| AC-09/10 | PASS；手工装配/真实发现/包/live控制fake已同步，历史字节未改；原生red与最终92/本票9项mutation有效检出。                                     |
| AC-11    | 六门禁PASS；最终独立规范轴PASS、需求轴PASS。                                                                                               |
| AC-12    | 文档/changeset/外部边界PASS；提交/普通推送/关票与暂停的实际回执见closeout.json，不以准备状态冒称已交付。                                   |

初审review-initial.md真实FAIL和全部修复保留；未参与实现的reviewer已直接核对源码、完整base...HEAD/cached/worktree/untracked以及前五门禁全部原始日志/JUnit/包/负载。最终全量mutation及同指纹索引已完成独立复核，规范轴PASS、需求轴PASS，无未解决阻断项；完整报告为`.artifacts/testing/issue-122/review-final.md`。提交、推送和关票仍按下段的实际回执确认，不把审查报告当作这些动作已经发生。

## 外部边界与授权收尾

所有请求证据来自严格fake、同包消费者或真实loopback。viewer为合成账号/匿名，region=unknown；没有访问真实网易云（匿名也未运行）、真实账号、npm发布、Release或部署。live不是本SDK子票必要门禁，父票下游有限只读取址另验；soak按需手动，未运行。

提交、普通非force推送、远端核对、completed关闭及读回由本次既有授权覆盖，实际SHA/消息/remote/关闭状态记录在`.artifacts/testing/issue-122/closeout.json`；只有这些回执齐备才算交付完成。用户明确要求本票完成后暂停，接力状态持锁合并更新，不创建后继聊天。
