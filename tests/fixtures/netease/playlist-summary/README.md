# 共用歌单类型的录制

来源：[nonhana/campanula-music](https://github.com/nonhana/campanula-music/tree/ce9e6840596e6f6214868fe55016d7d583455f6c/tests/fixtures/netease)，提交 `ce9e6840596e6f6214868fe55016d7d583455f6c`。

本目录复制该提交中 `tests/fixtures/netease/` 下文件名含 `user_playlist` 或 `playlist_detail` 的全部 76 份录制，保留原目录层级和 gzip 压缩；未压缩的 JSON 仅按本仓库规则格式化，数据未改动。录制的参数和背景见各文件的 `query`、`context`。

- `user_playlist`：7 份成功返回，327 张歌单。
- `playlist_detail`：69 份，其中 67 份成功返回，另有 401 和 404 各一份。
- 成功返回合计 394 张歌单、721 个 `creator` 或 `subscribers[]` 用户对象。

`tests/contract/playlist-summary-bodies.test.ts` 通过公开 SDK 和 Standard Schema 回放全部录制；失败返回继续按业务错误原样转交。此目录独立保留来源版本，不替换 SDK 原有的脱敏录制。
