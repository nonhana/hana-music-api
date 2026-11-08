---
'hana-music-api': major
---

上传、多请求、特殊域名和本地模块全部声明请求动作。普通模块配置不能再覆盖这些动作的协议、域名、UA、身份 Cookie、e_r 或 acceptGzip；需要自行控制请求时使用低层 createRequest。

保持业务输入、原协议与默认身份组合、Promise 和 status/body/cookie。上传的 plain 阶段继续发送原始字节，不携带网易云会话或 checkToken；多请求保留顺序、总期限、部分完成和失败停止规则。playlist_tracks 仅在原业务码 512 时发一次既有的第二请求。

audioMatch 和 relatedPlaylist 改为不自动重试。它们的动态 query 曾参与旧 URI 判定，部分合法字符串原本只发送一次；使用保守的单次策略，避免迁移后扩大这些输入的重试上限。其他成功请求内容与原协议保持。
