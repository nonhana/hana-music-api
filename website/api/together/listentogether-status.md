---
title: '一起听状态'
description: '获取当前登录账号的一起听房间状态、房间信息和成员列表。'
---

# 一起听状态

获取当前登录账号的一起听房间状态、房间信息和成员列表。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                   |
| ---------- | -------------------------------------------------------------------- |
| 接口地址   | `/listentogether/status`                                             |
| 请求方式   | `GET` / `POST`                                                       |
| 需要登录   | 是                                                                   |
| 对应模块   | `listentogether_status`                                              |
| SDK 函数   | `listentogetherStatus`（`hana-music-api/api/listentogether_status`） |
| 返回体类型 | `ListentogetherStatusBody`（已建模返回体）                           |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { listentogetherStatus } from 'hana-music-api';

const result = await listentogetherStatus(
  {},
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/listentogether/status' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ListentogetherStatusBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/listentogether_status`、`hana-music-api/schemas/listentogether_status` 导入运行时校验器）。

```ts
type TogetherStatus = {
  inRoom: boolean;
  anotherFollowStatus?: boolean | null;
};

type ListentogetherStatusBody = {
  code: 200;
  data: TogetherStatus;
  message?: string | null;
};
```

| 字段                       | 类型             | 必填 | 说明                         |
| -------------------------- | ---------------- | ---- | ---------------------------- |
| `code`                     | `200`            | 是   | 业务状态码（`200` 表示成功） |
| `data`                     | `TogetherStatus` | 是   | 接口返回的数据主体           |
| `data.inRoom`              | `boolean`        | 是   | -                            |
| `data.anotherFollowStatus` | `boolean`        | 否   | -                            |
| `message`                  | `string`         | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->

## 注意事项

- **房间状态判断**：当 `data.inRoom` 为 `false` 时，表示当前账号不在房间中，需要重新创建房间或接受邀请；在线成员列表位于 `data.roomInfo.roomUsers`。
