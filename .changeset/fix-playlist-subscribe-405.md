---
'hana-music-api': major
---

去掉反作弊 token（checkToken）整套逻辑，并修复收藏歌单一律返回 405。

- **不兼容：删掉配置项 `checkToken`。** `createRequest`、`createHanaMusicApi`、具名模块函数和 `invokeModule` 的配置都不再接受 `checkToken`，TypeScript 里写了它会编译报错，JavaScript 里写了会被忽略。SDK 内置的那个反作弊 token 是很早以前从官网抄下来的固定值，网易云会把它当成可疑请求：2026-10-09 实测，本来能成功的收藏请求带上它就变成 405。SDK 里也不再有任何模块用到它。HTTP 服务以前收到 `checkToken` 参数会返回 400，现在把它当普通参数，不再拒绝。
- **修复 `playlist_subscribe`：** 请求固定以 iPhone 客户端身份发出（设备信息和 User-Agent 都用内置的 iPhone 配置，调用方传入的 `os`、`ua` 对这个接口不起作用），请求体只带歌单 `id`。2026-10-09 用真实账号实测，SDK 默认的 pc 设备身份或带上反作弊 token，网易云都会拒绝收藏；改用新写法后，收藏和取消收藏都成功。入参 `id`、`t` 不变。网易云拒绝时，SDK 原样返回它给的状态码和说明。
- **已知局限：** 新写法只成功过一次收藏和一次取消，之后同一账号所有收藏请求都返回同样的 405，原因还没查清，后续验证见 #33。
