---
title: '专辑动态信息'
description: '调用此接口，传入专辑 id，可获得专辑动态信息，如是否收藏，收藏数，评论数，分享数'
---

# 专辑动态信息

调用此接口，传入专辑 id，可获得专辑动态信息，如是否收藏，收藏数，评论数，分享数

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                |
| ---------- | ----------------------------------------------------------------- |
| 接口地址   | `/album/detail/dynamic`                                           |
| 请求方式   | `GET` / `POST`                                                    |
| 需要登录   | 否                                                                |
| 对应模块   | `album_detail_dynamic`                                            |
| SDK 函数   | `albumDetailDynamic`（`hana-music-api/api/album_detail_dynamic`） |
| 返回体类型 | `AlbumDetailDynamicBody`（已建模返回体）                          |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { albumDetailDynamic } from 'hana-music-api';

const result = await albumDetailDynamic({
  id: '32311',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/album/detail/dynamic' \
  --data-urlencode 'id=32311'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明    |
| ---- | ------------------ | ---- | ------ | ------- |
| `id` | `number \| string` | 是   | -      | 专辑 id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`AlbumDetailDynamicBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/album_detail_dynamic`、`hana-music-api/schemas/album_detail_dynamic` 导入运行时校验器）。

```ts
type AlbumNearbyProduct = {
  subTitle?: string | null;
  title?: string | null;
  url?: string | null;
};

type AlbumDetailDynamicBody = {
  code: 200;
  albumNearbyProduct?: AlbumNearbyProduct | null;
  commentCount?: number | null;
  displayType?: number | null;
  isSub?: boolean | null;
  likedCount?: number | null;
  onSale?: boolean | null;
  paid?: boolean | null;
  sales?: number | null;
  shareCount?: number | null;
  subCount?: number | null;
  subTime?: number | null;
};
```

| 字段                          | 类型                 | 必填 | 说明                         |
| ----------------------------- | -------------------- | ---- | ---------------------------- |
| `code`                        | `200`                | 是   | 业务状态码（`200` 表示成功） |
| `albumNearbyProduct`          | `AlbumNearbyProduct` | 否   | -                            |
| `albumNearbyProduct.subTitle` | `string`             | 否   | -                            |
| `albumNearbyProduct.title`    | `string`             | 否   | 标题                         |
| `albumNearbyProduct.url`      | `string`             | 否   | 资源访问地址                 |
| `commentCount`                | `number`             | 否   | 评论数                       |
| `displayType`                 | `number`             | 否   | -                            |
| `isSub`                       | `boolean`            | 否   | -                            |
| `likedCount`                  | `number`             | 否   | 点赞数                       |
| `onSale`                      | `boolean`            | 否   | -                            |
| `paid`                        | `boolean`            | 否   | -                            |
| `sales`                       | `number`             | 否   | -                            |
| `shareCount`                  | `number`             | 否   | 分享数                       |
| `subCount`                    | `number`             | 否   | -                            |
| `subTime`                     | `number`             | 否   | 时间戳                       |

<!-- api-doc:response:end -->
