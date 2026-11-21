---
title: 'mv 排行'
description: '调用此接口，可获取 mv 排行'
---

# mv 排行

调用此接口，可获取 mv 排行

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                     |
| ---------- | -------------------------------------- |
| 接口地址   | `/top/mv`                              |
| 请求方式   | `GET` / `POST`                         |
| 需要登录   | 否                                     |
| 对应模块   | `top_mv`                               |
| SDK 函数   | `topMv`（`hana-music-api/api/top_mv`） |
| 返回体类型 | `TopMvBody`（已建模返回体）            |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { topMv } from 'hana-music-api';

const result = await topMv({
  limit: 10,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/top/mv' \
  --data-urlencode 'limit=10'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明                                                                        |
| -------- | -------- | ---- | ------ | --------------------------------------------------------------------------- |
| `area`   | `string` | 否   | ``     | 地区，可选值为内地，港台，欧美，日本，韩国，不填则为全部                    |
| `limit`  | `number` | 否   | `30`   | 取出数量，默认为 30                                                         |
| `offset` | `number` | 否   | `0`    | 偏移数量，用于分页，如：(页数 - 1)\*30，其中 30 为 limit 的值，默认<br>为 0 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`TopMvBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/top_mv`、`hana-music-api/schemas/top_mv` 导入运行时校验器）。

```ts
type MvVideoTagSign = {
  br?: number | null;
  mvtype?: string | null;
  resolution?: number | null;
  tagSign?: string | null;
  type?: string | null;
};

type MvVideo = {
  check?: boolean | null;
  container?: string | null;
  duration?: number | null;
  height?: number | null;
  md5?: string | null;
  size?: number | null;
  tag?: string | null;
  tagSign?: MvVideoTagSign | null;
  url?: string | null;
  width?: number | null;
};

type MvInfo = {
  aliaName?: string | null;
  appTitle?: string | null;
  appword?: string | null;
  area?: string | null;
  artists?: Array<Artist> | null;
  authId?: number | null;
  caption?: number | null;
  captionLanguage?: string | null;
  dayplays?: number | null;
  desc?: string | null;
  fee?: number | null;
  id?: number | null;
  monthplays?: number | null;
  mottos?: string | null;
  neteaseonly?: number | null;
  online?: number | null;
  pic16v9?: number | null;
  pic4v3?: number | null;
  plays?: number | null;
  publishTime?: string | null;
  score?: number | null;
  status?: number | null;
  subTitle?: string | null;
  subType?: string | null;
  title?: string | null;
  topWeeks?: string | null;
  transName?: string | null;
  type?: string | null;
  upban?: number | null;
  valid?: number | null;
  videos?: Array<MvVideo> | null;
  weekplays?: number | null;
};

type TopMv = Omit<MvSummary, 'lastRank' | 'mv' | 'score'> & {
  lastRank?: number | null;
  mv?: MvInfo | null;
  score?: number | null;
};

type TopMvBody = {
  code: 200;
  data: Array<TopMv>;
  hasMore?: boolean | null;
  updateTime?: number | null;
};
```

- **公共类型**：[Artist](/api/shared-types#artist)、[MvSummary](/api/shared-types#mvsummary)

| 字段              | 类型           | 必填 | 说明                         |
| ----------------- | -------------- | ---- | ---------------------------- |
| `code`            | `200`          | 是   | 业务状态码（`200` 表示成功） |
| `data`            | `Array<TopMv>` | 是   | 接口返回的数据主体           |
| `data[].lastRank` | `number`       | 否   | -                            |
| `data[].mv`       | `MvInfo`       | 否   | -                            |
| `data[].score`    | `number`       | 否   | -                            |
| `hasMore`         | `boolean`      | 否   | 是否还有更多数据             |
| `updateTime`      | `number`       | 否   | 时间戳                       |

<!-- api-doc:response:end -->
