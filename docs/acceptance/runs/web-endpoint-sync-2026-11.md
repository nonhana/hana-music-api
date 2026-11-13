# #137 当次实施与验收

来源：[Issue #137](https://github.com/nonhana/hana-music-api/issues/137)；验收依据为 [需求矩阵](../web-endpoint-sync-2026-11.md)。2026-11-13 当前任务先授权更新 AC，再调用 hana-implement 完整实施。Issue 正文已同步 AC-01–09 和本次实施状态。

基线：master / `472dbc5c46ecd9cfed075b47c8f5a1aad0b006e1`，初始工作区干净，无已有用户改动。验收时分支为 `fix/issue-137-web-endpoints`，HEAD 保持基线，全部本任务改动在工作区；该轮尚未提交、推送、关票、升版、发布或部署。

## 实现与证据

- S1：公开配置重新读取后的规范 JSON hash 与票内 `ffe2b2e…c375` 一致；现代 app/vendors 原始文件 hash 与票内一致。原始 JS 只在 `.artifacts/testing/issue-137/`，仓库保留公开配置、来源摘要、最短摘录、基线动作和完整处置矩阵。离线 CLI 从真实 registry 审计 352 模块、390 动作；61 完整迁移、Banner PC 新动作及保留分支逐项核对。动态代表样例关联实际动作，外域不匹配，固定 batch 子路由与通用输入保持区别。
- S2：红心和取消改 `/api/song/like`，回复改 `/api/v1/resource/comments/reply`。client、具名、invoke、HTTP 在最终 fetcher 独立解密；301/405/-460 单次失败、不换协议。保留 alg/time，不新增 userid、token 别名或补账号请求。
- S3/S4：矩阵的 23 个读取与 27 个账号/社交动作迁 web。Banner PC 与移动、普通播放与 sky、普通搜索与 voice 分开；身份、Cookie、取消、共享与失败合同沿原链路验证。
- S5：11 个写入/上传动作迁移，曲目主请求与 512 后备都用 web v1；provider 逐次，字符串第二 API 前失败。粉丝列表固定路径，具名 batch 三子路由对象化且保持一次写入/子失败；cloud 仍为 EAPI check→web allocate→EAPI information→web publish，外部字节上传与部分完成保持。
- S6：运行模块生成器，生成文件无需额外文本变化（registry 引用模块本地声明）。更新失败清单的 Banner readPc、当前请求差异、受影响断言/包消费者、定向变异、ADR、PUBLIC_API、config-reference 与 major changeset。历史请求/响应 fixture 未改写来源。

先测到 red：`.artifacts/testing/issue-137/red-valid.log` 对应原生 JUnit 保存在其 report 路径。旧实现的最终 URL 为 `/weapi/radio/like`/旧回复路径，严格上游和原生响应断言失败；审计逐项报告旧 profile/target 与缺少 readPc。不存在导入错误冒充行为 red。之后 `web-final-probe.log` 为 32 pass / 0 fail；所有最终结果以下方冻结候选为准。

初期全量回归暴露了旧协议断言与包消费者此前未解密 WEAPI 的缺口，已更新独立期望。早期 red、失败或候选期间仍有修改的运行都保留原日志，不计最终 PASS；特别是 mutation 的 `Original candidate changed during mutation validation` 保持失败事实，最终重新运行。

补充故障检查：新 lyric/Banner 变异最初只有严格 fake 的 Error，没有执行到原生断言，按规则保持 invalid。已在测试中先 settle SDK 结果再断言公开成功形状；判定器未改。`mutation-web-confirmed2.log` 的六项均由原生断言 killed。另修复 smoke 所用 loopback 的旧头像提交路由并补三阶段回归，原失败保留；新 smoke 完整执行 500 请求并归零。

## 最终候选门禁

候选 HEAD：`472dbc5c46ecd9cfed075b47c8f5a1aad0b006e1`；内容 SHA-256：`1361881d8f0510cea019189f104cb449cdd81a1f8128fdc4d0d39bbedd362213`；diff SHA-256：`08015b35e2364857f000f26c4bf43814e510002223174a3cdc1f4f6591aecae1`。Bun 1.4.4，Node 26.13.1。15 条串行命令均退出 0，每一步执行后内容指纹与起点一致。

原始证据：`.artifacts/testing/issue-137/final4/gates.json` 记录命令、起止时间、退出码、日志及指纹；每项 stdout/stderr 同目录。原生 JUnit 和包摘要路径见下表及各 log 的 report 字段。

| 实际命令                                                  | 结果                                                               | 主要证据                                                                          |
| --------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `bun run types:modules:check`                             | PASS：退出 0，指纹一致                                             | `.artifacts/testing/issue-137/final4/00-types-modules-check.log`                  |
| `bun run verify`                                          | PASS：8372 pass / 0 fail / 0 skip                                  | `.artifacts/testing/issue-137/final4/01-verify.log`                               |
| `bun run verify:sdk`                                      | PASS：34 pass / 0 fail / 0 skip                                    | `.artifacts/testing/issue-137/final4/02-verify-sdk.log`                           |
| `bun run verify:fixtures`                                 | PASS：退出 0，指纹一致                                             | `.artifacts/testing/issue-137/final4/03-verify-fixtures.log`                      |
| `bun run test:load:smoke`                                 | PASS：143 pass / 0 fail / 0 skip；500 HTTP 请求，active/inflight=0 | `.artifacts/testing/issue-137/final4/04-test-load-smoke.log`                      |
| `bun scripts/audit-upstream-endpoints.mts`                | PASS：352 模块 / 390 动作；无漏项                                  | `.artifacts/testing/issue-137/final4/05-scripts-audit-upstream-endpoints.mts.log` |
| `bun scripts/mutation-test.mts --target web-endpoints`    | PASS：6 killed；绿色基线与原生断言有效                             | `.artifacts/testing/issue-137/final4/06-web-endpoints.log`                        |
| `bun scripts/mutation-test.mts --target library-playback` | PASS：7 killed；绿色基线与原生断言有效                             | `.artifacts/testing/issue-137/final4/07-library-playback.log`                     |
| `bun scripts/mutation-test.mts --target account-social`   | PASS：8 killed；绿色基线与原生断言有效                             | `.artifacts/testing/issue-137/final4/08-account-social.log`                       |
| `bun scripts/mutation-test.mts --target search-discovery` | PASS：8 killed；绿色基线与原生断言有效                             | `.artifacts/testing/issue-137/final4/09-search-discovery.log`                     |
| `bun scripts/mutation-test.mts --target check-token`      | PASS：11 killed；绿色基线与原生断言有效                            | `.artifacts/testing/issue-137/final4/10-check-token.log`                          |
| `bun scripts/mutation-test.mts --target shared-reads`     | PASS：6 killed；绿色基线与原生断言有效                             | `.artifacts/testing/issue-137/final4/11-shared-reads.log`                         |
| `bun scripts/mutation-test.mts --target request-identity` | PASS：9 killed；绿色基线与原生断言有效                             | `.artifacts/testing/issue-137/final4/12-request-identity.log`                     |
| `bun scripts/mutation-test.mts --target special-chains`   | PASS：14 killed；绿色基线与原生断言有效                            | `.artifacts/testing/issue-137/final4/13-special-chains.log`                       |
| `bun scripts/mutation-test.mts --target upload`           | PASS：2 killed；绿色基线与原生断言有效                             | `.artifacts/testing/issue-137/final4/14-upload.log`                               |

`verify:sdk` 包含 `build:check`、`test:sdk-contract`；`verify` 包含生成物、输入/失败清单、完整回归、两工程类型、lint、拼写、格式与文档构建。lint 为 0 warning / 0 error。fixtures 审计只读本仓库的原文响应。

- `bun run verify` 原生摘要：`/Users/nonhana/workspace/code_life/Campanula/hana-music-api/.artifacts/testing/local/1794510427762-4b7ee2d4-4c92-4f23-9cac-9990aaca9369/summary.json`。
- `bun run verify:sdk` 原生摘要：`/Users/nonhana/workspace/code_life/Campanula/hana-music-api/.artifacts/testing/sdk/1794510533564-39bf5b2d-fc40-426a-a47c-6d4411c77939/summary.json`。
- `bun run test:load:smoke` 原生摘要：`/Users/nonhana/workspace/code_life/Campanula/hana-music-api/.artifacts/testing/smoke/1794510574241-2567f11e-24ce-452a-95db-64594443d91d/summary.json`。

两次包门禁实际安装的 tarball 摘要相同：`ea8021007fbed613a7a6e88989b3fd72788c393974e382187e1272c226527e80`。同包 Node/Bun 均通过，包括源基线的独立当前期望、sky/移动保留分支、search.voice、playlistTrackAll 两读取、cloud 四阶段、playlistTracks 512/provider/字符串停止及头像外部字节链。

- 包证据：`.artifacts/testing/package/757cc977-122d-401a-9018-607791b60d90/summary.json`；归档：`/Users/nonhana/workspace/code_life/Campanula/hana-music-api/.artifacts/testing/package/757cc977-122d-401a-9018-607791b60d90/hana-music-api-5.0.0.tgz`。
- 包证据：`.artifacts/testing/package/ec5ba12a-5cc6-4440-90d0-c455b02784b9/summary.json`；归档：`/Users/nonhana/workspace/code_life/Campanula/hana-music-api/.artifacts/testing/package/ec5ba12a-5cc6-4440-90d0-c455b02784b9/hana-music-api-5.0.0.tgz`。

## AC 逐项结果

| AC    | 状态与决定性证据                                                                |
| ----- | ------------------------------------------------------------------------------- |
| AC-01 | PASS：固定来源与完整处置；离线 audit/动态归属/重复漏项控制用例                  |
| AC-02 | PASS：web-endpoints 与各领域最终 URL/独立正文解密，三条固定 batch 子路由对象化  |
| AC-03 | PASS：61 完整动作与 Banner PC；390 动作矩阵，所有保留分支受审计与 wire 断言保护 |
| AC-04 | PASS：身份/Cookie/token/provider/取消/禁共享/外部上传边界回归与对应变异         |
| AC-05 | PASS：原文回放、共享取消、301/405/-460、512、子失败、部分完成及负载             |
| AC-06 | PASS：client/具名/invoke/HTTP 和同一 tarball Node/Bun；原始 fixture 来源不变    |
| AC-07 | PASS：9 组共 71 个有效 killed；新分支原生断言 red/green 已确认                  |
| AC-08 | PASS：全部适用门禁同候选通过；独立双轴审查通过                                  |
| AC-09 | PASS：major changeset、ADR/公开文档与生成检查；授权边界保持                     |

早期失败均保留，不作为最终证据。final3 的封存脚本在 audit 步因日志路径含斜杠未能启动命令，修复仅发生在被忽略的封存工具；最终 final4 从头执行全部命令，未复用该失败或其他候选结果。

## 独立双轴审查

独立 reviewer `/root/review_issue137` 未参与实现，直接读取原始来源、完整生产/测试 diff、全部非忽略未跟踪文件、实际 raw 日志、原生 JUnit 与包归档。初轮提出的动态/batch 审计归属、同包混合链覆盖、唯一 mutation 注入及 voice 上传样例索引均已修复；后续两条原生断言缺口与 loopback 头像路由修正也已复核。生产 61 行与原票逐行核对，没有遗留发现。

最终规范轴 **PASS**，需求轴 **PASS**，无未解决阻断项。reviewer 独立确认 15 项主门禁同候选通过、lint 零警告、8372/34/143 三个集合均无失败/跳过、500 HTTP 及资源归零、71 个有效 killed，并复算两份归档 SHA-256 一致。结论绑定上方 `1361881d…` 最终内容指纹。审查输入包位于 `.artifacts/testing/issue-137/final4/` 的 workspace.diff、staged.diff、workspace-status.txt 和 untracked.json；完整审查结论保存为 review.md。

总体结果：**完成本票当前授权的实现与离线验收**。验收记录补齐后另执行 `bun run fmt:check`、`bun run spell`；不改动受控候选，最终源码指纹再次核对一致。

## 外部条件与授权

本次验收是源码、受控上游、loopback 与当前候选包证据。真实 live、真实登录/写入、远端 workflow、十分钟 soak、Campanula 配套、版本发布不在本次门禁中，未运行。票内过去账号探针只证明当时组合，未拿它证明全部新模块当前可用。无新增账号授权，也未访问或操作真实账号。

## 后续交付授权

2026-11-13，用户在同一任务追加明确授权：提交并推送本次改动，创建关联 #137 的 PR。交付使用 `fix/issue-137-web-endpoints` → `master`；提交前再次核对源码内容指纹与上方已验收候选一致。此次仅补充本节授权记录，不改产品或测试代码；提交后的 HEAD 会改变，测试仍对应本记录列明的源码内容 SHA-256。

本次不执行合并、关票、实际升版、发布、部署或真实账号验证。PR 描述通过 `Closes #137` 关联 ticket，由合并后的既有 GitHub 流程处理关闭。远端 CI 状态在 PR 中单独记录，本地通过不冒称远端通过。
