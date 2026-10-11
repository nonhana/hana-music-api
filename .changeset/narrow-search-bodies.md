---
'hana-music-api': minor
---

搜索相关模块的返回体在运行时校验，并导出结构定义和类型（#21）

- `cloudsearch`、`search_suggest` 的 `body` 有了确定的类型，只声明真实返回里确认过的字段，其余字段原样保留。
- 根入口新增 `CloudsearchBody`、`SearchSuggestBody`。它们是 Standard Schema，不引入 Effect 也能调用 `~standard.validate`；同名类型可用 `import type` 单独引入。
- 云搜索的单曲、专辑、歌手、歌单四类结果分别在 `result.songs`、`albums`、`artists`、`playlists`，带上各自的总数；没有结果时列表整个缺失，所以在类型里是可选的。歌词搜索的结果也在 `songs` 里，同样校验；其他搜索类型（用户、MV 等）的结果不校验，原样返回。
- 搜索建议默认按类别给出 `songs`、`artists`、`albums`，`type` 为 `mobile` 时给关键词 `allMatch`；没有建议时 `result` 是空对象。
- 网易云改了返回结构时，Promise 以 `status: 502` 拒绝，`body.upstreamShape` 写明模块、路径、期望和实际类型。
- 行为变化：这两个模块遇到不认识的业务码时改为以网易云的原始正文拒绝，`status` 取业务码（不在 HTTP 状态码范围内时为 400）。受影响的是 `400` 等原来被当作成功、以 `status: 200` 返回的业务码；`301` 等原本就拒绝的业务码不变。
