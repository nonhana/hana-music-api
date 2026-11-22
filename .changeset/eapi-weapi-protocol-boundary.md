---
'hana-music-api': patch
---

确立 `eapi` 与 `web`（`weapi`）四层协议分界线（ADR-0007），并将 `song_download_url_v1.read`、`song_url_v1.read` 与 `login_refresh.request` 恢复至 `eapi`，修复浏览器下载音频直链时的 CDN CORS 失效/限速与 `MUSIC_U` 续期不轮换回归；同时在 `scripts/audit-upstream-endpoints.mts` 与测试/变异套件中加入自动边界门禁。公开导出、输入/响应体 Schema 与错误分类保持不变。
