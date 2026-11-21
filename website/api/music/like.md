---
title: '喜欢音乐'
description: '调用此接口，传入音乐 id，可喜欢该音乐'
---

# 喜欢音乐

调用此接口，传入音乐 id，可喜欢该音乐

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                  |
| ---------- | ----------------------------------- |
| 接口地址   | `/like`                             |
| 请求方式   | `GET` / `POST`                      |
| 需要登录   | 是                                  |
| 对应模块   | `like`                              |
| SDK 函数   | `like`（`hana-music-api/api/like`） |
| 返回体类型 | `LikeBody`（已建模返回体）          |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { like } from 'hana-music-api';

const result = await like(
  {
    id: '347230',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/like' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=347230'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数   | 类型               | 必填 | 默认值 | 说明                                               |
| ------ | ------------------ | ---- | ------ | -------------------------------------------------- |
| `id`   | `number \| string` | 是   | -      | 歌曲 id                                            |
| `like` | `boolean`          | 否   | `true` | 布尔值，默认为 true 即喜欢，若传 false，则取消喜欢 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`LikeBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/like`、`hana-music-api/schemas/like` 导入运行时校验器）。

```ts
type LikeBody = {
  code: 200;
  playlistId?: number | null;
};
```

| 字段         | 类型     | 必填 | 说明                         |
| ------------ | -------- | ---- | ---------------------------- |
| `code`       | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `playlistId` | `number` | 否   | 歌单 ID                      |

<!-- api-doc:response:end -->
