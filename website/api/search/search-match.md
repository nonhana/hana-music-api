---
title: '本地歌曲文件匹配网易云歌曲信息'
description: '调用此接口可以为本地歌曲文件搜索匹配歌曲ID、专辑封面等信息'
---

# 本地歌曲文件匹配网易云歌曲信息

调用此接口可以为本地歌曲文件搜索匹配歌曲ID、专辑封面等信息

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/search/match`                                    |
| 请求方式   | `GET` / `POST`                                     |
| 需要登录   | 否                                                 |
| 对应模块   | `search_match`                                     |
| SDK 函数   | `searchMatch`（`hana-music-api/api/search_match`） |
| 返回体类型 | `SearchMatchBody`（已建模返回体）                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { searchMatch } from 'hana-music-api';

const result = await searchMatch({
  title: '富士山下',
  album: '',
  artist: '陈奕迅',
  duration: 259.21,
  md5: 'bd708d006912a09d827f02e754cf8e56',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/search/match' \
  --data-urlencode 'title=富士山下' \
  --data-urlencode 'album=' \
  --data-urlencode 'artist=陈奕迅' \
  --data-urlencode 'duration=259.21' \
  --data-urlencode 'md5=bd708d006912a09d827f02e754cf8e56'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数       | 类型     | 必填 | 默认值 | 说明                                               |
| ---------- | -------- | ---- | ------ | -------------------------------------------------- |
| `album`    | `string` | 否   | ``     | 文件的专辑信息                                     |
| `artist`   | `string` | 否   | ``     | 文件的艺术家信息                                   |
| `duration` | `number` | 否   | `0`    | 文件的时长，单位为秒                               |
| `md5`      | `string` | 是   | -      | 文件的md5                                          |
| `title`    | `string` | 否   | ``     | 文件的标题信息，是文件属性里的标题属性，并非文件名 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SearchMatchBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/search_match`、`hana-music-api/schemas/search_match` 导入运行时校验器）。

```ts
type MatchedQuality = {
  id?: number | null;
  size?: number | null;
  extension?: string | null;
  sr?: number | null;
  dfsId?: number | null;
  bitrate?: number | null;
  playTime?: number | null;
  volumeDelta?: number | null;
};

type MatchedSong = Omit<
  Song,
  | 'disc'
  | 'position'
  | 'popularity'
  | 'score'
  | 'starred'
  | 'starredNum'
  | 'playedNum'
  | 'dayPlays'
  | 'hearTime'
  | 'ringtone'
  | 'copyFrom'
  | 'commentThreadId'
  | 'hMusic'
  | 'mMusic'
  | 'lMusic'
  | 'bMusic'
> & {
  disc?: string | null;
  position?: number | null;
  popularity?: number | null;
  score?: number | null;
  starred?: boolean | null;
  starredNum?: number | null;
  playedNum?: number | null;
  dayPlays?: number | null;
  hearTime?: number | null;
  ringtone?: string | null;
  copyFrom?: string | null;
  commentThreadId?: string | null;
  hMusic?: MatchedQuality | null;
  mMusic?: MatchedQuality | null;
  lMusic?: MatchedQuality | null;
  bMusic?: MatchedQuality | null;
};

type SearchMatchBody = {
  code: 200;
  result: {
    songs: Array<MatchedSong>;
    ids: Array<string>;
  };
};
```

- **公共类型**：[Song](/api/shared-types#song)

| 字段           | 类型                 | 必填 | 说明                         |
| -------------- | -------------------- | ---- | ---------------------------- |
| `code`         | `200`                | 是   | 业务状态码（`200` 表示成功） |
| `result`       | `object`             | 是   | 接口返回的结果主体           |
| `result.songs` | `Array<MatchedSong>` | 是   | 歌曲列表                     |
| `result.ids`   | `Array<string>`      | 是   | -                            |

<!-- api-doc:response:end -->
