---
'hana-music-api': major
---

将 search、lyric、songDetail、playlistDetail 迁入操作声明，分别固定协议、目标和客户端身份。搜索、歌词、歌单详情保持 eapi，歌曲详情保持 weapi 并使用完整 web 身份。普通调用的 crypto、domain、ua、e_r、acceptGzip 不再覆盖这些声明；需要低层协议控制时改用 createRequest。保留四模块的请求合并、可选缓存、身份隔离、独立取消和总期限，其他模块不会只因声明 read 就获得共享读取或更宽重试。
