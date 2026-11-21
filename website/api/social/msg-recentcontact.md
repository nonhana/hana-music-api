---
title: '最近联系人'
description: '登录后调用此接口 ，可获取最接近联系人'
---

# 最近联系人

登录后调用此接口 ，可获取最接近联系人

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                           |
| ---------- | ------------------------------------------------------------ |
| 接口地址   | `/msg/recentcontact`                                         |
| 请求方式   | `GET` / `POST`                                               |
| 需要登录   | 是                                                           |
| 对应模块   | `msg_recentcontact`                                          |
| SDK 函数   | `msgRecentcontact`（`hana-music-api/api/msg_recentcontact`） |
| 返回体类型 | `MsgRecentcontactBody`（已建模返回体）                       |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { msgRecentcontact } from 'hana-music-api';

const result = await msgRecentcontact({}, { cookie: 'MUSIC_U=your-cookie' });
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/msg/recentcontact' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`MsgRecentcontactBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/msg_recentcontact`、`hana-music-api/schemas/msg_recentcontact` 导入运行时校验器）。

```ts
type RecentContact = Omit<UserProfile, 'py' | 'onlined' | 'expertTags'> & {
  py?: string | null;
  onlined?: boolean | null;
  expertTags?: Array<string> | null;
};

type RecentContactData = {
  follow: Array<RecentContact>;
};

type MsgRecentcontactBody = {
  code: 200;
  data: RecentContactData;
};
```

- **公共类型**：[UserProfile](/api/shared-types#userprofile)

| 字段                       | 类型                   | 必填 | 说明                                                          |
| -------------------------- | ---------------------- | ---- | ------------------------------------------------------------- |
| `code`                     | `200`                  | 是   | 业务状态码（`200` 表示成功）                                  |
| `data`                     | `RecentContactData`    | 是   | 接口返回的数据主体                                            |
| `data.follow`              | `Array<RecentContact>` | 是   | 条目列表，继承自 [UserProfile](/api/shared-types#userprofile) |
| `data.follow[].py`         | `string`               | 否   | -                                                             |
| `data.follow[].onlined`    | `boolean`              | 否   | -                                                             |
| `data.follow[].expertTags` | `Array<string>`        | 否   | -                                                             |

<!-- api-doc:response:end -->
