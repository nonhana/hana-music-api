---
title: '歌曲音质详情'
description: '调用此接口获取歌曲各个音质的文件信息，与 `获取歌曲详情` 接口相比，多出 `高清环绕声`、`沉浸环绕声`、`超清母带`等音质的信息'
---

# 歌曲音质详情

调用此接口获取歌曲各个音质的文件信息，与 `获取歌曲详情` 接口相比，多出 `高清环绕声`、`沉浸环绕声`、`超清母带`等音质的信息

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                          |
| ---------- | ----------------------------------------------------------- |
| 接口地址   | `/song/music/detail`                                        |
| 请求方式   | `GET` / `POST`                                              |
| 需要登录   | 否                                                          |
| 对应模块   | `song_music_detail`                                         |
| SDK 函数   | `songMusicDetail`（`hana-music-api/api/song_music_detail`） |
| 返回体类型 | `SongMusicDetailBody`（已建模返回体）                       |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { songMusicDetail } from 'hana-music-api';

const result = await songMusicDetail({
  id: '2082700997',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/song/music/detail' \
  --data-urlencode 'id=2082700997'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明   |
| ---- | ------------------ | ---- | ------ | ------ |
| `id` | `number \| string` | 是   | -      | 歌曲id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SongMusicDetailBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/song_music_detail`、`hana-music-api/schemas/song_music_detail` 导入运行时校验器）。

```ts
type MusicQuality = {
  br?: number | null;
  fid?: number | null;
  it?: string | null;
  size?: number | null;
  sr?: number | null;
  vd?: number | null;
};

type SongMusicDetailBody = {
  code: 200;
  data: {
    songId: number;
    h?: MusicQuality | null;
    m?: MusicQuality | null;
    l?: MusicQuality | null;
    sq?: MusicQuality | null;
    vi?: MusicQuality | null;
    sk?: MusicQuality | null;
    sks?: Array<MusicQuality> | null;
    jm?: MusicQuality | null;
    je?: MusicQuality | null;
  };
  error?: boolean | null;
  message?: string | null;
  success?: boolean | null;
};
```

| 字段              | 类型                  | 必填 | 说明                         |
| ----------------- | --------------------- | ---- | ---------------------------- |
| `code`            | `200`                 | 是   | 业务状态码（`200` 表示成功） |
| `data`            | `object`              | 是   | 接口返回的数据主体           |
| `data.songId`     | `number`              | 是   | 歌曲 ID                      |
| `data.h`          | `MusicQuality`        | 否   | -                            |
| `data.h.br`       | `number`              | 否   | -                            |
| `data.h.fid`      | `number`              | 否   | -                            |
| `data.h.it`       | `string`              | 否   | -                            |
| `data.h.size`     | `number`              | 否   | -                            |
| `data.h.sr`       | `number`              | 否   | -                            |
| `data.h.vd`       | `number`              | 否   | -                            |
| `data.m`          | `MusicQuality`        | 否   | -                            |
| `data.m.br`       | `number`              | 否   | -                            |
| `data.m.fid`      | `number`              | 否   | -                            |
| `data.m.it`       | `string`              | 否   | -                            |
| `data.m.size`     | `number`              | 否   | -                            |
| `data.m.sr`       | `number`              | 否   | -                            |
| `data.m.vd`       | `number`              | 否   | -                            |
| `data.l`          | `MusicQuality`        | 否   | -                            |
| `data.l.br`       | `number`              | 否   | -                            |
| `data.l.fid`      | `number`              | 否   | -                            |
| `data.l.it`       | `string`              | 否   | -                            |
| `data.l.size`     | `number`              | 否   | -                            |
| `data.l.sr`       | `number`              | 否   | -                            |
| `data.l.vd`       | `number`              | 否   | -                            |
| `data.sq`         | `MusicQuality`        | 否   | -                            |
| `data.sq.br`      | `number`              | 否   | -                            |
| `data.sq.fid`     | `number`              | 否   | -                            |
| `data.sq.it`      | `string`              | 否   | -                            |
| `data.sq.size`    | `number`              | 否   | -                            |
| `data.sq.sr`      | `number`              | 否   | -                            |
| `data.sq.vd`      | `number`              | 否   | -                            |
| `data.vi`         | `MusicQuality`        | 否   | -                            |
| `data.vi.br`      | `number`              | 否   | -                            |
| `data.vi.fid`     | `number`              | 否   | -                            |
| `data.vi.it`      | `string`              | 否   | -                            |
| `data.vi.size`    | `number`              | 否   | -                            |
| `data.vi.sr`      | `number`              | 否   | -                            |
| `data.vi.vd`      | `number`              | 否   | -                            |
| `data.sk`         | `MusicQuality`        | 否   | -                            |
| `data.sk.br`      | `number`              | 否   | -                            |
| `data.sk.fid`     | `number`              | 否   | -                            |
| `data.sk.it`      | `string`              | 否   | -                            |
| `data.sk.size`    | `number`              | 否   | -                            |
| `data.sk.sr`      | `number`              | 否   | -                            |
| `data.sk.vd`      | `number`              | 否   | -                            |
| `data.sks`        | `Array<MusicQuality>` | 否   | -                            |
| `data.sks[].br`   | `number`              | 否   | -                            |
| `data.sks[].fid`  | `number`              | 否   | -                            |
| `data.sks[].it`   | `string`              | 否   | -                            |
| `data.sks[].size` | `number`              | 否   | -                            |
| `data.sks[].sr`   | `number`              | 否   | -                            |
| `data.sks[].vd`   | `number`              | 否   | -                            |
| `data.jm`         | `MusicQuality`        | 否   | -                            |
| `data.jm.br`      | `number`              | 否   | -                            |
| `data.jm.fid`     | `number`              | 否   | -                            |
| `data.jm.it`      | `string`              | 否   | -                            |
| `data.jm.size`    | `number`              | 否   | -                            |
| `data.jm.sr`      | `number`              | 否   | -                            |
| `data.jm.vd`      | `number`              | 否   | -                            |
| `data.je`         | `MusicQuality`        | 否   | -                            |
| `data.je.br`      | `number`              | 否   | -                            |
| `data.je.fid`     | `number`              | 否   | -                            |
| `data.je.it`      | `string`              | 否   | -                            |
| `data.je.size`    | `number`              | 否   | -                            |
| `data.je.sr`      | `number`              | 否   | -                            |
| `data.je.vd`      | `number`              | 否   | -                            |
| `error`           | `boolean`             | 否   | -                            |
| `message`         | `string`              | 否   | 返回说明信息                 |
| `success`         | `boolean`             | 否   | 操作是否成功                 |

<!-- api-doc:response:end -->
