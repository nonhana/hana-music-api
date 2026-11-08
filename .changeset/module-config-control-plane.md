---
'hana-music-api': major
---

将普通模块配置与显式低层选项分开。普通模块移除 crypto、ua、domain、e_r、acceptGzip、headers 和顶层 deviceId；运行时拒绝这些键（包括 undefined）及未知键，执行配置不能混入业务 query。设备改用 state.deviceId，Cookie 头改用 cookie，需要原始协议和请求头时使用 createRequest，createOption 只服务低层请求。

全部模块必须声明动作，本地模块保留空声明。删除缺声明 fallback、模块默认协议、URI 语义正则和模块名缓存名单，缓存、重试及上传期限由动作决定。低层保留原始协议、默认目标和凭据外送校验，但不再猜测业务语义或自动重放。保留 #122 身份、checkToken、业务参数、返回体与上传阶段行为。
