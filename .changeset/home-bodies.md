---
'hana-music-api': minor
---

给 3 个首页读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。推荐歌单、推荐新歌、推荐 MV、独家放送和每日推荐歌单由并行批次处理，本批不重复交付；`event_del`、`event_forward` 是写操作，也不在本批范围。

### 新增公开结构定义

- `banner` → `BannerBody`：收紧 `code`、`banners`；PC 和移动端共用 `targetId`/`targetType`/`typeTitle`/`url`，PC 独有 `imageUrl`/`bigImageUrl`，移动端独有 `bannerId`/`pic`/`encodeId`/`showAdTag` 等，都按宽松字段放在同一个对象里，嵌着的歌曲复用宽松的 `LooseSong`。
- `homepage_block_page` → `HomepageBlockPageBody`：收紧 `code`、`data`、`data.blocks`、`data.blocks[].blockCode`；`data.blocks[].creatives` 是可以没有的路径，出现时里面的坏元素报 502，creative 的 `resources` 是宽松数组、整列校验失败时丢弃。`pageConfig`、`cursor`、`hasMore`、block/creative/resource 的展示字段和 `resourceExtInfo` 宽松，旧版歌曲复用 `ProgramMainSong`、新歌复用 `LooseSong`、权限复用 `LooseSongPrivilege`、主播复用 `ProgramDj`、创建者和话题用户复用 `PlaylistUser`，嵌着的电台节目复用 `DjProgram` 字段。
- `homepage_dragon_ball` → `HomepageDragonBallBody`：收紧 `code`；`message` 宽松。`data` 在登录和匿名录制里都是空数组，元素类型没有证据，未声明并原样保留。

### 共享结构

本批没有新增 core 结构。`banner`、`homepage_block_page` 复用已有的 `LooseSong`、`ProgramMainSong`、`LooseSongPrivilege`、`PlaylistUser`、`ProgramDj`、`DjProgram`、`Artist`。

### 行为变化

- 这 3 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在上述收紧路径缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- `homepage_block_page` 的非法 `cursor` 上游返回 `code: 50002`，以前包在 `status: 200` 里，现在按业务拒绝原样转交（映射为 `status: 400`，见 `homepage_block_page.invalid-cursor.json`）。`banner` 和 `homepage_dragon_ball` 本批没有可复现的非 200 路径。
- 登录对照先用 `login_status` 确认 `account.anonimousUser: false`。default 录制是登录状态；`banner` 另有独立匿名录制（PC 视角），`homepage_block_page` 另有失效凭据回匿名视角的录制（viewer 为 invalid-cookie）。两份录制都能通过同一结构校验；差异在宽松字段、`creatives` 是否出现（default 的 5 个 block 都有，invalid-cookie 的 banner block 没有）和 block 集合/顺序；不对所有账号、地区和上游版本作相同性断言。
- `banner` 和 `homepage_block_page` 本批录入的录制与探测没有找到可达的空结果：`banner` 在 `type` 0–3 下都返回非空数组，`homepage_block_page` 在登录和失效凭据回匿名视角下都返回非空 `blocks`；数组本身允许为空。
- `homepage_dragon_ball` 的 `data` 在登录与匿名录制里都是空数组，元素类型没有证据，未声明并原样保留。
- `homepage_block_page` 的录制按字段覆盖保留非连续 block 子集，并截取部分 creative/resource，见 `context.truncated`。

### 迁移

- 这 3 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- `homepage_block_page` 的非法 `cursor` 调用以前 resolve `status: 200` + 正文 `code: 50002`，现在 reject `status: 400` + 网易云原文。调用方需要处理这个状态码。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `code`。
- 读 `data.blocks[].blockCode` 时不再需要自己判空；`banners[].targetId` 仍是宽松字段（`number | null | undefined`），block 的扩展键（`extInfo`、`crossPlatformConfig`）、`resourceExtInfo` 的未声明键和 `homepage_dragon_ball` 的 `data` 仍是 JSON 值。

详见公开指南的[返回体结构](/guide/response-bodies)。
