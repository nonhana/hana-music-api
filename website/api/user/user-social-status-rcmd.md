---
title: '用户状态 - 相同状态的用户'
description: '登录后调用此接口，获取相同状态的用户'
---

# 用户状态 - 相同状态的用户

登录后调用此接口，获取相同状态的用户

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| 接口地址   | `/user/social/status/rcmd`                                             |
| 请求方式   | `GET` / `POST`                                                         |
| 需要登录   | 是                                                                     |
| 对应模块   | `user_social_status_rcmd`                                              |
| SDK 函数   | `userSocialStatusRcmd`（`hana-music-api/api/user_social_status_rcmd`） |
| 返回体类型 | `UserSocialStatusRcmdBody`（已建模返回体）                             |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { userSocialStatusRcmd } from 'hana-music-api';

const result = await userSocialStatusRcmd(
  {},
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/user/social/status/rcmd' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`UserSocialStatusRcmdBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/user_social_status_rcmd`、`hana-music-api/schemas/user_social_status_rcmd` 导入运行时校验器）。

```ts
type StatusContent = {
  type?: string | null;
  iconUrl?: string | null;
  content?: string | null;
  actionUrl?: string | null;
  canEdit?: boolean | null;
};

type IdentityInfo = {
  type?: string | null;
  vip?: boolean | null;
  name?: string | null;
  level?: number | null;
  description?: string | null;
  detailDescription?: string | null;
  showName?: string | null;
  iconUrl?: string | null;
  tags?: Array<string> | null;
};

type TagRcmd = {
  name?: string | null;
  match?: boolean | null;
};

type RcmdUser = {
  userId: number;
  nickName?: string | null;
  avatarUrl?: string | null;
  actionUrl?: string | null;
  statusContentDTO?: StatusContent | null;
  identityInfoDTO?: IdentityInfo | null;
  tagRcmdVOList?: Array<TagRcmd> | null;
};

type UserSocialStatusRcmdBody = {
  code: 200;
  data: {
    rcmdTitle?: string | null;
    onlyShowState?: boolean | null;
    statusContentDTO?: StatusContent | null;
    userRcmdInfoVOList?: Array<RcmdUser> | null;
  };
  message?: string | null;
};
```

> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。

| 字段                                         | 类型              | 必填 | 说明                         |
| -------------------------------------------- | ----------------- | ---- | ---------------------------- |
| `code`                                       | `200`             | 是   | 业务状态码（`200` 表示成功） |
| `data`                                       | `object`          | 是   | 接口返回的数据主体           |
| `data.rcmdTitle`                             | `string`          | 否   | -                            |
| `data.onlyShowState`                         | `boolean`         | 否   | -                            |
| `data.statusContentDTO`                      | `StatusContent`   | 否   | -                            |
| `data.statusContentDTO.type`                 | `string`          | 否   | -                            |
| `data.statusContentDTO.iconUrl`              | `string`          | 否   | 资源访问链接                 |
| `data.statusContentDTO.content`              | `string`          | 否   | 正文内容                     |
| `data.statusContentDTO.actionUrl`            | `string`          | 否   | 资源访问链接                 |
| `data.statusContentDTO.canEdit`              | `boolean`         | 否   | -                            |
| `data.userRcmdInfoVOList`                    | `Array<RcmdUser>` | 可空 | -                            |
| `data.userRcmdInfoVOList[].userId`           | `number`          | 是   | 用户 ID                      |
| `data.userRcmdInfoVOList[].nickName`         | `string`          | 否   | -                            |
| `data.userRcmdInfoVOList[].avatarUrl`        | `string`          | 否   | 头像图片 URL                 |
| `data.userRcmdInfoVOList[].actionUrl`        | `string`          | 否   | 资源访问链接                 |
| `data.userRcmdInfoVOList[].statusContentDTO` | `StatusContent`   | 否   | -                            |
| `data.userRcmdInfoVOList[].identityInfoDTO`  | `IdentityInfo`    | 否   | -                            |
| `data.userRcmdInfoVOList[].tagRcmdVOList`    | `Array<TagRcmd>`  | 否   | -                            |
| `message`                                    | `string`          | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
