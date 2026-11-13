# 测试与验证

在修改测试、选择验证范围、触碰请求流量控制或准备交付前阅读本文件。

## 测试分层

- `tests/unit/`：独立规则、状态机与测试工具自身的故障控制样本。
- `tests/behavior/`：从 SDK/HTTP 入口执行模块和请求链；内存替身与 capability 级场景注明实际边界。
- `tests/replay/`：原文响应、兼容样本与返回体合同；纯 Schema 规则在 `tests/unit/schema/`，回放不证明请求。
- `tests/transport/`：默认适配器、代理、真实 loopback socket 与有限 load；`scripts/load-test.mts` 执行 500 次 smoke 和十分钟 soak，判定规则在 `tests/unit/testing/load-acceptance.test.ts`。
- `tests/package/`：当前候选 tarball 的 Node/Bun 消费者、公开类型/导出与单文件 serverless；`types/` 下文件由 tsc 检查。
- `tests/live/`：真实上游门控验证，不属于默认回归；条件与证据另记。
- `tests/mutation/`：定向故障与关联测试的登记，检查测试辨别力，不复制业务测试；CLI 为 `bun scripts/mutation-test.mts --all`（或 `--target web-endpoints|candidate-package|module-config|request-identity|special-chains|membership-business|podcast-video|account-social|search-discovery|library-playback|check-token|failure-contract|playlist-subscribe|shared-reads|upload|watchman|browser-types`、`--dry-run`）。

变异先跑该组全部登记文件的绿色基线；注入后按 `expectedFailures` 定位所属文件，执行这些文件的全部用例。原生 JUnit 必须与选中文件的基线用例逐项一致，空关联、缺名、跳过、遗漏、意外用例或超时均不能计为 killed；有效 kill 仍须是登记用例的原生断言失败。

- `tests/_kit/`：Effect 测试的统一入口；测试中的 `Effect.run*` 和 Layer 提供应集中在 kit 内。返回体契约测试判断“结构不符”的断言用 `assertions.ts` 的 `expectUpstreamShapeRejection`，录制文件和导出结构定义的类型用同一文件的 `Recording`、`Validator`；回放录制用 `replay.ts` 的 `replay`/`replayRaw`。

## 基线命令

- 默认回归：`bun run test`（唯一选择源为 `tests/suites.ts`）。
- 模块生成检查：`bun run types:modules:check`。
- 失败路径清单：`bun run failures:check` 核对 `docs/acceptance/issue-129/failures/*.json` 与 352 模块注册表、模块事实和生成报告一致；`bun run failures:report` 重新生成。新增内部错误类、模块或返回体校验分支时，先更新清单。
- 结构定义与录制审计：`bun run schema:audit check` 检查结构定义写法，`bun run schema:audit recordings --recordings tests/fixtures/netease` 用本仓库录制回放校验。`schema:audit` 的默认录制根是 Campanula 仓库的 `../campanula-svelte-main/tests/fixtures/netease`，在 SDK 仓库里运行必须显式传 `--recordings tests/fixtures/netease`。
- Fixtures 门槛：`bun run verify:fixtures`（`bun run schema:audit check && bun run schema:audit recordings --recordings tests/fixtures/netease`），只依赖本仓库 fixtures。
- 类型、静态检查和格式：`bun run typecheck`、`bun run lint`、`bun run spell`、`bun run fmt:check`。typecheck 串行检查 Bun/Node 与完整 DOM 两个工程；服务端不得获得 DOM 全局，浏览器不得自动获得 Bun/Node 全局。配置控制样本从实际命令验证两个阶段都能阻止错误。
- 完整仓库验证：`bun run verify`（含 `bun run schema:audit check`）。
- 浏览器专项：`bun run test:watchman` 用 Playwright Chromium 与受控官方脚本覆盖公开入口，不访问真实 Watchman；浏览器包消费者和 CSP 同时纳入 local/sdk 集合。首次安装命令见 BUILD.md。
- SDK 与发布验证：`bun run verify:sdk`、`bun run test:sdk-contract`、`bun run build:check`。

`verify`、`verify:sdk` 和 `build:check` 都会写入或读取构建输出；需要串行运行，上一条通过后再运行下一条。

