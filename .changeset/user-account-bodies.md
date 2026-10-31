---
'hana-music-api': minor
---

给 7 个用户账号读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `user_level` → `UserLevelBody`：收紧 `code`、`data`、`data.userId`、`data.level`；`info`、`progress`、`nowPlayCount`、`nowLoginCount`、`nextPlayCount`、`nextLoginCount` 和 `full` 宽松。
- `user_subcount` → `UserSubcountBody`：只收紧 `code`；各项收藏计数全部宽松。
- `user_binding` → `UserBindingBody`：收紧 `code`、`bindings`、`bindings[].id`；绑定时间、过期标记、`url`、`userId` 和 `tokenJsonStr` 宽松。
- `user_social_status` → `UserSocialStatusBody`：收紧 `code`；社交状态 `data` 在录制里只有空对象，内部字段没有声明，按宽松对象保留。
- `user_medal` → `UserMedalBody`：收紧 `code`、`data`、`data.obtainMedals`、`data.obtainMedals[].medalCode`、`data.categoryMedalBlockVos`、`data.categoryMedalBlockVos[].medalVOS`、`data.categoryMedalBlockVos[].subGroups[].medals`；分类块和分组里套着的徽章是嵌套记录，编号也宽松。`subGroups` 可以没有（缺失或 `null` 正常），出现时里面的记录仍按结构校验。
- `user_cloud` → `UserCloudBody`：收紧 `code`、`data`、`data[].songId`；`privateCloud` 和 `simpleSong` 是记录里套着的对象，全部宽松，分别复用 core 的 `PrivateCloud` 和 `LooseSong`（`Song` 字段 + 宽松 `id`）。
- `user_cloud_detail` → `UserCloudDetailBody`：收紧 `code`、`data`、`data[].songId`；`simpleSong` 同上。

### 行为变化

- 这 7 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- `user_medal` 查不存在的 uid 返回 `{ code: 499, message: '用户信息获取失败' }`。499 不在特殊码表里，改造前请求层就 reject `status: 499`（`ProtocolFailed`），现在仍 reject 相同状态（`UpstreamBusinessFailed`），公开状态和正文不变，不报 502。
- 空结果：`user_binding` 在不存在的 uid 下返回 `bindings: []`；`user_cloud` 的 `offset` 越过末尾返回 `data: []`；`user_cloud_detail` 传入不在云盘的歌曲 id 返回 `data: []`。这些数组本身允许为空。`user_medal` 本批录制与探测未发现可达的空结果；数组本身允许为空（`user_medal.unknown-user.json` 是 code 499，不是空结果）。
- `user_cloud` 的 25 条云盘记录截到 3 条，`user_medal` 的 493 条已获得徽章截到 5 条、5 个分类块截到 3 个（按字段覆盖抽样，已获得徽章保留原下标 0/1/18/259/289，分类块为 0/1/2；`sideBarGuideText` 空串样例来自完整录制），截断长度写在对应录制的 `context.truncated`。
- 只见过 `null` 的字段（如 `user_medal` 的 `medalTabs`、`musicMedalOperationVO`、`levelMedalPicUrl`、`userObtainProportion`、`detailPage`，`user_cloud` 的 `cursor`、`message`、`idVersions`）没有声明，继续作为未声明字段原样保留。
- 本批录制全部来自登录视角（先经 `login_status` 确认 `anonimousUser: false`）；`user_account` 的匿名对照仍在既有 login 录制里，`user_detail` 没有匿名录制，两者的声明都不在本批改动范围内。

### 迁移

- 这 7 个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- 读宽松字段（如收藏计数、绑定时间、云盘文件的 `matchType`）时类型带 `null | undefined`；读收紧字段（`data.level`、`bindings[].id`、`data[].songId`、`obtainMedals[].medalCode`）时不再需要自己判空。
- `user_social_status` 的 `data` 目前没有可依赖的内部字段，仍按 JSON 值保留。
- 模块输入合同没有变化。
- 工具链：模块表面与运行时行为不变；生成的 registry 只改类型标注（去掉 `as const`、加显式 `SdkModuleRegistry`），避免新增 Body 后 dts 超过 TypeScript 的序列化上限（TS7056）；生成内容重新生成后与提交一致。

详见公开指南的[返回体结构](/guide/response-bodies)。
