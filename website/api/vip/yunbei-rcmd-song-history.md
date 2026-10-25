---
title: '云贝推歌历史记录'
description: '无需登录即可调用；登录后返回当前账号的云贝推歌历史记录'
---

# 云贝推歌历史记录

> 无需登录即可调用；登录后返回当前账号的云贝推歌历史记录

## 接口信息

| 项目     | 值                          |
| -------- | --------------------------- |
| 接口地址 | `/yunbei/rcmd/song/history` |
| 请求方式 | `GET` / `POST`              |
| 需要登录 | 否                          |
| 对应模块 | `yunbei_rcmd_song_history`  |
| 文档分类 | 会员与云贝                  |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                           |
| -------- | ---------------- | :--: | ------ | ------------------------------------------------------------------------------ |
| `size`   | number \| string |  —   | 20     | 返回数量，默认为 20                                                            |
| `cursor` | number \| string |  —   | ''     | 返回数据的 cursor, 默认为 ''，传入上一次返回结果的 cursor,将会返回下一页的数据 |

## HTTP 示例

```bash
GET /yunbei/rcmd/song/history?size=10
```

## 编程式调用

```ts
import { yunbeiRcmdSongHistory } from 'hana-music-api';

const result = await yunbeiRcmdSongHistory({
  size: '10',
});

console.log(result.body);
```

## 返回内容

`body.code` 和推歌历史路径 `body.data` 收紧；`data.records` 只录到空数组，元素类型未知，没有声明并原样保留；分页对象 `data.page` 宽松。负 `size` 返回 `body.code: 400`，SDK 按业务失败转交为 HTTP 400。匿名调用返回 `body.code: 200`，正文同样通过结构校验；匿名对照录制是 `vip/yunbei_rcmd_song_history.anonymous.json`。结构定义和类型是 `YunbeiRcmdSongHistoryBody`，见[返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 无需登录即可调用；登录后返回当前账号的云贝推歌历史记录

**可选参数 :** `size` : 返回数量，默认为 20

`cursor` : 返回数据的 cursor, 默认为 ''，传入上一次返回结果的 cursor,将会返回下一页的数据

**接口地址 :** `/yunbei/rcmd/song/history`

**调用例子 :** `/yunbei/rcmd/song/history?size=10`
