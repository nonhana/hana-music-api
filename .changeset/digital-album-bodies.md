---
'hana-music-api': minor
---

给 7 个数字专辑与会员只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `digitalAlbum_detail` → `DigitalAlbumDetailBody`：与 `album_detail` 共用同一个上游详情接口，结构复用 `AlbumDetailBody`；收紧 `code`、`album`、`album.albumId`、`product`。
- `digitalAlbum_sales` → `DigitalAlbumSalesBody`：收紧 `code` 和销量映射 `data`（键是专辑 id，值是数字销量）。
- `digitalAlbum_purchased` → `DigitalAlbumPurchasedBody`：收紧 `code`；`paidAlbums` 只有空数组证据、元素类型未知，未声明并由 `UpstreamObject` 原样保留；`total` 宽松。
- `vip_timemachine` → `VipTimemachineBody`：收紧 `code`、`data`、`data.detail`（可以没有，无记录时为 `null`）、`data.detail[].rowKey` 和 `data.detail[].data`；每份周报的报告体必填，缺失、`null` 或非对象报 502；四种 `type` 的报告内容写进同一个宽松结构。
- `vip_growthpoint` → `VipGrowthpointBody`：收紧 `code`、`data`、`data.userLevel`、`data.userLevel.userId`、`data.userLevel.growthPoint`；`levelCard` 宽松。
- `vip_growthpoint_details` → `VipGrowthpointDetailsBody`：收紧 `code`、`data`、`data.details`；记录里的 `resourceId`、`descript`、`growthPoint`、`time` 宽松。
- `vip_tasks` → `VipTasksBody`：收紧 `code`、`data`、`data.taskList`、`data.taskList[].taskItems`、`data.taskList[].taskItems[].taskId`；本批只录到一条任务，`taskId` 为字符串。

### 行为变化

- 这 7 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段缺失或类型不对时丢这一项，`null` 原样保留。
- `digitalAlbum_detail` 与 `album_detail` 的 `body` 形状一致，只是公开模块名不同。

### 非 200 业务码的状态变化

- `digitalAlbum_detail` 未知 id 返回 `{ code: 404, message: '无专辑商品' }`，`digitalAlbum_sales` 缺 `ids` 返回 `{ code: 400, msg: '参数错误', massage: '参数错误' }`、空 `ids` 返回 `{ code: 500, message: '销量查询失败' }`。其中 `code: 400` 是特殊码，改造前被 `SPECIAL_STATUS_CODES` 归一成 resolve `status: 200`，现在按业务拒绝 reject `status: 400`；`code: 404` 和 `code: 500` 不在特殊码表里，改造前就是 reject `status: 404`/`500`（`ProtocolFailed`），现在仍 reject 相同状态（`UpstreamBusinessFailed`）。三种路径的 `body` 都是网易云原文。
- 迁移：`digitalAlbum_sales` 缺 `ids` 的 `code: 400` 从 resolve `status: 200` 变成 reject `status: 400`，依赖它返回正文的调用方需要 `try/catch`；`digitalAlbum_detail` 的 404 和空 `ids` 的 500 改造前就 reject，公开状态不变。不要依赖错误文案（400 用 `msg`/`massage`，404/500 用 `message`），只看 `code`。

### 空结果

- `digitalAlbum_purchased` 的 `paidAlbums` 为空数组；列表为空时 `offset=100000` 仍为空（录制 `digital-album/digitalAlbum_purchased.offset-100000.json`）。
- `vip_growthpoint_details` 的 `offset=100000` 越过列表返回 `details: []`（录制 `vip/vip_growthpoint_details.offset-100000.json`）。
- `vip_timemachine` 无记录的周区间返回 `data.detail: null`（录制 `vip/vip_timemachine.empty.json`，声明为可以没有）。
- `vip_tasks` 在本批录制（匿名与登录）里没有出现可达的空任务列表。
- `digitalAlbum_sales` 的未知专辑返回 `0`；空 `ids` 返回 `code: 500`，没有空映射形态。

### 登录对照

- 先确认 `login_status` 的 `account.anonimousUser` 为 `false`。`digitalAlbum_detail` 的登录对照只在 `vipType` 等宽松字段上出现值差异，登录对照未保留录制。
- 匿名对照录制保留为 `vip/vip_growthpoint.anonymous.json`、`vip/vip_growthpoint_details.anonymous.json`、`vip/vip_tasks.anonymous.json` 和 `digital-album/digitalAlbum_purchased.anonymous.json`；不对匿名与登录的公开结构作相同性断言。

### 其他

- 写操作不在本批范围：`digitalAlbum_ordering`（下单/购买）和 `vip_growthpoint_get`（领取成长值）没有改动。

### 迁移

- 读取 `digitalAlbum_detail` 时按 `body.album.albumId` 取数字专辑编号，`body.product` 的价格、简介和 `extInfo` 仍是宽松字段。
- `digitalAlbum_sales.data` 是 `Record<string, number>`。
- `digitalAlbum_purchased.paidAlbums` 只有空数组证据、元素类型未知、未声明；使用前请自行校验。录制账号未购买，也没有另一个已购买账号可补录。
- `vip_timemachine.data.detail` 的类型包含 `null | undefined`，每份记录的报告体 `data` 必填；`vip_tasks` 的任务 `taskId` 已收紧为 `string`。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。

详见公开指南的[返回体结构](/guide/response-bodies)。
