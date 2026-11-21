---
title: '获取精品歌单'
description: '调用此接口，可获取精品歌单'
---

# 获取精品歌单

调用此接口，可获取精品歌单

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                        |
| ---------- | ------------------------------------------------------------------------- |
| 接口地址   | `/top/playlist/highquality`                                               |
| 请求方式   | `GET` / `POST`                                                            |
| 需要登录   | 否                                                                        |
| 对应模块   | `top_playlist_highquality`                                                |
| SDK 函数   | `topPlaylistHighquality`（`hana-music-api/api/top_playlist_highquality`） |
| 返回体类型 | `TopPlaylistHighqualityBody`（已建模返回体）                              |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { topPlaylistHighquality } from 'hana-music-api';

const result = await topPlaylistHighquality({
  before: 1503639064232,
  limit: 3,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/top/playlist/highquality' \
  --data-urlencode 'before=1503639064232' \
  --data-urlencode 'limit=3'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型                      | 必填 | 默认值 | 说明                                                                                                                            |
| -------- | ------------------------- | ---- | ------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `cat`    | `string \| Array<string>` | 否   | `全部` | tag，比如 " 华语 "、" 古风 " 、" 欧美 "、" 流行 "，默认为<br>"全部"，可从精品歌单标签列表接口获取(`/playlist/highquality/tags`) |
| `limit`  | `number`                  | 否   | `50`   | 取出歌单数量，默认为 50                                                                                                         |
| `before` | `number`                  | 否   | `0`    | 分页参数，取上一页最后一个歌单的 `updateTime` 获取下一页数据                                                                    |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`TopPlaylistHighqualityBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/top_playlist_highquality`、`hana-music-api/schemas/top_playlist_highquality` 导入运行时校验器）。

```ts
type HighQualityPlaylist = Omit<PlaylistSummary, 'copywriter' | 'tag'> & {
  copywriter?: string | null;
  tag?: string | null;
};

type TopPlaylistHighqualityBody = {
  code: 200;
  playlists: Array<HighQualityPlaylist>;
  total?: number | null;
  lasttime?: number | null;
  more?: boolean | null;
  msg?: string | null;
};
```

- **公共类型**：[PlaylistSummary](/api/shared-types#playlistsummary)

| 字段                     | 类型                         | 必填 | 说明                         |
| ------------------------ | ---------------------------- | ---- | ---------------------------- |
| `code`                   | `200`                        | 是   | 业务状态码（`200` 表示成功） |
| `playlists`              | `Array<HighQualityPlaylist>` | 是   | 歌单列表                     |
| `playlists[].copywriter` | `string`                     | 否   | -                            |
| `playlists[].tag`        | `string`                     | 否   | -                            |
| `total`                  | `number`                     | 否   | 总条目数                     |
| `lasttime`               | `number`                     | 否   | 下一页游标时间戳             |
| `more`                   | `boolean`                    | 否   | 是否还有更多数据             |
| `msg`                    | `string`                     | 否   | 提示信息                     |

<!-- api-doc:response:end -->
