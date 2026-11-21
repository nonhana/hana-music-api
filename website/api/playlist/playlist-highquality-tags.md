---
title: '精品歌单标签列表'
description: '调用此接口，可获取精品歌单标签列表'
---

# 精品歌单标签列表

调用此接口，可获取精品歌单标签列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                          |
| ---------- | --------------------------------------------------------------------------- |
| 接口地址   | `/playlist/highquality/tags`                                                |
| 请求方式   | `GET` / `POST`                                                              |
| 需要登录   | 否                                                                          |
| 对应模块   | `playlist_highquality_tags`                                                 |
| SDK 函数   | `playlistHighqualityTags`（`hana-music-api/api/playlist_highquality_tags`） |
| 返回体类型 | `PlaylistHighqualityTagsBody`（已建模返回体）                               |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { playlistHighqualityTags } from 'hana-music-api';

const result = await playlistHighqualityTags();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/playlist/highquality/tags'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlaylistHighqualityTagsBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/playlist_highquality_tags`、`hana-music-api/schemas/playlist_highquality_tags` 导入运行时校验器）。

```ts
type Tag = {
  id: number;
  name?: string | null;
  type?: number | null;
  category?: number | null;
  hot?: boolean | null;
};

type PlaylistHighqualityTagsBody = {
  code: 200;
  tags: Array<Tag>;
};
```

| 字段              | 类型         | 必填 | 说明                         |
| ----------------- | ------------ | ---- | ---------------------------- |
| `code`            | `200`        | 是   | 业务状态码（`200` 表示成功） |
| `tags`            | `Array<Tag>` | 是   | 标签列表                     |
| `tags[].id`       | `number`     | 是   | 记录 ID                      |
| `tags[].name`     | `string`     | 否   | 名称                         |
| `tags[].type`     | `number`     | 否   | -                            |
| `tags[].category` | `number`     | 否   | -                            |
| `tags[].hot`      | `boolean`    | 否   | -                            |

<!-- api-doc:response:end -->