## 交付门禁与完成判定

准备交付前，先按需求和实际改动列出本次必须通过的检查：

- 代码、测试、构建、生成器或工具配置变更：执行 `bun run verify`（包含 `bun run failures:check`）。
- SDK 公开表面或包交付变更：另执行 `bun run verify:sdk`，并满足 [PUBLIC_API.md](./PUBLIC_API.md) 的验证要求；返回体结构定义或录制变更另执行 `bun run verify:fixtures`。请求与流量变更还需通过下文规定的 smoke。
- 仅文档变更：执行 `bun run fmt:check`、`bun run spell`；涉及文档站内容或配置时另执行 `bun run docs:build`。

所有检查针对同一份最终候选代码。记录分支、HEAD、未提交改动范围，以及实际执行的命令、结果和必要的日志位置；修复后重新运行受影响的检查。历史报告、其他分支或修复前的通过结果只供参考。

代码交付的 lint 必须达到 **0 warning、0 error**。`bun run lint:fix` 只负责应用自动修复，修复后仍须通过 `bun run lint`。保持既定检查强度，不能通过关闭规则、降低级别、扩大忽略范围或跳过失败测试来达标。

### 失败、阻塞与例外

任一适用门禁失败，交付状态就是“未完成”，即使功能和专项测试已经通过。既有基线问题同样计入失败；问题来源只用于定位和说明，不构成豁免。组合命令中任一步失败，整个命令仍是失败，前面通过的步骤不能代替整体结果。

缺少环境、权限、凭据或外部条件而无法执行的检查，记录为“阻塞”，说明缺失条件和需要的帮助。未运行、空测试选择、全部跳过或没有执行到断言，都不能计为通过。

在已授权范围内继续修复失败项；超出授权范围或需要用户帮助时，保持未完成状态并说明问题。只有用户明确同意调整验收范围或接受具体例外后，才能按调整后的约定交付；记录用户决定、未通过的检查及影响，仍不得将这些检查写成“已通过”。

### 审查与交付报告

审查输入必须包含适用门禁清单、实际运行结果和所有未解决问题，涵盖本次引入和既有基线问题。审查者直接核对命令输出或日志，再给出判断。使用双轴审查时，规范轴核对仓库约定及门禁结果，需求轴核对需求验收条件及其实际证据；审查者可以区分问题来源，但不得因此从验收问题清单中排除失败项。

“本次 diff 未发现问题”只是代码审查结论。最终交付由负责交付的 agent 汇总需求证据、自动检查和审查结果，按以下条件报告：

| 状态   | 判定条件                                                                     |
| ------ | ---------------------------------------------------------------------------- |
| 完成   | 需求验收条件有实际证据，所有适用门禁通过，审查无未解决的阻断项。             |
| 未完成 | 任一需求尚未实现、适用门禁失败或审查阻断项未解决；说明已完成部分和剩余问题。 |
| 阻塞   | 必要验证无法执行；说明缺失条件，不宣称任务完成。已知失败项仍按“未完成”报告。 |

交付报告逐项写出实际命令和结果，列明未通过、未执行或被用户明确接受的例外。只有满足“完成”条件才能宣称任务完成，不能用“功能已实现”或“审查无发现”替代完整验收。

## CI

完整 verify 并行运行五个 job：static 核对生成物、输入和失败合同、类型和代码风格；docs 执行仓库 fixtures、500 请求 load 与文档构建；两个 source job 分摊离线回归；package 从干净 checkout 运行包消费者，由它构建一次，再对同份 dist 执行严格包检查、源码边界、代理与浏览器测试。用例取 local、sdk、smoke 的并集，同一文件只执行一次，仍保留每文件独立进程、离线 guard 和原生 JUnit。本地组合命令继续可用。每个 job 独立上传证据，最后的 verify 要求五个 job 成功，并检查提交、测试指纹及文件并集；缺文件、重复或缺分片都不放行。

CI 保留按有限请求和明确断言完成的正确性检查；需要固定时长观测的 soak 仅由用户按需运行，不接入 workflow，也不作为交付或发布门禁。

