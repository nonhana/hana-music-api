# hana-music-api 发布日志

## 2.8.1

### Patch Changes

- 7af1815: 修复下游关闭 `skipLibCheck` 时，具名模块函数的公开声明因只读数组和可缺失字段而报 TS2411 的问题（#42）。生成的函数声明引用既有调用类型，已声明字段及未声明 JSON 字段的类型保持不变；同时移除 SDK 声明中由服务端类型入口带入的 Bun 类型依赖。严格类型检查需要加载 `@types/node`。

## 2.8.0

### Minor Changes

- 4f396df: Declare numeric `id`, `st`, and `pl` in `SongDetailBody.privileges` and each song's `privilege` in `AlbumBody` and `ArtistTopSongBody`. Validate these fields before returning SDK responses, preserve undeclared fields, and expose the same contract through the exported TypeScript types and Standard Schema validators.

## 2.7.1

### Patch Changes

- a29fbd8: 修复业务码 405 且说明为“操作频繁”或“操作过于频繁”时，因 HTTP 状态不是 405 而漏掉 `retryAfter` 的问题（#60）。限频识别不再依赖 HTTP 状态，保留网易云正文并补上建议等待秒数，不自动重试；其他 405 业务拒绝保持不变。

## 2.7.0

### Minor Changes

- d85cc6a: 修复没有简介的专辑让整个 `album` 返回以 502 拒绝的问题（#59）。`AlbumBody` 的 `album.description` 现在允许 `null`，专辑和歌曲原样返回；字段缺失或类型不符（如数字）仍返回 `UnexpectedUpstreamShape`。

  类型变化：`album.description` 从 `string` 变为 `string | null`，调用方使用简介前需要处理 `null`。沿用 #48 的 minor 发版规则。

## 2.6.0

### Minor Changes

- 37173f1: `ArtistAlbumBody` 新增顶层 `artist` 的 `id`、`name`、`img1v1Url`、`musicSize`、`albumSize` 结构定义和类型，供歌手页读取头像、歌曲数和专辑数（#53）。`name` 必须是字符串，未声明的字段原样保留；缺少 `artist` 或必填字段、字段类型不符时返回 `UnexpectedUpstreamShape`。

## 2.5.0

### Minor Changes

- ffa970c: 歌单编辑和收藏模块现在运行时校验返回体，并导出 Standard Schema 结构定义和推导类型（#22）。
- 7b6f60d: 搜索相关模块的返回体在运行时校验，并导出结构定义和类型（#21）

  - `cloudsearch`、`search_suggest` 的 `body` 有了确定的类型，只声明真实返回里确认过的字段，其余字段原样保留。
  - 根入口新增 `CloudsearchBody`、`SearchSuggestBody`。它们是 Standard Schema，不引入 Effect 也能调用 `~standard.validate`；同名类型可用 `import type` 单独引入。
  - 云搜索的单曲、专辑、歌手、歌单四类结果分别在 `result.songs`、`albums`、`artists`、`playlists`，带上各自的总数；没有结果时列表整个缺失，所以在类型里是可选的。歌词搜索的结果也在 `songs` 里，同样校验；其他搜索类型（用户、MV 等）的结果不校验，原样返回。
  - 搜索建议默认按类别给出 `songs`、`artists`、`albums`，`type` 为 `mobile` 时给关键词 `allMatch`；没有建议时 `result` 是空对象。
  - 网易云改了返回结构时，Promise 以 `status: 502` 拒绝，`body.upstreamShape` 写明模块、路径、期望和实际类型。
  - 行为变化：这两个模块遇到不认识的业务码时改为以网易云的原始正文拒绝，`status` 取业务码（不在 HTTP 状态码范围内时为 400）。受影响的是 `400` 等原来被当作成功、以 `status: 200` 返回的业务码；`301` 等原本就拒绝的业务码不变。

- a51eaee: 修复匿名注册因随机设备号的摘要包含 `+` 或 `/` 而失败的问题。公开 `generateDeviceId()` 生成合格设备号，并在 `ModuleCallConfig` 声明隐式匿名注册使用的 `deviceId` 配置（#30）。

## 2.4.0

### Minor Changes

