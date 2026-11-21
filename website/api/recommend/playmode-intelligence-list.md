---
title: '心动模式/智能播放'
description: '登录后调用此接口，可获取心动模式/智能播放列表'
---

# 心动模式/智能播放

登录后调用此接口，可获取心动模式/智能播放列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                            |
| ---------- | ----------------------------------------------------------------------------- |
| 接口地址   | `/playmode/intelligence/list`                                                 |
| 请求方式   | `GET` / `POST`                                                                |
| 需要登录   | 是                                                                            |
| 对应模块   | `playmode_intelligence_list`                                                  |
| SDK 函数   | `playmodeIntelligenceList`（`hana-music-api/api/playmode_intelligence_list`） |
| 返回体类型 | `PlaymodeIntelligenceListBody`（已建模返回体）                                |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { playmodeIntelligenceList } from 'hana-music-api';

const result = await playmodeIntelligenceList(
  {
    id: '33894312',
    pid: '24381616',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/playmode/intelligence/list' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=33894312' \
  --data-urlencode 'pid=24381616'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数    | 类型               | 必填 | 默认值 | 说明                       |
| ------- | ------------------ | ---- | ------ | -------------------------- |
| `count` | `number`           | 否   | `1`    | 返回推荐曲目数量，默认 `1` |
| `id`    | `number \| string` | 是   | -      | 歌曲 id                    |
| `pid`   | `number \| string` | 是   | -      | 歌单 id                    |
| `sid`   | `number \| string` | 否   | -      | 要开始播放的歌曲的 id      |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlaymodeIntelligenceListBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/playmode_intelligence_list`、`hana-music-api/schemas/playmode_intelligence_list` 导入运行时校验器）。

```ts
type RecommendedSong = {
  id: number;
  alg?: string | null;
  recommended?: boolean | null;
  songInfo?: LooseSong | null;
};

type PlaymodeIntelligenceListBody = {
  code: 200;
  data: Array<RecommendedSong>;
  message?: string | null;
};
```

- **公共类型**：[LooseSong](/api/shared-types#loosesong)

| 字段                 | 类型                                     | 必填 | 说明                         |
| -------------------- | ---------------------------------------- | ---- | ---------------------------- |
| `code`               | `200`                                    | 是   | 业务状态码（`200` 表示成功） |
| `data`               | `Array<RecommendedSong>`                 | 是   | 接口返回的数据主体           |
| `data[].id`          | `number`                                 | 是   | 记录 ID                      |
| `data[].alg`         | `string`                                 | 否   | 推荐算法标识                 |
| `data[].recommended` | `boolean`                                | 否   | -                            |
| `data[].songInfo`    | [LooseSong](/api/shared-types#loosesong) | 否   | LooseSong 实体               |
| `message`            | `string`                                 | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
