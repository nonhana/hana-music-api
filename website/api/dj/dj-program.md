---
title: '电台 - 节目'
description: '登录后调用此接口，传入`rid`，可查看对应电台的电台节目以及对应的 id，需要'
---

# 电台 - 节目

登录后调用此接口，传入`rid`，可查看对应电台的电台节目以及对应的 id，需要

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                             |
| ---------- | ---------------------------------------------- |
| 接口地址   | `/dj/program`                                  |
| 请求方式   | `GET` / `POST`                                 |
| 需要登录   | 是                                             |
| 对应模块   | `dj_program`                                   |
| SDK 函数   | `djProgram`（`hana-music-api/api/dj_program`） |
| 返回体类型 | `DjProgramBody`（已建模返回体）                |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djProgram } from 'hana-music-api';

const result = await djProgram(
  {
    rid: '336355127',
    limit: 40,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/dj/program' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'rid=336355127' \
  --data-urlencode 'limit=40'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值  | 说明                                                                    |
| -------- | ------------------ | ---- | ------- | ----------------------------------------------------------------------- |
| `asc`    | `boolean`          | 否   | `false` | 排序方式，默认为 `false` (新 => 老 ) 设置 `true` 可改为 老 => 新        |
| `limit`  | `number`           | 否   | `30`    | 返回数量，默认为 30                                                     |
| `offset` | `number`           | 否   | `0`     | 偏移数量，用于分页，如：(页数 - 1)\*30，其中 30 为 limit 的值，默认为 0 |
| `rid`    | `number \| string` | 是   | -       | 电台 的 id                                                              |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DjProgramBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/dj_program`、`hana-music-api/schemas/dj_program` 导入运行时校验器）。

```ts
type DjProgramBody = {
  code: 200;
  programs: Array<DjProgram>;
  count?: number | null;
  more?: boolean | null;
};
```

- **公共类型**：[DjProgram](/api/shared-types#djprogram)

| 字段       | 类型                                              | 必填 | 说明                         |
| ---------- | ------------------------------------------------- | ---- | ---------------------------- |
| `code`     | `200`                                             | 是   | 业务状态码（`200` 表示成功） |
| `programs` | Array\<[DjProgram](/api/shared-types#djprogram)\> | 是   | 电台节目列表                 |
| `count`    | `number`                                          | 否   | 条目总数                     |
| `more`     | `boolean`                                         | 否   | 是否还有更多数据             |

<!-- api-doc:response:end -->

## 注意事项

- **音频播放**：节目对象中的 `mp3Url` 通常为 `null`，如需播放节目音频，可读取节目的 `mainTrackId` 并传入 [获取音乐 URL](/api/music/song-url)。
