---
'hana-music-api': major
---

会员、数字专辑、云贝、音乐人、收听统计、历史、年度、乐谱与batch的50个接口固定迁移前协议和默认身份；普通crypto、domain、ua、e_r、acceptGzip和受控身份Cookie覆盖不再生效。账号会话和执行配置继续按调用传递，需要手动控制协议时使用低层createRequest。

下单、签到、奖励领取、云贝推歌和batch不自动重放；报告、签到活动信息与收入/支出明细查询保持原有不重试上限，全部不新增缓存或合并。业务输入、响应Schema、Promise与Cookie外壳保持。
