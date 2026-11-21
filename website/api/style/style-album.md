---
title: '曲风-专辑'
description: '调用此接口可以获取该曲风对应的专辑'
---

# 曲风-专辑

调用此接口可以获取该曲风对应的专辑

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                               |
| ---------- | ------------------------------------------------ |
| 接口地址   | `/style/album`                                   |
| 请求方式   | `GET` / `POST`                                   |
| 需要登录   | 否                                               |
| 对应模块   | `style_album`                                    |
| SDK 函数   | `styleAlbum`（`hana-music-api/api/style_album`） |
| 返回体类型 | `StyleAlbumBody`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { styleAlbum } from 'hana-music-api';

const result = await styleAlbum({
  tagId: '1000',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/style/album' \
  --data-urlencode 'tagId=1000'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                                                                           |
| -------- | ------------------ | ---- | ------ | ------------------------------------------------------------------------------ |
| `tagId`  | `number \| string` | 是   | -      | 曲风 ID                                                                        |
| `cursor` | `number`           | 否   | `0`    | 返回数据的 cursor，默认为 0，传入上一次返回结果的 cursor，将会返回下一页的数据 |
| `size`   | `number`           | 否   | `20`   | 返回数量，默认为 20                                                            |
| `sort`   | `0 \| 1`           | 否   | `0`    | 排序方式，0: 按热度排序，1: 按时间排序                                         |

| `sort` | 排序方式           |
| ------ | ------------------ |
| `0`    | 按热度排序（默认） |
| `1`    | 按时间排序         |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`StyleAlbumBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/style_album`、`hana-music-api/schemas/style_album` 导入运行时校验器）。

```ts
type StyleAlbum = Omit<SimpleAlbum, 'id'> & {
  id: number;
};

type StyleAlbumBody = {
  code: 200;
  data: {
    albums: Array<StyleAlbum>;
    page?: StylePage | null;
  };
};
```

- **公共类型**：[SimpleAlbum](/api/shared-types#simplealbum)、[StylePage](/api/shared-types#stylepage)

| 字段               | 类型                                     | 必填 | 说明                         |
| ------------------ | ---------------------------------------- | ---- | ---------------------------- |
| `code`             | `200`                                    | 是   | 业务状态码（`200` 表示成功） |
| `data`             | `object`                                 | 是   | 接口返回的数据主体           |
| `data.albums`      | `Array<StyleAlbum>`                      | 是   | 专辑列表                     |
| `data.albums[].id` | `number`                                 | 是   | 记录 ID                      |
| `data.page`        | [StylePage](/api/shared-types#stylepage) | 否   | StylePage 实体               |

<!-- api-doc:response:end -->
