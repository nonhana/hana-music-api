---
title: '歌曲动态封面'
description: '登录后调用此接口，传入歌曲id，获取歌曲动态封面'
---

# 歌曲动态封面

登录后调用此接口，传入歌曲id，获取歌曲动态封面

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                            |
| ---------- | ------------------------------------------------------------- |
| 接口地址   | `/song/dynamic/cover`                                         |
| 请求方式   | `GET` / `POST`                                                |
| 需要登录   | 是                                                            |
| 对应模块   | `song_dynamic_cover`                                          |
| SDK 函数   | `songDynamicCover`（`hana-music-api/api/song_dynamic_cover`） |
| 返回体类型 | `SongDynamicCoverBody`（已建模返回体）                        |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { songDynamicCover } from 'hana-music-api';

const result = await songDynamicCover(
  {
    id: '2101179024',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/song/dynamic/cover' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=2101179024'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明    |
| ---- | ------------------ | ---- | ------ | ------- |
| `id` | `number \| string` | 是   | -      | 歌曲 id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SongDynamicCoverBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/song_dynamic_cover`、`hana-music-api/schemas/song_dynamic_cover` 导入运行时校验器）。

```ts
type DynamicCover = {
  videoPlayUrl?: string | null;
  height?: number | null;
  weight?: number | null;
  needTransition?: boolean | null;
};

type SongDynamicCoverBody = {
  code: 200;
  data: DynamicCover;
  message?: string | null;
};
```

> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。

| 字段                  | 类型           | 必填 | 说明                         |
| --------------------- | -------------- | ---- | ---------------------------- |
| `code`                | `200`          | 是   | 业务状态码（`200` 表示成功） |
| `data`                | `DynamicCover` | 是   | 接口返回的数据主体           |
| `data.videoPlayUrl`   | `string`       | 可空 | 动态封面视频播放 URL         |
| `data.height`         | `number`       | 否   | -                            |
| `data.weight`         | `number`       | 否   | -                            |
| `data.needTransition` | `boolean`      | 否   | -                            |
| `message`             | `string`       | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->

## 注意事项

- **签名有效期**：`data.videoPlayUrl` 附带时效签名参数（`wsSecret`/`wsTime`），切勿长期缓存该链接；歌曲无动态封面时该字段可能缺失或为 `null`。
