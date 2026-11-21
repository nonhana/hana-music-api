---
title: '播客列表'
description: '可以获取播客列表'
---

# 播客列表

可以获取播客列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                         |
| ---------- | ---------------------------------------------------------- |
| 接口地址   | `/voicelist/search`                                        |
| 请求方式   | `GET` / `POST`                                             |
| 需要登录   | 否                                                         |
| 对应模块   | `voicelist_search`                                         |
| SDK 函数   | `voicelistSearch`（`hana-music-api/api/voicelist_search`） |
| 返回体类型 | `VoicelistSearchBody`（已建模返回体）                      |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { voicelistSearch } from 'hana-music-api';

const result = await voicelistSearch({
  limit: 30,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/voicelist/search' \
  --data-urlencode 'limit=30'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数          | 类型     | 必填 | 默认值 | 说明                                                                |
| ------------- | -------- | ---- | ------ | ------------------------------------------------------------------- |
| `limit`       | `number` | 否   | `200`  | 取出歌单数量，默认为 200                                            |
| `offset`      | `number` | 否   | `0`    | 偏移数量，用于分页，如：(评论页数 - 1)\*200，其中 200 为 limit 的值 |
| `podcastName` | `string` | 否   | ``     | 播客名称                                                            |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`VoicelistSearchBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/voicelist_search`、`hana-music-api/schemas/voicelist_search` 导入运行时校验器）。

```ts
type VoicelistSearchBody = {
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
