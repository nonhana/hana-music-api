---
title: '获取历史日推详情数据'
description: '调用此接口 ，传入当日日期，可获得当日历史日推数据'
---

# 获取历史日推详情数据

调用此接口 ，传入当日日期，可获得当日历史日推数据

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                                   |
| ---------- | ------------------------------------------------------------------------------------ |
| 接口地址   | `/history/recommend/songs/detail`                                                    |
| 请求方式   | `GET` / `POST`                                                                       |
| 需要登录   | 否                                                                                   |
| 对应模块   | `history_recommend_songs_detail`                                                     |
| SDK 函数   | `historyRecommendSongsDetail`（`hana-music-api/api/history_recommend_songs_detail`） |
| 返回体类型 | `HistoryRecommendSongsDetailBody`（已建模返回体）                                    |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { historyRecommendSongsDetail } from 'hana-music-api';

const result = await historyRecommendSongsDetail({
  date: '2020-06-21',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/history/recommend/songs/detail' \
  --data-urlencode 'date=2020-06-21'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数   | 类型     | 必填 | 默认值 | 说明                                                 |
| ------ | -------- | ---- | ------ | ---------------------------------------------------- |
| `date` | `string` | 否   | ``     | 日期，通过历史日推可用日期列表接口获取，不能任意日期 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`HistoryRecommendSongsDetailBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/history_recommend_songs_detail`、`hana-music-api/schemas/history_recommend_songs_detail` 导入运行时校验器）。

```ts
type HistoryRecommendSongsDetailBody = {
  code: 200;
  data: {
    songs: Array<Song>;
    purchaseUrl?: string | null;
    noHistoryMessage?: string | null;
  };
};
```

- **公共类型**：[Song](/api/shared-types#song)

| 字段                    | 类型                                    | 必填 | 说明                         |
| ----------------------- | --------------------------------------- | ---- | ---------------------------- |
| `code`                  | `200`                                   | 是   | 业务状态码（`200` 表示成功） |
| `data`                  | `object`                                | 是   | 接口返回的数据主体           |
| `data.songs`            | Array\<[Song](/api/shared-types#song)\> | 是   | 歌曲列表                     |
| `data.purchaseUrl`      | `string`                                | 否   | 资源访问链接                 |
| `data.noHistoryMessage` | `string`                                | 否   | -                            |

<!-- api-doc:response:end -->
