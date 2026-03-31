# 上传链路手工验证清单

本文档用于补齐 `cloud`、`voice_upload` 等上传相关模块在真实环境下的手工回归步骤。默认离线测试仍然是主基线，但在修改上传链路、NOS 交互、multipart 组装或 XML 解析逻辑后，应至少执行一次本清单。

## 适用范围

- `src/modules/cloud.ts`
- `src/modules/voice_upload.ts`
- `src/plugins/song-upload.ts`
- `src/plugins/upload.ts`
- `src/server/parse-body.ts`

## 前置条件

1. 已执行 `bun install`
2. 已确认本地工程校验通过：
   - `bun test`
   - `bun run typecheck`
   - `bun run lint:full`
3. 已准备一个可用的网易云登录态 Cookie：
   - 至少包含 `MUSIC_U`
   - 如需验证工作台/语音上传能力，应使用具备对应权限的账号
4. 已准备测试文件：
   - 一个小文件：小于 `10 MB`
   - 一个大文件：大于 `10 MB`，用于覆盖 `voice_upload` 多分块路径
   - 一个异常样本：可用代理或 mock 手段制造异常 XML / 丢失 `UploadId`
5. 本地服务已启动：`bun run start`

## Cookie 与环境准备

1. 用浏览器登录网易云相关站点，导出当前账号 Cookie
2. 只在本地环境使用该 Cookie，不要写入仓库或测试代码
3. 如通过 HTTP 接口验证，可在请求头中传入：

```http
Cookie: MUSIC_U=your-cookie
```

4. 如通过程序化 API 验证，可在 `query.cookie` 中传入字符串或对象：

```ts
await invokeModule('cloud', {
  cookie: 'MUSIC_U=your-cookie',
  songFile,
})
```

## 检查项 A：缺文件报错

目标：确认服务层 multipart 兼容和模块层显式报错都仍然存在。

1. 调用 `/cloud` 且不附带 `songFile`
2. 调用 `/voice/upload` 且不附带 `songFile`
3. 确认返回：
   - `cloud` 返回“请上传音乐文件”
   - `voice_upload` 返回“请上传音频文件”
4. 记录：
   - HTTP 状态码
   - 返回体中的 `code` / `msg`

## 检查项 B：单分块上传

目标：覆盖小文件上传，确认 NOS token 分配、文件上传和后续发布链路正常。

1. 使用小于 `10 MB` 的音频文件调用 `/voice/upload`
2. 确认只发生一次分块上传请求
3. 检查请求链路：
   - `/api/nos/token/alloc`
   - `POST ...?uploads`
   - `PUT ...?partNumber=1&uploadId=...`
   - `POST ...?uploadId=...`
   - `/api/voice/workbench/voice/batch/upload/preCheck`
   - `/api/voice/workbench/voice/batch/upload/v2`
4. 确认最终返回 `code: 200`

## 检查项 C：多分块上传

目标：覆盖 `voice_upload` 的循环分块逻辑和 complete XML 组装。

1. 使用大于 `10 MB` 的音频文件调用 `/voice/upload`
2. 观察是否发生多个 `PUT partNumber=N` 请求
3. 核对：
   - 分块编号连续递增
   - 每个分块都能拿到 `etag`
   - complete 请求体包含全部分块的 `PartNumber` 与 `ETag`
4. 确认最终上传结果与单分块场景一致返回成功

## 检查项 D：`multipart complete` XML

目标：确认 `createMultipartCompleteXml()` 生成的 XML 能被 NOS 接受。

1. 在真实上传时抓取 complete 阶段的请求体
2. 核对 XML 至少包含：
   - 根节点 `CompleteMultipartUpload`
   - 每个分块的 `Part`
   - `PartNumber`
   - `ETag`
3. 如果 NOS 返回非 2xx 或 XML 结构错误，记录原始响应文本

## 检查项 E：异常 XML 返回

目标：确认 `parseMultipartUploadId()` 在 NOS 返回异常 XML 时不会静默成功。

1. 使用代理、mock 服务或临时替换域名，让 `POST ...?uploads` 返回：
   - 缺少 `UploadId`
   - 非 XML 文本
   - 空响应
2. 确认接口返回失败，而不是继续执行后续上传
3. 记录：
   - 原始响应内容
   - 最终错误消息
   - 是否包含可定位问题的上下文

## 检查项 F：`cloud` 上传链路

目标：确认 `parse-body` 的文件兼容、`md5` 补算和云盘发布链路正常。

1. 以 multipart 方式调用 `/cloud`
2. 确认服务层把文件转换为 `{ name, data, size, mimetype }`
3. 对于未携带 `md5` 的输入，确认模块侧自动补算 `md5`
4. 检查链路：
   - `/api/cloud/upload/check`
   - `/api/nos/token/alloc`
   - `/api/upload/cloud/info/v2`
   - `/api/cloud/pub/v2`
5. 确认返回体中没有因 `music-metadata` 解析失败导致的异常中断

## 成功标准

- 缺文件场景能稳定返回可读错误
- 小文件和大文件上传都能走通
- 多分块上传的 complete XML 可被 NOS 接受
- 异常 XML 能明确失败，不会伪成功
- `cloud` 与 `voice_upload` 在真实 Cookie 下都能完成主链路验证

## 失败时必须记录的信息

- 触发时间
- 使用的模块和入口（HTTP / 程序化 API）
- 文件大小与文件类型
- 是否携带 Cookie 以及账号权限概况
- 失败阶段：
  - token 分配
  - initiate multipart
  - part upload
  - complete multipart
  - preCheck
  - publish / cloud info
- 原始错误响应、关键请求头和请求参数摘要
