---
title: '获取歌曲详情'
description: '传入歌曲 ID 数组，获取歌曲基础信息、歌手、专辑、音质及播放权限详情。'
---

# 获取歌曲详情

传入歌曲 ID 数组，获取歌曲基础信息、歌手、专辑、音质及播放权限详情。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                                |
| ---------- | --------------------------------------------------------------------------------- |
| 接口地址   | `/song/detail`                                                                    |
| 请求方式   | `GET` / `POST`                                                                    |
| 需要登录   | 否                                                                                |
| 对应模块   | `song_detail`                                                                     |
| SDK 函数   | `songDetail`（`hana-music-api/api/song_detail`）                                  |
| 返回体类型 | `SongDetailBody`（已建模返回体）                                                  |
| 读缓存     | 支持共享读缓存与并发请求去重，详见 [缓存与身份池](/guide/cache-and-identity-pool) |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { songDetail } from 'hana-music-api';

const result = await songDetail({
  ids: [347230],
});
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/song/detail' \
  -H 'Content-Type: application/json' \
  --data '{"ids":[347230]}'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数  | 类型                      | 必填 | 默认值 | 说明                                     |
| ----- | ------------------------- | ---- | ------ | ---------------------------------------- |
| `ids` | `Array<number \| string>` | 是   | -      | 音乐 id 数组，成员是正整数或纯数字字符串 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SongDetailBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/song_detail`、`hana-music-api/schemas/song_detail` 导入运行时校验器）。

```ts
type SongDetailBody = {
  code: 200;
  songs: Array<Song>;
  privileges: Array<SongPrivilege>;
};
```

- **公共类型**：[Song](/api/shared-types#song)、[SongPrivilege](/api/shared-types#songprivilege)

| 字段         | 类型                                                      | 必填 | 说明                         |
| ------------ | --------------------------------------------------------- | ---- | ---------------------------- |
| `code`       | `200`                                                     | 是   | 业务状态码（`200` 表示成功） |
| `songs`      | Array\<[Song](/api/shared-types#song)\>                   | 是   | 歌曲列表                     |
| `privileges` | Array\<[SongPrivilege](/api/shared-types#songprivilege)\> | 是   | 歌曲播放与下载权限列表       |

<!-- api-doc:response:end -->

## 注意事项

- **读缓存与并发请求去重**：本接口支持共享读缓存与并发请求去重，未声明的请求字段会在输入校验时被拒绝，详见 [缓存与身份池](/guide/cache-and-identity-pool)。
- **扩展字段说明**：`songs[].fee`、`songs[].mark`、`songs[].t` 及 `privileges[].st` 等枚举与位掩码含义见 [Song](/api/shared-types#song) 与 [SongPrivilege](/api/shared-types#songprivilege)。
