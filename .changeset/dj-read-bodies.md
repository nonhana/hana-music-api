---
'hana-music-api': minor
---

给电台领域的 10 个只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。本批不包含电台节目、DI.FM 和订阅写操作。

### 新增公开结构定义

- `dj_banner` → `DjBannerBody`：收紧 `code`、`data`；banner 的 `targetId`、`targetType`、`pic`、`url`、`typeTitle`、`exclusive` 宽松。
- `dj_catelist` → `DjCatelistBody`：收紧 `code`、`categories`、`categories[].id`；名称和各尺寸封面宽松。
- `dj_category_excludehot` → `DjCategoryExcludehotBody`：收紧 `code`、`data`、`data[].id`；其余同 `dj_catelist`。
- `dj_category_recommend` → `DjCategoryRecommendBody`：收紧 `code`、`data`、`data[].categoryId`、`data[].radios`、`data[].radios[].id`；`icon` 的 `type`、`value`、`color` 和其余展示字段宽松，`msg` 只见过 `null`，未声明。
- `dj_detail` → `DjDetailBody`：收紧 `code`、`data`、`data.id`；`dj` 复用宽松的 `PlaylistUser` 并补 `canReward`、`rewardCount`，`commentDatas[]` 和其余展示字段宽松；`unlockInfo`、`activityInfo`、`toplistInfo`、`labelDto`、`labels`、`toast`、`limitFreeToast`、`msg` 只见过 `null`，未声明；付费电台录制覆盖 `feeInfo` 的顶层字段和 `modules[]`（含 `modules[].data[]` 节目记录、旧版 `mainSong` 及其 `album`/`artists`），`feeInfo.discountPrice` 只见过 `null`，未声明，`feeInfo.videos` 只见过空对象，声明为空对象。
- `dj_hot` → `DjHotBody`：收紧 `code`、`djRadios`、`djRadios[].id`；`hasMore`、名称、封面、分类、计数、`copywriter`、`buyed` 和 `dj` 主播宽松。
- `dj_radio_hot` → `DjRadioHotBody`：收紧 `code`、`djRadios`、`djRadios[].id`；`count`、`hasMore`、价格、计数、`descPicList` 图文、`operateUidList`/`participateUidList` 和 `dj` 主播宽松；`shortName` 只见过 `null`，未声明。
- `dj_recommend` → `DjRecommendBody`：收紧 `code`、`djRadios`、`djRadios[].id`；`name` 和其余电台字段宽松。
- `dj_recommend_type` → `DjRecommendTypeBody`：收紧 `code`、`djRadios`、`djRadios[].id`；`descPicList`、`lastUpdateProgramName` 和其余字段宽松。
- `dj_paygift` → `DjPaygiftBody`：收紧 `code`、`data`、`data.list`、`data.list[].id`；`hasMore`、价格、计数和 `subed` 宽松，`msg`、`icon`、`traceId`、`playCount` 只见过 `null`，未声明。

### 共享结构

本批只有 `dj` 主播复用已有的 `PlaylistUser`（`dj_hot`、`dj_recommend`、`dj_radio_hot`、`dj_recommend_type`、`dj_detail`），没有新增 core 导出。电台记录按接口分成三套在模块内声明：`dj_hot`/`dj_recommend` 的 `Radio` 16 个字段完全相同，但只有两个消费方；`dj_radio_hot`/`dj_recommend_type` 的 `Radio` 只差 `lastUpdateProgramName` 和 `DescPic` 的 `height`/`width`；`dj_category_recommend`/`dj_paygift` 的短推荐记录与上面两套都不同。三套都不满足“三个模块字段完全相同”的门槛，因此没有提升到 core。`dj_catelist` 与 `dj_category_excludehot` 的分类记录字段相同，但只有两个模块使用，同样留在模块里。

### 行为变化

- 这 10 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- **非 200 业务码的状态码变化**：结构定义只接受 `code: 200`。`dj_detail`、`dj_radio_hot`、`dj_recommend_type` 缺少 `rid`、`cateId`、`type` 和 `dj_hot`、`dj_radio_hot`、`dj_paygift` 非数字 `limit` 的 `code: 400` 是特殊码，以前被归一成 resolve `status: 200`，现在按业务码 reject `status: 400`（录制 `*.missing-param.json`、`*.invalid-limit.json`）；`dj_detail` 未知 `rid` 的 `code: 404`、`msg: radio not exist` 不在特殊码表里，改造前就 reject `status: 404`，现在仍 reject 相同状态（录制 `dj_detail.unknown-rid.json`）。其余 5 个模块没有必选或可非法化的参数，本批没有录到其它非 200 业务码。
- 空结果可以正常返回：`dj_hot`、`dj_radio_hot`、`dj_paygift` 的越界分页返回空数组和 `hasMore: false`（录制 `*.empty.json`）；`dj_recommend_type` 的未知分类返回空数组（录制 `dj_recommend_type.empty.json`），`dj_radio_hot` 的未知分类返回空数组和 `count: 0`（录制 `dj_radio_hot.empty-cate.json`）。`dj_banner`、`dj_catelist`、`dj_category_excludehot`、`dj_category_recommend`、`dj_recommend` 本批录制与探测未发现可达的空结果，数组本身允许为空。
- `dj_radio_hot` 的非空录制按字段覆盖保留非连续子集（索引 7/8/19/23，原始 31 条，`context.truncated` 记录 `path: "body.djRadios"`、`length: 31`）；其余模块保留完整列表。
- 登录对照在本地用登录 Cookie 重放 `login_status` 确认过 `account.anonimousUser: false`；本批未保留登录对照录制，不对公开结构作相同性断言。
- 本批模块都没有本地输入拒绝分支，参数仍按原样透传给上游。

### 迁移

- 这 10 个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- **调用方要处理按业务码拒绝的 400**：`dj_detail`、`dj_radio_hot`、`dj_recommend_type` 未传 `rid`、`cateId`、`type`，`dj_hot`、`dj_radio_hot`、`dj_paygift` 传了非数字 `limit` 时，以前 resolve HTTP 200 + 正文 `code: 400`，现在以 `status: 400` 拒绝；`dj_detail` 未知 `rid` 的 404 改造前就 reject `status: 404`，公开状态不变。先补齐或修正参数，或按 `status`/`code` 处理。
- 读 `dj_*` 的电台记录时，只有条目自己的 `id` 是收紧的 `number`；名称、封面、分类、计数、价格、`dj` 主播等宽松字段类型带 `null | undefined`，主播里的 `remarkName` 没有声明。
- `dj_detail` 的 `commentDatas` 是宽松字段，坏一条评论会丢掉整个 `commentDatas`；`feeInfo` 的顶层和 `modules[]` 已声明（节目记录和旧版 `mainSong` 的字段类型带 `null | undefined`），`feeInfo.discountPrice` 未声明，`feeInfo.videos` 是空对象。
- `dj_radio_hot` 的 `operateUidList`、`participateUidList` 是宽松数字数组，类型带 `null | undefined`；`shortName` 未声明。
- 列表接口的数组本身允许为空；分页不要假定一定有结果。

详见公开指南的[返回体结构](/guide/response-bodies)。
