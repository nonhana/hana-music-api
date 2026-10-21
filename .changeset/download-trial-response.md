---
'hana-music-api': patch
---

补充 `song_download_url_v1` 的真实匿名会员歌录制与契约测试：standard、higher、exhigh 均返回 `data.code: -105`、`url: null`、`size: 0`，而不是试听文件。文档说明下载权限不足时的判断方式，以及顶层成功码与单曲下载返回码的区别；保留现有公开类型，不新增未经录制确认的试听字段。
