---
'hana-music-api': minor
---

给 5 个动态与话题读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `event` → `EventBody`：收紧 `code`、`event`、`event[].id`；转发数、评论数、图片、作者、`topEvent` 和展示字段宽松；`privacySetting`、`uuid` 也是宽松字段；`contentDeclaration`、`repostSource` 按事件列表里的空串证据声明为宽松字符串，`resourceUniqueId` 的宽松字符串类型证据来自 `user_event` 录制。
- `hot_topic` → `HotTopicBody`：收紧 `code`、`hot`、`hot[].actId`；标题、正文、参与人数、封面和 `alg` 宽松。
- `topic_sublist` → `TopicSublistBody`：收紧 `code`、`data`、`data[].id`；作者、标题、封面、阅读数和收藏时间宽松，`count`、`hasMore` 宽松。
- `topic_detail` → `TopicDetailBody`：收紧 `code`、`act`、`act.actId`；话题正文、封面、`resourceJson`（JSON 字符串）、参与人数和时间字段宽松。
- `topic_detail_event_hot` → `TopicDetailEventHotBody`：收紧 `code`、`events`、`events[].id`；动态记录与 `event` 共用 core 的事件附带结构，`topEvent` 宽松声明，`contentDeclaration`、`repostSource`、`resourceUniqueId` 按共享记录一并声明为宽松字符串（类型证据来自 `event` 录制）。

### 共享结构

- `EventUser`、`EventIpLocation`、`EventPic`、`EventResourceInfo`、`EventLikedUser`、`EventCommentThread`、`EventInfo` 在 `user_event`、`event`、`topic_detail_event_hot` 三处逐字相同，移入 `src/core/upstream-schemas.ts`，只在 core 声明一次；三个模块改为 import 复用。
- `EventRecord` 留在各自模块（事件记录的字段三份不同）。
- `EventPic` 随共享结构进入 core 后，`user_event` 的 `pics[]` 类型也补齐 `pcRectangleIdStr`、`pcSquareIdStr`、`rectangleIdStr`、`squareIdStr` 四个宽松字段。
- `EventResourceInfo.resourceType` 按三份录制的并集取证保留声明：`user_event.default.json` 里有非 null 数字 `2`。

### 非 200 业务码的状态码变化

- 上游 HTTP 200 + `code: 400` 的参数错误，改造前按 200 resolve；这 5 个模块开始做 Body 校验后，`decodeUpstreamBody` 会在解码 Body 之前先按业务码拒绝，公开结果为 `status: 400`、`body` 保留上游原文。请求层原有的 `SPECIAL_STATUS_CODES` 会把 `code: 400` 映射成 200，但 Body 校验发生在公开响应之前，最终状态是 400。
- 已录入 5 份匿名 400 录制：`event.invalid-pagesize.json`（`pagesize=abc`）、`hot_topic.invalid-limit.json`（`limit=abc`）、`topic_sublist.invalid-offset.json`（`offset=abc`）、`topic_detail.missing-actid.json`（缺失 `actid`）、`topic_detail_event_hot.missing-actid.json`（缺失 `actid`）。
- `SPECIAL_STATUS_CODES` 里的其他码同样会在 Body 校验时拒绝：201/302/502 以原码拒绝，800–803 因超出 100–599 钳位为 400。
- `code: 404` 不在 `SPECIAL_STATUS_CODES` 里，仍按业务拒绝原样转交：未知话题的 `topic_detail`、`topic_detail_event_hot` 返回 HTTP 200 和 `{ code: 404 }`，SDK 以 `status: 404` 原样转交，不报 502。

### 行为变化

- 这 5 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- 空结果：登录账号用 `lasttime=1` 取到 `event: []`、`more: false`（`event.empty.json`，此时没有 `lasttime`）；`topic_sublist` 的 `offset=100000` 返回 `data: []`、`count` 保持原值（`topic_sublist.out-of-range.json`）；`topic_detail_event_hot` 的话题 47972517 没有热门动态，返回 `events: []`（`topic_detail_event_hot.empty.json`）。`hot_topic` 的 `offset=100000` 与默认调用返回同一份推荐内容，本批没有找到它可达的空列表；`hot: []` 由契约测试构造验证。
- 登录对照：5 个模块都先用 `login_status` 确认 `account.anonimousUser: false` 后录制（账号 599663130）。`event` 的匿名调用返回与登录空结果相同的 `event: []`、`more: false`；`hot_topic`、`topic_detail` 的匿名响应与登录响应字段集合一致，CDN 主机可能不同（本次对照只有 `topic_detail` 的 p3/p4 差异）。匿名录制未提交，不对公开结构作相同性断言。
- 录制截取：`event.default.json` 原 20 条保留 3 条（索引 0/4/9），`topic_detail_event_hot.default.json` 原 5 条保留 2 条（索引 0/4），`context.truncated` 记录原数组长度。
- 未声明的扩展块继续原样保留为 JSON：非 null 扩展对象 `adInfo`、`anonymityInfo`、`bottomActivityInfos`、`extJsonInfo`、`pointTopicInfo`、`privacySettingInfo`、`pubSource`、`xInfo`；只有空容器的 `likeAnimationMap`（`{}`）、`topActivityInfos`（`[]`）；`tailMark` 在事件列表录制里只有 `null`、在话题热门动态录制里有非 null 对象。只见过 `null` 的子字段也没有声明。

### 迁移

- 这 5 个模块的 `body` 类型从原始的 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- 需要处理 `code: 400` 参数错误从 resolve 200 变成 reject 400；`error.body` 是上游原文，`error.status` 为 400。
- 读 `event.event[].id`、`hot_topic.hot[].actId`、`topic_sublist.data[].id`、`topic_detail.act.actId`、`topic_detail_event_hot.events[].id` 时不再需要自己判空。
- 宽松字段（如 `event.event[].topEvent`、`topic_detail.act.title`、`hot_topic.hot[].title`）的类型带 `null | undefined`。
- `EventPic` 移入 core，`user_event` 的 `pics[]` 类型随之补齐 4 个宽松字段；`EventResourceInfo.resourceType` 按共享结构的并集证据保持声明。

详见公开指南的[返回体结构](/guide/response-bodies)。
