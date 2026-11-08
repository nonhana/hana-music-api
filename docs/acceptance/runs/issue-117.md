# #117 当次运行

当前状态：离线候选和当次官方 origin 已通过，用户已授权候选准备提交/普通推送、真实匿名 preflight、next 发布及 registry 复验；发布验收继续执行，#117 仍 open。基线 feature/refactor / 96a318adb2908e5bd423636aeaf77700cda107dc，工作区初始干净。

2026-11-09：已自分配 #117，读取完整原票及 #80，确认原生前置 #107/#116/#123 均 completed。registry 只读查询 latest=3.2.1，无 next；原 integrity 保存于 `.artifacts/testing/issue-117/sources/latest-before.json`。本地 Bun 1.4.4、Node v26.13.0、npm 11.20.0。

验收矩阵见 [issue-117](../issue-117.md)。实施前所有门禁尚未运行，官方 origin、匿名上游和 npm 发布未获当次授权；后续当次结果见下文。未关闭 #117，未启动后继。

## 实施与失败轮次

- `engines-red.log/xml`：原包缺少 `engines.node`，公开包元数据断言真实失败（1 fail），补 `>=24` 后在包测试通过；不将过滤执行说成完整回归。
- Changesets 实际执行 `bun run changeset pre enter next`、`bun run version-packages`，生成 `4.0.0-next.0`，已消费说明移动至 `.changeset/pre/`。风格初审发现旧说明仍写 PC Cookie 与“未来删除配置”，从源文案修正并重新生成同版本，最终版本日志为 `pre-enter-final.log`、`version-packages-final.log`。只读 `publish-plan.json` 确认 next；没有执行 publish。
- `package-initial` / `package-second` 均 exit 1：新上传消费者样本缺少必填 `mimetype/size`，第一轮诊断又被 outcome 访问遮住；补外部 failures 断言与完整文件输入后 `package-third` 5 pass。两次失败不是产品故障检出，也不算有效 red/mutation。
- `lint-initial.log` exit 1：新消费者剥离协议字段时两个解构变量未使用；改为明确的忽略名，`lint-green` 及后续 lint/typecheck 退出 0，无 warning/error。未更改检查规则。
- 首轮冻结 `ae153717de2a01f37faa82f038054347737d128eb1f2806ae8f4c83f1d690d6d` 的 `gates-1794158783617`：types:modules:check exit 0，verify exit 1；local 为 8237 pass / 3 fail / 0 skip。原生 `output-4.log.stderr`、`junit-4.xml` 证明三处是 inner_version 的旧 3.2.0 期望与当前候选不符。停止后续门禁；历史 fixture 原文不变，在四处测试消费者用当前 package.version 构造明确期望，仍断言完整外壳。
- 功能初审发现 token 正负类型仅在源码检查；已补入安装 tarball 的声明消费者，`package-revision.log/xml` 5 pass，含两种严格根声明编译与独立浏览器声明。
- 新 candidate workflow 保留 release:checked/provenance，校验明确版本、next/pre 状态、没有未消费 changeset 及实际 tarball hash，candidate 模式关闭 GitHub Release/远端 git tag。隔离控制原命令首轮发现 ArrayBuffer 不能直接传 crypto.update，真实错误保留在 `revision-green.log`，改用字节后 `revision-green2` 368 pass、`guard-final` 22 pass；此工具错误不算有效故障检出。新增 candidate-package 的两个有限故障随后纳入最终 --all。

## 第二轮最终候选

起始 HEAD 仍为 `96a318adb2908e5bd423636aeaf77700cda107dc`。最终源码/矩阵内容指纹 `23d6a209be9bee9eb60d82d22eb71eab914cd42364c1c5a560da17c99fb0f774`，diff 指纹 `3200e9bf00b5f023b19e05381ba2683d77bb56863db6c4567d412bf1b215750f`。包括全部未提交及非忽略未跟踪文件，不包括本 runs 记录。门禁原始目录 `.artifacts/testing/issue-117/gates-1794159309016`，每条命令独立 stdout/stderr、起止/退出码在 commands.json；尚在执行，不能提前报告通过。

