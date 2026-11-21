---
title: '用户状态 - 编辑'
description: '登录后调用此接口，编辑当前用户的社交状态，可用参数可通过 `/user/social/status/support` 获取。'
---

# 用户状态 - 编辑

登录后调用此接口，编辑当前用户的社交状态，可用参数可通过 `/user/social/status/support` 获取。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| 接口地址   | `/user/social/status/edit`                                             |
| 请求方式   | `GET` / `POST`                                                         |
| 需要登录   | 是                                                                     |
| 对应模块   | `user_social_status_edit`                                              |
| SDK 函数   | `userSocialStatusEdit`（`hana-music-api/api/user_social_status_edit`） |
| 返回体类型 | `UserSocialStatusEditBody`（已建模返回体）                             |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { userSocialStatusEdit } from 'hana-music-api';

const result = await userSocialStatusEdit(
  {
    content: '听歌中',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/user/social/status/edit' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'content=听歌中'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数        | 类型     | 必填 | 默认值 | 说明                 |
| ----------- | -------- | ---- | ------ | -------------------- |
| `type`      | `string` | 否   | -      | 社交状态类型标识     |
| `iconUrl`   | `string` | 否   | -      | 状态图标图片 URL     |
| `content`   | `string` | 否   | -      | 状态展示文本         |
| `actionUrl` | `string` | 否   | -      | 点击状态后的跳转链接 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`UserSocialStatusEditBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/user_social_status_edit`、`hana-music-api/schemas/user_social_status_edit` 导入运行时校验器）。

```ts
type UserSocialStatusEditBody = {
  code: 200;
  data?: string | null;
  message?: string | null;
};
```

| 字段      | 类型     | 必填 | 说明                         |
| --------- | -------- | ---- | ---------------------------- |
| `code`    | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `data`    | `string` | 否   | 接口返回的数据主体           |
| `message` | `string` | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->

## 注意事项

- **参数校验**：`type`、`iconUrl`、`content`、`actionUrl` 不能全部为空，否则上游返回 `code: 500`。
