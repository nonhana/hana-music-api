# #113 当次验收

验收结论：通过。六项最终自动门禁及独立规范轴/需求轴审查均通过，无未解决发现。AC-13授权收尾在审查后执行，实际提交/推送/关票与一个后继聊天由closeout.json和链state.json记录；不把初轮绿灯或中止轮次当作最终通过。

## 最终候选与证据

分支feature/refactor，testedHead `fa40cad6b56b9fcb4b666a80bb84c4b487551919`；起始工作区干净，无用户改动，没有切分支/reset/新建worktree。67模块声明71动作（44个weapiPc、23个eapi），实际352总/289声明/63pending；输入、返回Schema、Promise和会话外壳保持。普通覆盖收口用major changeset，低层createRequest保持。

- 内容SHA-256：`70ec6c8cfb105e687587b1fd2d567d298acb9944d2ed677ac32c680dce99fc3a`。
- diff SHA-256：`30cd57adfef38ebe6be528c5987d0f3e6f1a85fdeaa91a9f2df28cda909a8494`。
- 锁文件SHA-256：`68762384acdb3b96e20542b15eec10ea70a1d560b9b5d43f2f41966dbfb10ded`，bun.lock未改。
- 同一tarball SHA-256：`6de75fa377537069f73cd076d2a6fa4e25b0ad871802d505660ae1ad8911b46f`。

六项门禁冻结后串行执行，每条退出0且前后指纹相同；实际命令数组、起止时间、退出码、锁hash和原始stdout/stderr见.artifacts/testing/issue-113/final-2/gates.json，结构化逐项核对见final-evidence.json。每条sink发送前清空，旧失败/中止轮次保留。verify:sdk内实际包含build:check和test:sdk-contract；verify含docs:build，lint为零warning/error。构建工具既有弃用/文档chunk提示未降低任何检查。

| 实际命令                              | 退出码 | 原始stdout（同目录同名.stderr）                            |
| ------------------------------------- | ------ | ---------------------------------------------------------- |
| `bun run types:modules:check`         | 0      | `.artifacts/testing/issue-113/final-2/modules-check.log`   |
| `bun run verify`                      | 0      | `.artifacts/testing/issue-113/final-2/verify.log`          |
| `bun run verify:sdk`                  | 0      | `.artifacts/testing/issue-113/final-2/verify-sdk.log`      |
| `bun run verify:fixtures`             | 0      | `.artifacts/testing/issue-113/final-2/verify-fixtures.log` |
| `bun run test:load:smoke`             | 0      | `.artifacts/testing/issue-113/final-2/load-smoke.log`      |
| `bun scripts/mutation-test.mts --all` | 0      | `.artifacts/testing/issue-113/final-2/mutation-all.log`    |

| 集合     | pass / fail / skip | 原生报告                                                                                      |
| -------- | ------------------ | --------------------------------------------------------------------------------------------- |
| local    | 6909 / 0 / 0       | `.artifacts/testing/local/1794113548699-aa4a0ebc-3220-443b-b659-61577d13da3e/summary.json`    |
| sdk      | 32 / 0 / 0         | `.artifacts/testing/sdk/1794113715370-979b8c19-ecb8-46ab-a58c-033c8ad5ef3e/summary.json`      |
| package  | 1 / 0 / 0          | `.artifacts/testing/package/170bedac-8397-409e-95ff-5067e2c60e3e/summary.json`                |
| smoke    | 146 / 0 / 0        | `.artifacts/testing/smoke/1794113753537-26dfea54-ae30-4e72-9d92-c16de5211b72/summary.json`    |
| load     | 1 / 0 / 0          | `.artifacts/testing/load/smoke-1794113757555/summary.json`                                    |
| mutation | 58 / 0 / 0         | `.artifacts/testing/mutation/1794113757879-c1fcf389-5a35-4b07-8cf5-2e4626b7268a/summary.json` |

本领域1145项包括370分支各client/真实HTTP loader最终请求、18项显式token、155份原录制逐份返回对照和232项政策/期限/取消/本地拒绝/SDK及HTTP不同账号隔离。每个runner保留原生JUnit、逐子命令/stdout/stderr，空选择/skip没有充数。

