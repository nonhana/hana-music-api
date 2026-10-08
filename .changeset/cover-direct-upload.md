---
'hana-music-api': minor
---

封面直传：新增 `image_upload_token` 模块（SDK 为 `imageUploadToken`，HTTP 路由 `/image/upload/token`），返回浏览器直传网易云图片存储所需的上传地址 `uploadUrl`、凭证 `token`、图片编号 `imgId` 和图片地址 `url_pre`，返回体带 TypeScript 类型。`playlist_cover_update` 新增 `imgId` 参数：传入已上传图片的编号时只发一次“设为封面”的请求，不再经手图片数据，失败后重试也不必重新上传；原来传 `imgFile` 整图上传的用法不变。`imgFile` 和 `imgId` 同时传入时返回 `status: 400`，不发出任何请求。
