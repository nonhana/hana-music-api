---
title: '首页-发现-圆形图标入口列表'
description: '调用此接口，可获取 APP 首页圆形图标入口列表'
---

# 首页-发现-圆形图标入口列表

调用此接口，可获取 APP 首页圆形图标入口列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                |
| ---------- | ----------------------------------------------------------------- |
| 接口地址   | `/homepage/dragon/ball`                                           |
| 请求方式   | `GET` / `POST`                                                    |
| 需要登录   | 否                                                                |
| 对应模块   | `homepage_dragon_ball`                                            |
| SDK 函数   | `homepageDragonBall`（`hana-music-api/api/homepage_dragon_ball`） |
| 返回体类型 | `HomepageDragonBallBody`（已建模返回体）                          |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { homepageDragonBall } from 'hana-music-api';

const result = await homepageDragonBall();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/homepage/dragon/ball'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`HomepageDragonBallBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/homepage_dragon_ball`、`hana-music-api/schemas/homepage_dragon_ball` 导入运行时校验器）。

```ts
type HomepageDragonBallBody = {
  code: 200;
  message?: string | null;
};
```

| 字段      | 类型     | 必填 | 说明                         |
| --------- | -------- | ---- | ---------------------------- |
| `code`    | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `message` | `string` | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
