---
title: '歌手详情动态'
description: '调用后可获取歌手详情动态部分，如是否关注，视频数'
---

# 歌手详情动态

调用后可获取歌手详情动态部分，如是否关注，视频数

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                  |
| ---------- | ------------------------------------------------------------------- |
| 接口地址   | `/artist/detail/dynamic`                                            |
| 请求方式   | `GET` / `POST`                                                      |
| 需要登录   | 否                                                                  |
| 对应模块   | `artist_detail_dynamic`                                             |
| SDK 函数   | `artistDetailDynamic`（`hana-music-api/api/artist_detail_dynamic`） |
| 返回体类型 | `ArtistDetailDynamicBody`（已建模返回体）                           |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { artistDetailDynamic } from 'hana-music-api';

const result = await artistDetailDynamic({
  id: '15396',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/artist/detail/dynamic' \
  --data-urlencode 'id=15396'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明    |
| ---- | ------------------ | ---- | ------ | ------- |
| `id` | `number \| string` | 是   | -      | 歌手 id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ArtistDetailDynamicBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/artist_detail_dynamic`、`hana-music-api/schemas/artist_detail_dynamic` 导入运行时校验器）。

```ts
type Concert = {
  onlineCount?: number | null;
  view?: boolean | null;
};

type RcmdResource = {
  buttonName?: string | null;
  description?: string | null;
  resourceType?: number | null;
  title?: string | null;
  url?: string | null;
};

type VideoNum = {
  cat?: number | null;
  num?: number | null;
};

type ArtistDetailDynamicBody = {
  code: 200;
  concert?: Concert | null;
  followed?: boolean | null;
  rcmdResource?: RcmdResource | null;
  videoNum?: Array<VideoNum> | null;
};
```

| 字段                        | 类型              | 必填 | 说明                         |
| --------------------------- | ----------------- | ---- | ---------------------------- |
| `code`                      | `200`             | 是   | 业务状态码（`200` 表示成功） |
| `concert`                   | `Concert`         | 否   | -                            |
| `concert.onlineCount`       | `number`          | 否   | -                            |
| `concert.view`              | `boolean`         | 否   | -                            |
| `followed`                  | `boolean`         | 否   | 是否已关注                   |
| `rcmdResource`              | `RcmdResource`    | 否   | -                            |
| `rcmdResource.buttonName`   | `string`          | 否   | -                            |
| `rcmdResource.description`  | `string`          | 否   | 描述信息                     |
| `rcmdResource.resourceType` | `number`          | 否   | -                            |
| `rcmdResource.title`        | `string`          | 否   | 标题                         |
| `rcmdResource.url`          | `string`          | 否   | 资源访问地址                 |
| `videoNum`                  | `Array<VideoNum>` | 否   | -                            |
| `videoNum[].cat`            | `number`          | 否   | -                            |
| `videoNum[].num`            | `number`          | 否   | -                            |

<!-- api-doc:response:end -->
