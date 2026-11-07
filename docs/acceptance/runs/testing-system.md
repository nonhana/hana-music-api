# 测试系统实施记录

基线：feature/refactor，fb10b0052f05627307310cb307995f77762211a4。2026-11-07 工作区干净，清单与计划一致。运行证据在 `.artifacts/testing/`，baseline 保存 101 项迁移清单、原始源码与 fixtures hash。

本轮接续已完成独立 live/mutation 和故意失败 job 上传的真实远端验收，源候选为 `2e7f3a2e9e9496acceb18299d9ba0fe8cf779fb2405e0a9ab5bc2337a99a50cc`，实现提交 `16e6ad8`。下表与最终逐项结论为接续状态，各切片正文保留当时命令与历史失败；当前完整证据见 [独立专项与失败上传补验收](testing-system-ci.md#独立专项与失败上传补验收)。

| 切片    | 状态                       | 证据与剩余事项                                                                                 |
| ------- | -------------------------- | ---------------------------------------------------------------------------------------------- |
| S1      | 本地及 PR CI 通过          | 当前完整 verify 已在 PR 119 实际运行，3532 pass；其余历史结果保留                              |
| S2      | 本地通过                   | 79 个相关测试、完整 verify 与 smoke 通过                                                       |
| S3      | 本地通过                   | 3443 个回归、SDK、smoke 和十分钟 soak 通过                                                     |
| S4      | 本地通过                   | 全部 Verification 通过，103 个专项、3480 个回归、smoke 与十分钟 soak                           |
| S5      | 本地通过                   | 53 文件代码与断言保持，2710 个相关用例、完整 verify 和 fixtures 审计通过                       |
| S6      | 本地通过                   | 34 个原测试与 3 个类型文件归位，完整门禁与同包 Node/Bun 消费者通过                             |
| S7      | 本地通过                   | 最终 8 个 CLI 控制样本（S11 补充第八项）、5 个有效变异被预期断言发现                           |
| S8      | 本地及 E1 通过             | 同一最终候选登录专项 1 pass、写专项 1 pass，目标恢复 confirmed；见 E1 接续记录                 |
| S9      | 本地与远端验收通过         | PR/正常手动 verify、独立 live/mutation、完整 soak 成功；真实失败 job 保留 failure 且上传成功   |
| S10     | 本地通过                   | 三输入五条核心 AC/门禁等价，九场景独立演练及修订复验通过                                       |
| S11     | 同源候选门禁与外部验收通过 | 本地及远端完整门禁、E1 同字节包关联、101 项映射与独立审查；未合并                              |
| E1      | 通过                       | 当次账号、token、单目标与授权齐备；收藏/取消各一次，真实读回确认恢复                           |
| 远端 CI | 验收通过                   | PR 完整门禁、同提交独立 live/mutation、完整 soak、失败 artifact 下载和 90 天 metadata 均已核对 |

red：`bun test tests/unit/testing/runner.test.ts` 在 runner 未实现时因缺模块失败，日志 baseline/s1-red.log；故障样本随后分别命中失败路径，不能将工具导入失败当作故障检测通过。

## S1 结果

候选内容 SHA-256：`6d5c6d2399fc8b0cc18a07f16a4f2281cb8814e9258b14f53eb4ec23b8af3003`，testedHead 为基线 HEAD。以下命令串行执行，退出码均为 0：

| 命令                                       | 结果                                                                   | 日志（相对 .artifacts/testing） |
| ------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------- |
| bun test tests/unit/testing/runner.test.ts | 10 pass，0 fail；各故障检查失败原因                                    | baseline/s1-green.log           |
| bun run verify                             | 3422 pass、0 fail、0 skip；typecheck/lint/spell/fmt/docs 通过          | baseline/s1-verify.log          |
| bun run verify:sdk                         | SDK 32 pass；构建、包检查及所有余下门禁通过                            | baseline/s1-verify-sdk.log      |
| bun run verify:fixtures                    | 761 validated，0 failures；既有 4 份无 ModuleBody 录制不在结构审计范围 | baseline/s1-fixtures.log        |
| bun run test:load:smoke                    | 专项 75 pass；500 次请求；upstreamActive=0、inflight=0                 | baseline/s1-smoke.log           |

初次合并进程运行发现 HTTP 测试读到其他测试的全局匿名状态；独立文件通过。已按计划的旧测试隔离要求改为逐文件串行子进程，并加入跨文件污染 red/green。没有改弱原断言。首次失败的 JUnit 留在 local/1793987427335-43cb4c8c-4855-4485-9726-61099e972f89；后续通过报告分别为 local/1793987580006-cfbb5df7-7deb-489b-978b-3c37fd311ce0、sdk 集合与 smoke 集合。每份 summary.json 记录完整实际子命令和候选。

CI 已在现有 SDK/fixtures/smoke 前添加完整 verify，always 上传证据；固定 Bun 1.4.4，Node 24 保持。没有触发远端操作。load.yml 已同步新报告位置。源码与 fixtures 暂未迁移。

## S2 结果

候选内容 SHA-256：`26e9c7daeb6e66414a066bd61b8764e02f701f31505b5c4d33faab6735b53b13`。

- `bun test tests/unit/testing/upstream.test.ts tests/contract/playlist-subscribe.test.ts tests/contract/module-runtime.test.ts tests/unit/request.test.ts`：79 pass、0 fail，日志 baseline/s2-targeted.log。
- `bun run verify`：3438 pass、0 fail、0 skip；全部余下门禁通过，日志 baseline/s2-verify.log。初次运行在运行记录的格式检查失败，修正 Markdown 格式后重跑完整命令通过；没有减少门禁。
- `bun run test:load:smoke`：专项通过及实际 500 次请求，资源归零；日志 baseline/s2-smoke.log。

三个直接消费者分别为公开 playlistSubscribe、公开共享 search 读取、低层 createRequest。独立 ledger 能保留被产品映射为 502 的 fake 断言；未知请求、错误方法、额外发送、未消费期待、忽略取消、清理失败均有控制样本。固定 double-AES 向量不调用产品请求构造或 profile。Request/init 覆盖与原始 body 复制、多个 Set-Cookie、原始文本与受控流均有证据。

默认 runner 预加载 offline 防护；为保持中间状态可运行，提前给现有 fake loopback 与 server-traffic 注册本次端口，S4 迁移时继续承接。Node 代理消费者也在启动时安装防护；Node 原生 fetch 与实际 Undici 默认 dispatcher 由独立子进程探针验证。Bun 的 undici.fetch 是原生实现，此探针不被描述为操作系统网络沙箱。

## S3 已验证部分

候选内容 SHA-256：`9b37394bab602e9c4fed80ae2f2eecc0d30c591bed15d7b4447ce3f794318760`。内部 execution 已进入现有 Call 链；runCall 显式 Clock 优先，公开 fetcher 优先，实际 fetcher 继续参与读取键。HTTP 走真实 loader 和实例 execution，没有全局 fetch spy；收藏解码场景没有 Math.random spy。

生成器产出独立 client-factory.generated.ts；公开工厂、收藏受控装配、共享读取受控装配是三个真实消费者。根导出 denylist 和负向类型检查守住内部入口。testEntropy 与阶段同步分别在收藏、HTTP、共享读取文件使用；HTTP 的单一调用装配步骤留在文件内，没有预建空 http harness。

| 命令                           | 当前结果                                     | 日志（相对 .artifacts/testing） |
| ------------------------------ | -------------------------------------------- | ------------------------------- |
| bun run types:modules:generate | 通过，生成 352 个模块及内部工厂              | baseline/s3-generate.log        |
| 四个迁移文件的 bun test        | 44 pass，0 fail                              | baseline/s3-targeted.log        |
| bun run verify                 | 3443 pass、0 fail、0 skip，全部后续门禁通过  | baseline/s3-verify-1.log        |
| bun run verify:sdk             | SDK 32 pass，全部包和静态门禁通过            | baseline/s3-verify-sdk-1.log    |
| bun run test:load:smoke        | 80 pass，实际 500 次请求，资源归零           | baseline/s3-smoke-1.log         |
| bun run test:load:soak         | 通过：30201 次请求，资源归零，RSS 增长 16.5% | baseline/s3-soak-1.log          |

red/green：内部 fetcher 尚未接入时，测试发送数为 0，默认网络被 offline guard 拦截；接入同一请求链后发送数为 1、响应 200，日志 baseline/s3-red.log 与 s3-core-green.log。新增虚拟时钟覆盖 token 总期限及迟到结果、不同实例的 TTL、独立等待者与最后等待者取消、显式 Clock 优先；两种熵用独立解码核对。阶段未发生但调用提前结束时直接失败。

迁移证据 baseline/s3-title-mapping.json 对照 S1 的原生 JUnit：原 module-runtime 16 个用例迁入后全部出现，原 playlist-subscribe 22 个用例在三个目标中全部出现；新增用例另计。五个录制场景、发送次数与完整身份断言均保留。917 份原始录制及 gzip 的 hash 未变。ADR-0002 记录内部装配边界。

S3 soak 最终退出码 0，完整十分钟，p95 56.44ms，upstreamActive=0、inflight=0，RSS 尾部增长 0.16499，failures=[]，候选指纹保持 9b37394b…。原始报告 `.artifacts/testing/load/soak-1793989555360.json`，日志 baseline/s3-soak-1.log。S3 全部本地 Verification 通过。

## S4 已验证部分

候选内容 SHA-256：`4d11c9f89dfed971610464d6512ad985b330f31d4b1eb7792d5928ed726b0780`。八个原文件及 Node 代理消费者已迁移，server-traffic 与 upload-traffic 分别拆开真实监听/进程内语义和模块/HTTP 入口，原用例标题逐项出现，见 baseline/s4-title-mapping.json（load 原用例取 S1 smoke 的原生 JUnit 对照）。普通回归现已纳入原 load 的有限场景及负载判定规则。

| 命令                                     | 当前结果                                    | 日志（相对 .artifacts/testing） |
| ---------------------------------------- | ------------------------------------------- | ------------------------------- |
| bun run build                            | 通过                                        | baseline/s4-build-2.log         |
| 计划所列上传/HTTP/代理/负载规则 bun test | 103 pass，0 fail                            | baseline/s4-targeted-3.log      |
| bun run verify                           | 3480 pass、0 fail、0 skip，全部后续门禁通过 | baseline/s4-verify-3.log        |
| bun run test:load:smoke                  | 有限专项通过，500 次请求、资源归零          | baseline/s4-smoke-2.log         |
| bun run test:load:soak                   | 通过：完整十分钟、资源归零                  | baseline/s4-soak-1.log          |

真实公开 voiceUpload 已覆盖完整六阶段、六个失败点、取消后零后续发送、双实例账号与 token 隔离。原能力级 XML/阶段合同继续保留，不称作 transport 证据；真实 NOS plain 错误的公开 partial body 按既有合同只保留 partialCompletion/completedStages，API JSON 错误另外精确断言原错误字段，没有修改响应处理来迁就测试。

strict loopback 从旧 helper 原子移动，已删除未知路由通用成功，按完整逻辑 URL/方法注册，并复用 scenario 的匹配和独立 ledger；sent 同时保留逻辑上游和物理 loopback socket，负载报告保存去重目标和实际发送数。未知路径原先获得成功的 red 见 baseline/s4-red.log，修正后可在 stop 中发现被产品映射的失败。默认网络适配器经过真实 socket 的慢 headers/body、断流、重定向和取消；finally 停止监听、reader、连接与任务。Bun 自动资源清理的控制样本证明原始业务失败与清理 ledger 失败同时保留。Node 代理继续保留绝对 URI/CONNECT 实现、慢正文、取消及无直连回退检查。

验证过程的失败均未降低检查强度：首轮新增公开上传测试对 plain 错误套用了 JSON 字段预期，随后按既有公开合同改为精确形状；原能力级细节断言保留。第一次完整 verify 在新增编码路径片段的拼写检查失败，改为明确解码的路径表达后重跑通过。清理改进后再次冻结候选并重跑完整 verify 与 smoke。

S4 soak 最终退出码 0：30501 次请求，p95 58.62ms，upstreamActive=0、inflight=0，RSS 尾部增长 0.0000，failures=[]；指纹保持 4d11c9f8…，原始报告 `.artifacts/testing/load/soak-1793991206562.json`。

## S5 结果

候选内容 SHA-256：`cafd2e22448d57d9029bded208e68b66423090a114b8043dfff0e8a50da56216`。计划中的 53 个文件全部迁移，保持文件粒度；纯 Schema 规则进入 unit/schema，录制与兼容响应进入 replay。没有新增产品行为，因此复用已有有效断言，没有人为制造 red。

- `bun test tests/replay tests/unit/schema`：2710 pass、0 fail，日志 baseline/s5-targeted.log。
- `bun run verify:fixtures`：761 validated、0 failures，原有 4 份无 ModuleBody 样本仍如实单列，日志 baseline/s5-fixtures.log。
- `bun run verify`：3480 pass、0 fail、0 skip，typecheck/lint/spell/fmt/docs 全部通过，日志 baseline/s5-verify-1.log。
- baseline/s5-source-comparison.json：53 对文件统一模块路径后，运行时代码逐字相同，既有断言均保留。
- baseline/s5-title-mapping.json：53 个原文件的每个测试标题在新目录的原生 JUnit 出现。
- baseline/s5-fixture-comparison.json：917 份原始录制与 gzip 的 hash 全部保持。

API_CONVENTIONS、测试导航和 schema skill 已更新路径，明确响应回放、真实录制、人工数据与请求证据的边界；允许独立 request-evidence.md 旁置元数据，缺少的请求事实写 unknown，不回填成 web 验证。原始样本正文/context 未动。schema skill 中的两处历史“本票已获许可”已删除，提前落实 S10 的授权维护要求。

## S6 结果

候选内容 SHA-256：`97a8ae23a6c205fca5ebb2c79c85d6432e3e500109e2cc7920bf764aebf710fc`。剩余 34 个测试与 3 个类型文件迁移完成；suites 登记唯一归属，三个 typecheck 文件继续被 tsc 检查。旧 unit/contract/integration 的每项原测试标题都已在迁移后的 JUnit 找到承接，S6 对照为 baseline/s6-title-mapping.json；34 个未增强的源码文件按真实路径统一后运行时代码一致，见 baseline/s6-source-comparison.json。包消费者、S2 新增低层请求场景和 S3 新增负向类型断言单独保留并审查。

| 命令                      | 结果                                          | 日志（相对 .artifacts/testing） |
| ------------------------- | --------------------------------------------- | ------------------------------- |
| bun run verify            | 3480 pass、0 fail、0 skip，全部门禁通过       | baseline/s6-verify-3.log        |
| bun run verify:sdk        | SDK 32 pass，全部包与静态门禁通过             | baseline/s6-verify-sdk-1.log    |
| bun run test:sdk-contract | 32 pass、0 fail、0 skip                       | baseline/s6-sdk-contract.log    |
| bun run verify:fixtures   | 761 validated、0 failures，原有无 Body 项单列 | baseline/s6-fixtures.log        |
| bun run test:load:smoke   | 87 pass，500 次请求，资源归零                 | baseline/s6-smoke.log           |

包测试总是重新构建当前产物；同一 tarball 在 Node 26.13.0 与 Bun 1.4.4 的同一临时安装中执行公开 SDK、收藏、Standard Schema 和深层导入拒绝。严格类型消费者与单文件 serverless 零文件访问合同继续通过。tarball SHA-256 `331c2e99f1594f6390b8e57be31cbc1f6df0b70ac1b112093df3bd7f209c5cff`，包目录中的 summary.json 记录具体工件、文件内容 hash 和两个运行时结果。CI 的 Node 24 下限仍待远端实际验证。

迁移过程保留失败证据：初版路径转换误改了 fixture 字面量，包导出断言发现后改用语法节点迁移；动态 import 的模板路径由完整回归发现 17 处用例失败，修正两处共享路径后 50 个相关用例通过；新增头名称被拼写检查识别，使用协议规范大小写后重跑完整 verify 通过。没有删除失败用例或减弱断言。

915 份 JSON/gzip 数据字节保持；录制目录共有 917 个文件，另外两份为 README。playlist-summary 的 README 仅更新当前测试导航，来源文本未改；之前 S3/S5 的“917 份”指整个目录文件校验。其余工具搬迁按 S11 执行。

## S7 结果

`bun test tests/unit/testing/mutation.test.ts` 的 7 个真实子进程控制样本通过，覆盖 killed、survived、invalid、timeout、tool-error、无关断言失败与 dry-run；日志 baseline/s7-controls-2.log。`bun run verify`：3487 pass、0 fail、0 skip，全部静态及文档门禁通过，日志 baseline/s7-verify-1.log。

`bun scripts/mutation-test.mts --all`：五个登记变异全部 killed，分别命中收藏地址、正文 token、web os、最后等待者取消、上传预检失败后的禁止提交断言；报告 mutation/1793993299920-46480bf6-f32b-47c5-a694-66c66225b660/summary.json。每个故障先通过编译，再由登记断言发现，未将无关失败或工具异常算作 kill。原工作区指纹保持不变，临时副本已清理。候选内容 SHA-256：`3b741aef7ebc148d2b32dff2b4a3c7b3d47870e79c15e5dc5f90bee826ff801a`。

首次控制演练因隔离项目缺少 allowImportingTsExtensions 被判为编译无效，修正测试项目后通过；runner 增加 baseline 类型检查，避免既有类型错误误算成目标 kill。dry-run 已实际运行，只核对基线与补丁范围。

## S8 结果

候选 SHA-256：`e6c013c1caa4ea50ab2e9407daae1ca1bc5ab3da27bf23c4b18090a74a0b3767`。`bun test tests/unit/testing/live-runner.test.ts`：15 pass；录制 CLI 与 live 合并专项 35 pass（此前为 12 个 live 控制样本加 23 个录制样本）；日志 baseline/s8-controls-6.log、s8-controls-5.log。`bun run verify`：3502 pass、0 fail、0 skip，全部门禁通过（baseline/s8-verify-2.log）；`bun run verify:sdk`：32 pass，完整命令通过（baseline/s8-verify-sdk-1.log）。

`LIVE_UPSTREAM=1 HANA_LIVE_SUITE=anonymous bun run test:live`：2 pass、0 fail、0 skip，真实请求 6 次，包含匿名初始化，无重试，无替换 fetcher。搜索得出的 ID 用于详情和歌词；榜单/歌手读取保持业务对应断言。报告 live/1793994108364-9bfdcf94-3dab-496a-9c68-40f6e78ece93/summary.json 与原生 JUnit；地区 unknown，时间、运行时和精确 URL 在报告。tarball SHA-256：`dce8377541abaf5b7c6ec55d70f07f3efd3bf586cf8f5bdac52c03a0f6b9312b`，与本候选 Node/Bun 消费者使用的同包一致。

旧 live 的搜索、详情、歌词合为一个完整场景，榜单和歌手合为 catalog，登录状态改为真实 data.account/profile 身份断言，另外增加独立可逆写入。普通回归不再登记旧 live 文件；无 gate 显式调用非零且零网络。严格控制测试覆盖账号来源冲突、身份错误、12/30 次实际请求预算、初始化计数、五页上限、初始已收藏/本人歌单、失败后停止、写入各一次、token 同值且取消不取、六次保留恢复额度和未确认恢复失败。

录制/live/证据共用脱敏，录制的故障开关只由录制 CLI 显式传入，不影响其他消费者。Bun reporter 的 cause 仅保存脱敏摘要，原始凭据与上游异常正文不进入 reporter。首次控制测试发现测试本身把 api 域名、表单编码和 token 头写错；按真实协议修正，独立严格 ledger 保留了这些失败，没有改产品。第一次 verify 在协议头拼写检查失败，修正大小写后重跑完整命令通过。

E1 未执行且阻塞：用户尚未提供本次账号、期望身份、fresh token、单一目标和写入/恢复授权。没有读取历史票据或执行真实账号操作。

## S9 结果

候选 SHA-256：`70069abdfc7b583309fce67a1fbddd77260fc4cb26242155fc29774f34f02fbf`。`bun scripts/release-preflight.mts` 退出 0，本身没有发布：verify 3513 pass/0 fail/0 skip；SDK 32 pass；fixtures 761 validated/0 failures；smoke 87 pass 加 500 次请求；完整十分钟 soak 30201 请求、failures=[]，资源归零；五个变异均 killed；匿名 live 2 pass、6 次实际请求。最终 npm dry-run 的包文件集合、各文件内容、tarball 与源码指纹均保持。报告 preflight/1793994256288-f1d0cc08-e414-48ef-a97f-00399cb0c9ce/summary.json，step-1 至 step-7 保留实际命令输出；包 SHA-256 `dce8377541abaf5b7c6ec55d70f07f3efd3bf586cf8f5bdac52c03a0f6b9312b`；原始 soak 为 load/soak-1793995030795.json。

`bun test tests/behavior/tooling/release-preflight.test.ts`：11 pass，原生 JUnit baseline/s9-controls.xml。通过临时 PATH 真实子进程分别令七个门禁失败、改变 dist、增加 dist 文件、改变源码；每条失败路径的 release 调用为 0。正例执行所有门禁和 manifest 复核后才到隔离发布探针。这里的发布是隔离探针，未运行仓库真实 release。初轮所有控制样本已经通过，负向控制中的门禁失败为实际 red，未人为破坏产品制造 red；日志 s9-controls-1/2.log。

六份 workflow 已实际解析并核对命令 shell 语法、Bun pin、always 上传和权限，证据 baseline/s9-workflow-review.json。普通 PR 保留完整 verify/SDK/fixtures/smoke；live 日 05:40 UTC、mutation 周一 06:30 UTC、load 每日/手动独立执行。PR 无账号 Secrets，登录/写仍只允许本机当次授权。检查输出 tee 保存；最终审查发现默认 shell 未保留管道失败，已在 S11 显式修正并验证，S9 配置记录不能视为该失败路径已通过；即使构建在 JUnit 前失败也保留日志。PR 证据 30 天、候选 90 天。

release-rehearsal 的版本条件保持，版本后重建/包验证；手动再跑同包匿名。Changesets version-script 未变，publish-script 由 release:checked 包脚本执行 preflight && release（S11 已按 Action 的真实命令语义修正），dry-run 版本后只执行 preflight。远端 CI 仍阻塞：没有获准推送、创建/修改 PR 或触发远端；本地 YAML/探针不冒称实际 CI、失败上传或保护规则已验证。

## S10 结果

仓库 skill 位于 `.agents/skills/hana-implement/SKILL.md`，review 与 input-cases 引用均存在；YAML 元数据 保留计划要求的 disable-model-invocation=true，Codex agents/openai.yaml 同时设置 allow_implicit_invocation=false。AGENTS 提供显式选用导航，全局 skill 未改。TESTING 仍是唯一门禁权威。

三个独立执行者只接收一种原始输入、skill 和必要来源，不读取 examples 预期或其他输出。ticket 实时只读 #105/#80，plan 完整读 269 行等价原文，prompt 完整读相同需求；均保留 P1 五条核心 AC 与父约束，当前路径映射及 verify/SDK/fixtures/smoke/soak/对应 mutation/独立审查一致，没有强制开票或扩大到父票其他切片。六项边界演练分别为只计划、缺 E1 条件、未提交实现、既有用户草稿、纯文档、明确提交授权；都作出预期决策。

实际产物：skill/ticket/{requirement-matrix,gates,case-2-plan-only,case-3-commit-authorized,recheck}.md；skill/plan/{result,fixture-review-package,recheck}.md 与 fixture-evidence.json；skill/prompt/{report,recheck}.md 与 checks.json；对照为 skill/comparison.json。控制项目实际读取 base...HEAD、cached、worktree、untracked 四类原文，四个任务文件和一个用户草稿全部保留，index/status/hash 前后一致。执行者没有产品测试、生成、提交、账号或远端写操作；控制项目初始化是隔离测试数据，不是主仓库提交。

首轮歧义驱动窄修订：计划明确结束、既有实现先核验、父其他切片不扩范围、完整状态集、纯文档裁剪、限定文件/演练输出、空 diff 不冒充新实现或制造空提交、审查包不冒充代码审查、关键 mutation 缺对应故障则补有限登记。三个执行者重新处理原请求，五条 AC/门禁/授权结论不变，无阻止决策的剩余歧义。最终 skill SHA-256：`32990c5fff7632304cbef6e08d28cc2dfc263029832048b5abd9db42f95985e6`。

`bun run fmt:check`、`bun run spell` 通过（baseline/s10-fmt-3.log、s10-spell-3.log）；显式检查隐藏目录的新 skill 4 文件与原 schema skill/6 workflow 拼写通过，四个 skill 文件格式与五个相对链接均通过。原 quick_validate 不支持计划必需的 disable-model-invocation 字段，actual 拒绝保留在 s10-validate.log；保留该字段，单独结构化验证实际元数据与 Codex 策略，在隔离副本仅移除此已验证字段后 quick_validate 通过（s10-structure.json）。这说明工具白名单不兼容，不伪报原校验器通过，也没有删除计划字段。宿主缺 PyYAML 时仅使用 artifacts 内 隔离 Python 环境，没有修改全局工具。

## S11 实现与审查

剩余三个 helper 已原子迁入 _kit/module、upload、artifacts；静态上传数据拆入 fixtures/synthetic/upload，所有实际 import 同步，无旧路径 shim，旧 contract/integration/load 空目录已删。无消费者的 load fingerprint 重导出与旧 Oxlint 路径已移除，登记表没有过渡路径。活跃 package/scripts/CI/agent-docs/skill/website 旧目录引用扫描为零。

baseline/s11-helper-comparison.json 证明三个 helper 的运行时和静态数据与原 HEAD 一致；915 份 JSON/gzip 字节无变（s11-fixture-comparison.json），唯一录制目录文档变化是 README 的导航。87 项 S5/S6 未增强文件对当前源按真实导入/路径比较：80 项运行时完全一致；7 项因统一 kit 原生 Effect 操作入口发生明确变化，列表和原文差异保存在 s11-source-comparison.json，未把它们冒称字面相同。AST 迁移统计为 s11-effect-boundary.json，同步/分叉/service 继续直接复用 Effect 原实现，调用和断言责任保留；独立审查已读具体变更和日志。

新增行为 red/green：普通 data.only 曾被误拒，空 creator.userId 曾继续读取收藏状态；baseline/s11-red.log 实际 2 fail，修复后控制 31 pass。独立审查进一步发现并复现 six workflow 管道失败被 tee 掩盖、Action 不解释 publish-script 的 &&、局部/动态 only 绕过、自动 redirect 外连、清理后才检查 socket、同 URL 逆序 body 匹配以及 kit 外旧 Effect 入口。全部在冻结前修复：

- workflow 显式 Bash，并保存输出；实际 workflow 命令 + PATH 故障探针从 6 fail 变为 6 pass（s11-ci-red/green.log）。GitHub 对默认 shell 与显式 Bash 的差异见 [官方语法](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#defaultsrun)。
- Action 实际执行程序/参数，不解释 shell 运算符；publish-script 改为 bun run release:checked，组合逻辑在 package script。测试从真实 YAML/package 取命令、按无外层 shell 的 Action 语义启动真实 Bun，正例和十个负例均通过，未实际发布；[版本对应源码](https://github.com/changesets/action/blob/v2.1.2/src/run.ts#L174-L180)。
- Bun 测试进程预加载 only 独立 ledger，保护 root/each 派生注册，局部别名/动态选择/捕获异常均不能假绿；静态扫描仍放行普通数据。带实际 preload 的正常参数化/decoder 控制 97 pass（s11-selection-compatibility.log）。
- offline 对自动 redirect 先取 manual 首跳再拒绝，未登记目标零连接，manual 的 Request/init 语义保持。strict scenario 在消费期待前匹配 body，逆序业务请求可正确对应；故障/控制原文在 review 目录。
- lifecycle 在夹具销毁前等待真实 socket close，有界 1 秒；正常 7 pass，关闭取消能力的隔离副本当前准确 3 fail（s11-socket-fault.log/XML），不靠清理制造归零。

修复相关七文件 152 pass、0 fail，2315 个实际断言；typecheck 与 deny-warnings lint 通过（s11-review-green-3、s11-types-5、s11-lint-5）。拼写发现真实 shell 选项后只按合法标识登记局部词，不降低规则；spell/fmt 最终预检通过。模块生成检查通过（s11-types-modules-final.log）。

独立规范、需求、迁移三份初审与原 FAIL 均保留，复审为 review/standards-recheck.md、requirements-recheck.md、migration.md；审查者实际读完整来源/工作区范围和原始日志，分别用离线探针复核，所有 actionable 发现已关闭。基线干净，本任务没有用户既有改动；主仓库 HEAD 未移动，没有提交或远端写操作。S9 历史通过只属于当时指纹，以下最终复验会绑定同一新候选，不拼接旧结果。E1/远端继续阻塞。

### 冻结候选后的分类补查

第一份 S11 冻结候选 c5bf9a51… 的 verify 3530、SDK 32、fixtures、smoke 87+500 已通过，97 个原非 live 文件的 3433 个旧用例逐标题均在当次 JUnit 出现；但最后一次负向审查用同一预期标题、断言前抛 Unexpected mock setup，复现 mutation 用 Expected 子串将普通错误误算 killed。实际控制为 7 pass/1 fail（s11-mutation-classification-red.log），不是产品导入失败或预期断言 kill。

因此主动停止该候选尚未结束的 soak，不计通过，也不把前四步结果用于新候选。中断 preflight 报告保留 preflight/1793997244085-ac12288e-dc3f-4e1e-9c7b-030866cb9655/summary.json，soak 非零来自本次主动中止。分类改为原生 JUnit 的 AssertionError 类型，或组合错误中明确的 Bun AssertionError: expect(received) 诊断；不再以 Expected/Received 等普通词判断。新增第八个进程控制要求这种普通错误为 invalid；有效上传故障仍由组合错误中的真实断言证明，不把 strict ledger 的 Unexpected 一词单独当断言证据。之后重新冻结并完整验证，最终结论仅使用新候选。

分类修复后 `bun test tests/unit/testing/mutation.test.ts`：8 pass、0 fail（s11-mutation-classification-green.log）；`bun scripts/mutation-test.mts --all` 五项均 killed，逐项确有 native AssertionError 或组合中的真实 Bun 断言，明细 s11-explicit-assertion-kills.json，报告 mutation/1793997810338-03d10757-0752-439d-92ca-fa7771ed9320/summary.json。types/lint-6、spell/fmt-revised 通过。规范与需求独立复审分别保存 review/mutation-standards-recheck.md、mutation-classification-recheck.md；需求审查者用自己的同标题普通错误重新运行，得到 invalid/assertionFailure=false/非零，所有新发现已关闭。下面重新冻结，旧 c5bf 门禁及桌面演练保留为历史，不与新结果拼接。

## 初次完整候选验证（历史）

当前源内容 SHA-256：`6c045a58faf755176fb964ef5016f229a278fb1d7584429da74df692e56b2f8a`。testedHead 为 `fb10b0052f05627307310cb307995f77762211a4`，分支 feature/refactor；最后现场指纹与所有当次报告一致。完整 Git 审查范围为 review/final-surface.json，含受控与 157 个非忽略未跟踪文件，staged/committed 均空，基线无用户既有改动。只排除 artifacts 与 runs 的报告内容，没有扩大排除源码。生成检查运行中的 check-tmp 文件曾使并发只读快照短暂变化，清理后回到同一指纹；最终完成态再次实际核对一致，不把瞬时快照或旧候选当最终结果。

`bun run types:modules:check` 退出 0（baseline/s11-types-modules-verified.log）。随后 `bun scripts/release-preflight.mts` 退出 0（baseline/s11-verified-preflight.log），实际串行执行：

| 实际命令                                                    | 结果                                                                                      | 原始输出                                                                          |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| bun run verify                                              | 3531 pass、0 fail、0 skip；生成、结构、构建、类型、lint、拼写、格式、文档全部通过         | preflight/1793998090754-c51b55ae-7a69-4b58-8092-39c98133d922/step-1.log 与 stderr |
| bun run verify:sdk                                          | 32 pass；build:check、包/导出/类型/Standard Schema/serverless 与 Node/Bun 同包消费通过    | 同目录 step-2.log 与 stderr                                                       |
| bun run verify:fixtures                                     | scanned 915，765 ok/150 rejected 原文；761 validated、4 无 ModuleBody 另列、0 failures    | step-3.log                                                                        |
| bun run test:load:smoke                                     | 87 pass；500 请求，upstreamActive=0、inflight=0、failures=[]                              | step-4.log 与原始 load JSON                                                       |
| bun run test:load:soak                                      | 完整 600350.85ms，30301 请求，p95 59.33ms，RSS 尾部增长 19.60%，两项资源归零，failures=[] | step-5.log 与 load/soak-1793998868682.json                                        |
| bun scripts/mutation-test.mts --all                         | 五个登记故障均 killed，均有登记标题中的真实断言证据；新分类不以普通错误词判断             | step-6.log、原生失败 JUnit、summary                                               |
| LIVE_UPSTREAM=1 HANA_LIVE_SUITE=anonymous bun run test:live | 2 pass，实际 6 请求含匿名初始化，无重试；安装后的同一 tarball，零替身，地区 unknown       | step-7.log、live 原生 JUnit/summary                                               |
| npm pack --dry-run --json --ignore-scripts（preflight 内）  | 包文件集合/内容 hash、tarball 和源指纹末尾复核一致                                        | package-manifest.json 与 preflight summary                                        |

preflight 总报告：`.artifacts/testing/preflight/1793998090754-c51b55ae-7a69-4b58-8092-39c98133d922/summary.json`。当次各子命令的 summary/JUnit/load/包路径、计数与指纹核对保存 `baseline/s11-final-evidence.json`；没有把原始 stdout 的“无错误文字”单独当退出成功证据。所有命令退出码经 preflight 检查，任何非零均不能进入后续发布；本次只执行 preflight，没有调用 release。

同包 SHA-256：`08d9446c5f1dc5d630d2bbb9879c06c399992a28fa5e7705def8acaf6af077cc`。实际运行时 Bun 1.4.4、Node v26.13.0，711 个包文件清单/hash 可审查；Node 24 的 CI 下限仍需远端真实运行，未声称遍历全部 Node/OS 版本或核对尚未发布的 registry 包。

最终逐项迁移证据：baseline/s11-final-title-mapping.json 对全部 101 原项登记，97 个原非 live 文件的 3433 个旧用例逐标题在当次原生 JUnit 出现，missing=[]；3 个类型文件仍由当前 tsc 执行。原 live 六项分别由搜索→详情→歌词完整场景、catalog、登录身份场景承接；匿名当次 2 场景通过，登录 E1 阻塞，写循环明确是新增。915 JSON/gzip hash 当前再次逐项保持，唯一 README 变动只是导航。

新 skill 的当前 hash 仍为 `32990c5fff7632304cbef6e08d28cc2dfc263029832048b5abd9db42f95985e6`。九场景在本最终候选再次由三位执行者完成，当前输出为 skill/{ticket,plan,prompt}/verified-candidate.md，五核心 AC、门禁、权限与四类 Git 内容/用户草稿保护均符合预期；对照 skill/comparison.json。演练者的产品门禁执行数为 0，不与本任务实际 preflight 的通过混淆。原 quick_validate 的字段白名单仍拒绝计划要求的 disable-model-invocation，未伪报原工具通过；实际 YAML/显式调用策略与隔离兼容结构在 baseline/s11-skill-structure-final.json 验证通过，原必需字段未删。

## 最终逐项结论

| AC    | 当前结论             | 当次决定性证据                                                                                                                       |
| ----- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| AC-01 | 本地通过             | 101 项台账、97 文件/3433 旧标题全部承接，3 类型检查；helper/source/hash 及拆分审查                                                   |
| AC-02 | 本地通过             | 3532 原生回归零失败/跳过；inventory/JUnit/only/alias/dynamic/正常 each 控制                                                          |
| AC-03 | 本地通过             | 严格匹配、逆序 body、额外/未消费请求、独立 ledger、取消与清理故障控制；redirect 零未登记连接                                         |
| AC-04 | 本地通过             | 收藏、共享读取、六阶段上传与失败后零后续发送；SDK/HTTP/replay 证据边界明确                                                           |
| AC-05 | 本地通过             | 真 loader/实例 execution；公开 root/named/invoke 与负向类型/根导出检查                                                               |
| AC-06 | 本地通过             | 身份/fetcher/Clock/期限/等待者隔离；单次写/不缓存合并重放；架构回归                                                                  |
| AC-07 | 本地通过             | 915 录制数据字节保持；replay/synthetic/request-evidence 分明；fixtures 0 failures                                                    |
| AC-08 | 本地通过             | 默认真实 socket/Node 代理；取消故障副本准确被发现；smoke/十分钟 soak 两计数归零                                                      |
| AC-09 | 本地通过             | 同 tarball Node/Bun、类型/导出/Standard Schema/serverless，无陈旧 dist                                                               |
| AC-10 | 本地通过             | 8 真实进程分类控制；五故障真正断言 killed；普通错误 invalid；原工作区无变异残留                                                      |
| AC-11 | 匿名真实通过         | 最终安装包、2 场景/6 请求、源码/包/时间/身份类别/地区齐全，无替身或历史结果                                                          |
| AC-12 | E1 真实通过          | 同一候选登录 1 pass、写专项 1 pass；七次请求、收藏/取消各一次、restoration=confirmed；见 E1 接续记录                                 |
| AC-13 | 远端验收通过         | PR 完整门禁；同提交 testing 的实际 verify/live/mutation 成功；失败 job 保持 failure 且原上传成功；完整 soak 和 90 天 metadata 已核对 |
| AC-14 | 本地通过             | 三输入同义矩阵与同门禁，无强制开票/全局依赖；完整工作区独立审查                                                                      |
| AC-15 | 本地通过             | 九场景独立演练、歧义修订和最终候选复验，隔离项目内容/index/用户草稿保持                                                              |
| AC-16 | 本地/E1/远端门禁通过 | 实施验收候选 2e7f 的 verify 3532、SDK 32、fixtures、smoke、完整 soak、mutation、匿名 live 均通过；两轴复审核对原件                   |
| AC-17 | 证据与授权边界通过   | 当前源/包/命令/JUnit 可追溯；提交、推送和 PR 操作按用户新增授权执行；未合并、发布、关票或改 Secrets/保护规则                         |

本轮同源候选的必要验收已通过，独立 live/mutation 与故意失败 job 上传两项原 BLOCKED 条件已解除。当前完整结果见 [PR CI 记录](testing-system-ci.md#独立专项与失败上传补验收) 与 [E1 记录](testing-system-e1.md)；记录提交 5ba826c 的完整 PR verify 和发布演练也已成功。故意失败 run 保持 failure，不能将它本身写成绿灯；通过的是失败能被准确报告且 artifact 仍可取得这一验收条件。

E1 所需条件已由用户本次提供或授权取得，并已验证通过；fresh token 本轮只使用一次。当前 2e7f 候选的本地 tarball 与 E1 包逐字节相同、711 项文件 hash 一致，已保存关联证据，没有重跑账号写入。随后用户新增授权提交、推送、创建 PR、跟进修复和补验收；这些动作已经执行。合并、发布、远端 Secrets、保护规则和关票均未执行。

初次完整候选的证据审查为 review/final-standards.md 与 review/final-requirements.md；本轮追加实现与真实 CI 原件的复审为 ci-acceptance/review-standards.md、review-requirements.md，历史发现和修复复核均保留。原有辅助 quick_validate 不兼容字段仍明确保留“原工具未通过”，不冒充必要门禁通过。运行记录最后另做 fmt:check/spell，报告更新不改变源/包指纹。

## E1 当次账号接续

**E1 PASS。** 用户已提供本次 Cookie 和 fresh token，并授权选择符合条件的单一目标、执行收藏及恢复。账号 UID 599663130，目标 77629049；同一最终候选正式 authenticated 集合 1 pass、写集合 1 pass。写专项实际 7 次请求，收藏和取消各发送一次、无重试；前后真实列表读回确认未收藏→已收藏→未收藏，restoration=confirmed，failures=[]。含前置调查与独立登录，本次自动化共 12 次真实请求。完整结果及原始报告位置见 [E1 接续记录](testing-system-e1.md)。

上文各切片的历史“未提供账号/授权/token”等为首次交付时状态，当前以本节和接续记录为准。E1 外部阻塞已解除；独立 CI 补验收也已取得实际证据。E1 当时没有修改候选源码、测试或配置；后续提交、推送和 PR 操作按用户新增授权执行，见下节。

## PR 119 当次远端接续

用户已授权创建 feature/refactor → master 的 PR、持续跟进 CI 并修复失败，明确先不合并。[PR 119](https://github.com/nonhana/hana-music-api/pull/119) 已创建；第一轮 head e682744 的 verify/rehearsal 全部 completed/success，默认回归 3531、SDK 32、fixtures 761 与 smoke 87+500 均实证通过，成功 artifacts 已下载核对。Netlify 预览成功，两个无相关变化检查为 NEUTRAL。没有发生实际 CI 失败，没有为获得绿灯删测试或降低规则。

具体 SHA、GitHub 测试候选、跨平台权限指纹、包 hash、预期拒绝控制报告、已完成的独立验收和后续 HEAD 的检查见 [PR CI 记录](testing-system-ci.md)。PR 保持 OPEN，自动合并关闭，未合并或发布。

## 独立远端补验收接续

当前实现提交 16e6ad8 已对同一源候选完成全部本地门禁、正常 PR、独立匿名 live/mutation、故意失败 job 上传以及本地/远端完整十分钟 soak。failure run 42347650538 的原生测试确有 1 个断言失败，job/run 均为 failure，原上传为 success，日志/JUnit/候选已下载且约 90 天；其后同提交的 testing run 42347915406 全部成功。独立 live 为安装包上的 2 场景/6 请求，mutation 三目标五故障均有登记标题下的真实断言证据。PR 实际 rollup 无失败或等待项；未选择模式的 job 单列为 SKIPPED，不计测试通过。

本地实施验收源为 2e7f3a2e…，Linux 为 8d7b334b…，原规则下权限差异可精确重算；该轮门禁绑定它们。verify 为 3532/0/0、SDK 32、fixtures 761/0 failures、smoke 87 加 500 请求；本地 soak 600175.53ms/30300 请求，远端 soak 600193.46ms/30203 请求，两边 active/inflight=0、failures=[]。先前两次为保留期修复而中断的旧 soak 不计通过。E1 通过同字节 tarball 关联；hana-implement 内容 hash 与九场景演练均保持，不把未改变的产品或 skill 伪称重新实现。

完整命令、run 链接、原始证据、保留期、审查报告及记录提交后的最终检查入口见 [补验收记录](testing-system-ci.md#独立专项与失败上传补验收)。本次只在已授权分支提交和推送，PR 119 保持打开，未启用自动合并。

后续文档同步修正了矩阵 AC-13、迁移台账和 E1 记录中的旧状态，并同步 S7 最终控制样本数。矩阵和迁移台账参与指纹，因此文档候选会有新 hash；上述实施验收的源/包 hash、账号执行和测试结果保持各自原始记录，不改写成新一轮执行。文档候选的验证和发版核对见 [文档同步记录](testing-system-ci.md#文档状态同步与发版核对)。
