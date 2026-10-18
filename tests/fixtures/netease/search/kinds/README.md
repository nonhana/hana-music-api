# 搜索歌单录制

来自 [Campanula 的 #31 返工录制](https://github.com/nonhana/campanula-music/tree/b1794c7eebde8a070e0409126b2e2ccda68f6bd8/tests/fixtures/netease/search/kinds)，用于 hana-music-api #82 的返回体契约测试。

原始 `.json.gz` 已脱敏，这里解压为 JSON 并统一格式，保留完整正文和录制上下文。录制时间为 2026-10-18 北京时间，SDK 为 2.9.0，登录视角为 `vip-qr`。

- `001-search_suggest.json`：“真夜中”，有 2 张歌单，没有歌手建议。
- `002-search_suggest.json`：“周杰伦”，单曲、歌手、专辑和歌单四类都有。
- `004-cloudsearch.json`：“真夜中”，`type: 1000`，返回 30 张歌单（总数 188），`playCount` 均为数字。

不含歌单建议的匿名录制沿用上级目录的 `search_suggest.json`（“夜に”）。
