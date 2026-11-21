---
title: '删除用户动态'
description: '登录后调用此接口 ，可以删除用户动态'
---

# 删除用户动态

登录后调用此接口 ，可以删除用户动态

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                           |
| ---------- | -------------------------------------------- |
| 接口地址   | `/event/del`                                 |
| 请求方式   | `GET` / `POST`                               |
| 需要登录   | 是                                           |
| 对应模块   | `event_del`                                  |
| SDK 函数   | `eventDel`（`hana-music-api/api/event_del`） |
| 返回体类型 | `EventDelBody`（已建模返回体）               |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { eventDel } from 'hana-music-api';

const result = await eventDel(
  {
    evId: '6712917601',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/event/del' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'evId=6712917601'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数   | 类型               | 必填 | 默认值 | 说明    |
| ------ | ------------------ | ---- | ------ | ------- |
| `evId` | `number \| string` | 是   | -      | 动态 id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`EventDelBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/event_del`、`hana-music-api/schemas/event_del` 导入运行时校验器）。

```ts
type EventDelBody = {
  code: 200;
};
```

| 字段   | 类型  | 必填 | 说明                         |
| ------ | ----- | ---- | ---------------------------- |
| `code` | `200` | 是   | 业务状态码（`200` 表示成功） |

<!-- api-doc:response:end -->