- ed84209: 修复云盘上传的歌、凭据失效时的歌单让整个返回以 502 拒绝（#48）

  - 传到云盘、没有匹配上曲库的歌，歌手和专辑的编号是 0，名字是 `null`。以前歌曲详情、歌单中的歌曲等模块只要遇到一首这样的歌，整页都以 `status: 502` 拒绝；现在原样返回。
  - Cookie 里的 `MUSIC_U` 已经失效时，网易云给用户歌单、歌单详情的是没有登录的视角，`subscribed` 是 `null`。以前以 `status: 502` 拒绝，现在原样返回，调用方可以靠它认出需要重新登录。
  - 类型变化：歌曲的 `ar[].name`、`al.name`，专辑里的 `artist.name`、`artists[].name`，以及 `UserPlaylistBody`、`PlaylistDetailBody` 的 `subscribed`，类型都加上了 `null`。TypeScript 里直接当作字符串或布尔值使用的地方，需要先处理 `null`。
  - 这种歌只有上传者本人登录时能看到歌名。别人看、或者没有有效登录时，歌名也是 `null`，仍然以 `status: 502` 拒绝。

## 2.3.0

### Minor Changes

- 54913c9: 播放相关模块的返回体在运行时校验，并导出结构定义和类型（#20）

  - `song_url_v1`、`song_download_url_v1`、`lyric_new`、`scrobble` 的 `body` 有了确定的类型，只声明真实返回里确认过的字段，其余字段原样保留。
  - 根入口新增 `SongUrlV1Body`、`SongDownloadUrlV1Body`、`LyricNewBody`、`ScrobbleBody`。它们是 Standard Schema，不引入 Effect 也能调用 `~standard.validate`；同名类型可用 `import type` 单独引入。
  - 播放地址带上试听、无版权的标记：`url` 是 `null` 时拿不到这首歌，原因看 `code`；`freeTrialInfo` 不是 `null` 时只能试听。下载地址同样用 `url` 和 `code` 标出无版权。歌词的逐行 `lrc` 一直都在，翻译、音译、逐字可能缺失。
  - 网易云改了返回结构时，Promise 以 `status: 502` 拒绝，`body.upstreamShape` 写明模块、路径、期望和实际类型。
  - 行为变化：这些模块遇到不认识的业务码时改为以网易云的原始正文拒绝，`status` 取业务码（不在 HTTP 状态码范围内时为 400）。受影响的是 `400` 等原来被当作成功、以 `status: 200` 返回的业务码；`301` 等原本就拒绝的业务码不变。

### Patch Changes

- db440b9: 识别网易云 429 和 405 限频响应，返回 retryAfter 并禁止 SDK 自动重试。

## 2.2.0

### Minor Changes

- a1e7bcd: 曲库相关模块的返回体在运行时校验，并导出结构定义和类型（#19）

  - `user_playlist`、`playlist_detail`、`playlist_track_all`、`song_detail`、`album`、`album_sublist`、`artist_sublist`、`artist_top_song`、`artist_album`、`recommend_songs`、`likelist` 的 `body` 有了确定的类型，只声明真实返回里确认过的字段，其余字段原样保留。
  - 根入口新增这些模块的结构定义，如 `UserPlaylistBody`、`PlaylistDetailBody`、`SongDetailBody`。它们是 Standard Schema，不引入 Effect 也能调用 `~standard.validate`；同名类型可用 `import type` 单独引入。
  - 网易云改了返回结构时，Promise 以 `status: 502` 拒绝，`body.upstreamShape` 写明模块、路径、期望和实际类型。
  - 行为变化：这些模块遇到不认识的业务码时改为以网易云的原始正文拒绝，`status` 取业务码（不在 HTTP 状态码范围内时为 400）。受影响的是 `400` 等原来被当作成功、以 `status: 200` 返回的业务码；`301` 等原本就拒绝的业务码不变。

## 2.1.0

### Minor Changes

