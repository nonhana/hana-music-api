---
title: '相关歌单推荐'
description: '调用此接口，传入歌单id，获取相关歌单推荐'
---

# 相关歌单推荐

调用此接口，传入歌单id，获取相关歌单推荐

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                       |
| ---------- | ------------------------------------------------------------------------ |
| 接口地址   | `/playlist/detail/rcmd/get`                                              |
| 请求方式   | `GET` / `POST`                                                           |
| 需要登录   | 否                                                                       |
| 对应模块   | `playlist_detail_rcmd_get`                                               |
| SDK 函数   | `playlistDetailRcmdGet`（`hana-music-api/api/playlist_detail_rcmd_get`） |
| 返回体类型 | `PlaylistDetailRcmdGetBody`（已建模返回体）                              |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { playlistDetailRcmdGet } from 'hana-music-api';

const result = await playlistDetailRcmdGet({
  id: '8039587836',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/playlist/detail/rcmd/get' \
  --data-urlencode 'id=8039587836'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明   |
| ---- | ------------------ | ---- | ------ | ------ |
| `id` | `number \| string` | 是   | -      | 歌单id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlaylistDetailRcmdGetBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/playlist_detail_rcmd_get`、`hana-music-api/schemas/playlist_detail_rcmd_get` 导入运行时校验器）。

```ts
type RecommendedPlaylist = {
  id: number;
  name?: string | null;
  coverImgId?: number | null;
  coverImgUrl?: string | null;
  playCount?: number | null;
  specialType?: number | null;
  action?: string | null;
};

type RecPlaylist = {
  playlist: RecommendedPlaylist;
  alg?: string | null;
};

type RcmdData = {
  rcmdTitle?: string | null;
  jumpUrl?: string | null;
  recPlaylist: Array<RecPlaylist>;
};

type PlaylistDetailRcmdGetBody = {
  code: 200;
  message?: string | null;
  doesNotCache?: boolean | null;
  data?: RcmdData | null;
};
```

> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。

| 字段                          | 类型                  | 必填 | 说明                         |
| ----------------------------- | --------------------- | ---- | ---------------------------- |
| `code`                        | `200`                 | 是   | 业务状态码（`200` 表示成功） |
| `message`                     | `string`              | 否   | 返回说明信息                 |
| `doesNotCache`                | `boolean`             | 否   | -                            |
| `data`                        | `RcmdData`            | 可空 | 接口返回的数据主体           |
| `data.rcmdTitle`              | `string`              | 否   | -                            |
| `data.jumpUrl`                | `string`              | 否   | 资源访问链接                 |
| `data.recPlaylist`            | `Array<RecPlaylist>`  | 是   | -                            |
| `data.recPlaylist[].playlist` | `RecommendedPlaylist` | 是   | 歌单详情                     |
| `data.recPlaylist[].alg`      | `string`              | 否   | 推荐算法标识                 |

<!-- api-doc:response:end -->
