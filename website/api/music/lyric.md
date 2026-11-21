---
title: '获取歌词'
description: '调用此接口，传入音乐 id 可获得对应音乐的歌词 ( 不需要登录 )'
---

# 获取歌词

调用此接口，传入音乐 id 可获得对应音乐的歌词 ( 不需要登录 )

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                                |
| ---------- | --------------------------------------------------------------------------------- |
| 接口地址   | `/lyric`                                                                          |
| 请求方式   | `GET` / `POST`                                                                    |
| 需要登录   | 否                                                                                |
| 对应模块   | `lyric`                                                                           |
| SDK 函数   | `lyric`（`hana-music-api/api/lyric`）                                             |
| 返回体类型 | `LyricBody`（已建模返回体）                                                       |
| 读缓存     | 支持共享读缓存与并发请求去重，详见 [缓存与身份池](/guide/cache-and-identity-pool) |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { lyric } from 'hana-music-api';

const result = await lyric({
  id: '33894312',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/lyric' \
  --data-urlencode 'id=33894312'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明    |
| ---- | ------------------ | ---- | ------ | ------- |
| `id` | `number \| string` | 是   | -      | 音乐 id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`LyricBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/lyric`、`hana-music-api/schemas/lyric` 导入运行时校验器）。

```ts
type LyricPart = {
  lyric?: string | null;
  version?: number | null;
};

type LyricBody = {
  code: 200;
  lrc: {
    lyric: string;
    version?: number | null;
  };
  klyric?: LyricPart | null;
  tlyric?: LyricPart | null;
  romalrc?: LyricPart | null;
  lyricUser?: LyricUser | null;
  transUser?: LyricUser | null;
  sgc?: boolean | null;
  sfy?: boolean | null;
  qfy?: boolean | null;
  pureMusic?: boolean | null;
  needDesc?: boolean | null;
  uncollected?: boolean | null;
};
```

- **公共类型**：[LyricUser](/api/shared-types#lyricuser)

| 字段              | 类型                                     | 必填 | 说明                         |
| ----------------- | ---------------------------------------- | ---- | ---------------------------- |
| `code`            | `200`                                    | 是   | 业务状态码（`200` 表示成功） |
| `lrc`             | `object`                                 | 是   | 逐行歌词对象                 |
| `lrc.lyric`       | `string`                                 | 是   | -                            |
| `lrc.version`     | `number`                                 | 否   | 当前服务版本号               |
| `klyric`          | `LyricPart`                              | 否   | 卡拉 OK 歌词对象             |
| `klyric.lyric`    | `string`                                 | 否   | -                            |
| `klyric.version`  | `number`                                 | 否   | 当前服务版本号               |
| `tlyric`          | `LyricPart`                              | 否   | 歌词翻译对象                 |
| `tlyric.lyric`    | `string`                                 | 否   | -                            |
| `tlyric.version`  | `number`                                 | 否   | 当前服务版本号               |
| `romalrc`         | `LyricPart`                              | 否   | 歌词音译对象                 |
| `romalrc.lyric`   | `string`                                 | 否   | -                            |
| `romalrc.version` | `number`                                 | 否   | 当前服务版本号               |
| `lyricUser`       | [LyricUser](/api/shared-types#lyricuser) | 否   | 歌词贡献者信息               |
| `transUser`       | [LyricUser](/api/shared-types#lyricuser) | 否   | 翻译贡献者信息               |
| `sgc`             | `boolean`                                | 否   | -                            |
| `sfy`             | `boolean`                                | 否   | -                            |
| `qfy`             | `boolean`                                | 否   | -                            |
| `pureMusic`       | `boolean`                                | 否   | 是否为纯音乐                 |
| `needDesc`        | `boolean`                                | 否   | -                            |
| `uncollected`     | `boolean`                                | 否   | -                            |

<!-- api-doc:response:end -->

## 注意事项

- **读缓存与并发请求去重**：本接口支持共享读缓存与并发请求去重，未声明的请求字段会在输入校验时被拒绝，详见 [缓存与身份池](/guide/cache-and-identity-pool)。
