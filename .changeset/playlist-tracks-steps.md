---
'hana-music-api': minor
---

为 playlistTracks 增加可选的 step：initial 只发送首次请求，业务码 512 按现有失败合同返回；fallback 使用原始曲目数组直接发送一次后备请求，由 SDK 负责重复编号和编码。省略 step 时保留现有自动后备行为。

应用可以在确认 512 后再获取第二枚 token，并用新的 Cookie、设备、checkToken、取消和期限配置调用 fallback。两个调用不共享状态，SDK 不自动获取或复用 token，也不提供跨调用事务或回滚。
