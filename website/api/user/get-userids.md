---
title: '根据nickname获取userid'
description: '使用此接口，传入用户昵称，可获取对应的用户id，支持批量获取，多个昵称用`分号(;)`隔开'
---

# 根据nickname获取userid

使用此接口，传入用户昵称，可获取对应的用户id，支持批量获取，多个昵称用`分号(;)`隔开

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                               |
| ---------- | ------------------------------------------------ |
| 接口地址   | `/get/userids`                                   |
| 请求方式   | `GET` / `POST`                                   |
| 需要登录   | 否                                               |
| 对应模块   | `get_userids`                                    |
| SDK 函数   | `getUserids`（`hana-music-api/api/get_userids`） |
| 返回体类型 | `GetUseridsBody`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { getUserids } from 'hana-music-api';

const result = await getUserids({
  nicknames: ['云音乐小秘书'],
});
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/get/userids' \
  -H 'Content-Type: application/json' \
  --data '{"nicknames":["云音乐小秘书"]}'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数        | 类型            | 必填 | 默认值 | 说明                                     |
| ----------- | --------------- | ---- | ------ | ---------------------------------------- |
| `nicknames` | `Array<string>` | 是   | -      | 用户昵称数组（每个昵称不能包含分号 `;`） |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`GetUseridsBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/get_userids`、`hana-music-api/schemas/get_userids` 导入运行时校验器）。

```ts
type GetUseridsBody = {
  code: 200;
  nicknames: Record<string, number>;
};
```

| 字段        | 类型                     | 必填 | 说明                         |
| ----------- | ------------------------ | ---- | ---------------------------- |
| `code`      | `200`                    | 是   | 业务状态码（`200` 表示成功） |
| `nicknames` | `Record<string, number>` | 是   | 昵称到用户 ID 的映射字典     |

<!-- api-doc:response:end -->