- c1c4fb0: 登录相关模块的返回体在运行时校验，并导出结构定义和类型（#18）

  - `login_qr_key`、`login_qr_create`、`login_qr_check`、`verify_getQr`、`captcha_sent`、`login_cellphone`、`user_account`、`login_status`、`user_detail`、`login_refresh`、`logout` 的 `body` 有了确定的类型，只声明真实返回里确认过的字段，其余字段原样保留。
  - 根入口新增这些模块的结构定义，如 `LoginQrCheckBody`、`UserAccountBody`，以及手机号登录被风控拦下时的 `LoginCellphoneRiskBody`。它们是 Standard Schema，不引入 Effect 也能调用 `~standard.validate`；同名类型可用 `import type` 单独引入。
  - 网易云改了返回结构时，Promise 以 `status: 502` 拒绝，`body.upstreamShape` 写明模块、路径、期望和实际类型。
  - 行为变化：这些模块遇到不认识的业务码时改为以网易云的原始正文拒绝，`status` 取业务码（不在 HTTP 状态码范围内时为 400）。受影响的是 `400`、`502` 等原来被当作成功、以 `status: 200` 返回的业务码；`301`、`8821` 等原本就拒绝的业务码不变。
  - `login_refresh` 文档改正：扫码登录和手机号登录得到的 Cookie 都能续期。

## 2.0.0

### Major Changes

- c2814d2: 去掉反作弊 token（checkToken）整套逻辑，并修复收藏歌单一律返回 405。

  - **不兼容：删掉配置项 `checkToken`。** `createRequest`、`createHanaMusicApi`、具名模块函数和 `invokeModule` 的配置都不再接受 `checkToken`，TypeScript 里写了它会编译报错，JavaScript 里写了会被忽略。SDK 内置的那个反作弊 token 是很早以前从官网抄下来的固定值，网易云会把它当成可疑请求：2026-10-09 实测，本来能成功的收藏请求带上它就变成 405。SDK 里也不再有任何模块用到它。HTTP 服务以前收到 `checkToken` 参数会返回 400，现在把它当普通参数，不再拒绝。
  - **修复 `playlist_subscribe`：** 请求固定以 iPhone 客户端身份发出（设备信息和 User-Agent 都用内置的 iPhone 配置，调用方传入的 `os`、`ua` 对这个接口不起作用），请求体只带歌单 `id`。2026-10-09 用真实账号实测，SDK 默认的 pc 设备身份或带上反作弊 token，网易云都会拒绝收藏；改用新写法后，收藏和取消收藏都成功。入参 `id`、`t` 不变。网易云拒绝时，SDK 原样返回它给的状态码和说明。
  - **已知局限：** 新写法只成功过一次收藏和一次取消，之后同一账号所有收藏请求都返回同样的 405，原因还没查清，后续验证见 #33。

## 1.4.0

### Minor Changes

- 4264128: 封面直传：新增 `image_upload_token` 模块（SDK 为 `imageUploadToken`，HTTP 路由 `/image/upload/token`），返回浏览器直传网易云图片存储所需的上传地址 `uploadUrl`、凭证 `token`、图片编号 `imgId` 和图片地址 `url_pre`，返回体带 TypeScript 类型。`playlist_cover_update` 新增 `imgId` 参数：传入已上传图片的编号时只发一次“设为封面”的请求，不再经手图片数据，失败后重试也不必重新上传；原来传 `imgFile` 整图上传的用法不变。`imgFile` 和 `imgId` 同时传入时返回 `status: 400`，不发出任何请求。

### Patch Changes

- b5c6d89: 修复 HTTP 服务从不提示“需要登录”：网易云返回数字 301 时，模块路由和演示页的接口调试都会在响应的 `msg` 里写上“需要登录”。以前拿字符串 `'301'` 去比较数字返回码，永远对不上。进程内直接调用 SDK 不受影响。

## 1.3.0

### Minor Changes

- 4c153e0: SDK 不再在本地限制发往网易云的请求频率，调用方需要自己控制请求频率。

  - 删掉进程级出口配额：以前每个身份每秒 2 次、每个上游域名每秒 4 次、同时最多 8 个请求在路上，超出的排队，排队超过 2 秒就返回 503。现在每次调用都立刻发给网易云，不排队、不延迟，也不会因为本地额度不足返回 503。
  - 删掉收到限频后的冷却：以前网易云对一个身份返回 429，会同时冷却这个身份和整个上游域名，同一进程里其他身份的调用也直接返回 429。现在这次调用照常以 429 失败、带上 `retryAfter`，SDK 不重试，也不影响其他调用。
  - 调用方（例如批量同步曲库的程序、音乐爬虫）要自己限制并发和频率，收到 429 后按 `retryAfter` 退避。
  - HTTP 服务按来访 IP 的入口限流不变（默认每个 IP 每秒 2 次、突发 10 次，最多同时执行 32 个模块），它仍然保护对外开放的 HTTP 服务。
  - 相同读请求合并、可选的结果暂存、8 秒总期限、eapi 加密和 Cookie 处理都不变。

