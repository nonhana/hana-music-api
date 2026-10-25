---
'hana-music-api': minor
---

给 6 个账号校验与基础查询只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `cellphone_existence_check` → `CellphoneExistenceCheckBody`：收紧 `code` 和注册状态 `exist`（`1` 已注册、`-1` 未注册）；回显手机号、`nickname`、`avatarUrl`、`hasPassword`、`hasSnsBinded`、`countryCode` 宽松。
- `nickname_check` → `NicknameCheckBody`：收紧 `code` 和 `duplicated`；`candidateNicknames` 只在昵称重复时提供，按“可以没有”处理，出现坏记录仍报 502；`nickname` 宽松。
- `get_userids` → `GetUseridsBody`：收紧 `code` 和昵称到 user id 的映射 `nicknames`；没有匹配的昵称时映射是空对象，混合查询只返回存在的键。
- `countries_code_list` → `CountriesCodeListBody`：收紧 `code`、国家分组 `data`、每组 `countryList` 和国家记录自己的区号 `countryList[].code`；`label`、`zh`、`en`、`locale` 和 `message` 宽松。
- `verify_qrcodestatus` → `VerifyQrcodestatusBody`：收紧 `code`、`data` 和 `data.qrCodeStatus`；`data.detailReason` 与 `message` 宽松，缺失或 `null` 照常返回；有值但类型不对时丢这一项。上游成功码是字符串 `"200"`，请求层会归一成数字 200，结构定义同时接受两者。
- `pl_count` → `PlCountBody`：只收紧 `code`；私信、通知、关注等计数和 `friend`、`eventUser`、`sceneComments`、`battle` 里的字段全部宽松（同 `user_subcount`）。

### 行为变化

- 这 6 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- `verify_qrcodestatus` 的空 `qr`（`code: 400`，`qrcode is null`）以前被 `SPECIAL_STATUS_CODES` 映射成 `status: 200` 放行，现在按业务码拒绝为 `status: 400`；未登录（`code: 301`，`un login`）的公开状态原本就是 `301`，改造前 resolve、现在 reject。两者的 `body` 都保留原文，`code` 由请求层归一成数字。
- 空结果：`get_userids` 只查不存在的昵称时返回 `nicknames: {}`（`get_userids.no-match.json`），存在与不存在的昵称混合查询只返回存在的键（`get_userids.multi.json`）；`nickname_check` 昵称可用时没有 `candidateNicknames`。`countries_code_list` 没有分页或其他输入，默认参数探测返回 22 组、189 个国家（`bun run fixtures:record countries_code_list --out /tmp/b39-countries-probe`），未发现可达的空结果，数组本身允许为空。
- 登录对照先用 `login_status` 确认 `account.anonimousUser: false`（账号 599663130）；`cellphone_existence_check`、`nickname_check`、`get_userids`、`countries_code_list` 本批未保留匿名对照，不对公开结构作相同性断言。`pl_count` 保留匿名录制，`pushMsg` 是 `null`、`eventUser` 缺失；`verify_qrcodestatus` 需要登录。
- `verify_qrcodestatus` 没有可构造的扫码会话，只录到已失效二维码（`qrCodeStatus: 21`）；未扫（`0`）、已扫（`10`）、已确认（`20`）三态没有录制，未声明额外字段。

### 迁移

- 这 6 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- 读 `nickname_check.candidateNicknames` 时类型带 `null | undefined`；`get_userids.nicknames` 的类型是字符串到数字的只读映射。
- `verify_qrcodestatus` 的 `code` 类型同时包含 `200` 和 `'200'`，但运行时返回的是数字 200；`data.qrCodeStatus` 不再需要自己判空，`data.detailReason` 的类型带 `null | undefined`。

详见公开指南的[返回体结构](/guide/response-bodies)。
