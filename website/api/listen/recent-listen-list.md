---
title: '最近听歌列表'
description: '调用后可获取最近听歌列表'
---

# 最近听歌列表

调用后可获取最近听歌列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                            |
| ---------- | ------------------------------------------------------------- |
| 接口地址   | `/recent/listen/list`                                         |
| 请求方式   | `GET` / `POST`                                                |
| 需要登录   | 否                                                            |
| 对应模块   | `recent_listen_list`                                          |
| SDK 函数   | `recentListenList`（`hana-music-api/api/recent_listen_list`） |
| 返回体类型 | `RecentListenListBody`（已建模返回体）                        |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { recentListenList } from 'hana-music-api';

const result = await recentListenList();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/recent/listen/list'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`RecentListenListBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/recent_listen_list`、`hana-music-api/schemas/recent_listen_list` 导入运行时校验器）。

```ts
type RecentResource = {
  resourceId: number;
  resourceType?: string | null;
  subResourceId?: string | null;
  title?: string | null;
  tag?: string | null;
  coverUrlList?: Array<string> | null;
  landingUrl?: string | null;
  update?: boolean | null;
  playOrUpdateTime?: number | null;
  star?: boolean | null;
  coverCenter?: boolean | null;
};

type RecentListenListBody = {
  code: 200;
  data: {
    title?: string | null;
    resources?: Array<RecentResource> | null;
  };
  message?: string | null;
};
```

> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。

| 字段                                | 类型                    | 必填 | 说明                         |
| ----------------------------------- | ----------------------- | ---- | ---------------------------- |
| `code`                              | `200`                   | 是   | 业务状态码（`200` 表示成功） |
| `data`                              | `object`                | 是   | 接口返回的数据主体           |
| `data.title`                        | `string`                | 否   | 标题                         |
| `data.resources`                    | `Array<RecentResource>` | 可空 | -                            |
| `data.resources[].resourceId`       | `number`                | 是   | 资源 ID                      |
| `data.resources[].resourceType`     | `string`                | 否   | -                            |
| `data.resources[].subResourceId`    | `string`                | 否   | subResource ID               |
| `data.resources[].title`            | `string`                | 否   | 标题                         |
| `data.resources[].tag`              | `string`                | 否   | -                            |
| `data.resources[].coverUrlList`     | `Array<string>`         | 否   | -                            |
| `data.resources[].landingUrl`       | `string`                | 否   | 资源访问链接                 |
| `data.resources[].update`           | `boolean`               | 否   | -                            |
| `data.resources[].playOrUpdateTime` | `number`                | 否   | 时间戳                       |
| `data.resources[].star`             | `boolean`               | 否   | -                            |
| `data.resources[].coverCenter`      | `boolean`               | 否   | -                            |
| `message`                           | `string`                | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
