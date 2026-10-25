# 接口与模块约定

在新增模块、调整路由、修改输入解码、Cookie 合并、响应形状或 HTTP 安全行为前阅读本文件。

## 模块合同

`src/modules/` 中的每个端点必须在本地声明并导出 `ModuleInput`，导出 `decodeModuleInput`，并将默认导出显式标注为 `ModuleEffect<ModuleInput>`。模块通过传入的 `RequestCapability` 发请求，不直接使用 `fetch`。

输入先经过 `src/core/module-input.ts` 的普通对象校验，再进入模块自己的 Schema。需要精确字段的模块声明本地字段、可选性和字面量；证据不足的旧式输入使用受控的 legacy 对象，不伪造完整接口模型。模块生成器会检查这三个导出合同，动态 loader 也会拒绝缺少 decoder 或不是 Effect 函数的模块。

模块只为确实要读取的上游字段做局部检查。普通响应体保持 `UnknownJson`，未知字段继续保留；收紧的字段（见[收紧与宽松](#收紧与宽松)）缺失或类型错误时返回带模块名和路径的 `UnexpectedUpstreamShape`。公开边界把它映射为 `status: 502`，`body.upstreamShape` 带上 `{ module, path, expected, actual }`。

## 收窄返回体

按 ADR（campanula-music `docs/adr/0005`），被下游依赖的模块在 SDK 里收窄返回体：导出 `ModuleBody` 结构定义（`Schema.toStandardSchemaV1` 包装）和同名类型，默认导出标注为 `ModuleEffect<ModuleInput, ModuleBody>`。生成器把它们以 `<模块名 PascalCase>Body` 从根入口公开；只导出类型的模块（如 `image_upload_token`）只公开类型。

- 用 `src/core/upstream-body.ts` 的 `UpstreamObject` 声明对象，每个字段按下面的[收紧与宽松](#收紧与宽松)写，未声明的字段原样保留为 JSON。宽松字段用同文件的 `Loose(schema)`，可以整个没有的路径用 `Optional(schema)`，收紧字段照常写。区分返回码时每个联合成员只认一个 `code` 字面量。
- 同一个模块按查询参数返回不同形状、正文里又没有区分字段时（如 `cloudsearch` 的 `type`、`search_suggest` 的 `type=mobile`），把各形状的字段都声明成可以缺失，放在同一个对象里，不用联合：没声明的形状（如 MV 搜索）原样通过，出现了的字段照样校验。
- 多个模块共用的上游结构（歌曲 `Song`、歌手 `Artist`）放在 `src/core/upstream-schemas.ts`，只收至少三个模块都用到、且字段完全相同的结构；各接口字段不同的实体（如三种专辑列表）留在模块里。
- 用 `decodeUpstreamBody` 校验 SDK 将要返回的 body：`code` 不在已知返回码里时作为 `UpstreamBusinessFailed` 原样转交网易云的正文（`status` 取返回码），已知返回码但结构不符时报 `UnexpectedUpstreamShape`。
- 失败正文有录制时可另外导出结构定义（如 `LoginCellphoneRiskBody`），不在运行时校验；没有录制的返回码不猜字段。
- 录制放在 `tests/fixtures/netease/<领域>/`，契约测试用自定义 fetcher 回放，覆盖原样返回、多余字段保留和结构不符三种情况，见 `tests/contract/login-bodies.test.ts`、`tests/contract/library-bodies.test.ts`、`tests/contract/playback-bodies.test.ts`、`tests/contract/search-bodies.test.ts`。一次调用要读两次上游的模块（如 `playlist_track_all`）按尝试顺序回放全部 `<module>.<label>.<n>.json`，并用 `context.part = { index, of, final, gaps? }` 标记：`of` 是尝试次数（含失败），中间无响应的尝试记在 `gaps`，正常多请求只有最后一份 `final: true`；`schema:audit` 只校验 `final: true` 的录制（无 `context.part` 的老录制视为单请求 final），其余计入 `multi-part: N (excluded)`。录制除 `context.redacted` 记录的字段外是网易云原文，不做拼写检查（`cspell.json` 忽略这个目录）。审计扫描同时读取 `.json` 和 `.json.gz`；`fixtures:record --force` 会清理同 base 的两种文件，避免新旧证据并存。SDK 的 `tests/fixtures/netease/` 是唯一证据源；补录用 `bun run fixtures:record`，Cookie 只从本机未跟踪文件读、禁止提交，列表类接口要补空结果录制。
- 验证关卡没录到、但决定字段能不能缺失或是 `null` 的情况（如搜索没有结果、歌手没有头像），可以匿名调用真实网易云补录（用 `bun run fixtures:record`，录制落在 `tests/fixtures/netease/<领域>/`），`context` 写明 `region: local` 和补录原因；补录只用来放宽已声明的字段，不用来新增声明的字段。

响应体完全由模块自己组装、每个字段都已校验时也可以导出 `ModuleBody`，例如 `image_upload_token`、`login_qr_create`。

### 收紧与宽松

字段的松紧按这一句判断：**这个字段缺了，这次调用是不是就等于没成功？是就收紧；缺了只是少一项信息，就宽松。** 判断只看接口是干什么的、录制里出现过什么，不看谁在用、以后会不会用。正常情况下会整个缺失的收紧路径另写成“可以没有”。

收紧的字段不能缺失，类型不对就报 `UnexpectedUpstreamShape`。只有四类：

- 返回码：`code`，包括区分几种返回的字面量（如扫码登录的 800–803）。
- 通到接口要返回的东西的路径：如 `body.songs`、`body.playlist`、`body.data.dailySongs`。
- 这条记录自己的编号：如每首歌的 `id`、每个歌单的 `id`、用户的 `userId`。只算接口要返回的那种记录；记录里套着的对象（歌曲里的专辑和歌手、歌单的创建者）不算，它们的编号也宽松。宽松字段里套着的记录也一样，例如歌单详情里的 `tracks`、`privileges`。
- 接口就是为了拿它的那一项：如上传凭证、二维码、刷新后的 Cookie、播放和下载地址及其返回码、账号是不是匿名。

收紧的字段只在录制证明 `null` 是正常状态时才允许 `null`，如没登录时的 `account`、拿不到地址时的 `url`。

其余字段都宽松：可能缺失，也可能是 `null`；有值但类型不对时当成缺失，不报错。缺了怎么办由使用者决定。宽松字段整个值校验失败时都当成缺失，包括数组元素里的问题。用 `Optional` 声明的“可以没有”的路径不在此列：它缺失或是 `null` 时照常返回，出现但里面一条记录不合校验时仍报 `UnexpectedUpstreamShape`。宽松字段里不要出现收紧字段。

录制只能让字段变宽松，不能让字段变收紧：

- 收紧的路径如果有录制证明正常情况下也会整个缺失（如搜索没有结果时的 `result.songs`），写成“可以没有”：缺失或是 `null` 时照常返回；出现了仍按收紧校验，里面的记录编号也照样收紧，坏一条记录就报 `UnexpectedUpstreamShape`，不会整列消失。列表类接口要有空结果的录制。这种路径用 `Optional(schema)` 声明，不加 `catchDecoding`。
- 录制里每次都出现，不是收紧的理由。#48、#59、#79 出事之前，出事的字段在录制里都一直在。

录制里出现过非 `null` 值的字段都声明；从没见过非 `null` 值的字段猜不出类型，不声明，也不声明成 `Schema.MutableJson`。只见过空数组的字段，元素类型也猜不出，同样不声明。以 SDK 仓库的 `tests/fixtures/netease/` 录制为准；在别处见到的值先补录进来再声明。每个模块的路径和“接口就是为了拿它的那一项”在加模块时定一次，在模块文件里用一句注释写明。

## SDK 与 HTTP 输入

SDK 调用把接口业务参数放在 query，把 `cookie`、`proxy`、`fetcher`、`retry`、`timeoutMs` 和 `signal` 等执行配置放在 config。HTTP 只接受业务参数以及传统的 `cookie`、`noCookie`；执行配置在发送前返回 400。

HTTP 路由按请求头 Cookie → query → body 的顺序合并，后者覆盖前者；HTTPS 响应写回 Cookie 时保留 `SameSite=None; Secure`。调试请求入口默认关闭，只有 loopback 的 `startServer` 配置可以开启。

## 路由与准入

模块名由 `src/server/module-discovery.ts` 转换为 URL 路由；模块 registry、类型表和具名 SDK 文件由 `scripts/gen-module-types.mts` 生成，不手工维护平行表。

服务准入在读取请求 body 前取得许可。默认每个连接 IP 每秒 2 次、突发 10 次，最多同时执行 32 个模块和 2 个上传；速率拒绝返回 429，容量拒绝返回 503，并附带 `Retry-After`。只有显式配置在 `traffic.trustedProxyIps` 中的连接地址才可转发客户端 IP。

携带身份的 API 只能访问已知 HTTPS 网易云 API 目标；网页和 NOS 请求也必须通过目标策略。登录、写入、批量、轮询和上传不因普通读取规则而自动重放。

## 错误与公开形状

请求层负责目标拒绝、上游限流、期限、传输和协议失败；HTTP 服务层负责入口准入拒绝；模块层负责输入错误、上游结构错误、业务失败和上传部分完成。内部错误只在公开边界映射为既有的 `{ status, body, cookie }` Promise 响应。

相关实现：`src/modules/`、`src/server/routes.ts`、`src/server/execution-input.ts`、`src/server/admission.ts`、`src/server/module-loader.ts`、`scripts/gen-module-types.mts`。
