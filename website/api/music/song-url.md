---
title: '获取音乐 url'
description: '传入歌曲 ID 数组，获取对应码率的音乐播放链接；未登录或非会员曲目可能仅返回试听片段。'
---

# 获取音乐 url

传入歌曲 ID 数组，获取对应码率的音乐播放链接；未登录或非会员曲目可能仅返回试听片段。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                         |
| ---------- | ------------------------------------------ |
| 接口地址   | `/song/url`                                |
| 请求方式   | `GET` / `POST`                             |
| 需要登录   | 否                                         |
| 对应模块   | `song_url`                                 |
| SDK 函数   | `songUrl`（`hana-music-api/api/song_url`） |
| 返回体类型 | `SongUrlBody`（已建模返回体）              |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { songUrl } from 'hana-music-api';

const result = await songUrl({
  ids: [347230],
});
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/song/url' \
  -H 'Content-Type: application/json' \
  --data '{"ids":[347230]}'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数  | 类型                      | 必填 | 默认值   | 说明                                                                        |
| ----- | ------------------------- | ---- | -------- | --------------------------------------------------------------------------- |
| `br`  | `number`                  | 否   | `999000` | 码率，默认设置了 999000 即最大码率，如果要 320k 则可设置为 320000，其他类推 |
| `ids` | `Array<number \| string>` | 是   | -        | 歌曲 ID 数组（至少包含一个正整数或纯数字字符串 ID）                         |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SongUrlBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/song_url`、`hana-music-api/schemas/song_url` 导入运行时校验器）。

```ts
type SongUrlEntry = Omit<SongUrlData, 'id'> & {
  id: string | number;
};

type SongUrlBody = {
  code: 200;
  data: Array<SongUrlEntry>;
};
```

- **公共类型**：[SongUrlData](/api/shared-types#songurldata)

| 字段        | 类型                  | 必填 | 说明                         |
| ----------- | --------------------- | ---- | ---------------------------- |
| `code`      | `200`                 | 是   | 业务状态码（`200` 表示成功） |
| `data`      | `Array<SongUrlEntry>` | 是   | 接口返回的数据主体           |
| `data[].id` | `string \| number`    | 是   | 记录 ID                      |

<!-- api-doc:response:end -->

## 注意事项

- **响应结构**：模块按请求传入的 `ids` 顺序重排 `data` 并统一输出 `code: 200`；单项是否可播放或受限于版权请检查 `data[].code` 与 `data[].url`。
- **试听与防盗链**：仅可试听时 `data[].freeTrialInfo` 给出试听起止秒数；浏览器播放若遇 403，请在页面 `<head>` 添加 `<meta name="referrer" content="no-referrer">`。
