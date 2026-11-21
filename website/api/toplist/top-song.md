---
title: '新歌速递'
description: '调用此接口，可获取新歌速递'
---

# 新歌速递

调用此接口，可获取新歌速递

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                         |
| ---------- | ------------------------------------------ |
| 接口地址   | `/top/song`                                |
| 请求方式   | `GET` / `POST`                             |
| 需要登录   | 否                                         |
| 对应模块   | `top_song`                                 |
| SDK 函数   | `topSong`（`hana-music-api/api/top_song`） |
| 返回体类型 | `TopSongBody`（已建模返回体）              |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { topSong } from 'hana-music-api';

const result = await topSong({
  type: 96,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/top/song' \
  --data-urlencode 'type=96'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数   | 类型     | 必填 | 默认值 | 说明                                                                       |
| ------ | -------- | ---- | ------ | -------------------------------------------------------------------------- |
| `type` | `number` | 否   | `0`    | 地区类型 id，对应以下:<br>全部:0<br>华语:7<br>欧美:96<br>日本:8<br>韩国:16 |

| `type` | 地区分类     |
| ------ | ------------ |
| `0`    | 全部（默认） |
| `7`    | 华语         |
| `96`   | 欧美         |
| `8`    | 日本         |
| `16`   | 韩国         |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`TopSongBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/top_song`、`hana-music-api/schemas/top_song` 导入运行时校验器）。

```ts
type NewSong = Omit<
  Song,
  | 'popularity'
  | 'starred'
  | 'score'
  | 'position'
  | 'exclusive'
  | 'playedNum'
  | 'dayPlays'
  | 'hearTime'
  | 'starredNum'
> & {
  popularity?: number | null;
  starred?: boolean | null;
  score?: number | null;
  position?: number | null;
  exclusive?: boolean | null;
  playedNum?: number | null;
  dayPlays?: number | null;
  hearTime?: number | null;
  starredNum?: number | null;
};

type TopSongBody = {
  code: 200;
  data: Array<NewSong>;
};
```

- **公共类型**：[Song](/api/shared-types#song)

| 字段   | 类型             | 必填 | 说明                         |
| ------ | ---------------- | ---- | ---------------------------- |
| `code` | `200`            | 是   | 业务状态码（`200` 表示成功） |
| `data` | `Array<NewSong>` | 是   | 接口返回的数据主体           |

<!-- api-doc:response:end -->
