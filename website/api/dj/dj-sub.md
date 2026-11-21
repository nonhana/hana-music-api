---
title: '电台 - 订阅'
description: '登录后调用此接口，传入`rid`，可订阅 dj，dj 的 `rid` 可通过搜索指定'
---

# 电台 - 订阅

登录后调用此接口，传入`rid`，可订阅 dj，dj 的 `rid` 可通过搜索指定

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                     |
| ---------- | -------------------------------------- |
| 接口地址   | `/dj/sub`                              |
| 请求方式   | `GET` / `POST`                         |
| 需要登录   | 是                                     |
| 对应模块   | `dj_sub`                               |
| SDK 函数   | `djSub`（`hana-music-api/api/dj_sub`） |
| 返回体类型 | `DjSubBody`（已建模返回体）            |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djSub } from 'hana-music-api';

const result = await djSub(
  {
    rid: '336355127',
    t: 1,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/dj/sub' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'rid=336355127' \
  --data-urlencode 't=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数  | 类型               | 必填 | 默认值 | 说明                                       |
| ----- | ------------------ | ---- | ------ | ------------------------------------------ |
| `rid` | `number \| string` | 是   | -      | 电台 ID                                    |
| `t`   | `0 \| 1`           | 否   | -      | 操作类型：`1` 为订阅，`0` 或省略为取消订阅 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DjSubBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/dj_sub`、`hana-music-api/schemas/dj_sub` 导入运行时校验器）。

```ts
type DjSubBody = {
  code: 200;
};
```

| 字段   | 类型  | 必填 | 说明                         |
| ------ | ----- | ---- | ---------------------------- |
| `code` | `200` | 是   | 业务状态码（`200` 表示成功） |

<!-- api-doc:response:end -->