独立风格初审和复审报告在 `.artifacts/testing/issue-117/style-review-*.md`；独立功能初审在 `functional-review-initial.md`。修复前结论和旧候选通过只保留作历史，最终两轴结论需读本轮原日志。真实 origin、匿名 preflight、npm 发布及 registry 安装仍未授权/未执行，#117 继续 open，不提交/推送/关票或启动后继。

## 本轮最终离线结果

以下命令均在上述最终版本和内容指纹下串行完成，起止时间、完整 argv、原始 stdout/stderr 和退出码保存在 `gates-1794159309016/commands.json`，汇总 `summary.json` 为 pass；结束源码指纹与开始相同。

| 实际命令                                               | 退出码 | 结果与原始证据                                                                                                                                                          |
| ------------------------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run types:modules:check`                          | 0      | 生成物检查通过；`1.stdout.log` / `1.stderr.log`                                                                                                                         |
| `bun run verify`                                       | 0      | 完整 local 8246 pass / 0 fail / 0 skip，另完成类型、lint、拼写、格式和 docs build；`2.*.log`，local/1794159388527-ebcf3b4a-f344-4ec6-aac4-8ce0fb09aad3 原始日志与 JUnit |
| `bun run verify:sdk`                                   | 0      | SDK 32 pass / 0 fail / 0 skip，同包 Node/Bun/Chromium 和正负类型通过；`3.*.log`，sdk/1794159534634-29bb7a99-e328-4125-88bc-ccb589cdd0b7                                 |
| `bun run build:check`                                  | 0      | 本票另外实际运行，publint strict / attw 通过；`4.*.log`                                                                                                                 |
| `bun run verify:fixtures`                              | 0      | 仓库 Schema 和历史录制审计通过，未修改 fixture/Schema；`5.*.log`                                                                                                        |
| `bun run test:load:smoke`                              | 0      | 142 pass / 0 fail / 0 skip；实际 500 次 loopback，upstreamActive=0、inflight=0、failures=[]；`6.*.log`，load/smoke-1794159586000.json                                   |
| `bun scripts/mutation-test.mts --all`                  | 0      | 123 个故障均有效 killed，无 survived/invalid/timeout/tool-error/skip；`7.*.log`，mutation/1794159586319-8b8cb57f-26ea-4154-9a5d-ea37e217ef9f 的每项编译/原始 JUnit      |
| `npm pack --json --pack-destination <本轮 gates 目录>` | 0      | 最后另外实际 pack；713 文件，非 dist 仅 LICENSE/README.md/package.json；`8.*.log`                                                                                       |

lint 达到 0 warning / 0 error。构建中的 TypeScript 7.0 声明生成器弃用提示保留原日志，没有关闭或放宽检查。手动十分钟 soak 不适用本次自动门禁，未运行。真实网络门禁没有用 skip 报绿。

版本 `4.0.0-next.0`、计划 tag `next`。包 SHA-256：`179d82317c10c0dd84963a752e0dd2af92a28eacb3f221b62139e3785f945256`；npm integrity：`sha512-ONh0s3aInHlGRxEK6dBof1CzXsNOrGtRMPEJrK224MwWYodVYK+9ixqzvE9hhWRjY7c3OgV3Ibm7xD+yJp56nQ==`。最终独立包在本轮 gates 目录，与通过安装消费者的 package/e0d3f69b-98ba-4fd9-9b90-232d276b583e 同字节；逐文件与源码构建产物一致。新增特殊消费者每个运行时 21 requests / 6 providers / 3 scenarios / 0 localProviders。真实 Chromium/CSP 与依赖图来自同 tarball，只有受控官方回调，不冒充当前 origin。

锁文件 SHA-256：`68762384acdb3b96e20542b15eec10ea70a1d560b9b5d43f2f41966dbfb10ded`；矩阵 SHA-256：`189ba9a8f54c9edd201d8031de2142a015433986b3e4d6236852700705fdb777`。testedHead 仍为实际运行时的 `96a318adb2908e5bd423636aeaf77700cda107dc`，不改标为未来提交。

专门风格复审 `style-review-revision.md` PASS，绑定最终 content/diff 指纹，无未解决 finding。独立功能 reviewer 已逐项读取全部最终原始证据、123 份故障及 15 份非空基线 JUnit、包字节和负载；`functional-review-final.md` 无未解决 finding，离线部分 PASS，规范轴与需求轴整体均 BLOCKED（真实 preflight/origin/registry 缺项）。主 agent 已实际读取两份完整报告，不能将离线通过写成整票完成。

## 待当次授权的具体操作

完整候选、integrity、命令和来源保存在 `.artifacts/testing/issue-117/pending-publication.json`；这份记录不是发布回执。授权后计划：

1. 在 `https://campanula-test.caelum.moe/` 或作者本次指定的 HTTPS origin，用隔离匿名 Chromium 加载已安装候选及官方脚本，同页两次取值；实际浏览器网络最多 40 次，应用业务子资源阻止，不登录、不做账号写入。只记录长度与脱敏结果。候选脚本已准备为 `.artifacts/testing/issue-117/live-probe.mts`，要求当次授权文件、origin 和同候选包报告，尚未执行。
2. 可信发布 workflow 只能读取远端提交，因此需要作者明确允许一次**验收交付之前的候选准备提交与普通推送**，再执行 `gh workflow run release.yml --ref feature/refactor -f mode=candidate -f candidate_version=4.0.0-next.0 -f candidate_sha256=179d82317c10c0dd84963a752e0dd2af92a28eacb3f221b62139e3785f945256`。这是原“所有 AC 通过后才提交”时序的具体例外，未经批准不执行。此 workflow 仍重跑原 preflight，含最多 12 次匿名只读上游请求，检查失败就不发布；发布仅用 next，不创建 GitHub Release/远端 tag，不合并或部署。
3. 发布成功后读回指定版本、next、latest 与 integrity，从 registry 下载真实候选并用 `HANA_PACKAGE_SPEC=hana-music-api@4.0.0-next.0 bun run test:sdk-contract` 验证同包；latest 必须仍是 3.2.1 且保持原 integrity。再补外部证据独立复审，所有 AC 达标后按既有授权完成最终记录提交/普通推送/completed 关票与一个后继 Session。

