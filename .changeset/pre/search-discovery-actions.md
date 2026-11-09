---
'hana-music-api': major
---

搜索、推荐与发现的55个模块改用显式请求动作，保留39个weapi和16个eapi的原协议；最终身份分别采用web与iPhone组合。search_suggest的mobile/web目标及top_list的本地拒绝保持，业务输入和返回体不变。

普通配置的crypto、domain、ua、e_r、acceptGzip、冲突headers及受控Cookie身份字段不再覆盖这批模块的声明。需要原始协议控制时使用显式低层createRequest；旧公开配置类型与运行时覆盖已统一移除。私人FM、私人DJ和首页刷新不再自动重试连接前失败，避免连续推荐操作重放；不新增缓存、合并或其他重试资格。
