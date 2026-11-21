---
title: '播客声音列表'
description: '可以获取播客里的声音'
---

# 播客声音列表

可以获取播客里的声音

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                     |
| ---------- | ------------------------------------------------------ |
| 接口地址   | `/voicelist/list`                                      |
| 请求方式   | `GET` / `POST`                                         |
| 需要登录   | 是                                                     |
| 对应模块   | `voicelist_list`                                       |
| SDK 函数   | `voicelistList`（`hana-music-api/api/voicelist_list`） |
| 返回体类型 | `UnknownJson`（未建模接口）                            |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { voicelistList } from 'hana-music-api';

const result = await voicelistList(
  {
    voiceListId: 999999,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/voicelist/list' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'voiceListId=999999'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数          | 类型               | 必填 | 默认值 | 说明                                                                |
| ------------- | ------------------ | ---- | ------ | ------------------------------------------------------------------- |
| `voiceListId` | `number \| string` | 是   | -      | 播客id                                                              |
| `limit`       | `number`           | 否   | `200`  | 取出歌单数量，默认为 200                                            |
| `offset`      | `number`           | 否   | `0`    | 偏移数量，用于分页，如：(评论页数 - 1)\*200，其中 200 为 limit 的值 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->

## 注意事项

- **权限范围**：工作台接口仅允许读取当前登录账号自己的播客；读取他人播客或不存在的播客将返回 `code: 400`。
- **声音状态**：常见 `displayStatus` 取值为 `ONLINE`（已发布）、`AUDITING`（审核中）、`ONLY_SELF_SEE`（仅自己可见）。
