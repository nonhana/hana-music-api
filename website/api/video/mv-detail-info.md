---
title: '获取 mv 点赞转发评论数数据'
description: '传入 MV ID，获取对应 MV 的点赞、转发与评论统计数据。'
---

# 获取 mv 点赞转发评论数数据

传入 MV ID，获取对应 MV 的点赞、转发与评论统计数据。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                    |
| ---------- | ----------------------------------------------------- |
| 接口地址   | `/mv/detail/info`                                     |
| 请求方式   | `GET` / `POST`                                        |
| 需要登录   | 否                                                    |
| 对应模块   | `mv_detail_info`                                      |
| SDK 函数   | `mvDetailInfo`（`hana-music-api/api/mv_detail_info`） |
| 返回体类型 | `MvDetailInfoBody`（已建模返回体）                    |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { mvDetailInfo } from 'hana-music-api';

const result = await mvDetailInfo({
  mvid: '5436712',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/mv/detail/info' \
  --data-urlencode 'mvid=5436712'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数   | 类型               | 必填 | 默认值 | 说明     |
| ------ | ------------------ | ---- | ------ | -------- |
| `mvid` | `number \| string` | 是   | -      | mv 的 id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`MvDetailInfoBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/mv_detail_info`、`hana-music-api/schemas/mv_detail_info` 导入运行时校验器）。

```ts
type MvDetailInfoBody = {
  code: 200;
  commentCount: number;
  liked?: boolean | null;
  likedCount: number;
  shareCount: number;
};
```

| 字段           | 类型      | 必填 | 说明                         |
| -------------- | --------- | ---- | ---------------------------- |
| `code`         | `200`     | 是   | 业务状态码（`200` 表示成功） |
| `commentCount` | `number`  | 是   | 评论数                       |
| `liked`        | `boolean` | 否   | 是否已点赞                   |
| `likedCount`   | `number`  | 是   | 点赞数                       |
| `shareCount`   | `number`  | 是   | 分享数                       |

<!-- api-doc:response:end -->
