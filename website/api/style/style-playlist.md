---
title: '曲风-歌单'
description: '调用此接口可以获取该曲风对应的歌单'
---

# 曲风-歌单

调用此接口可以获取该曲风对应的歌单

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                     |
| ---------- | ------------------------------------------------------ |
| 接口地址   | `/style/playlist`                                      |
| 请求方式   | `GET` / `POST`                                         |
| 需要登录   | 否                                                     |
| 对应模块   | `style_playlist`                                       |
| SDK 函数   | `stylePlaylist`（`hana-music-api/api/style_playlist`） |
| 返回体类型 | `StylePlaylistBody`（已建模返回体）                    |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { stylePlaylist } from 'hana-music-api';

const result = await stylePlaylist({
  tagId: '1000',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/style/playlist' \
  --data-urlencode 'tagId=1000'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                                                                           |
| -------- | ------------------ | ---- | ------ | ------------------------------------------------------------------------------ |
| `tagId`  | `number \| string` | 是   | -      | 曲风 ID                                                                        |
| `cursor` | `number`           | 否   | `0`    | 返回数据的 cursor，默认为 0，传入上一次返回结果的 cursor，将会返回下一页的数据 |
| `size`   | `number`           | 否   | `20`   | 返回数量，默认为 20                                                            |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`StylePlaylistBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/style_playlist`、`hana-music-api/schemas/style_playlist` 导入运行时校验器）。

```ts
type StylePlaylist = {
  id: number;
  cover?: string | null;
  name?: string | null;
  playCount?: number | null;
  songCount?: number | null;
  userId?: number | null;
  userName?: string | null;
};

type StylePlaylistBody = {
  code: 200;
  data: {
    page?: StylePage | null;
    playlist: Array<StylePlaylist>;
  };
};
```

- **公共类型**：[StylePage](/api/shared-types#stylepage)

| 字段                        | 类型                                     | 必填 | 说明                         |
| --------------------------- | ---------------------------------------- | ---- | ---------------------------- |
| `code`                      | `200`                                    | 是   | 业务状态码（`200` 表示成功） |
| `data`                      | `object`                                 | 是   | 接口返回的数据主体           |
| `data.page`                 | [StylePage](/api/shared-types#stylepage) | 否   | StylePage 实体               |
| `data.playlist`             | `Array<StylePlaylist>`                   | 是   | 歌单详情                     |
| `data.playlist[].id`        | `number`                                 | 是   | 记录 ID                      |
| `data.playlist[].cover`     | `string`                                 | 否   | 封面图片 URL                 |
| `data.playlist[].name`      | `string`                                 | 否   | 名称                         |
| `data.playlist[].playCount` | `number`                                 | 否   | 播放次数                     |
| `data.playlist[].songCount` | `number`                                 | 否   | -                            |
| `data.playlist[].userId`    | `number`                                 | 否   | 用户 ID                      |
| `data.playlist[].userName`  | `string`                                 | 否   | -                            |

<!-- api-doc:response:end -->
