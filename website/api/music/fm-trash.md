---
title: '垃圾桶'
description: '调用此接口，传入音乐 id，可把该音乐从私人 FM 中移除至垃圾桶'
---

# 垃圾桶

调用此接口，传入音乐 id，可把该音乐从私人 FM 中移除至垃圾桶

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                         |
| ---------- | ------------------------------------------ |
| 接口地址   | `/fm_trash`                                |
| 请求方式   | `GET` / `POST`                             |
| 需要登录   | 是                                         |
| 对应模块   | `fm_trash`                                 |
| SDK 函数   | `fmTrash`（`hana-music-api/api/fm_trash`） |
| 返回体类型 | `FmTrashBody`（已建模返回体）              |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { fmTrash } from 'hana-music-api';

const result = await fmTrash(
  {
    id: '347230',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/fm_trash' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=347230'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数   | 类型               | 必填 | 默认值 | 说明                        |
| ------ | ------------------ | ---- | ------ | --------------------------- |
| `id`   | `number \| string` | 是   | -      | 歌曲 id                     |
| `time` | `number`           | 否   | `25`   | 移除前已播放秒数，默认 `25` |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`FmTrashBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/fm_trash`、`hana-music-api/schemas/fm_trash` 导入运行时校验器）。

```ts
type FmTrashBody = {
  code: 200;
  count?: number | null;
};
```

| 字段    | 类型     | 必填 | 说明                         |
| ------- | -------- | ---- | ---------------------------- |
| `code`  | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `count` | `number` | 否   | 条目总数                     |

<!-- api-doc:response:end -->
