---
'hana-music-api': major
---

播客、广播、MV、视频、声音和声音列表的67个接口固定迁移前协议与默认身份；普通crypto、domain、ua、e_r、acceptGzip和受控身份Cookie覆盖不再生效。账号Cookie与执行配置继续按调用传递，需要显式协议控制时使用低层createRequest。

时间线、分组视频、个性推荐、今日优选、DIFM播放列表及mlog推荐采用保守的单次请求策略，避免自动重放可能变化的推荐内容；订阅、取消、声音删除和声音排序保持不自动重放，全部不新增缓存或合并。业务输入、响应Schema与Promise返回外壳保持。
