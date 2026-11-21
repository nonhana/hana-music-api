# API 参考

本参考涵盖全部 352 个业务接口的地址、参数定义、调用示例与返回结构。SDK 与 HTTP 服务共用同一套业务模块，参数传递与返回形式存在差异，调用前请先阅读 [SDK 调用方式](/guide/sdk-usage) 或 [HTTP 调用约定](/guide/http-conventions)。

通用复用结构定义见 [公共数据结构](/api/shared-types)。

## 分类概览

| 分类                                                    | 数量 | 说明                                             |
| ------------------------------------------------------- | ---: | ------------------------------------------------ |
| [用户与登录](/api/user/login-cellphone)                 |   31 | 登录、账户信息、账号绑定、个人资料与验证码接口   |
| [歌曲与播放](/api/music/song-order-update)              |   26 | 歌曲详情、播放地址、歌词、私人 FM 与红心喜欢接口 |
| [搜索](/api/search/search)                              |    8 | 关键词搜索、热搜榜、默认词与搜索建议接口         |
| [歌单](/api/playlist/user-playlist)                     |   33 | 歌单详情、创建更新、歌曲管理、导入与订阅接口     |
| [专辑](/api/album/album)                                |   16 | 专辑详情、收藏管理、新碟上架与数字专辑接口       |
| [歌手](/api/artist/artist-list)                         |   19 | 歌手分类、详情、专辑、MV、热门歌曲与订阅接口     |
| [评论](/api/comment/user-comment-history)               |   16 | 评论列表、楼层评论、点赞、抱一抱与发表删除接口   |
| [推荐与发现](/api/recommend/playmode-intelligence-list) |   22 | 每日推荐、首页发现、Banner、独家放送与相似内容   |
| [排行榜](/api/toplist/top-song)                         |    5 | 榜单列表、榜单详情、新歌速递与 MV 排行接口       |
| [电台与播客](/api/dj/user-dj)                           |   41 | 电台节目、主播排行、播客声音列表与 DIFM 接口     |
| [视频与 MV](/api/video/video-sub)                       |   21 | 视频、MV、Mlog 详情与播放地址接口                |
| [社交与消息](/api/social/user-follows)                  |   25 | 动态、关注粉丝、私信发送、话题与通知消息接口     |
| [云盘与上传](/api/cloud/user-cloud)                     |    6 | 云盘列表、详情、删除、歌曲上传与匹配纠正接口     |
| [听歌记录](/api/listen/user-record)                     |   14 | 播放历史、最近播放、听歌足迹与年度听歌报告接口   |
| [一起听](/api/together/listentogether-accept)           |    9 | 一起听房间管理、状态查询、心跳与同步控制接口     |
| [会员与云贝](/api/vip/daily-signin)                     |   28 | VIP 权益、成长值、签到、云贝与音乐人数据接口     |
| [曲风](/api/style/style-list)                           |    7 | 曲风列表、偏好设置、曲风歌单与曲风歌曲接口       |
| [百科与用户贡献](/api/ugc/ugc-album-get)                |    7 | 音乐百科简要信息、歌手搜索与用户贡献记录接口     |
| [歌词摘录](/api/lyrics-mark/song-lyrics-mark)           |    4 | 歌词摘录查询、歌词本分页、添加编辑与删除接口     |
| [其他工具](/api/other/pl-count)                         |   14 | 批量请求、国家编码、乐谱、行为验证与广播电台接口 |

## 通用调用原则

- **登录凭证**：需要账号权限的接口须传入有效 Cookie。SDK 放在第二个参数 `config.cookie` 中，HTTP 放在请求头或 `cookie` 参数中，详见 [认证机制](/guide/authentication)。
- **参数传递**：SDK 直接传入数组、对象、数字或布尔值等原生类型。HTTP 通过 query 或 JSON body 传参，未声明字段会在发送前以 `400` 拒绝。
- **文件上传**：上传接口须提供实际文件。SDK 传入文件描述对象，HTTP 使用 `multipart/form-data` 提交。
- **返回体结构**：315 个接口具备已建模返回体类型与运行时校验，其余 37 个未建模接口返回 `UnknownJson`。失败判定与状态码映射见 [返回值与错误处理](/guide/error-handling)。
