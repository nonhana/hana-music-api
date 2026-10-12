---
'hana-music-api': patch
---

修复云盘上传的歌、凭据失效时的歌单让整个返回以 502 拒绝（#48）

- 传到云盘、没有匹配上曲库的歌，歌手和专辑的编号是 0，名字是 `null`。以前歌曲详情、歌单中的歌曲等模块只要遇到一首这样的歌，整页都以 `status: 502` 拒绝；现在原样返回。
- Cookie 里的 `MUSIC_U` 已经失效时，网易云给用户歌单、歌单详情的是没有登录的视角，`subscribed` 是 `null`。以前以 `status: 502` 拒绝，现在原样返回，调用方可以靠它认出需要重新登录。
- 类型变化：歌曲的 `ar[].name`、`al.name`，专辑里的 `artist.name`、`artists[].name`，以及 `UserPlaylistBody`、`PlaylistDetailBody` 的 `subscribed`，类型都加上了 `null`。TypeScript 里直接当作字符串或布尔值使用的地方，需要先处理 `null`。
- 这种歌只有上传者本人登录时能看到歌名。别人看、或者没有有效登录时，歌名也是 `null`，仍然以 `status: 502` 拒绝。