## 1.2.1

### Patch Changes

- e59319b: SDK 现在可以在 Vercel 等 Serverless 函数里正常加载和调用：加载和首次调用都不再读写本地文件。

  - 版本号（`innerVersion` 接口和 HTTP 服务的 `/health`）改为构建时写进产物，运行时不再查找和读取 `package.json`。以前 SDK 被打包进云函数后，周围找不到 `package.json`，加载时就会报错 `Unable to locate package.json`。
  - SDK 启动时不再读取系统临时目录里的 `anonymous_token` 文件，匿名令牌只放在进程内存里：第一次不带 Cookie 的调用会注册匿名身份，函数实例被回收后，新实例会重新注册。
  - HTTP 服务和 CLI 的行为不变：启动时仍从 `ANONYMOUS_TOKEN_FILE`（缺省为系统临时目录的 `anonymous_token`）读取匿名令牌，缺少时注册并写回这个文件。

## 1.2.0

### Minor Changes

- b57dd49: 重写请求内核与模块执行架构：统一处理请求意图、身份快照、加密、限流、并发、缓存、重试、超时、取消、响应解释和资源释放。Effect 只用于内部编排，`createHanaMusicApi`、具名模块函数、`invokeModule` 与 `createRequest` 继续返回 Promise，响应继续保持 `{ status, body, cookie }` 外壳。

  所有 351 个模块现在都声明本地 `ModuleInput` 和输入解码器，并使用 `ModuleEffect` 执行；生成的 SDK 类型表与模块注册表同步更新。已确认输入会在发起请求前进行更严格的校验，依赖旧式宽松输入的调用需要按模块定义修正。

  自定义模块和动态模块作者需要采用 `ModuleDefinition`、`decodeInput`、`ModuleEffect` 与 `RequestCapability` 的新内部扩展约定；普通 SDK 使用者无需引入 Effect 或改变公开调用方式。

## 1.1.1

### Patch Changes

- 2198d3b: - 声明 MIT 开源协议。
  - 新增 LICENSE 文件，并在 package.json 中补齐 license: MIT 字段（npm 会随包发布，消费者可见）
  - 同步完善文档站：汉化 CHANGELOG、重写上手指南并新增「请求层进阶」系列文档（不影响运行时行为）

## 1.1.0

### 次要变更

- 786e9b6: 强化高频调用场景下的请求层能力与流量伪装策略。

  重点摘要：

  - 修复 weapi (`e_r`) 加密响应的解密逻辑，使其与旧实现保持一致；现在 eapi 与 weapi 的加密响应都会正确解密
  - SDK 调用路径下，当未显式提供 `ip` 或 `realIP` 时，默认注入运行时中国 IP（`cnIp`）；显式配置仍然优先，HTTP 服务路径不受影响
  - 为单次请求尝试引入保守的默认超时 8 秒；可通过 `timeoutMs: 0` 关闭
  - 默认重试“连接尚未建立”类传输错误；这类错误没有重复提交风险，而歧义性 socket 错误与业务状态码仍需显式开启重试
  - 支持通过 `acceptGzip` 显式开启 gzip eapi 响应
  - SDK 调用路径会懒加载匿名 token，并通过 single-flight 去重
  - 新增可选的 SDK 响应缓存（`cache`），同时支持 single-flight 请求去重
  - 新增可选的匿名身份池（`identityPool`），可在多次调用之间轮换 `deviceId`、`cnIp` 与 token

## 1.0.0

### 重大变更

- 9b71f47: 以 `1.0.0` 正式发布首个以 SDK 为中心的 npm 包契约。

  重点摘要：

  - 将根包导出面收敛为以 `createHanaMusicApi` 为核心的冻结 SDK 契约
  - 在根 SDK 导出面补齐 camelCase 形式的原始模块导出
  - 提供基于 tsdown 的纯 ESM 构建产物，并声明明确的 package exports
  - 补齐面向包消费者的契约校验、changesets 发版流程与 GitHub Release 自动化
