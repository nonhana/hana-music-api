---
'hana-music-api': patch
---

统一歌单收藏的网页请求身份与按次 token 策略，阻止协议、域名、请求头和旧客户端 Cookie 字段覆盖网页身份；保留收藏可不传 token、取消不取 token 的行为。
