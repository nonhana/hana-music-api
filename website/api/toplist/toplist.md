---
title: '所有榜单'
description: '调用此接口，可获取所有榜单'
---

# 所有榜单

调用此接口，可获取所有榜单

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                        |
| ---------- | ----------------------------------------- |
| 接口地址   | `/toplist`                                |
| 请求方式   | `GET` / `POST`                            |
| 需要登录   | 否                                        |
| 对应模块   | `toplist`                                 |
| SDK 函数   | `toplist`（`hana-music-api/api/toplist`） |
| 返回体类型 | `ToplistBody`（已建模返回体）             |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { toplist } from 'hana-music-api';

const result = await toplist();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/toplist'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ToplistBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/toplist`、`hana-music-api/schemas/toplist` 导入运行时校验器）。

```ts
type ToplistSummary = Omit<
  PlaylistSummary,
  'tsSongCount' | 'originalCoverId'
> & {
  tsSongCount?: number | null;
  originalCoverId?: number | null;
};

type ArtistToplist = {
  coverUrl?: string | null;
  name?: string | null;
  position?: number | null;
  upateFrequency?: string | null;
  updateFrequency?: string | null;
};

type ToplistBody = {
  code: 200;
  list: Array<ToplistSummary>;
  artistToplist?: ArtistToplist | null;
};
```

- **公共类型**：[PlaylistSummary](/api/shared-types#playlistsummary)

| 字段                            | 类型                    | 必填 | 说明                         |
| ------------------------------- | ----------------------- | ---- | ---------------------------- |
| `code`                          | `200`                   | 是   | 业务状态码（`200` 表示成功） |
| `list`                          | `Array<ToplistSummary>` | 是   | 结果条目列表                 |
| `list[].tsSongCount`            | `number`                | 否   | -                            |
| `list[].originalCoverId`        | `number`                | 否   | originalCover ID             |
| `artistToplist`                 | `ArtistToplist`         | 否   | -                            |
| `artistToplist.coverUrl`        | `string`                | 否   | 资源访问链接                 |
| `artistToplist.name`            | `string`                | 否   | 名称                         |
| `artistToplist.position`        | `number`                | 否   | -                            |
| `artistToplist.upateFrequency`  | `string`                | 否   | -                            |
| `artistToplist.updateFrequency` | `string`                | 否   | -                            |

<!-- api-doc:response:end -->
