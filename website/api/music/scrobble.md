---
title: '听歌打卡'
description: '调用此接口，传入音乐 id，来源 id，歌曲时间 time，更新听歌排行数据'
---

# 听歌打卡

调用此接口，传入音乐 id，来源 id，歌曲时间 time，更新听歌排行数据

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                          |
| ---------- | ------------------------------------------- |
| 接口地址   | `/scrobble`                                 |
| 请求方式   | `GET` / `POST`                              |
| 需要登录   | 是                                          |
| 对应模块   | `scrobble`                                  |
| SDK 函数   | `scrobble`（`hana-music-api/api/scrobble`） |
| 返回体类型 | `ScrobbleBody`（已建模返回体）              |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { scrobble } from 'hana-music-api';

const result = await scrobble(
  {
    id: '518066366',
    sourceid: 36780169,
    source: 'list',
    time: 291,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/scrobble' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=518066366' \
  --data-urlencode 'sourceid=36780169' \
  --data-urlencode 'source=list' \
  --data-urlencode 'time=291'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数       | 类型               | 必填 | 默认值 | 说明                                  |
| ---------- | ------------------ | ---- | ------ | ------------------------------------- |
| `id`       | `number \| string` | 是   | -      | 歌曲 id                               |
| `source`   | `string`           | 否   | `list` | 播放来源类型                          |
| `sourceid` | `number`           | 是   | -      | 播放来源 id；没有容器 id 的来源传 `0` |
| `time`     | `number`           | 否   | -      | 歌曲播放时间，单位为整数秒            |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ScrobbleBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/scrobble`、`hana-music-api/schemas/scrobble` 导入运行时校验器）。

```ts
type ScrobbleBody = {
  code: 200;
  data?: string | null;
  message?: string | null;
};
```

| 字段      | 类型     | 必填 | 说明                         |
| --------- | -------- | ---- | ---------------------------- |
| `code`    | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `data`    | `string` | 否   | 接口返回的数据主体           |
| `message` | `string` | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->

## 注意事项

- **播放来源约定**：`source` 常用值与 `sourceid` 对应关系——`list`（歌单 ID）、`album`（专辑 ID）、`artist`（歌手 ID）；`recommend`/`search`/`download` 无容器 ID 时 `sourceid` 传 `0`。
- **数据延迟**：听歌打卡计入用户听歌排行存在上游延迟，返回 `code: 200` 不代表排行立即更新。
