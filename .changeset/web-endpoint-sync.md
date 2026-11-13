---
'hana-music-api': major
---

同步有官方网页调用依据的请求地址与默认身份。红心改用 `/api/song/like`，评论回复改用 `/api/v1/resource/comments/reply`，歌单曲目主请求和 512 后备同时使用网页 v1 地址；粉丝列表改为固定路径，具名歌单 batch 的三个子路由改传对象。

61 个原 EAPI 动作改为 WEAPI、网页 UA 和 `os=web`。Banner 默认/type=0 的 PC 业务改走 web，移动业务仍走 EAPI；普通播放地址改 web，显式 sky 保持 EAPI。通用 batch、歌曲排序、云盘 check/information 和专用 clientlog 等保留，完整范围及理由见 #137 的固定清单。

公开函数名、业务输入和返回体合同保持。调用方仍负责获取并传入可选 checkToken；多请求调用使用 provider，每个 API 请求取新值，未配置不强制要求。SDK 不自动加载 Watchman、读取远端配置或遇错切换协议。新默认身份可能影响上游权限与反作弊结果，离线验收不代表所有动作已在真实账号成功；Campanula 配套、实际升版与发布另行执行。
