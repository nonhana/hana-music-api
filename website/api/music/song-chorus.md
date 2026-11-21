---
title: '副歌时间'
description: '调用此接口，传入歌曲id，获取副歌时间'
---

# 副歌时间

调用此接口，传入歌曲id，获取副歌时间

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                               |
| ---------- | ------------------------------------------------ |
| 接口地址   | `/song/chorus`                                   |
| 请求方式   | `GET` / `POST`                                   |
| 需要登录   | 否                                               |
| 对应模块   | `song_chorus`                                    |
| SDK 函数   | `songChorus`（`hana-music-api/api/song_chorus`） |
| 返回体类型 | `SongChorusBody`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { songChorus } from 'hana-music-api';

const result = await songChorus({
  id: '2058263032',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/song/chorus' \
  --data-urlencode 'id=2058263032'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明   |
| ---- | ------------------ | ---- | ------ | ------ |
| `id` | `number \| string` | 是   | -      | 歌曲id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SongChorusBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/song_chorus`、`hana-music-api/schemas/song_chorus` 导入运行时校验器）。

```ts
type Chorus = {
  id: number;
  endTime?: number | null;
  startTime?: number | null;
  ugcLocked?: number | null;
};

type SongChorusBody = {
  code: 200;
  chorus: Array<Chorus>;
  data: Array<Chorus>;
};
```

| 字段                 | 类型            | 必填 | 说明                         |
| -------------------- | --------------- | ---- | ---------------------------- |
| `code`               | `200`           | 是   | 业务状态码（`200` 表示成功） |
| `chorus`             | `Array<Chorus>` | 是   | -                            |
| `chorus[].id`        | `number`        | 是   | 记录 ID                      |
| `chorus[].endTime`   | `number`        | 否   | 时间戳                       |
| `chorus[].startTime` | `number`        | 否   | 时间戳                       |
| `chorus[].ugcLocked` | `number`        | 否   | -                            |
| `data`               | `Array<Chorus>` | 是   | 接口返回的数据主体           |
| `data[].id`          | `number`        | 是   | 记录 ID                      |
| `data[].endTime`     | `number`        | 否   | 时间戳                       |
| `data[].startTime`   | `number`        | 否   | 时间戳                       |
| `data[].ugcLocked`   | `number`        | 否   | -                            |

<!-- api-doc:response:end -->

## 注意事项

- **时间单位**：副歌起止时间 `startTime` 与 `endTime` 单位均为毫秒。
