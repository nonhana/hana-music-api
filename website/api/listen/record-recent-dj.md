---
title: '最近播放-播客'
description: '调用此接口，可获得最近播放-播客'
---

# 最近播放-播客

调用此接口，可获得最近播放-播客

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                        |
| ---------- | --------------------------------------------------------- |
| 接口地址   | `/record/recent/dj`                                       |
| 请求方式   | `GET` / `POST`                                            |
| 需要登录   | 否                                                        |
| 对应模块   | `record_recent_dj`                                        |
| SDK 函数   | `recordRecentDj`（`hana-music-api/api/record_recent_dj`） |
| 返回体类型 | `RecordRecentDjBody`（已建模返回体）                      |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { recordRecentDj } from 'hana-music-api';

const result = await recordRecentDj({
  limit: 1,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/record/recent/dj' \
  --data-urlencode 'limit=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数    | 类型     | 必填 | 默认值 | 说明                 |
| ------- | -------- | ---- | ------ | -------------------- |
| `limit` | `number` | 否   | `100`  | 返回数量，默认为 100 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`RecordRecentDjBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/record_recent_dj`、`hana-music-api/schemas/record_recent_dj` 导入运行时校验器）。

```ts
type RecentRadio = {
  id: number;
  name?: string | null;
  picUrl?: string | null;
  dj?: PlaylistUser | null;
  lastProgramId?: number | null;
  programCount?: number | null;
  playCount?: number | null;
  categoryId?: number | null;
};

type RecentDjRecord = {
  resourceId: string;
  playTime?: number | null;
  resourceType?: string | null;
  data: RecentRadio;
  os?: string | null;
  multiTerminalInfo?: MultiTerminalInfo | null;
};

type RecordRecentDjBody =
  | {
      code: 200;
      data: {
        list: Array<RecentDjRecord>;
        total?: number | null;
      };
      message?: string | null;
    }
  | '';
```

- **公共类型**：[MultiTerminalInfo](/api/shared-types#multiterminalinfo)、[PlaylistUser](/api/shared-types#playlistuser)

| 字段                            | 类型                                                     | 必填 | 说明                         |
| ------------------------------- | -------------------------------------------------------- | ---- | ---------------------------- |
| `code`                          | `200`                                                    | 是   | 业务状态码（`200` 表示成功） |
| `data`                          | `object`                                                 | 是   | 接口返回的数据主体           |
| `data.list`                     | `Array<RecentDjRecord>`                                  | 是   | 结果条目列表                 |
| `data.list[].resourceId`        | `string`                                                 | 是   | 资源 ID                      |
| `data.list[].playTime`          | `number`                                                 | 否   | 时间戳                       |
| `data.list[].resourceType`      | `string`                                                 | 否   | -                            |
| `data.list[].data`              | `RecentRadio`                                            | 是   | 接口返回的数据主体           |
| `data.list[].os`                | `string`                                                 | 否   | -                            |
| `data.list[].multiTerminalInfo` | [MultiTerminalInfo](/api/shared-types#multiterminalinfo) | 否   | MultiTerminalInfo 实体       |
| `data.total`                    | `number`                                                 | 否   | 总条目数                     |
| `message`                       | `string`                                                 | 否   | 返回说明信息                 |

> 当参数格式异常时，上游可能返回空响应，此时返回体为 `""`。

<!-- api-doc:response:end -->
