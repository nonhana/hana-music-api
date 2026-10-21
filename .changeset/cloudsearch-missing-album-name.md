---
'hana-music-api': minor
---

修复 `cloudsearch` 单曲结果里有歌曲缺少专辑名时整页返回 502 的问题（#79）。`CloudsearchBody.result.songs[].al.name` 现在允许缺失，仍接受字符串和 `null`；读取类型从 `string | null` 变为 `string | null | undefined`，调用方需要处理缺失值。

SDK 原样保留完整搜索结果，不补专辑名、不丢弃歌曲；专辑名为数字等错误类型时仍返回 `UnexpectedUpstreamShape`。只放宽搜索结果，不改变 `song_detail` 等模块的共用歌曲结构。新增两个复现关键词的完整真实录制、回放测试和公开类型检查，沿用 #48 的 minor 发版惯例。