同包Node26.13.0/Bun1.4.4各执行370case、1110请求、370provider，轮换client/具名/invokeModule三入口；两协议均独立解码，未只检查密文容器。包公开类型/导出/browser/CSP/serverless边界通过，713个包文件hash逐一验证。loopback完整500样本，failures为空，upstreamActive=0、inflight=0；58项登记mutation均有效killed，本票10项关联原生AssertionError，10组非空基线和编译通过，非关联异常/编译失败/超时不计通过。

370份请求从固定fa40cad6普通archive的完整旧SDK生产链捕获（不是worktree），原789份生产文件与git对象一致；迁移前首轮366及审查修复后的370来源分别保留。155份原录制是按metadata.module筛选的可用全集，原文/recordedAt/viewer/region/provenance/hash未改。工作台无成功样本时合成成功只守策略，不猜Schema，不当作上游录制。默认仅离线，live不适用且未运行；soak按需手动且未运行。没有沿用旧账号/目标/token或恢复许可。

## 逐项AC

| AC    | 决定性证据                                                                                                              | 状态   |
| ----- | ----------------------------------------------------------------------------------------------------------------------- | ------ |
| AC-01 | 原始issue/父合同、67份固定源码hash、67行六列矩阵、370分支唯一且全部query字段可达                                        | 通过   |
| AC-02 | 真实发现352/289/63、本票71动作与SDK/HTTP声明一致，唯一请求链，无P11/P12越界                                             | 通过   |
| AC-03 | 370个生成client冲突配置与370个真实HTTP最终URL/POST/UA/Cookie/e_r/协议路径/header/业务数据独立解码                       | 通过   |
| AC-04 | 实际缺省/显式/假值/枚举/分页、合法vid四形态与mlog缺省mvid、原本地拒绝零发送                                             | 通过   |
| AC-05 | 逐67模块连接前/已连接失败次数、成功并发/连续/异账号不共享；声音排序等写never、状态读取保守never、旧重试上限保持         | 通过   |
| AC-06 | 155份历史原文逐份经过实际模块对照固定旧SDK返回hash及既有领域回放/fixtures结构审计                                       | 通过   |
| AC-07 | 两profile无token/字符串/provider、原统一协议编码与非法值/凭据外送/多请求/外部plain/低层原始参数回归                     | 通过   |
| AC-08 | eapi读写/weapi订阅与时间线的provider及完整正文取消/总期限、迟到无发送、部分正文失败不重放、SDK/HTTP不同账号输入结果隔离 | 通过   |
| AC-09 | 生成/check/发现、全手工definition与固定fake消费者搜索、Node/Bun当前同包370分支实际执行                                  | 通过   |
| AC-10 | ADR/架构/公开API/使用说明/major changeset，协议和身份保持，无Schema或低层createRequest重写                              | 通过   |
| AC-11 | 真实原生red/green与修复记录、suites登记、全58项/本票10项有效关联mutation                                                | 通过   |
| AC-12 | 六项同候选门禁、原生JUnit/713包文件hash/500样本/锁与源码hash；独立规范轴PASS、需求轴PASS                                | 通过   |
| AC-13 | 离线与授权边界核对；提交/推送/关票及一个后继的实际回执由closeout.json与链state.json记录                                 | 待收尾 |

## 独立审查与授权收尾

review_113未参与实现，直接读原始需求、矩阵、完整base...HEAD/cached/worktree diff、12份非忽略untracked原文和原始门禁/包/500负载/变异证据。审查包在final-2/review-inputs.json、review-*.diff、review-untracked.json与final-evidence.json。初轮两项P2样本缺口、一项P3来源文字均已修复并复核关闭，初轮报告保留；最终审查已读取本轮完整原始证据，规范轴PASS、需求轴PASS（实现与离线验收），无未解决actionable finding。原文为.artifacts/testing/issue-113/review-final.md。58项mutation每份原始JUnit/日志/编译输出、10组非空green基线、713包成员hash与同包消费者、500负载样本及当前源码/锁指纹均经独立核对。AC-13提交/普通push/远端读回/关票与一个后继保持为审查后的授权收尾，不伪称已提前执行。

