---
title: '获取声音歌词'
description: '调用此接口可以获取声音歌词'
---

# 获取声音歌词

调用此接口可以获取声音歌词

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                               |
| ---------- | ------------------------------------------------ |
| 接口地址   | `/voice/lyric`                                   |
| 请求方式   | `GET` / `POST`                                   |
| 需要登录   | 否                                               |
| 对应模块   | `voice_lyric`                                    |
| SDK 函数   | `voiceLyric`（`hana-music-api/api/voice_lyric`） |
| 返回体类型 | `VoiceLyricBody`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { voiceLyric } from 'hana-music-api';

const result = await voiceLyric({
  id: 347230,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/voice/lyric' \
  --data-urlencode 'id=347230'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明   |
| ---- | ------------------ | ---- | ------ | ------ |
| `id` | `number \| string` | 是   | -      | 声音id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`VoiceLyricBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/voice_lyric`、`hana-music-api/schemas/voice_lyric` 导入运行时校验器）。

```ts
type Lyric = {
  lyricUrl: string;
};

type VoiceLyricBody = {
  code: 200;
  data?: Lyric | null;
};
```

> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。

| 字段            | 类型     | 必填 | 说明                         |
| --------------- | -------- | ---- | ---------------------------- |
| `code`          | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `data`          | `Lyric`  | 可空 | 接口返回的数据主体           |
| `data.lyricUrl` | `string` | 是   | 资源访问链接                 |

<!-- api-doc:response:end -->
