# #115 当次执行记录

当前状态：最终候选七项门禁全部通过，独立规范轴/需求轴均PASS，无未解决阻断项；授权内提交、推送、关票和后继聊天的实际回执另记在closeout.json与链state.json。

来源、范围、授权及AC见[验收矩阵](../issue-115.md)。起点为feature/refactor / ea108c87a45cd8c0546949ab4d08d2d22aa74100，origin同提交、工作区干净；原生前置#106已closed。源码固定副本由git archive取得，不创建worktree，未访问真实上游/账号或执行发布。

## 已完成的实施与证据

- 13模块声明30动作，inner_version/login_qr_create空集；生成器/真实HTTP loader均读取同一声明，pending为空。新增clientlogOsx及6个plain profile，保留既有weapiPc/eapi；没有第二执行器或模块修改Call。
- plain动作固定方法和响应模式，最终URL受profile域名、规范路径及原NOS允许后缀/桶目录校验。API业务头保留，普通协议/身份覆盖收口按major记录；低层createRequest不变，P12旧控制面删除未提前实施。
- 固定旧SDK完整编排55个输入分支，包含multipart字符串和有效WAV标签；独立解码API、核对plain原始字节与头。来源与限制见special-chains.request-evidence.md；阶段正文保存在special-chains.json，原源码hash另存baseline-source-hashes.json。
- 历史可用全集23份、7个模块，全部逐份通过旧/新模块回放；原文件/hash/metadata不变。原SDK包装、合成前置、合成凭证及本地二维码边界逐份记录。其余6模块无历史录制，不猜Schema、不补真实请求。
- 多请求顺序、512只执行一次第二分支、所有阶段失败停止/部分完成、每个阶段provider和完整正文的取消/期限、总期限不重置、provider迟到不续发、固定字符串第二次API限制、外部plain零会话/token、A/B账号/输入/token/结果冻结、0字节/10MiB分片及ETag顺序、TTL下不合并/缓存均有当前专项断言。
- 全部手工装配已搜索，实际上传模块装配同步actions，负载fake同步加密目标并独立解码。通用低层/协议probe继续沿原链，没有改换pending模块或放宽严格ledger。

## 原生red与修复历史

所有命令回执均在`.artifacts/testing/issue-115/`，包含命令数组、起止时间、退出码、原始stdout/stderr和前后指纹。

| 记录                             | 实际结果与边界                                                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| red-wire                         | 初次Bun路径过滤未选中测试，属于无效运行，不算red                                                                    |
| red-wire-1                       | 固定旧源码上的新配置收口断言失败，原生JUnit的AssertionError显示旧模块接受冲突配置导致400，期待为原请求成功；有效red |
| baseline-wire至baseline-wire-6   | 完整旧编排取证；第3轮新增HTTP字符串分支时脚本预期计数未同步而失败，修正后重取；第6轮为最终55分支，未改旧源码        |
| green-wire-0至green-wire-4       | 依次修正Cookie字段排列比较、合成IP不固定、HTTP multipart数字/字符串不同；保留旧输出，最终对照全部通过               |
| baseline-replays / green-replays | 23份固定旧SDK输出与当前逐份回放均通过                                                                               |
| regression-0                     | 全仓7946通过/11失败；失败涉及旧手工装配缺actions、旧明文预期、pending计数和意图语义；未豁免                         |
| green-consumers-0                | 修复后7文件120项通过，无skip                                                                                        |
| mutation-special-0               | 补丁匹配多处，工具错误，不算killed                                                                                  |
| mutation-special-1               | 9项有效killed；1项引入未使用变量导致编译失败，invalid，不算通过                                                     |
| mutation-special-2               | 修正补丁后10项均由关联原生断言有效killed；仍以最终冻结all轮为交付证据                                               |
| green-special-3                  | 361通过/1失败；测试把规范化后仍在允许桶内的/..地址误判为逃逸，改为真实越出桶目录的地址                              |
| green-special-4                  | 最终专项362项通过，0失败/0skip，含23历史回放；完整门禁仍单独执行                                                    |

## 适用性与冻结门禁

unit/behavior/replay/transport/package/mutation适用；live不适用（本票是默认离线等价迁移，无真实上游授权，不声称上游可用）。soak按需手动，本次未请求。website变更另加docs:build。最终候选将以`.artifacts/testing/issue-115/final-3/candidate.json`记录；矩阵/源码/测试/锁均计入指纹，runs与工件排除。最终门禁串行执行，sink显式清空；任一失败或内容变化停止后续并重新冻结。

| 命令                                | 状态                                                                    |
| ----------------------------------- | ----------------------------------------------------------------------- |
| bun run types:modules:check         | PASS                                                                    |
| bun run verify                      | PASS；8063通过/0失败/0skip，lint 0 warning/0 error                      |
| bun run verify:sdk                  | PASS；SDK32通过，内部含build:check/test:sdk-contract                    |
| bun run verify:fixtures             | PASS；915扫描、765 ok、761结构验证、150预期拒绝、0失败，4项无ModuleBody |
| bun run test:load:smoke             | PASS；146通过、完整500个loopback样本、upstreamActive/inflight均0        |
| bun scripts/mutation-test.mts --all | PASS；全部83项有效killed，含本票14项                                    |
| bun run docs:build                  | PASS；单独真实执行                                                      |

## 独立双轴审查

未参与实现的review_115已直接读取来源、矩阵、完整base...HEAD/cached/worktree diff与非忽略untracked原文，最终规范轴/需求轴均PASS。生成器的临时check-tmp文件由其finally清理，审查在清理后核对候选。已直接核对最终日志/JUnit、同包Node/Bun/hash、500样本/资源及全部83个变异原生关联结果，工件为`.artifacts/testing/issue-115/review-final.md`。

