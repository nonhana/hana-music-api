---
'hana-music-api': minor
---

声明并校验 `PlaylistDetailBody.playlist.status` 数字字段，让调用方能识别仍返回成功正文的已删除歌单（状态为 10），同时保留未声明的上游字段。
