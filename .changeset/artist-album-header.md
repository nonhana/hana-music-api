---
'hana-music-api': minor
---

`ArtistAlbumBody` 新增顶层 `artist` 的 `id`、`name`、`img1v1Url`、`musicSize`、`albumSize` 结构定义和类型，供歌手页读取头像、歌曲数和专辑数（#53）。`name` 必须是字符串，未声明的字段原样保留；缺少 `artist` 或必填字段、字段类型不符时返回 `UnexpectedUpstreamShape`。