独立 workflow：live 每日 05:40 UTC/手动只执行匿名集合，零账号 Secrets；mutation 每周一 06:30 UTC/手动执行登记目标。它们不成为普通 PR 的真实网络依赖。所有 workflow 固定 Bun 1.4.4/Node 24，失败也上传证据，PR 保留 30 天，候选保留 90 天。配置检查通过不能证明远端 job 或保护规则实际生效。

未合并分支的独立验收通过已登记的 release-rehearsal 手动入口运行：`gh workflow run release-rehearsal.yml --ref <branch> -f acceptance=testing`。它按同一提交的相对路径调用 verify、live、mutation 实际 workflow，不复制 job，不传账号 Secrets，不执行版本步骤或发布。live/mutation 同时保留 schedule 和 workflow_dispatch；普通 PR 只执行离线门禁；改动版本元数据、发布流程或包配置等发布相关文件时额外演练版本。

故意失败上传演练使用同一入口的 `acceptance=failure`：调用同一个 verify workflow，在 static job 中，显式传入默认为 false 的 evidence_failure，让一个临时 Bun 测试真实断言失败。job 必须为 failure、退出非零，同一个 always 上传步骤仍应保留 failure-probe.log、原生 failure-probe.xml 和初始候选信息；不能用 continue-on-error 改成通过。该模式不执行真实上游或账号操作。随后对同一候选运行 acceptance=testing，确认 candidate/verify、live、mutation 正常通过，普通 PR 也必须保持全绿。verify 上传按调用事件选择保留期：手动候选及故障演练 90 天，PR/master push 30 天。省略 acceptance 或选择 release 时保持原发布演练行为。

发布候选在最后一次版本步骤后验证：release-rehearsal 重跑 verify:sdk（包含重新构建、打包和 Node/Bun 消费者），手动模式再跑匿名 live。普通 master push 先查这次合入的 PR，只在其最终 head 对应的 verify 已成功、且汇总 job 记录的 PR 号和 Git tree 与本次合入一致时复用。汇总 job 会核对五个分片在检查前后的 Git 状态、初始内容指纹及测试报告中的指纹，确认干净 checkout 与实际测试的内容一致才记录 tree；plan 摘要给出来源。没有对应记录、tree 不符或 GitHub 查询失败则补跑完整 verify。发布候选及手动演练始终执行完整门禁。实际候选的 package 分片额外验证匿名 live，封存同一份已安装过的 tarball；全部登记变异在独立 runner 并发。汇总门禁与全量变异都是发布 job 的直接依赖。发布 job 从同一次运行恢复归档，再核对独立传入的 SHA-256、包内名称、版本及 provenance；手动 candidate 仍要求批准的 next 版本和摘要。手动 dry-run 也经过相同验收，最后的 npm 演练无写权限。本地 preflight 保留原串行门禁。

## 请求与流量变更

- 请求、取消、重试、缓存或流量控制变更至少运行 `bun run test:load:smoke`。
- 用户需要观察长时间稳定性时，手动运行 `bun run test:load:soak`；该命令约运行十分钟，只连接 loopback，保留原有时长、内存与资源归零判定。它独立于默认回归和自动门禁。
- 负载报告写入 `.artifacts/testing/load/`，结束时应确认 `upstreamActive` 和 `inflight` 均归零。
- 负载脚本使用本地 fake upstream；通过它不能推断网易云真实上游的可用性。

## 真实上游测试

只有 `LIVE_UPSTREAM=1 bun run test:live` 启用真实上游。`HANA_LIVE_SUITE` 默认 anonymous，也接受 authenticated、writes。显式调用而 gate 不等于 1 时返回非零阻塞，零请求，不以 skip 报绿。普通回归根本不选择 live。

匿名集合共享一个安装后的候选包 client，串行执行搜索→同一歌曲详情→歌词、榜单和歌手；每请求 30 秒，禁重试、关闭缓存，匿名初始化也计入最多 12 次实际请求。报告保存源码、tarball hash、身份类别、地区（未提供时 unknown）、时间与脱敏失败。候选包必须先通过同包 Node/Bun 消费者，不能复用旧源码包。

