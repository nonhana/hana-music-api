# E1 真实账号专项验收记录

**E1：PASS。** 登录身份、单次收藏、读回、单次取消和目标恢复均有当次真实上游证据。E1 执行时尚缺的远端 CI，后续已获用户授权并完成验收，见 [PR CI 记录](testing-system-ci.md#独立专项与失败上传补验收)。以下账号操作、时间和候选均保留 E1 当次事实，没有为本次文档同步重新执行账号操作。

## 当次授权与候选

用户提供 `_notes/credential/cookie.txt`，允许读取当前身份；随后明确允许选择一个非本人创建、当前未收藏的公开歌单，并已授权本轮收藏、读回、取消收藏和确认恢复。用户之后确认 fresh token 已保存，实际文件为 `_notes/credential/checkToken.txt`，仅本轮收藏使用一次。没有沿用旧票授权、历史 token 或重复写入。结构化授权记录：`.artifacts/testing/e1/write-authorization.json`。

候选 SHA-256：`6c045a58faf755176fb964ef5016f229a278fb1d7584429da74df692e56b2f8a`，HEAD `fb10b0052f05627307310cb307995f77762211a4`，tarball SHA-256：`08d9446c5f1dc5d630d2bbb9879c06c399992a28fa5e7705def8acaf6af077cc`。与 Slice 11 最终候选一致。使用安装后的同一已校验 tarball，无替换 fetcher；没有改产品、测试或配置。

## 账号、目标与初始状态

- 账号 UID `599663130`，loginStatus.data.account.id 与 profile.userId 一致，非匿名。预期 UID 由用户本次允许读取的 Cookie 查询得到，并非用户另外提供的独立 UID。
- 目标为 [歌单 77629049](https://music.163.com/playlist?id=77629049)，创建者 UID `63574988`，不是当前账号。
- 前置完整歌单清单为 56 项，1 页读完；目标不在其中，详情 subscribed=false。正式写专项在写入前再次验证账号、详情和完整清单，未把前置调查当作写前即时状态。

## 实际执行与结果

正式写专项时间：2026-11-07 12:44:36 至 12:44:44（Asia/Shanghai），约 8.17 秒。Bun 1.4.4、Node v26.13.0；地区 unknown。缓存关闭、每请求 30 秒，重试 0。

| 顺序     | 实际动作                                       | 决定性结果                                              | 实际请求数 |
| -------- | ---------------------------------------------- | ------------------------------------------------------- | ---------- |
| 前置     | 身份查询、完整歌单清单、公开候选选择、目标详情 | 账号有效，目标非本人创建且未收藏                        | 4          |
| 登录专项 | authenticated 集合                             | 1 pass、0 fail、0 skip，预期 UID 与两处返回身份一致     | 1          |
| 写专项 1 | 再次确认登录身份                               | UID 599663130，非匿名                                   | 1          |
| 写专项 2 | 即时检查目标详情与完整清单                     | 非本人创建，subscribed=false，清单无目标                | 2          |
| 写专项 3 | 收藏一次                                       | HTTP 200 / body.code=200，token provider 仅取一次       | 1          |
| 写专项 4 | 等待 1500ms 后关闭缓存读回                     | userPlaylist 中包含目标                                 | 1          |
| 写专项 5 | 取消收藏一次                                   | HTTP 200 / body.code=200，不取 token                    | 1          |
| 写专项 6 | 等待 1500ms 后关闭缓存读回                     | 完整 userPlaylist 中不再包含目标，restoration=confirmed | 1          |

自动化共 12 次真实请求：前置 4、独立登录 1、写专项 7。写专项业务额度 30 次中使用 7 次，恢复预留 6 次中使用 0 次；收藏发送 1 次、取消发送 1 次，没有写重试或额外清理发送。写专项原生 JUnit 为 1 pass、0 fail、0 skip，进程退出 0，failures=[]。恢复确认来自真实列表读回，没有使用替身、旧录制或历史结果。没有记录写后列表总量，因此不声称实测总量 56→57→56；本次验收证明的是该目标的未收藏→已收藏→未收藏状态。

登录专项实际命令：

```sh
LIVE_UPSTREAM=1 HANA_LIVE_SUITE=authenticated \
NCM_LIVE_COOKIE_FILE=_notes/credential/cookie.txt \
NCM_LIVE_EXPECTED_UID=599663130 bun run test:live
```

写专项实际命令及环境（Python 子进程传入，未把凭据值放进命令）：

```sh
LIVE_UPSTREAM=1 HANA_LIVE_SUITE=writes \
NCM_LIVE_COOKIE_FILE=_notes/credential/cookie.txt \
NCM_LIVE_EXPECTED_UID=599663130 \
HANA_LIVE_ALLOW_WRITE=1 \
HANA_LIVE_WRITE_AUTHORIZATION=.artifacts/testing/e1/write-authorization.json \
NCM_LIVE_PLAYLIST_ID=77629049 \
NCM_LIVE_CHECK_TOKEN_FILE=_notes/credential/checkToken.txt \
bun run test:live
```

实际授权引用环境值为上述 JSON 的仓库绝对路径；命令块给出根目录下等价相对路径。

## 原始证据与复核

- 前置调查：`.artifacts/testing/e1/1794026054305-discovery/summary.json`。
- 登录专项：`.artifacts/testing/live/1794026067865-c2771996-7f22-4fdc-b05d-9cb3e81f509e/summary.json`。
- 写专项：`.artifacts/testing/live/1794026676855-b06d37e8-2f8c-4acf-980f-78b247ef6f85/summary.json`；同目录保留原生 junit.xml、live.json、output.log 与 output.log.stderr。
- 13 份原始日志/报告逐个检查，无当前 Cookie 各项真实值或 fresh token 泄漏。凭据原文件没有修改，也未进入 fixtures、命令正文、JUnit 或验收 Markdown。
- `.artifacts/testing/e1/final-evidence-review.json` 核对同源/同包 hash、账号、原生用例实际执行、七次实际请求顺序、各一次写入、零重试和恢复确认。
- E1 当次结构化状态：`.artifacts/testing/e1/current.json`。该次仅更新报告，没有改变其候选源码指纹；后续候选通过同字节 tarball 和 711 项文件 hash 关联，见 `ci-acceptance/e1-package-reuse.json`。

E1 的外部阻塞已解除。E1 执行当时没有提交、推送或 PR 操作授权；随后用户新增授权的提交推送、PR 119、正常与故意失败 CI、失败 artifacts、独立 live/mutation/soak 和 Node 24 均已实际验收。账号写入仍仅为上文这一轮，合并、发布、关票、远端 Secrets 和保护规则修改均未执行。