## 授权收尾与后继

收尾回执保存在`.artifacts/testing/issue-115/closeout.json`及链state.json，不把验收前HEAD改称提交后重跑。仅当AC、所有适用门禁和独立审查满足TESTING后，按已授权单行type: message提交、普通推送并核对remote、completed关闭#115并读回；然后清洁检出/停止本票进程，按原生依赖和锁去重，实际创建#116新聊天并观察真实进度。提交前testedHead与候选hash原样保留，不改称提交后重跑。

## 独立审查修复轮

review_115发现两个具体问题：动态plain query触发旧URI误判时，新connect声明会扩大重试；HTTP排除谓词还错误排除了cloud_import的普通md5业务输入。final-0在modules-check通过、verify运行中被明确中止，interrupted.json与原始日志保留，后续门禁未执行，不能计为通过。

red-dynamic-retry在当前候选上产生两个原生AssertionError；随后audio_match/related_playlist明确收紧为never，AC/major/ADR/公开说明同步，不宣称所有输入的错误次数等价，固定songLookup仍connect。HTTP排除只匹配实际songFile.md5，cloud_import/explicit执行真实loader。新增两个定向mutation。green-special-5当前365项通过、0失败/0skip。最终全部门禁重新从final-1串行执行。

final-1在生成检查期间中止：reviewer指出动作/阶段表有四格仍写connect，按矩阵计入指纹规则修正并重新冻结为final-2。中止的生成器自有临时文件已按其精确files清单清理，未删除用户文件。

final-2已通过modules-check、verify（8060/0/0）、verify:sdk（32/0/0）、fixtures与500样本smoke后，在mutation阶段中止：补齐图片/歌曲NOS非JSON成功响应消费证据。原实现已用bytes，但旧JSON成功样本不能发现误改json的错误；新增avatar/cover/cloud三个最终transport窄例和image/song两个变异，不把旧轮当最终。下一轮final-3全部门禁重新串行执行。

## 最终候选与原始工件

testedHead保持`ea108c87a45cd8c0546949ab4d08d2d22aa74100`。content SHA-256：`a76604b1ec328d60f458e527c6deeffb07f8a80f1338bab7f400f2e5ab9fb1f6`；diff SHA-256：`ee095de78e18dcfa06b5c36a3973cd9559844e1d5b1136cec3218bc062e7871d`；bun.lock SHA-256：`68762384acdb3b96e20542b15eec10ea70a1d560b9b5d43f2f41966dbfb10ded`。七项命令的起止时间、退出码、原始stdout/stderr与逐步指纹在`.artifacts/testing/issue-115/final-3/gates.json`，每条exitCode=0且unchanged=true。

| 证据                  | 实际位置与结果                                                                                                                                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| local原生runner/JUnit | `/Users/nonhana/workspace/code_life/Campanula/hana-music-api/.artifacts/testing/local/1794118023177-7e349068-bcf3-42bb-a3cd-a6264759205e/summary.json`；{'pass': 8063, 'fail': 0, 'skip': 0}                                 |
| sdk原生runner/JUnit   | `/Users/nonhana/workspace/code_life/Campanula/hana-music-api/.artifacts/testing/sdk/1794118167748-8c815a2e-4bd0-486a-9e40-854402d240d4/summary.json`；{'pass': 32, 'fail': 0, 'skip': 0}                                     |
| smoke原生runner/JUnit | `/Users/nonhana/workspace/code_life/Campanula/hana-music-api/.artifacts/testing/smoke/1794118211684-0ffa9a3f-0e66-477e-9921-77941955db76/summary.json`；{'pass': 146, 'fail': 0, 'skip': 0}                                  |
| 负载原JSON            | `/Users/nonhana/workspace/code_life/Campanula/hana-music-api/.artifacts/testing/load/smoke-1794118215998.json`；500个样本，末尾资源归零，全部socket为loopback                                                                |
| 全量变异原生结果      | `/Users/nonhana/workspace/code_life/Campanula/hana-music-api/.artifacts/testing/mutation/1794118216363-61d7d613-07fa-488f-aea7-c936a3be4b40/summary.json`；83项有效killed，本票14项关联原生AssertionError，编译/非空基线正常 |
| 同包消费者与文件hash  | `.artifacts/testing/package/b2223bb3-9657-4797-b605-b7625bbc1a2f/summary.json`；Node 26.13.0/Bun 1.4.4均status200/exit0，浏览器/CSP及类型/导出边界通过                                                                       |

本轮实际tarball为`/Users/nonhana/workspace/code_life/Campanula/hana-music-api/.artifacts/testing/package/b2223bb3-9657-4797-b605-b7625bbc1a2f/hana-music-api-3.2.0.tgz`，SHA-256=`20ad6644dd663f9f8f84521b0f81acc3898260b325035b7e9dcd5a910dfe5831`；713个包文件hash保存在原报告，实际tarball及hash已复算。没有执行npm发布、Release、合并或部署。

最终本票专项为368项（345 behavior与23历史回放）；55个固定旧SDK输入分支/123最终请求对照独立于历史响应。新增三个非JSON NOS成功样本与两个模式变异补足plain bytes消费证据。collect-final工具首次将load的指纹字段误读为candidate而失败，改按原revision字段精确核对后通过；这只是排除工件的汇总工具修复，不改变原始门禁或候选。

AC-01～AC-11的决定性证据由上述同候选专项/全仓/包/负载/变异及原始回放共同覆盖；无必要外部缺项。AC-12的最终独立双轴结论在review-final.md，后续授权收尾依据实际回执判定。所有失败/中止旧轮保留，只以final-3交付。报告最后另执行fmt/spell并复核指纹。
