---
title: '一起听 - 结束房间'
description: '结束当前一起听房间，通常由房主在会话结束时调用。'
---

# 一起听 - 结束房间

结束当前一起听房间，通常由房主在会话结束时调用。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                             |
| ---------- | -------------------------------------------------------------- |
| 接口地址   | `/listentogether/end`                                          |
| 请求方式   | `GET` / `POST`                                                 |
| 需要登录   | 是                                                             |
| 对应模块   | `listentogether_end`                                           |
| SDK 函数   | `listentogetherEnd`（`hana-music-api/api/listentogether_end`） |
| 返回体类型 | `ListentogetherEndBody`（已建模返回体）                        |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { listentogetherEnd } from 'hana-music-api';

const result = await listentogetherEnd(
  {
    roomId: 'MzA0NjY5...',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/listentogether/end' \
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

返回体类型：`ListentogetherEndBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/listentogether_end`、`hana-music-api/schemas/listentogether_end` 导入运行时校验器）。

```ts
type ListentogetherEndBody = {
  code: 200;
  data?: {
    roomType?: string | null;
    success?: boolean | null;
  } | null;
  message?: string | null;
};
```

| 字段            | 类型      | 必填 | 说明                         |
| --------------- | --------- | ---- | ---------------------------- |
| `code`          | `200`     | 是   | 业务状态码（`200` 表示成功） |
| `data`          | `object`  | 否   | 接口返回的数据主体           |
| `data.roomType` | `string`  | 否   | -                            |
| `data.success`  | `boolean` | 否   | 操作是否成功                 |
| `message`       | `string`  | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->

## 注意事项

- **关闭房间**：房主结束一起听会话或前端清理无效房间时调用，可结合 `data.success` 判断是否关闭成功。
