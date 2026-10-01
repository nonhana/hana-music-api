# API 参考

这里按分类整理接口地址、参数和调用示例。HTTP 与 SDK 共用业务模块，但参数和返回形式不同，先阅读 [HTTP 调用约定](/guide/request-convention) 或 [编程式调用](/guide/programmatic-api)。

## 分类概览

| 分类                                                    | 数量 | 说明                                              |
| ------------------------------------------------------- | ---: | ------------------------------------------------- |
| [用户与登录](/api/user/login-cellphone)                 |   33 | 登录、账户、绑定、资料和验证码相关接口。          |
| [歌曲与播放](/api/music/song-order-update)              |   26 | 歌曲详情、播放链接、歌词、私人 FM 与喜好管理。    |
| [搜索](/api/search/search)                              |    8 | 搜索、热搜、默认词与搜索建议接口。                |
| [歌单](/api/playlist/user-playlist)                     |   33 | 歌单详情、更新、导入、订阅与用户歌单接口。        |
| [专辑](/api/album/album)                                |   16 | 专辑详情、订阅、新碟与数字专辑相关接口。          |
| [歌手](/api/artist/artist-list)                         |   19 | 歌手详情、专辑、MV、热门歌曲与订阅接口。          |
| [评论](/api/comment/user-comment-history)               |   16 | 评论列表、楼层评论、点赞、抱一抱与新版评论接口。  |
| [推荐与发现](/api/recommend/playmode-intelligence-list) |   23 | 推荐歌单、日推、首页发现、Banner 与相似内容接口。 |
| [排行榜](/api/toplist/top-song)                         |    6 | 榜单、榜单详情、新歌与 MV 排行接口。              |
| [电台与播客](/api/dj/user-dj)                           |   41 | DJ、电台、声音、播客与 DIFM 相关接口。            |
| [视频与 MV](/api/video/video-sub)                       |   21 | 视频、MV、Mlog 与相关播放地址接口。               |
| [社交与消息](/api/social/user-follows)                  |   25 | 动态、关注、私信、分享、话题与点赞接口。          |
| [云盘与上传](/api/cloud/user-cloud)                     |    6 | 云盘、导入、匹配和上传能力。                      |
| [听歌记录](/api/listen/user-record)                     |   14 | 播放记录、最近收听与听歌足迹相关接口。            |
| [一起听](/api/together/listentogether-accept)           |    9 | 一起听房间、状态、同步与控制相关接口。            |
| [会员与云贝](/api/vip/daily-signin)                     |   28 | VIP、云贝、音乐人、签到与成长值相关接口。         |
| [曲风](/api/style/style-list)                           |    7 | 曲风列表、偏好、曲风歌单与曲风歌曲接口。          |
| [百科与用户贡献](/api/ugc/ugc-album-get)                |    7 | 音乐百科、歌手搜索与用户贡献内容接口。            |
| [歌词摘录](/api/lyrics-mark/song-lyrics-mark)           |    4 | 歌词摘录、编辑与我的歌词本接口。                  |
| [其他工具](/api/other/pl-count)                         |   19 | 批量请求、国家编码、广播电台等辅助接口。          |

## 说明

- 需要登录的操作要提供有效 Cookie，SDK 中放在执行配置里。
- 部分旧页面还没有完整参数表。示例用于展示调用形式，具体输入以当前模块声明和说明为准。
- 上传接口需要文件，使用 POST multipart 或 SDK 文件对象，不能只请求一个空 URL。
- 普通响应正文保留未知 JSON，页面列出的字段和登录可用性仍可能随上游变化。
