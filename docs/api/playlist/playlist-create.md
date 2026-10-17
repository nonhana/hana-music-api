---
title: '新建歌单'
description: '调用此接口，传入歌单名字可新建歌单'
---

# 新建歌单

> 调用此接口，传入歌单名字可新建歌单

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/playlist/create` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 否                 |
| 对应模块 | `playlist_create`  |
| 文档分类 | 歌单               |

## 请求参数

| 参数      | 类型   | 必填 | 默认值      | 说明                                                                 |
| --------- | ------ | :--: | ----------- | -------------------------------------------------------------------- |
| `name`    | string |  ✅  | -           | 歌单名                                                               |
| `privacy` | string |  —   | 否          | 是否设置为隐私歌单，默认否，传'10'则设置成隐私歌单                   |
| `type`    | string |  —   | 'NORMAL',传 | 歌单类型,默认'NORMAL',传 'VIDEO'则为视频歌单,传 'SHARED'则为共享歌单 |

## HTTP 示例

```bash
GET /playlist/create?name=测试歌单
GET /playlist/create?name=test&type=VIDEO
```

## 编程式调用

```ts
import { playlistCreate } from 'hana-music-api';

const result = await playlistCreate({
  name: '测试歌单',
});

console.log(result.body);
```

## 补充说明

说明 : 调用此接口，传入歌单名字可新建歌单

### 请求模式

| 请求              | 实际请求                                                                         | 适用场景                                         |
| ----------------- | -------------------------------------------------------------------------------- | ------------------------------------------------ |
| 未传 `checkToken` | weapi，`https://music.163.com/weapi/playlist/create`，Cookie `os=web`，浏览器 UA | 低频调用；连续操作仍可能被上游限频               |
| 传入 `checkToken` | weapi，同一地址，正文 `checkToken`，HTTP 头 `X-antiCheatToken`                   | 需要稳定高频创建；令牌必须由调用方从稳定设备现取 |

```ts
import { createWatchman } from 'hana-music-api/watchman';

const watchman = await createWatchman();
await playlistCreate(
  { name: '测试歌单' },
  { checkToken: () => watchman.getToken() },
);
```

官方 web 新建歌单时会携带 `checkToken`。模块声明 `profile: 'web'`、`checkToken: 'optional'`，调用方传入的 `crypto`、`os`、`ua` 会被 profile 替换；没有 provider 时按网页回退路径发送。令牌的获取与设备稳定性见[浏览器 Watchman](../../guide/watchman.md)。

**必选参数 :** `name` : 歌单名

**可选参数 :**

`privacy` : 是否设置为隐私歌单，默认否，传'10'则设置成隐私歌单

`type` : 歌单类型,默认'NORMAL',传 'VIDEO'则为视频歌单,传 'SHARED'则为共享歌单

**接口地址 :** `/playlist/create`

**调用例子 :** `/playlist/create?name=测试歌单`,`/playlist/create?name=test&type=VIDEO`