登录态仅在用户提供本次身份与凭据后执行：使用 `NCM_LIVE_COOKIE` 或 `NCM_LIVE_COOKIE_FILE`，不可同时提供；`NCM_LIVE_EXPECTED_UID` 必须匹配 `loginStatus.data.account/profile`。不要在命令正文放凭据。账号过期或缺失是失败/阻塞，不是通过。

写专项还需记录本次指定目标的写入/恢复授权，在 `HANA_LIVE_WRITE_AUTHORIZATION` 中引用该记录，再设置 `HANA_LIVE_ALLOW_WRITE=1`、一个 `NCM_LIVE_PLAYLIST_ID` 和 `NCM_LIVE_CHECK_TOKEN_FILE`。token 从本机文件读取，仅本次收藏使用，不生成 token。初始歌单不能已收藏或属于本人；userPlaylist 每页 1000、最多 5 页，状态不完整即停止。业务预算 30 次，另留 6 次恢复额度；收藏/取消各最多发送一次，写后最多两次间隔 1500ms 的读回。失败停止业务，按既有授权取消并确认恢复；未确认必须单列失败，不能报 pass。登录与写操作不自动安排到 CI，也不能沿用旧票授权。

门控、预算、失败停止、分页和清理的严格假上游自测只证明控制流程，真实账号读回另记 E1；缺凭据或授权时 E1 保持阻塞。录制、live 和运行摘要共用脱敏规则；录制 CLI 的故障演练开关不能关闭 live/证据脱敏。

当前验证流程不依赖数据库；测试应沿用现有 fixtures、fake upstream 和自定义 fetcher，不另设 mock 数据库。

重构验收的历史结果和证据边界见 `_notes/effect-refactor/final-report.md`，不能将其中的测试数量视为永久不变的通过证明。

相关实现：`package.json`、`tests/_kit/`、`tests/package/`、`tests/transport/load/`、`scripts/load-test.mts`、`.github/workflows/`。

## 执行清单与证据

`tests/suites.ts` 登记每个物理测试文件的主类别和命令选择。新增、移动测试时同步清单，typecheckFiles 中的类型用例由所属的 Bun/Node 或 DOM 工程通过 tsc 检查。runner 拒绝漏登记、重复登记、空选择、only、todo、必要测试 skip、缺失或不一致的 JUnit，以及子进程失败。

测试文件默认按清单串行运行在独立 Bun 子进程，避免旧测试的全局替换与运行时状态跨文件泄漏。每个文件保留 Bun 原生 JUnit，runner 校验后汇总；命令数组与每个子进程的日志都保留。

运行结果保存到 `.artifacts/testing/`：Bun 原生 JUnit、日志和 schemaVersion 为 1 的摘要。摘要记录实际命令数组、时间、退出码、pass/fail/skip、运行时版本、锁文件 hash、testedHead 和候选内容指纹。指纹覆盖受控文件和非忽略未跟踪文件；只排除 `.artifacts/testing/` 与 `docs/acceptance/runs/` 的运行记录，需求矩阵仍计入。包证据另记 tarball SHA-256。报告或断言数量只说明执行情况，不能替代需求验收。

需求来源、AC、适用门禁与必要条件写入 `docs/acceptance/<slug>.md`，当次结果写入 `docs/acceptance/runs/<slug>.md`。规则见 [验收记录](../docs/acceptance/README.md)。CI 即使失败也上传运行产物；远端是否实际运行、保护规则是否启用必须独立确认。

实施调度见 [.agents/skills/hana-implement/SKILL.md](../.agents/skills/hana-implement/SKILL.md)，由用户显式选用，支持 ticket、plan、提示词。它引用本文件选择门禁；代码改动由独立 reviewer 读取完整工作区和实际日志，再分别审查规范与 AC，修复后重新验收。

离线 guard 对自动重定向采取拒绝策略，避免 native fetch 在内部跳转到未登记目标；显式 manual 请求保留原始响应，真实 transport 的重定向拒绝另有 socket 证据。测试选择还在实际 Bun 进程预加载独立 only 违例 ledger，局部别名、动态选择或捕获异常都不能让剩余必要测试静默消失。