当前 AC-117-01～05 的离线证据已齐；AC-117-06（origin）、07 的真实 preflight、08（发布/registry）、09 的完整交付仍未完成。原票明确要求“具体发布动作必须由作者在执行本票时确认”，接力与 hana-implement 同样要求真实访问当次授权。未执行 npm publish、真实 origin/上游/账号，未提交、推送、关闭 #117 或启动后继。

## 2026-11-09 当次授权与官方 origin

用户明确回复：“同意以上两项授权，允许为可信发布提前提交并普通推送候选。继续完成真实验证、next 发布和 registry 复验，latest 保持 3.2.1，全部通过后通知我。”原文及具体候选/预算保存在 `.artifacts/testing/issue-117/authorization-2026-11-09.md`。此前“未授权”均为前阶段历史状态，此次授权覆盖具体的候选提交时序例外和外部操作，仍不含账号写入、稳定版、Release、合并或部署。

实际执行 `LIVE_UPSTREAM=1 HANA_APPROVED_ORIGIN=https://campanula-test.caelum.moe/ HANA_ORIGIN_AUTHORIZATION_FILE=.artifacts/testing/issue-117/authorization-2026-11-09.md HANA_PACKAGE_REPORT=.artifacts/testing/package/e0d3f69b-98ba-4fd9-9b90-232d276b583e/summary.json bun .artifacts/testing/issue-117/live-probe.mts`，exit 0。原始输出 `live-origin.log`；结构化报告 `.artifacts/testing/watchman-live/0f3c18ae-48e7-41e6-ab24-861f1038e796/summary.json` 和同目录 browser-metafile.json。

报告绑定当前 source content 23d6a209… 和 tarball 179d8231…，是安装后同一候选在真实 origin 文档和原 CSP 下执行；仅在浏览器提供候选模块，未部署文件，应用业务子资源被阻止。官方 CDN/Watchman 请求真实，一次初始化，同实例两次长度均为 170，未保存 token 原文。身份 anonymous-isolated-browser，地区 unknown；参数和公开超时、浏览器版本、时间、各 origin 请求次数与官方脚本 hash 见报告。AC-117-06 当前通过；真实匿名 preflight、npm 发布、registry 和最终独立复审仍须执行。

