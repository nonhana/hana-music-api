---
title: '播客声音排序'
description: '调整声音在列表中的顺序，每个声音都有固定的序号，例如将4的声音移动到1后，原来的1、2、3增加为2、3、4，其他不变'
---

# 播客声音排序

调整声音在列表中的顺序，每个声音都有固定的序号，例如将4的声音移动到1后，原来的1、2、3增加为2、3、4，其他不变

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                       |
| ---------- | -------------------------------------------------------- |
| 接口地址   | `/voicelist/trans`                                       |
| 请求方式   | `GET` / `POST`                                           |
| 需要登录   | 是                                                       |
| 对应模块   | `voicelist_trans`                                        |
| SDK 函数   | `voicelistTrans`（`hana-music-api/api/voicelist_trans`） |
| 返回体类型 | `UnknownJson`（未建模接口）                              |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { voicelistTrans } from 'hana-music-api';

const result = await voicelistTrans(
  {
    limit: 30,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/voicelist/trans' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'limit=30'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数        | 类型               | 必填 | 默认值 | 说明                                                                |
| ----------- | ------------------ | ---- | ------ | ------------------------------------------------------------------- |
| `limit`     | `number`           | 否   | `200`  | 取出歌单数量，默认为 200                                            |
| `offset`    | `number`           | 否   | `0`    | 偏移数量，用于分页，如：(评论页数 - 1)\*200，其中 200 为 limit 的值 |
| `radioId`   | `number \| string` | 否   | -      | 电台id，即voiceListId                                               |
| `programId` | `number \| string` | 否   | `0`    | 播客声音id，即voiceId                                               |
| `position`  | `number`           | 否   | `1`    | 位置，最小为1，最大为歌曲数量，超过最大则为移动到最底，小于1报错    |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->
