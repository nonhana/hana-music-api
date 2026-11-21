---
title: '获取音乐 url - 新版'
description: '传入歌曲 ID 数组与目标音质等级，获取对应音质的音乐播放链接与试听信息。'
---

# 获取音乐 url - 新版

传入歌曲 ID 数组与目标音质等级，获取对应音质的音乐播放链接与试听信息。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                              |
| ---------- | ----------------------------------------------- |
| 接口地址   | `/song/url/v1`                                  |
| 请求方式   | `GET` / `POST`                                  |
| 需要登录   | 否                                              |
| 对应模块   | `song_url_v1`                                   |
| SDK 函数   | `songUrlV1`（`hana-music-api/api/song_url_v1`） |
| 返回体类型 | `SongUrlV1Body`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { songUrlV1 } from 'hana-music-api';

const result = await songUrlV1({
  ids: [347230],
  level: 'standard',
});
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/song/url/v1' \
  -H 'Content-Type: application/json' \
  --data '{"ids":[347230],"level":"standard"}'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数    | 类型                                                                                               | 必填 | 默认值 | 说明                                                |
| ------- | -------------------------------------------------------------------------------------------------- | ---- | ------ | --------------------------------------------------- |
| `ids`   | `Array<number \| string>`                                                                          | 是   | -      | 歌曲 ID 数组（至少包含一个正整数或纯数字字符串 ID） |
| `level` | `'standard' \| 'higher' \| 'exhigh' \| 'lossless' \| 'hires' \| 'jyeffect' \| 'sky' \| 'jymaster'` | 是   | -      | 目标音质等级，见下方枚举表                          |

| `level`    | 音质等级   |
| ---------- | ---------- |
| `standard` | 标准       |
| `higher`   | 较高       |
| `exhigh`   | 极高       |
| `lossless` | 无损       |
| `hires`    | Hi-Res     |
| `jyeffect` | 高清环绕声 |
| `sky`      | 沉浸环绕声 |
| `jymaster` | 超清母带   |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SongUrlV1Body`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/song_url_v1`、`hana-music-api/schemas/song_url_v1` 导入运行时校验器）。

```ts
type SongUrlV1Body = {
  code: 200;
  data: Array<SongUrlData>;
};
```

- **公共类型**：[SongUrlData](/api/shared-types#songurldata)

| 字段   | 类型                                                  | 必填 | 说明                         |
| ------ | ----------------------------------------------------- | ---- | ---------------------------- |
| `code` | `200`                                                 | 是   | 业务状态码（`200` 表示成功） |
| `data` | Array\<[SongUrlData](/api/shared-types#songurldata)\> | 是   | 接口返回的数据主体           |

<!-- api-doc:response:end -->

## 注意事项

- **音质与设备**：实际返回的 `data[].level` 可能低于请求等级；获取杜比全景声等高阶音质通常需要账号对应会员权限并在 Cookie 中携带 `os=pc`。
- **链接有效期与试听**：`data[].expi` 为链接有效秒数；仅限试听时 `freeTrialInfo` 标明片段起止秒数，无版权时 `url` 与 `level` 均为 `null`。
