---
title: '一起听 - 房间检查'
description: '检查一起听房间是否可加入以及当前可用状态。'
---

# 一起听 - 房间检查

检查一起听房间是否可加入以及当前可用状态。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                          |
| ---------- | --------------------------------------------------------------------------- |
| 接口地址   | `/listentogether/room/check`                                                |
| 请求方式   | `GET` / `POST`                                                              |
| 需要登录   | 是                                                                          |
| 对应模块   | `listentogether_room_check`                                                 |
| SDK 函数   | `listentogetherRoomCheck`（`hana-music-api/api/listentogether_room_check`） |
| 返回体类型 | `ListentogetherRoomCheckBody`（已建模返回体）                               |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { listentogetherRoomCheck } from 'hana-music-api';

const result = await listentogetherRoomCheck(
  {
    roomId: 'MzA0NjY5...',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/listentogether/room/check' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'roomId=MzA0NjY5...'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明    |
| -------- | -------- | ---- | ------ | ------- |
| `roomId` | `string` | 是   | -      | 房间 ID |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ListentogetherRoomCheckBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/listentogether_room_check`、`hana-music-api/schemas/listentogether_room_check` 导入运行时校验器）。

```ts
type RoomCheck = {
  joinable: boolean;
  status: string;
  copywriting?: string | null;
};

type ListentogetherRoomCheckBody = {
  code: 200;
  data: RoomCheck;
  message?: string | null;
};
```

| 字段               | 类型        | 必填 | 说明                         |
| ------------------ | ----------- | ---- | ---------------------------- |
| `code`             | `200`       | 是   | 业务状态码（`200` 表示成功） |
| `data`             | `RoomCheck` | 是   | 接口返回的数据主体           |
| `data.joinable`    | `boolean`   | 是   | -                            |
| `data.status`      | `string`    | 是   | -                            |
| `data.copywriting` | `string`    | 否   | -                            |
| `message`          | `string`    | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->

## 注意事项

- **可用性字段**：`data.joinable` 表示房间当前是否可加入，`data.status` 常见可用状态为 `AVAILABLE`。
