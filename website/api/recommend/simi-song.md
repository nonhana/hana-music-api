---
title: '获取相似音乐'
description: '调用此接口，传入歌曲 id，可获得相似歌曲'
---

# 获取相似音乐

调用此接口，传入歌曲 id，可获得相似歌曲

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                           |
| ---------- | -------------------------------------------- |
| 接口地址   | `/simi/song`                                 |
| 请求方式   | `GET` / `POST`                               |
| 需要登录   | 否                                           |
| 对应模块   | `simi_song`                                  |
| SDK 函数   | `simiSong`（`hana-music-api/api/simi_song`） |
| 返回体类型 | `SimiSongBody`（已建模返回体）               |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { simiSong } from 'hana-music-api';

const result = await simiSong({
  id: '347230',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/simi/song' \
  --data-urlencode 'id=347230'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                         |
| -------- | ------------------ | ---- | ------ | ---------------------------- |
| `id`     | `number \| string` | 是   | -      | 歌曲 id                      |
| `limit`  | `number`           | 否   | `50`   | 返回数量，默认 `50`          |
| `offset` | `number`           | 否   | `0`    | 偏移数量，用于分页，默认 `0` |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SimiSongBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/simi_song`、`hana-music-api/schemas/simi_song` 导入运行时校验器）。

```ts
type SimiSong = Omit<
  ProgramMainSong,
  | 'id'
  | 'alg'
  | 'alias'
  | 'mp3Url'
  | 'privilege'
  | 'recommendReason'
  | 'sqMusic'
  | 'transNames'
> & {
  id: number;
  alg?: string | null;
  alias?: Array<string> | null;
  mp3Url?: string | null;
  privilege?: LooseSongPrivilege | null;
  recommendReason?: string | null;
  sqMusic?: ProgramQuality | null;
  transNames?: Array<string> | null;
};

type SimiSongBody = {
  code: 200;
  songs: Array<SimiSong>;
};
```

- **公共类型**：[LooseSongPrivilege](/api/shared-types#loosesongprivilege)、[ProgramMainSong](/api/shared-types#programmainsong)、[ProgramQuality](/api/shared-types#programquality)

| 字段         | 类型              | 必填 | 说明                         |
| ------------ | ----------------- | ---- | ---------------------------- |
| `code`       | `200`             | 是   | 业务状态码（`200` 表示成功） |
| `songs`      | `Array<SimiSong>` | 是   | 歌曲列表                     |
| `songs[].id` | `number`          | 是   | 记录 ID                      |

<!-- api-doc:response:end -->
