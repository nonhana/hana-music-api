---
title: '歌手粉丝'
description: '调用此接口，传入歌手 id，可获取歌手粉丝'
---

# 歌手粉丝

调用此接口，传入歌手 id，可获取歌手粉丝

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                               |
| ---------- | ------------------------------------------------ |
| 接口地址   | `/artist/fans`                                   |
| 请求方式   | `GET` / `POST`                                   |
| 需要登录   | 否                                               |
| 对应模块   | `artist_fans`                                    |
| SDK 函数   | `artistFans`（`hana-music-api/api/artist_fans`） |
| 返回体类型 | `ArtistFansBody`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { artistFans } from 'hana-music-api';

const result = await artistFans({
  id: '2116',
  limit: 10,
  offset: 0,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/artist/fans' \
  --data-urlencode 'id=2116' \
  --data-urlencode 'limit=10' \
  --data-urlencode 'offset=0'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                         |
| -------- | ------------------ | ---- | ------ | ---------------------------- |
| `id`     | `number \| string` | 是   | -      | 歌手 id                      |
| `limit`  | `number`           | 否   | `20`   | 返回数量，默认 `20`          |
| `offset` | `number`           | 否   | `0`    | 偏移数量，用于分页，默认 `0` |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ArtistFansBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/artist_fans`、`hana-music-api/schemas/artist_fans` 导入运行时校验器）。

```ts
type Fan = {
  userProfile: UserProfile;
  vipRights?: VipRights | null;
};

type ArtistFansBody = {
  code: 200;
  message?: string | null;
  data?: Array<Fan> | null;
};
```

- **公共类型**：[UserProfile](/api/shared-types#userprofile)、[VipRights](/api/shared-types#viprights)

> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。

| 字段                 | 类型                                         | 必填 | 说明                         |
| -------------------- | -------------------------------------------- | ---- | ---------------------------- |
| `code`               | `200`                                        | 是   | 业务状态码（`200` 表示成功） |
| `message`            | `string`                                     | 否   | 返回说明信息                 |
| `data`               | `Array<Fan>`                                 | 可空 | 接口返回的数据主体           |
| `data[].userProfile` | [UserProfile](/api/shared-types#userprofile) | 是   | UserProfile 实体             |
| `data[].vipRights`   | [VipRights](/api/shared-types#viprights)     | 否   | VipRights 实体               |

<!-- api-doc:response:end -->
