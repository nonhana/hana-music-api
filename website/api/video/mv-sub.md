---
title: '收藏/取消收藏 MV'
description: '调用此接口，可收藏/取消收藏 MV'
---

# 收藏/取消收藏 MV

调用此接口，可收藏/取消收藏 MV

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                     |
| ---------- | -------------------------------------- |
| 接口地址   | `/mv/sub`                              |
| 请求方式   | `GET` / `POST`                         |
| 需要登录   | 是                                     |
| 对应模块   | `mv_sub`                               |
| SDK 函数   | `mvSub`（`hana-music-api/api/mv_sub`） |
| 返回体类型 | `MvSubBody`（已建模返回体）            |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { mvSub } from 'hana-music-api';

const result = await mvSub(
  {
    mvid: 5436712,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/mv/sub' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'mvid=5436712'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数   | 类型               | 必填 | 默认值 | 说明                     |
| ------ | ------------------ | ---- | ------ | ------------------------ |
| `mvid` | `number \| string` | 是   | -      | MV id                    |
| `t`    | `0 \| 1`           | 否   | -      | 1 为收藏，其他为取消收藏 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`MvSubBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/mv_sub`、`hana-music-api/schemas/mv_sub` 导入运行时校验器）。

```ts
type MvSubBody = {
  code: 200;
  message?: string | null;
};
```

| 字段      | 类型     | 必填 | 说明                         |
| --------- | -------- | ---- | ---------------------------- |
| `code`    | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `message` | `string` | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
