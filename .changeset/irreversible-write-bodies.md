---
'hana-music-api': minor
---

给匿名注册模块补上结构定义（`ModuleBody`）并在运行时校验返回体。评论、私信发送和数字专辑下单在本批没有成功正文证据，未声明结构定义；这 5 个缺口单列在下面。

### 新增公开结构定义

- `register_anonimous` → `RegisterAnonimousBody`：收紧 `code`、新建匿名账号自己的编号 `userId` 和匿名凭据 `cookie`；`createTime` 宽松。`body.cookie` 由响应的 Set-Cookie 拼出，不是上游 JSON 字段，拼好后和外层 JSON 一起校验。
- 录制 `login/register_anonimous.default.json` 是匿名注册成功正文，账号编号已换成合成值 `10000001`；公开体的凭据只在 `context.expect` 保留脱敏占位值 `<redacted>`，真实令牌不落盘。

### 行为变化

- `register_anonimous` 开始做运行时结构校验：收紧字段缺失或类型不对时报 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）；返回体没有非空 `MUSIC_A` 时仍按 `cookie.MUSIC_A` 报 502。
- **请求层旧行为**分两档：2xx 业务码原样 resolve（状态取业务码）；`201`、`302`、`400`、`502`、`800–803` 在 `SPECIAL_STATUS_CODES` 里，归一成 `status: 200` resolve。其余业务码按状态码 reject（`100–599` 取原值，其余 `400`），正文保留网易云原文。
- `register_anonimous` 以前在 `code !== 200` 时把请求层归一后的响应原样返回，2xx 业务码和特殊码都会 resolve；现在 `decodeUpstreamBody` 只把 `200` 当成功，其他返回码全部 reject，`status` 按上一档规则（例如 `code: 400` 以前归一成 `status: 200` resolve，现在 reject `status: 400`）。成功返回缺少 `userId` 或匿名凭据时现在会 502；`cookie` 现在是必填项，调用方如果自己构造过该返回，需要补上 `userId` 和 `cookie`。

### 录制缺口（成功正文未验证）

以下 5 项只录到上游拒绝或缺参，均未声明 Body，返回体继续按原始 JSON 放行：

- `comment` 新增（`comment_add`）：歌曲 `1394617453`、`type: 0`、`t: 1`，内容带测试标记前缀，被上游风控拒绝 `code: 250`（`comment/comment.add-rejected.json`）；换短内容、自然内容、其他歌曲和歌单评论同样 250。没有成功正文和评论 id，`t: 0` 的删除没有调用，避免误删历史评论。
- `comment` 删除（`comment_delete`）：没有刚发布、属于自己且可以安全删除的评论 id，列为缺口。
- `send_text`：发给自己（`user_ids` 的账号编号已换成合成值）被上游以 `code: 2201`（发送过于频繁）拒绝（`msg/send_text.rejected.json`），换自然内容重试同样被拒；发给自己可能本身不允许，无法区分频率限制与不允许发给自己。
- `send_song`：发给自己歌曲 `1394617453` 被上游以 `code: 2201`（发送过于频繁）拒绝（`msg/send_song.rejected.json`）；同样无法区分频率限制与不允许发给自己。
- `digitalAlbum_ordering`：只录到缺 `id`/`payment` 参数时的 HTTP 400 空正文（`digital-album/digitalAlbum_ordering.missing-params.json`）；**未实际下单、未支付**，成功正文未验证。

补录条件统一为：风控解除后（或改用第二个账号），用 `bun run fixtures:record` 重录成功体，再按 Skill 决定字段松紧；`comment` 的删除要在新增成功后用自己的评论 id 录制，并回读确认评论消失。

### 迁移

- `register_anonimous` 的 `body` 类型从原始 JSON 值变成收窄后的结构；`userId` 是 `number`，`cookie` 是 `string`（由 Set-Cookie 拼出），`createTime` 是 `number | null | undefined`。
- 需要处理新的 502 和业务拒绝：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- 其余 5 个写操作（4 个模块）的返回体类型不变。

详见公开指南的[返回体结构](/guide/response-bodies)。
