---
title: '歌曲红心数量'
description: '调用此接口获取歌曲的红心用户数量'
---

# 歌曲红心数量

调用此接口获取歌曲的红心用户数量

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                    |
| ---------- | ----------------------------------------------------- |
| 接口地址   | `/song/red/count`                                     |
| 请求方式   | `GET` / `POST`                                        |
| 需要登录   | 否                                                    |
| 对应模块   | `song_red_count`                                      |
| SDK 函数   | `songRedCount`（`hana-music-api/api/song_red_count`） |
| 返回体类型 | `SongRedCountBody`（已建模返回体）                    |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { songRedCount } from 'hana-music-api';

const result = await songRedCount({
  id: '186016',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/song/red/count' \
  --data-urlencode 'id=186016'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明   |
| ---- | ------------------ | ---- | ------ | ------ |
| `id` | `number \| string` | 是   | -      | 歌曲id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SongRedCountBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/song_red_count`、`hana-music-api/schemas/song_red_count` 导入运行时校验器）。

```ts
type RedCount = {
  count: number;
  countDesc?: string | null;
};

type SongRedCountBody = {
  code: 200;
  data: RedCount;
};
```

| 字段             | 类型       | 必填 | 说明                         |
| ---------------- | ---------- | ---- | ---------------------------- |
| `code`           | `200`      | 是   | 业务状态码（`200` 表示成功） |
| `data`           | `RedCount` | 是   | 接口返回的数据主体           |
| `data.count`     | `number`   | 是   | 条目总数                     |
| `data.countDesc` | `string`   | 否   | -                            |

<!-- api-doc:response:end -->