本次用户已明确授权验收和审查通过后提交本票、普通推送feature/refactor、completed关闭#113及实际创建一个满足前置的后继聊天；未授权真实上游/账号/发布/合并/部署。收尾回执在.artifacts/testing/issue-113/closeout.json与.artifacts/testing/auto-ticket-chain/hana-80-2026-11-08/state.json；testedHead与本记录指纹保持提交前原值，不改称提交后重跑。

## 过程与历史记录

# #113 当次验收

当前状态：修复独立审查发现后，final-2最终候选门禁运行中，尚未完成独立审查和授权收尾。本次起点feature/refactor / fa40cad6b56b9fcb4b666a80bb84c4b487551919，工作区初始干净，未切分支/reset/创建worktree。需求见[验收矩阵](../issue-113.md)，原始issue/父合同与更新正文保存在.artifacts/testing/issue-113/。

## 实施和证据边界

67模块声明71动作，44模块复用weapiPc、23模块复用eapi，无新profile/执行器。全部cache=none；写入never、可能有状态的推荐读取保守never，广播收藏列表和DIFM已收藏频道列表保留旧URI误判write时的never上限。普通配置覆盖收口以major changeset说明，输入/返回Schema/Promise/Cookie保持。voice_upload归#115，P12未提前实施。

固定迁移前源码已逐份保存并记录hash，完整生成client编排至严格fake后，独立解密366个有效请求分支；155份历史原文另经旧SDK逐份回放，捕获公开返回hash。原录制及metadata未修改；65模块有录制，voice_delete/voicelist_trans没有，四个工作台未录到成功的策略场景用合成成功，不推测Schema。测试与源码均离线，未访问真实上游/账号；旧授权/凭据未继承。live不适用且未运行，soak按需手动且未运行。

## red/green及修复记录

- baseline-wire初轮把dj_program的asc=null当成可发送输入，但原decoder在本地400拒绝；第二轮遇到user_dj的空串limit同样本地400。保留baseline-wire.*和baseline-wire-2.*失败日志，移入明确的本地拒绝用例；第三轮366个有效请求捕获成功。它们属于调查脚本修正，不冒称产品行为red。
- red-wire：732通过、374失败、零skip；366个生成client冲突配置场景和8个重试政策场景以原生断言发现迁移前未收口行为。真实runner的逐文件日志/JUnit位置见同名stdout中的report。
- 首次迁移后green-domain-1：1106/0/0；补充provider/完整正文取消期限、部分正文失败、本地输入拒绝、动态路径/具名/dynamic和A/B快照后green-domain-2：1135/0/0；HTTP不同账号/输入/结果及Cookie优先级加入后green-domain-3/4：1137/0/0。
- 核对旧requestSemantic时发现dj_difm_subscribe_channels_get的subscribe目录也使旧策略禁止重试；red-difm-policy：1136通过、1原生断言失败；产品声明改为read/never后green-domain-4恢复1137/0/0。新增同判定定向变异，最终全量执行时复验。
- typecheck-initial失败TS2367，移除本地拒绝测试从旧模板残留的500比较后typecheck-2通过。lint-1零warning/error通过；spell-1发现编码URL字串和请求证据中的两个拼写问题，改用encodeURIComponent与中文说明后spell-2通过。未降低规则/添加忽略。
- 首轮8项领域mutation有效killed；修正DIFM列表策略后已新增第9项，首轮不能替代最终全量同候选结果。

所有真实步骤命令数组、时间、退出码、前后指纹与stdout/stderr在.artifacts/testing/issue-113/<name>.json及对应日志；失败轮次保留。阶段性结果不代替最终候选。

