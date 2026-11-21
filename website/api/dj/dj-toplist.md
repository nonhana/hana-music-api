---
title: '电台 - 新晋电台榜/热门电台榜'
description: '登录后调用此接口，可获得新晋电台榜/热门电台榜'
---

# 电台 - 新晋电台榜/热门电台榜

登录后调用此接口，可获得新晋电台榜/热门电台榜

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                             |
| ---------- | ---------------------------------------------- |
| 接口地址   | `/dj/toplist`                                  |
| 请求方式   | `GET` / `POST`                                 |
| 需要登录   | 是                                             |
| 对应模块   | `dj_toplist`                                   |
| SDK 函数   | `djToplist`（`hana-music-api/api/dj_toplist`） |
| 返回体类型 | `DjToplistBody`（已建模返回体）                |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djToplist } from 'hana-music-api';

const result = await djToplist(
  {
    type: 'hot',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/dj/toplist' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'type=hot'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                      |
| -------- | ---------------- | ---- | ------ | ------------------------------------------------------------------------- |
| `limit`  | `number`         | 否   | `100`  | 返回数量，默认为 100                                                      |
| `offset` | `number`         | 否   | `0`    | 偏移数量，用于分页，如：(页数 - 1)\*100，其中 100 为 limit 的值，默认为 0 |
| `type`   | `'hot' \| 'new'` | 否   | -      | 榜单类型，`new` 为新晋电台榜，`hot`为热门电台榜                           |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DjToplistBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/dj_toplist`、`hana-music-api/schemas/dj_toplist` 导入运行时校验器）。

```ts
type ToplistRadio = {
  id: number;
  category?: string | null;
  categoryId?: number | null;
  createTime?: number | null;
  creatorName?: string | null;
  dj?: PlaylistUser | null;
  feeScope?: number | null;
  lastRank?: number | null;
  name?: string | null;
  picUrl?: string | null;
  playCount?: number | null;
  programCount?: number | null;
  rank?: number | null;
  rcmdtext?: string | null;
  radioFeeType?: number | null;
  score?: number | null;
  subCount?: number | null;
};

type DjToplistBody = {
  code: 200;
  toplist: Array<ToplistRadio>;
  updateTime?: number | null;
};
```

- **公共类型**：[PlaylistUser](/api/shared-types#playlistuser)

| 字段         | 类型                  | 必填 | 说明                         |
| ------------ | --------------------- | ---- | ---------------------------- |
| `code`       | `200`                 | 是   | 业务状态码（`200` 表示成功） |
| `toplist`    | `Array<ToplistRadio>` | 是   | 排行榜列表                   |
| `updateTime` | `number`              | 否   | 时间戳                       |

<!-- api-doc:response:end -->
