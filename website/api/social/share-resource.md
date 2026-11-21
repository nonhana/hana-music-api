---
title: '分享文本、歌曲、歌单、mv、电台、电台节目到动态'
description: '登录后调用此接口 ，可以分享文本、歌曲、歌单、mv、电台、电台节目，专辑到动态'
---

# 分享文本、歌曲、歌单、mv、电台、电台节目到动态

登录后调用此接口 ，可以分享文本、歌曲、歌单、mv、电台、电台节目，专辑到动态

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                     |
| ---------- | ------------------------------------------------------ |
| 接口地址   | `/share/resource`                                      |
| 请求方式   | `GET` / `POST`                                         |
| 需要登录   | 是                                                     |
| 对应模块   | `share_resource`                                       |
| SDK 函数   | `shareResource`（`hana-music-api/api/share_resource`） |
| 返回体类型 | `UnknownJson`（未建模接口）                            |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { shareResource } from 'hana-music-api';

const result = await shareResource(
  {
    id: '1297494209',
    msg: '测试',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/share/resource' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=1297494209' \
  --data-urlencode 'msg=测试'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数   | 类型                                                                                        | 必填 | 默认值 | 说明                                                                                                             |
| ------ | ------------------------------------------------------------------------------------------- | ---- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| `id`   | `number \| string`                                                                          | 否   | ``     | 资源 id （歌曲，歌单，mv，电台，电台节目对应 id）                                                                |
| `type` | `'song' \| 'playlist' \| 'mv' \| 'djradio' \| 'djprogram' \| 'album' \| 'noresource' \| ''` | 否   | `song` | 资源类型，默认歌曲 song，可传 `song`，`playlist`，`mv`，`djradio`，`djprogram`，`album`                          |
| `msg`  | `string`                                                                                    | 否   | ``     | 内容，140 字限制，支持 emoji，@用户名（`/user/follows`接口获取的用户名，用户名后和内容应该有空格），图片暂不支持 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->

## 注意事项

- **内容限制**：分享文案 `msg` 限制 140 字以内，支持 emoji；`@用户名` 后需保留空格，暂不支持附带图片。
