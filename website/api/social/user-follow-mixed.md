---
title: '当前账号关注的用户/歌手'
description: '调用此接口，可获得当前账号关注的用户/歌手'
---

# 当前账号关注的用户/歌手

调用此接口，可获得当前账号关注的用户/歌手

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                          |
| ---------- | ----------------------------------------------------------- |
| 接口地址   | `/user/follow/mixed`                                        |
| 请求方式   | `GET` / `POST`                                              |
| 需要登录   | 否                                                          |
| 对应模块   | `user_follow_mixed`                                         |
| SDK 函数   | `userFollowMixed`（`hana-music-api/api/user_follow_mixed`） |
| 返回体类型 | `UserFollowMixedBody`（已建模返回体）                       |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { userFollowMixed } from 'hana-music-api';

const result = await userFollowMixed({
  scene: 1,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/user/follow/mixed' \
  --data-urlencode 'scene=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型          | 必填 | 默认值 | 说明                                                                           |
| -------- | ------------- | ---- | ------ | ------------------------------------------------------------------------------ |
| `cursor` | `number`      | 否   | `0`    | 返回数据的 cursor，默认为 0，传入上一次返回结果的 cursor，将会返回下一页的数据 |
| `scene`  | `0 \| 1 \| 2` | 否   | `0`    | 场景，0 表示所有关注，1 表示关注的歌手，2 表示关注的用户，默认为 0             |
| `size`   | `number`      | 否   | `30`   | 返回数量，默认为 30                                                            |

| `scene` | 筛选范围         |
| ------- | ---------------- |
| `0`     | 所有关注（默认） |
| `1`     | 关注的歌手       |
| `2`     | 关注的用户       |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`UserFollowMixedBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/user_follow_mixed`、`hana-music-api/schemas/user_follow_mixed` 导入运行时校验器）。

```ts
type FansGroupInfo = {
  fansGroupIdStr?: string | null;
  fansGroupInnerPageUrl?: string | null;
  level?: string | null;
  segment?: string | null;
  showUpgrade?: boolean | null;
};

type ShowContentResource = {
  coverUrl?: string | null;
  orpheusUrl?: string | null;
  picCount?: number | null;
  resourceId?: string | null;
  resourceType?: number | null;
};

type ShowContentBox = {
  resource?: ShowContentResource | null;
  title?: string | null;
};

type ShowContent = {
  active?: boolean | null;
  boxContent?: ShowContentBox | null;
  consumeParam?: string | null;
  message?: string | null;
  time?: number | null;
};

type MixedUser = Omit<UserProfile, 'userId' | 'urlAnalyze' | 'vipRights'> & {
  userId?: number | null;
  urlAnalyze?: boolean | null;
  vipRights?: VipRights | null;
};

type FollowRecord = {
  followId: number;
  artistInfo?: Artist | null;
  fansGroupInfo?: FansGroupInfo | null;
  followDay?: string | null;
  followTime?: number | null;
  showContent?: ShowContent | null;
  type?: number | null;
  userProfile?: MixedUser | null;
};

type ExtData = {
  visualStyle?: string | null;
};

type Page = {
  cursor?: string | null;
  more?: boolean | null;
  size?: number | null;
};

type FollowData = {
  records: Array<FollowRecord>;
  extData?: ExtData | null;
  page?: Page | null;
};

type UserFollowMixedBody = {
  code: 200;
  data: FollowData;
  message?: string | null;
};
```

- **公共类型**：[Artist](/api/shared-types#artist)、[UserProfile](/api/shared-types#userprofile)、[VipRights](/api/shared-types#viprights)

> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。

| 字段                           | 类型                               | 必填 | 说明                                                |
| ------------------------------ | ---------------------------------- | ---- | --------------------------------------------------- |
| `code`                         | `200`                              | 是   | 业务状态码（`200` 表示成功）                        |
| `data`                         | `FollowData`                       | 是   | 接口返回的数据主体                                  |
| `data.records`                 | `Array<FollowRecord>`              | 是   | 记录列表                                            |
| `data.records[].followId`      | `number`                           | 是   | follow ID                                           |
| `data.records[].artistInfo`    | [Artist](/api/shared-types#artist) | 否   | Artist 实体                                         |
| `data.records[].fansGroupInfo` | `FansGroupInfo`                    | 否   | -                                                   |
| `data.records[].followDay`     | `string`                           | 否   | -                                                   |
| `data.records[].followTime`    | `number`                           | 否   | 时间戳                                              |
| `data.records[].showContent`   | `ShowContent`                      | 否   | -                                                   |
| `data.records[].type`          | `number`                           | 否   | -                                                   |
| `data.records[].userProfile`   | `MixedUser`                        | 可空 | 继承自 [UserProfile](/api/shared-types#userprofile) |
| `data.extData`                 | `ExtData`                          | 否   | -                                                   |
| `data.extData.visualStyle`     | `string`                           | 否   | -                                                   |
| `data.page`                    | `Page`                             | 否   | -                                                   |
| `data.page.cursor`             | `string`                           | 否   | 下一页分页游标                                      |
| `data.page.more`               | `boolean`                          | 否   | 是否还有更多数据                                    |
| `data.page.size`               | `number`                           | 否   | -                                                   |
| `message`                      | `string`                           | 否   | 返回说明信息                                        |

<!-- api-doc:response:end -->

## 注意事项

- **歌手条目差异**：当记录表示关注的歌手（`type === 2`）时，`userProfile` 字段为 `null`。
