---
'hana-music-api': minor
---

修复没有简介的专辑让整个 `album` 返回以 502 拒绝的问题（#59）。`AlbumBody` 的 `album.description` 现在允许 `null`，专辑和歌曲原样返回；字段缺失或类型不符（如数字）仍返回 `UnexpectedUpstreamShape`。

类型变化：`album.description` 从 `string` 变为 `string | null`，调用方使用简介前需要处理 `null`。沿用 #48 的 minor 发版规则。