| 步骤               | 命令                                                   | 退出码 | 元数据/原始日志前缀                               |
| ------------------ | ------------------------------------------------------ | ------ | ------------------------------------------------- |
| red-wire           | `bun scripts/test.mts podcast-video`                   | 1      | `.artifacts/testing/issue-113/red-wire`           |
| generate           | `bun run types:modules:generate`                       | 0      | `.artifacts/testing/issue-113/generate`           |
| green-domain-1     | `bun scripts/test.mts podcast-video`                   | 0      | `.artifacts/testing/issue-113/green-domain-1`     |
| green-domain-2     | `bun scripts/test.mts podcast-video`                   | 0      | `.artifacts/testing/issue-113/green-domain-2`     |
| typecheck-initial  | `bun run typecheck`                                    | 1      | `.artifacts/testing/issue-113/typecheck-initial`  |
| format-1           | `bun run fmt`                                          | 0      | `.artifacts/testing/issue-113/format-1`           |
| typecheck-2        | `bun run typecheck`                                    | 0      | `.artifacts/testing/issue-113/typecheck-2`        |
| lint-1             | `bun run lint`                                         | 0      | `.artifacts/testing/issue-113/lint-1`             |
| spell-1            | `bun run spell`                                        | 1      | `.artifacts/testing/issue-113/spell-1`            |
| format-2           | `bun run fmt`                                          | 0      | `.artifacts/testing/issue-113/format-2`           |
| spell-2            | `bun run spell`                                        | 0      | `.artifacts/testing/issue-113/spell-2`            |
| green-domain-3     | `bun scripts/test.mts podcast-video`                   | 0      | `.artifacts/testing/issue-113/green-domain-3`     |
| mutation-content-1 | `bun scripts/mutation-test.mts --target podcast-video` | 0      | `.artifacts/testing/issue-113/mutation-content-1` |
| red-difm-policy    | `bun scripts/test.mts podcast-video`                   | 1      | `.artifacts/testing/issue-113/red-difm-policy`    |
| format-3           | `bun run fmt`                                          | 0      | `.artifacts/testing/issue-113/format-3`           |
| green-domain-4     | `bun scripts/test.mts podcast-video`                   | 0      | `.artifacts/testing/issue-113/green-domain-4`     |

## 冻结候选

本轮六项串行门禁及候选fingerprint在.artifacts/testing/issue-113/final-0/，每条sink先清空；保存实际命令/起止时间/退出码/源码与锁hash，任何失败保持未完成。待门禁结束后汇总原始JUnit、tarball和500loopback、mutation，并安排未参与实现者双轴审查。所有本票改动尚未提交、推送或关票；接力在完整交付后才创建后继。

## 独立审查发现与候选失效

review_113未参与实现，初轮完整diff/12份未跟踪文件和原始日志审查发现两项P2：video_detail_info只有缺省vid的最终请求样本；mlog_music_rcmd/default预填可选mvid。原文在.artifacts/testing/issue-113/review-final-0.md。final-0六项门禁虽全通过，因AC-03/04证据缺口不能完成；全部原始日志/JUnit/57变异保留，不作为最终验收。

已从固定fa40cad6的普通git archive副本（不是worktree）运行完整旧SDK，重新独立解密370分支：新增合法vid字符串/数字/布尔/null，mlog推荐默认只传必要songid，真正省略mvid。155份原响应也由旧SDK重新执行，保留原文hash，更新实际query对照。新增资源ID转发丢失变异，领域10项、全量58项；同包消费者预期各1110请求/370provider。green-review-fixes实际1145/0/0，矩阵67行六列、370分支名唯一。

新候选在.artifacts/testing/issue-113/final-1/重新冻结，六项门禁重新串行执行；初轮绿灯不沿用。原始捕获命令/时间/退出码/日志在baseline-extended.json与baseline-extended-replays.json；产品源码无额外行为修改。

独立审查另指出请求证据旁置文档仍把最终370分支指向初轮366的日志，已明确初轮与最终archive/捕获日志。final-1因此候选失效并中止在verify，停止回执见final-1/stopped.json；原有modules-check通过与被中止verify不计最终通过。全部门禁改在final-2重新冻结执行。
