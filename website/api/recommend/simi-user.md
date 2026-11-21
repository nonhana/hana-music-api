---
title: '获取最近 5 个听了这首歌的用户'
description: '调用此接口，传入歌曲 id，最近 5 个听了这首歌的用户'
---

# 获取最近 5 个听了这首歌的用户

调用此接口，传入歌曲 id，最近 5 个听了这首歌的用户

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                           |
| ---------- | -------------------------------------------- |
| 接口地址   | `/simi/user`                                 |
| 请求方式   | `GET` / `POST`                               |
| 需要登录   | 否                                           |
| 对应模块   | `simi_user`                                  |
| SDK 函数   | `simiUser`（`hana-music-api/api/simi_user`） |
| 返回体类型 | `SimiUserBody`（已建模返回体）               |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { simiUser } from 'hana-music-api';

const result = await simiUser({
  id: '347230',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/simi/user' \
  --data-urlencode 'id=347230'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                         |
| -------- | ------------------ | ---- | ------ | ---------------------------- |
| `id`     | `number \| string` | 是   | -      | 歌曲 id                      |
| `limit`  | `number`           | 否   | `50`   | 返回数量，默认 `50`          |
| `offset` | `number`           | 否   | `0`    | 偏移数量，用于分页，默认 `0` |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SimiUserBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/simi_user`、`hana-music-api/schemas/simi_user` 导入运行时校验器）。

```ts
type SimiUserBody =
  | {
      code: 200;
    }
  | '';
```

| 字段   | 类型  | 必填 | 说明                         |
| ------ | ----- | ---- | ---------------------------- |
| `code` | `200` | 是   | 业务状态码（`200` 表示成功） |

> 当参数格式异常时，上游可能返回空响应，此时返回体为 `""`。

<!-- api-doc:response:end -->
