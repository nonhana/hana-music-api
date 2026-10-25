---
title: '歌单导入 - 元数据/文字/链接导入'
description: '登录后调用此接口, 支持通过元数据/文字/链接三种方式生成歌单; 三种方式不可同时调用'
---

<!-- cSpell:ignore ZLMS -->

# 歌单导入 - 元数据/文字/链接导入

> 登录后调用此接口, 支持通过元数据/文字/链接三种方式生成歌单; 三种方式不可同时调用

## 接口信息

| 项目     | 值                                  |
| -------- | ----------------------------------- |
| 接口地址 | `/playlist/import/name/task/create` |
| 请求方式 | `GET` / `POST`                      |
| 需要登录 | 是                                  |
| 对应模块 | `playlist_import_name_task_create`  |
| 文档分类 | 歌单                                |

## 请求参数

| 参数                 | 类型    | 必填 | 默认值 | 说明                                                                                            |
| -------------------- | ------- | :--: | ------ | ----------------------------------------------------------------------------------------------- |
| `importStarPlaylist` | boolean |  —   | -      | 是否导入`我喜欢的音乐`, 此项为true则不生成新的歌单                                              |
| `playlistName`       | string  |  —   | 为     | 生成的歌单名, 仅文字导入和链接导入支持, 默认为`'导入音乐 '.concat(new Date().toLocaleString())` |

## HTTP 示例

```bash
GET /playlist/import/name/task/create?local=${local}
```

## 编程式调用

```ts
import { playlistImportNameTaskCreate } from 'hana-music-api';

const result = await playlistImportNameTaskCreate({
  local: '${local}',
});

console.log(result.body);
```

## 返回内容

写操作：创建一个导入任务，文字导入和链接导入成功后网易云会按任务结果新建歌单。正文的 `code` 收紧；`data`、`data.taskId`、`msg`、`message` 宽松（`local`/`link` 分支没有录制，不收紧 `data.taskId`），拿到任务编号后用 [歌单导入任务状态](/api/playlist/playlist-import-task-status) 轮询。缺少 `text` 时上游回 `code: 400`（格式错误或暂不支持该类型音乐导入）；这个 400 以前归一成 `status: 200` 放行，现在按业务拒绝转交 `status: 400`。即使没有匹配到歌曲也会建任务并回 `code: 200`，任务失败信息在状态接口里。结构定义和类型是 `PlaylistImportNameTaskCreateBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口, 支持通过元数据/文字/链接三种方式生成歌单; 三种方式不可同时调用

**接口地址 :** `/playlist/import/name/task/create`

**可选参数 :**

`importStarPlaylist` : 是否导入`我喜欢的音乐`, 此项为true则不生成新的歌单
`playlistName` : 生成的歌单名, 仅文字导入和链接导入支持, 默认为`'导入音乐 '.concat(new Date().toLocaleString())`

**元数据导入 :**

`local`: json类型的字符串, 如：

```javascript
let local = encodeURIComponent(
  JSON.stringify([
    {
      name: 'アイニーブルー', // 歌曲名称
      artist: 'ZLMS', // 艺术家名称
      album: 'アイニーブルー', // 专辑名称
    },
    {
      name: 'ファンタズマ',
      artist: 'sasakure.UK',
      album: '未来イヴ',
    },
  ]),
);
```

**调用例子 :** `/playlist/import/name/task/create?local=${local}`

**文字导入 :**

`text`: 导入的文字, 如：

```javascript
let text = encodeURIComponent(`アイニーブルー ZLMS
ファンタズマ sasakure.UK`);
```

**调用例子 :** `/playlist/import/name/task/create?text=${text}`

**链接导入 :**

`link`: 存有歌单链接的数组类型的字符串, 如：

```javascript
let link = encodeURIComponent(
  JSON.stringify([
    'https://i.y.qq.com/n2/m/share/details/taoge.html?id=7716341988&hosteuin=',
    'https://i.y.qq.com/n2/m/share/details/taoge.html?id=8010042041&hosteuin=',
  ]),
);
```

歌单链接来源:

1. 将歌单分享到微信/微博/QQ后复制链接
2. 直接复制歌单/个人主页链接
3. 直接复制文章链接

**调用例子 :** `/playlist/import/name/task/create?link=${link}`
