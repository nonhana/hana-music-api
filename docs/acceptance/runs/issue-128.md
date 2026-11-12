# #128 实施记录

基线：`c9c27fb3c07340476b998bf6c30675c547ccd10a`；分支 `refactor/issue-128-input-contracts`；工作区开工时干净。

## 批次

| 批次             | 模块数 | 状态 | 审查 |
| ---------------- | -----: | ---- | ---- |
| 共享基建与样板   |     10 | 完成 | 完成 |
| account          |     22 | 完成 | 完成 |
| user-social      |     39 | 完成 | 完成 |
| album            |     11 | 完成 | 完成 |
| artist           |     23 | 完成 | 完成 |
| toplist-style    |     28 | 完成 | 完成 |
| song-lyric       |     25 | 完成 | 完成 |
| playback-video   |     20 | 完成 | 完成 |
| playlist         |     26 | 完成 | 完成 |
| comment          |     13 | 完成 | 完成 |
| msg-topic        |     16 | 完成 | 完成 |
| dj               |     30 | 完成 | 完成 |
| program-voice    |     13 | 完成 | 完成 |
| search-discovery |     24 | 完成 | 完成 |
| library          |     18 | 完成 | 完成 |
| vip-yunbei       |     18 | 完成 | 完成 |
| musician-signin  |     10 | 完成 | 完成 |
| misc             |     16 | 完成 | 完成 |

## 命令与结果

开工门禁：

- `bun run typecheck`：通过（共享基建、样板、文档）。
- `bun test tests/unit/schema/module-input.test.ts`：通过。
- `bun test tests/behavior/modules/input-contracts.test.ts -t "<样板模块>"`：通过。
- `bun test tests/behavior/modules/special/input-encoding.test.ts`：通过。
- `bun test tests/behavior/modules/library/read-modules.test.ts tests/behavior/modules/special/special-chains.test.ts tests/replay/library/library-bodies.test.ts tests/replay/playlist/playlist-edit-bodies.test.ts tests/replay/activity/listen-together-bodies.test.ts`：通过（534 项）。

## 最终门禁

- `bun run typecheck`：通过。
- `bun run lint`：通过（0 warning / 0 error）。
- `bun run fmt:check`：通过（随 `verify:sdk`）。
- `bun run test`：通过，8299 pass / 0 fail / 0 skip。
- `bun run verify:sdk`：通过（模块类型、构建、SDK 合同、typecheck、lint、spell、fmt、docs build）。
- `bun run verify:fixtures`：通过，761 个录制通过，4 个无 ModuleBody 跳过，0 failure。
- `bun run test:load:smoke`：通过，142 个 smoke 测试与 500 请求负载 smoke。
- `bun scripts/mutation-test.mts --all`：见下方 mutation 记录。

## Fixture 与测试调整

- 旧协议输入在 decoder 阶段被拒绝后，双轴 fixture 中仅用于失败历史的 `empty/null/false/zero/string-zero` 变体不再作为合法请求；共享 request fixture 删除这些条目，防止 package consumer 把 400 当作 403 拒绝。
- `top_list` 的 `idx` 现在在发送前返回 500；该 fixture 条目删除，策略测试 `idx: 1` 继续覆盖。
- `voice_delete`、`song_url`、`song_url_v1`、`playlist_order_update`、`song_order_update`、`song_like_check`、`send_album` 等改为数组/对象业务输入，并同步 wire data。
- `artist_list` 保留 `initial: -1` 哨兵；`voicelist_trans.position` 拒绝 0；`batch` 保留非 `/api/` 键静默过滤，同时对 `/api/` 值做运行时校验。

## Mutation

- `bun scripts/mutation-test.mts --all`：121 killed / 0 survived / 0 invalid（最终候选）。
- 分组：membership-business、podcast-video、account-social、search-discovery、library-playback、check-token、playlist-subscribe、shared-reads、upload、watchman、browser-types、module-config 均全部 killed。
