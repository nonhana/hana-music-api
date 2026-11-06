# ADR-0001：请求动作与客户端身份分别声明

状态：已采用，适用于 [#105](https://github.com/nonhana/hana-music-api/issues/105) 的首条迁移。

## 原因与决定

模块原来能分别指定协议、域名、UA 和 Cookie，歌单收藏还需要改写 Call 才能形成网页请求。现在由 profile 统一决定这些客户端身份字段、加密响应等协议选项和 token 放置；模块按动作声明业务语义、token 策略、缓存和重试资格。profile 不保存 MUSIC_U、MUSIC_A 等会话，它们继续来自每次调用的不可变身份快照。

模块导出的 `moduleActions` 同时进入生成的 SDK registry 与 HTTP 动态 loader，调用时复制并冻结，避免等待 token 时声明被改动。动作可以使用固定 API 路径或有边界的动态路径；请求层按 URL 的规范化结果检查边界，再核对最终 URL。纯本地模块用空动作集，多请求模块逐动作声明。

保留 SDK/HTTP → runCall → 模块 → RequestCapability/RequestIntent → requestEffect → prepareRequest → transport 这条执行链。token 在请求层按次读取，不缓存、不重放，不进入 URL、Cookie 或事件日志；provider 等待属于本次期限。写动作绕过 ReadStore，无论模块名是否落在旧读取白名单中，都不合并、不缓存、不自动重试。

## 首条合同与证据

`playlist_subscribe` 的收藏和取消都使用 web：weapi、music.163.com、浏览器 UA、os=web，e_r=false，不接受 x-aeapi。appver、channel、osver、clientSign、buildver、mobilename、versioncode、resolution、brand、mode 及其大小写变体不进入网页请求；其余 Cookie 按调用快照保留，原有设备与网页 Cookie 的生成规则继续适用。

收藏 token 为 optional：没配置就不带，配置了却失败或为空就在发送前失败；取消为 none，完全不取 token。正文 checkToken 与 HTTP 头 X-antiCheatToken 使用同一个值。HTTP 通用执行配置继续拒绝 checkToken。

协议、目标和 token 位置依据 [#77 的官方现代 web player 调查](https://github.com/nonhana/hana-music-api/issues/77#issuecomment-6238560685) 与 [PR #78](https://github.com/nonhana/hana-music-api/pull/78)。本次以本地 fetcher 检查最终请求并解密测试正文；旧响应录制保持原来源，不作为本次真实上游或完整浏览器 Cookie 抓包证据。

## 兼容边界与过渡删除条件

保留 Promise、id/t 业务参数、status/body/cookie 外壳、返回体 Schema 和用户会话。普通配置不能再覆盖本模块的受控身份字段；这延续收藏模块原来强制网页请求的约定。本次不删除其他模块的公开配置字段；P12 删除公开字段时使用 major changeset，并保留显式低层 createRequest 及其目标和凭据外送校验。

本次唯一迁移模块为 playlist_subscribe。其余 351 个模块由生成的 generatedPendingActionModuleIdentifiers 完整枚举；该清单只说明迁移范围，不代表所有模块已通过 profile 验收。旧默认协议、模块名缓存名单和 URI 语义判定仅供这些未迁移模块沿原执行链使用。P2、P5 及各领域批次完成后，P12 必须删除可选动作声明分支和旧判定，装配时要求每个模块声明所有实际动作；纯本地模块也不能省略空声明。
