---
title: '排行榜详情'
description: '传入榜单 ID 获取排行榜详情数据（也可使用歌单详情接口 `/playlist/detail`）。'
---

# 排行榜详情

传入榜单 ID 获取排行榜详情数据（也可使用歌单详情接口 `/playlist/detail`）。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                         |
| ---------- | ------------------------------------------ |
| 接口地址   | `/top/list`                                |
| 请求方式   | `GET` / `POST`                             |
| 需要登录   | 否                                         |
| 对应模块   | `top_list`                                 |
| SDK 函数   | `topList`（`hana-music-api/api/top_list`） |
| 返回体类型 | `TopListBody`（已建模返回体）              |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { topList } from 'hana-music-api';

const result = await topList({
  id: '2809577409',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/top/list' \
  --data-urlencode 'id=2809577409'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数  | 类型               | 必填 | 默认值 | 说明                                                         |
| ----- | ------------------ | ---- | ------ | ------------------------------------------------------------ |
| `id`  | `number \| string` | 否   | -      | 排行榜歌单 ID，可通过 `/toplist` 获取                        |
| `idx` | `number`           | 否   | -      | 已废弃的历史参数，传入会在本地直接返回 `code: 500`，请勿使用 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`TopListBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/top_list`、`hana-music-api/schemas/top_list` 导入运行时校验器）。

```ts
type Playlist = Omit<PlaylistSummary, 'trackIds'> & {
  trackIds: Array<{
    id: number;
  }>;
};

type RejectedBody = {
  code: 500;
  msg?: string | null;
};

type TopListBody =
  | {
      code: 200;
      playlist: Playlist;
    }
  | RejectedBody;
```

- **公共类型**：[PlaylistSummary](/api/shared-types#playlistsummary)

| 字段                | 类型            | 必填 | 说明         |
| ------------------- | --------------- | ---- | ------------ |
| `code`              | `200 \| 500`    | 是   | 业务状态码   |
| `playlist`          | `Playlist`      | 否   | 歌单详情     |
| `playlist.trackIds` | `Array<object>` | 否   | 曲目 ID 列表 |
| `msg`               | `string`        | 否   | 提示信息     |

<!-- api-doc:response:end -->

## 注意事项

- **已废弃参数**：`idx` 参数已不再支持，传入会在本地直接返回 `code: 500`；请改用排行榜歌单 `id` 查询，或直接调用 [获取歌单详情](/api/playlist/playlist-detail)。
