---
title: '播客声音搜索'
description: '可以搜索播客里的声音'
---

# 播客声音搜索

可以搜索播客里的声音

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                  |
| ---------- | ------------------------------------------------------------------- |
| 接口地址   | `/voicelist/list/search`                                            |
| 请求方式   | `GET` / `POST`                                                      |
| 需要登录   | 否                                                                  |
| 对应模块   | `voicelist_list_search`                                             |
| SDK 函数   | `voicelistListSearch`（`hana-music-api/api/voicelist_list_search`） |
| 返回体类型 | `VoicelistListSearchBody`（已建模返回体）                           |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { voicelistListSearch } from 'hana-music-api';

const result = await voicelistListSearch({
  voiceListId: 999999,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/voicelist/list/search' \
  --data-urlencode 'voiceListId=999999'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数            | 类型               | 必填 | 默认值 | 说明                                                                                                                     |
| --------------- | ------------------ | ---- | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| `voiceListId`   | `number \| string` | 否   | -      | 所属播客 ID（不传则查询账号下所有声音）                                                                                  |
| `limit`         | `number`           | 否   | `200`  | 返回数量，默认 `200`                                                                                                     |
| `offset`        | `number`           | 否   | `0`    | 偏移数量，用于分页，默认 `0`                                                                                             |
| `name`          | `string`           | 否   | -      | 声音名称关键词                                                                                                           |
| `displayStatus` | `string`           | 否   | -      | 声音展示状态（如 `ONLINE`、`AUDITING`、`ONLY_SELF_SEE`、`SCHEDULE_PUBLISH`、`TRANSCODE_FAILED`、`PUBLISHING`、`FAILED`） |
| `type`          | `string`           | 否   | -      | 可见类型（如 `PUBLIC`、`PRIVATE`）                                                                                       |
| `voiceFeeType`  | `number`           | 否   | -      | 付费类型（`-1` 全部、`0` 免费、`1` 收费）                                                                                |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`VoicelistListSearchBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/voicelist_list_search`、`hana-music-api/schemas/voicelist_list_search` 导入运行时校验器）。

```ts
type VoicelistListSearchBody = {
  code: 200;
  data: {
    hasMore?: boolean | null;
    total?: number | null;
  };
};
```

| 字段           | 类型      | 必填 | 说明                         |
| -------------- | --------- | ---- | ---------------------------- |
| `code`         | `200`     | 是   | 业务状态码（`200` 表示成功） |
| `data`         | `object`  | 是   | 接口返回的数据主体           |
| `data.hasMore` | `boolean` | 否   | 是否还有更多数据             |
| `data.total`   | `number`  | 否   | 总条目数                     |

<!-- api-doc:response:end -->

## 注意事项

- **权限范围**：工作台接口仅查询当前登录账号下的声音；可选按 `displayStatus`、`type`、`voiceFeeType` 筛选。