## 候选准备提交与可信打包差异

按用户当次明确允许的提交时序例外，生成候选准备提交 `f243c9e75fd88681468d570a7bfa29272ec555d9`（`feat: 准备 4.0.0-next.0 npm 候选包`），普通推送 feature/refactor，读回远端一致，工作区干净；回执 `.artifacts/testing/issue-117/preparation-receipt.json`。这不是最终验收完成提交，#117 未关闭。

首次实际 dispatch `release.yml mode=candidate` 的 run [42507974926](https://github.com/nonhana/hana-music-api/actions/runs/42507974926) **failure**：远端 Node24/Bun 的 SDK 32 项通过，随后实际 hash guard 拒绝本地旧 gzip hash，发布步骤 skipped，未执行匿名 preflight 或 npm publish。原始日志、步骤结论和下载产物在 `trusted-workflow-failed.log/json`、`trusted-run-42507974926/`，不将这一轮记通过。

定位没有修改产品或 guard：原本地 Node26.13.0/zlib1.2.12 的 gzip 包为 493507 字节，CI Node24 的包为 493097 字节；713 个文件、内容、tar 元数据乃至**解压后的整个 tar 逐字节相同**。工具链对齐到实际 CI Node24.22.2/npm11.5.1 后，本地新 gzip 也与 CI 整包逐字节相同。另用同一份 tar、相同 level9/portable OS，仅切换 Node 运行 `node:zlib.gzipSync`，分别精确复现两个实际包的 hash 和大小，排除 npm 选项或输入文件差异。复现命令、差异表和同类检查排查见 `hash-failure-diagnosis.md`、`archive-difference.json`、`gzip-control.mjs`、`gzip-node26.json`、`gzip-node24.json` 和 `toolchain-aligned/reproduction.json`。

用于可信发布的 canonical 物理归档为 `toolchain-aligned/hana-music-api-4.0.0-next.0.tgz`，SHA-256 **`8143eb697c100874e2d3dd6cf9e354da9980c3d060d0542568ba10c0be087553`**，integrity **`sha512-fLHCLcSMT28zCStmhOzcAetVRZaPgvKuoxsY34K4TCmRo3YB29d+s6eGrO6I75fky/pcifdlmavZgUODbm3fcQ==`**。它已被首次 CI 的 Node24/Bun/Chromium/正负类型安装消费者实际验证，原始 package/57f9db2f-dc23-46ee-b50f-3334da60de00 摘要及原生 JUnit 随首次 CI 产物保存。原179d归档仅保留作原工具链证据，不把原压缩 hash 写成将来 registry integrity。

两种编码的完整 tar SHA-256 均为 `3b8f687b3fab37d26b04381cfd218b73ca184349a2e47d89f8d8fb0a89090589`，所有包代码/声明/元数据字节相同，故当次 origin 的 watchman 代码与 canonical 包相同。独立 `external-review-origin.md`、`external-review-canonical.md` 均 PASS，明确保留原 origin testedHead/hash，并通过完整 tar 字节等价关联 canonical 包；未再次取 token，也未扩大授权预算。实际 origin 网络总数7（页面1/CDN2/Watchman4），小于40。

CI source content 指纹实际为 `5323484511dcebf8dc9d7fb98b96acfc92dcc840bcda0737f5bca797d1713c83`，与本地23d不同仅因 CLAUDE.md 软链接的 lstat 权限 macOS755/Linux777。按 git checkout 权限重算本地指纹精确等于532，证据 `source-mode-difference.json`；保留各环境的真实值，不改标旧报告。产品/版本/声明/矩阵未变，原本地门禁仍对应相同包内容。

第二次实际 dispatch 使用 canonical 8143 作为原 hash guard 的预期输入，仍是同一 f243c9e/4.0.0-next.0/next，run [42508969202](https://github.com/nonhana/hana-music-api/actions/runs/42508969202)。本轮工作流正在执行，完整 preflight 和发布仍待后续实际结果，尚不能写为通过；首轮零次真实匿名请求，后续匿名预算仍为最多12次。没有绕过 hash 检查、放宽 ledger 或修改版本/行为来消除失败。

## 第二次可信运行失败与变异选择修复

run42508969202 最终为 failure。canonical hash guard、verify/verify:sdk、fixtures 和 smoke 通过，但 mutation 为97 killed、26 timeout；26项全部属于 module-config，不计作有效 kill，之后真实匿名集合和 npm 发布均未执行。原日志与产物在 `trusted-workflow-42508969202-failed.log/json`、`trusted-run-42508969202/`。前两轮实际匿名请求均为0，获准的一次最多12次集合尚未执行。

其原生完整组基线161项、0 fail/skip，CI耗时16.783秒，其中两个类型编译控制8.872/6.214秒；突变却每次重复全组，进程总预算只有原定10秒，因此总会超时。独立功能预审确认这是工具选择范围问题。修复保留完整组基线和全部原预算，按登记断言所属文件执行该文件全部用例；两个类型控制原样移到独立文件、保留所有selection，不删除任何断言或回归。原生JUnit还须与选中文件的完整绿色基线逐项一致，空/缺名、skip、遗漏、改名或意外用例均不能报kill。名称过滤试验因Bun把未选用例写成skip而被既有读取器拒绝，该失败不计为通过。

新增永久CLI控制的旧实现真实red保存在 `mutation-selection-red.log/xml`；按文件选择的完整控制、相关mutation与最终全门禁另记新候选，旧 f243 的绿灯不改标。所有产品、fixture、Schema和ledger保持，发布尚未完成。

## 文件选择修复的首次完整复验失败

候选 f0e4167a…（testedHead f243c9e）的目录为 `gates-1794165849524`：types、verify（8253/0/0）、verify:sdk（32/0/0）、独立build:check、fixtures、smoke（142/0/0及真实500次loopback，资源归零）均通过；mutation 在114 killed、2 invalid和1 tool-error处非零结束，后续pack未执行。原mutation目录 `mutation/1794166114372-59bcefc4-8ad8-4dd2-a849-7c5f7d784cb7`，不将这一轮标通过。

debug fetcher故障本来就触发目标原生断言，但还使同文件其他debug场景误用native网络，offline afterAll多出unnamed错误。新增严格集合核对正确拒绝它。现将原final-wire测试移到独立文件，保留原URL/body/Cookie/次数ledger，增加finally恢复的负向默认fetch替身和fallbacks=0断言；误用时计数并抛错、不委托native。原其他HTTP测试和全部selection保留，guard未变；复验module-config整组26 killed、0 invalid/timeout，原生证据 `module-file-selection-revision.log` 指向独立报告。

另一个失败是临时副本后期typecheck无法找到20个不同的大JSON（22条TS2307），导致shared最后一项invalid及upload基线失败；原fixture全部存在。单独shared-reads同源码6 killed，表明不是该组确定性删除。遗留临时副本中所有大于128KiB的23个JSON实体均已缺失；活跃新副本复制初期仍存在，且Bun copyFile保留原件10月旧mtime。删除进程与精确触发条件尚未确认，不能把临时副本损坏称作产品故障。为使新建快照保持本次时间，runner只更新副本普通文件时间，原fixture字节/权限/时间不变；新增大JSON旧mtime控制验证实际副本新鲜、内容完整且原件时间不变。该控制旧实现原生red在 `mutation-copy-freshness-red.log/xml`，不算有效kill；完整green另记。大小/时间/位置控制位于 `fixture-lifetime-control/`，当前尚未复现外部删除，不把推断写成已证实。

这次修复未发起任何新增真实请求或发布。下一份候选需重新冻结全部source/矩阵并串行重验；旧f0门禁不改标为新源码。

补记：`gates-1794167094327` 在导入排序修正前启动，候选f6a40781…与最终8b81b7e…不同，因此整轮汇总无效，不能当最终门禁。修正后的lint/spell通过；独立fmt:check与生成器临时check-tmp文件相撞而非零，日志保留在mutation-final-format.log，未改格式规则或忽略项。当前进程退出后从干净的最终候选重新串行开始，后续build/pack不并发。

## 修复后最终离线候选通过

最终冻结源码内容指纹 **8b81b7e6039530eb5ba4236625e5ae223d127fcbaa4409bb701fee058aa78696**、diff指纹95487464b86b912344f5131f14d618d21eae5488a84bcaaa0a90e02583ce9d18；实际testedHead仍为f243c9e，未改标为随后提交。锁文件hash保持68762384…，矩阵hash为1a276ab3e38897cab5338d32195f492c0a9a189e68814256f6f3c6e7234203d3。完整命令、起止、退出码、原始stdout/stderr和最终不变指纹均在 `gates-1794167288101/commands.json`、`summary.json`，8项全部exit0。

| 实际串行命令                                                                                                | 结果                                                                         |
| ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| bun run types:modules:check                                                                                 | 通过                                                                         |
| bun run verify                                                                                              | 8254 pass、0 fail、0 skip；含types/schema/build/types/lint/spell/format/docs |
| bun run verify:sdk                                                                                          | 32 pass、0 fail、0 skip；实际同包Node/Bun/Chromium/正负类型                  |
| bun run build:check                                                                                         | 独立构建、publint、attw通过                                                  |
| bun run verify:fixtures                                                                                     | Schema与本仓库录制审计通过，未改历史fixture                                  |
| bun run test:load:smoke                                                                                     | 142 pass、0 fail、0 skip；另真实500次loopback，upstreamActive/inflight=0     |
| bun scripts/mutation-test.mts --all                                                                         | 全部123有效killed，0 survived/invalid/timeout/tool-error/skip                |
| npm exec --yes --package=node@24.22.2 --package=npm@11.5.1 -- npm pack --json --pack-destination <本轮目录> | 713文件、493097字节，canonical物理包完全相同                                 |

原生回归、SDK、smoke、load、package报告路径汇在 `tooling-final-evidence.json`，独立审查仍需直接读取相应原日志/JUnit。变异原始目录 `mutation/1794167553717-e4210517-b164-4865-ae99-275206bf6284`，完整组baseline与每项故障的编译、命令、JUnit保留；本轮已实际越过原先临时副本后期失败点并完成全部目标。原件不变、新副本时间及17个工具控制由完整回归重跑，未放宽时限/ledger/skip。外部删除进程与触发条件仍未知，此次全量通过不补写成已定位该进程。

本轮tarball位于 `gates-1794167288101/hana-music-api-4.0.0-next.0.tgz`，与此前可信CI的canonical归档逐字节相同：SHA-256仍为8143eb697c100874e2d3dd6cf9e354da9980c3d060d0542568ba10c0be087553，integrity仍为sha512-fLHCLcSMT28zCStmhOzcAetVRZaPgvKuoxsY34K4TCmRo3YB29d+s6eGrO6I75fky/pcifdlmavZgUODbm3fcQ==，完整解压tar仍为3b8f687b…；因此本次工具修复不改变已获真实origin验证的包字节，无新增token调用。

本地8b与预期git-checkout模式源码指纹3c3e10704e843cef82a50b12439beb4e53c0f7366e1c4073115c82e888992e95的差异仍仅CLAUDE.md symlink模式，见 `tooling-source-mode-map.json`。这只是环境模式映射，后续CI必须保存自己的实际值。外部匿名preflight/发布/registry尚待执行，#117仍未完成；按用户明确的提前提交例外，在独立离线复审通过后普通提交推送必要工具修复，再实际重跑原可信流程。

包证据口径：本轮af23784b…安装消费者实际打包并安装的是本机Node26的179d压缩归档；最后一条明确Node24/npm11.5.1的pack才生成8143 canonical。二者完整解压tar逐字节相同，均为3b8f687b…，且8143本身已在首次可信CI实际安装消费通过；不得将af237报告改标成8143安装记录。后续新可信CI还须在当前源码实际安装8143并完成preflight，registry也须下载8143物理包复验。
