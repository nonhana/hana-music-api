---
title: '热门歌单分类'
description: '调用此接口，可获取歌单分类，包含 category 信息'
---

# 热门歌单分类

调用此接口，可获取歌单分类，包含 category 信息

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/playlist/hot`                                    |
| 请求方式   | `GET` / `POST`                                     |
| 需要登录   | 否                                                 |
| 对应模块   | `playlist_hot`                                     |
| SDK 函数   | `playlistHot`（`hana-music-api/api/playlist_hot`） |
| 返回体类型 | `PlaylistHotBody`（已建模返回体）                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { playlistHot } from 'hana-music-api';

const result = await playlistHot();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/playlist/hot'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlaylistHotBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/playlist_hot`、`hana-music-api/schemas/playlist_hot` 导入运行时校验器）。

```ts
type PlaylistTag = {
  id?: number | null;
  name?: string | null;
  category?: number | null;
  usedCount?: number | null;
  type?: number | null;
  position?: number | null;
  createTime?: number | null;
  highQuality?: number | null;
  highQualityPos?: number | null;
  officialPos?: number | null;
};

type HotTag = {
  id: number;
  name?: string | null;
  category?: number | null;
  type?: number | null;
  position?: number | null;
  createTime?: number | null;
  usedCount?: number | null;
  hot?: boolean | null;
  activity?: boolean | null;
  playlistTag?: PlaylistTag | null;
};

type PlaylistHotBody = {
  code: 200;
  tags: Array<HotTag>;
};
```

| 字段                                | 类型            | 必填 | 说明                         |
| ----------------------------------- | --------------- | ---- | ---------------------------- |
| `code`                              | `200`           | 是   | 业务状态码（`200` 表示成功） |
| `tags`                              | `Array<HotTag>` | 是   | 标签列表                     |
| `tags[].id`                         | `number`        | 是   | 记录 ID                      |
| `tags[].name`                       | `string`        | 否   | 名称                         |
| `tags[].category`                   | `number`        | 否   | -                            |
| `tags[].type`                       | `number`        | 否   | -                            |
| `tags[].position`                   | `number`        | 否   | -                            |
| `tags[].createTime`                 | `number`        | 否   | 时间戳                       |
| `tags[].usedCount`                  | `number`        | 否   | -                            |
| `tags[].hot`                        | `boolean`       | 否   | -                            |
| `tags[].activity`                   | `boolean`       | 否   | -                            |
| `tags[].playlistTag`                | `PlaylistTag`   | 否   | -                            |
| `tags[].playlistTag.id`             | `number`        | 否   | 记录 ID                      |
| `tags[].playlistTag.name`           | `string`        | 否   | 名称                         |
| `tags[].playlistTag.category`       | `number`        | 否   | -                            |
| `tags[].playlistTag.usedCount`      | `number`        | 否   | -                            |
| `tags[].playlistTag.type`           | `number`        | 否   | -                            |
| `tags[].playlistTag.position`       | `number`        | 否   | -                            |
| `tags[].playlistTag.createTime`     | `number`        | 否   | 时间戳                       |
| `tags[].playlistTag.highQuality`    | `number`        | 否   | -                            |
| `tags[].playlistTag.highQualityPos` | `number`        | 否   | -                            |
| `tags[].playlistTag.officialPos`    | `number`        | 否   | -                            |

<!-- api-doc:response:end -->
