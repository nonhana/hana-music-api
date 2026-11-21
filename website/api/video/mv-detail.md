---
title: '获取 mv 数据'
description: '传入 MV ID，获取对应 MV 的名称、歌手、发布时间、简介与分辨率等详细信息。'
---

# 获取 mv 数据

传入 MV ID，获取对应 MV 的名称、歌手、发布时间、简介与分辨率等详细信息。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                           |
| ---------- | -------------------------------------------- |
| 接口地址   | `/mv/detail`                                 |
| 请求方式   | `GET` / `POST`                               |
| 需要登录   | 否                                           |
| 对应模块   | `mv_detail`                                  |
| SDK 函数   | `mvDetail`（`hana-music-api/api/mv_detail`） |
| 返回体类型 | `MvDetailBody`（已建模返回体）               |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { mvDetail } from 'hana-music-api';

const result = await mvDetail({
  mvid: '5436712',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/mv/detail' \
  --data-urlencode 'mvid=5436712'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数   | 类型               | 必填 | 默认值 | 说明     |
| ------ | ------------------ | ---- | ------ | -------- |
| `mvid` | `number \| string` | 是   | -      | mv 的 id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`MvDetailBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/mv_detail`、`hana-music-api/schemas/mv_detail` 导入运行时校验器）。

```ts
type MvBitrate = {
  br?: number | null;
  point?: number | null;
  size?: number | null;
};

type MvDetail = {
  artistId?: number | null;
  artistName?: string | null;
  artists?: Array<Artist> | null;
  briefDesc?: string | null;
  brs?: Array<MvBitrate> | null;
  commentCount?: number | null;
  commentThreadId?: string | null;
  cover?: string | null;
  coverId?: number | null;
  coverId_str?: string | null;
  desc?: string | null;
  duration?: number | null;
  id: number;
  nType?: number | null;
  name?: string | null;
  playCount?: number | null;
  publishTime?: string | null;
  shareCount?: number | null;
  subCount?: number | null;
};

type MvPlayback = {
  cp?: number | null;
  dl?: number | null;
  fee?: number | null;
  id?: number | null;
  mvFee?: number | null;
  normal?: boolean | null;
  payed?: number | null;
  pl?: number | null;
  sid?: number | null;
  st?: number | null;
  unauthorized?: boolean | null;
};

type MvDetailBody = {
  bufferPic?: string | null;
  bufferPicFS?: string | null;
  code: 200;
  data: MvDetail;
  loadingPic?: string | null;
  loadingPicFS?: string | null;
  mp?: MvPlayback | null;
  subed?: boolean | null;
};
```

- **公共类型**：[Artist](/api/shared-types#artist)

| 字段              | 类型         | 必填 | 说明                         |
| ----------------- | ------------ | ---- | ---------------------------- |
| `bufferPic`       | `string`     | 否   | -                            |
| `bufferPicFS`     | `string`     | 否   | -                            |
| `code`            | `200`        | 是   | 业务状态码（`200` 表示成功） |
| `data`            | `MvDetail`   | 是   | 接口返回的数据主体           |
| `loadingPic`      | `string`     | 否   | -                            |
| `loadingPicFS`    | `string`     | 否   | -                            |
| `mp`              | `MvPlayback` | 否   | -                            |
| `mp.cp`           | `number`     | 否   | -                            |
| `mp.dl`           | `number`     | 否   | -                            |
| `mp.fee`          | `number`     | 否   | -                            |
| `mp.id`           | `number`     | 否   | 记录 ID                      |
| `mp.mvFee`        | `number`     | 否   | -                            |
| `mp.normal`       | `boolean`    | 否   | -                            |
| `mp.payed`        | `number`     | 否   | -                            |
| `mp.pl`           | `number`     | 否   | -                            |
| `mp.sid`          | `number`     | 否   | -                            |
| `mp.st`           | `number`     | 否   | -                            |
| `mp.unauthorized` | `boolean`    | 否   | -                            |
| `subed`           | `boolean`    | 否   | 是否已收藏/订阅              |

<!-- api-doc:response:end -->

## 注意事项

- **播放地址**：MV 视频链接存在防盗链处理，需配合 [获取 MV 播放地址](/api/video/mv-url) 获取可播放 URL。
