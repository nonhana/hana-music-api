---
title: '喜欢音乐列表'
description: '调用此接口，传入用户 id，可获取已喜欢音乐 id 列表(id 数组)'
---

# 喜欢音乐列表

调用此接口，传入用户 id，可获取已喜欢音乐 id 列表(id 数组)

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                          |
| ---------- | ------------------------------------------- |
| 接口地址   | `/likelist`                                 |
| 请求方式   | `GET` / `POST`                              |
| 需要登录   | 否                                          |
| 对应模块   | `likelist`                                  |
| SDK 函数   | `likelist`（`hana-music-api/api/likelist`） |
| 返回体类型 | `LikelistBody`（已建模返回体）              |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { likelist } from 'hana-music-api';

const result = await likelist({
  uid: '32953014',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/likelist' \
  --data-urlencode 'uid=32953014'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数  | 类型               | 必填 | 默认值 | 说明    |
| ----- | ------------------ | ---- | ------ | ------- |
| `uid` | `number \| string` | 是   | -      | 用户 id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`LikelistBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/likelist`、`hana-music-api/schemas/likelist` 导入运行时校验器）。

```ts
type LikelistBody = {
  code: 200;
  ids: Array<number>;
  checkPoint?: number | null;
};
```

| 字段         | 类型            | 必填 | 说明                         |
| ------------ | --------------- | ---- | ---------------------------- |
| `code`       | `200`           | 是   | 业务状态码（`200` 表示成功） |
| `ids`        | `Array<number>` | 是   | -                            |
| `checkPoint` | `number`        | 否   | -                            |

<!-- api-doc:response:end -->
