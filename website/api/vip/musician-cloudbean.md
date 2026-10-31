---
title: '账号云豆数'
description: '音乐人登录后调用此接口，可获取账号云豆数'
---

# 账号云豆数

> 音乐人登录后调用此接口，可获取账号云豆数

## 接口信息

| 项目     | 值                    |
| -------- | --------------------- |
| 接口地址 | `/musician/cloudbean` |
| 请求方式 | `GET` / `POST`        |
| 需要登录 | 是                    |
| 对应模块 | `musician_cloudbean`  |
| 文档分类 | 会员与云贝            |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /musician/cloudbean
```

## 编程式调用

```ts
import { musicianCloudbean } from 'hana-music-api';

const result = await musicianCloudbean();

console.log(result.body);
```

## 返回内容

`body.code`、云豆对象 `body.data`、音乐人编号 `body.data.artistId` 和云豆数 `body.data.cloudBean` 收紧；`maxCloudBean`、`needPop`、`signed` 宽松，`musicianLevel`、`flowStage`、`dynamicNews` 只见过 `null`，没有声明。录制来自音乐人账号（`context.viewer` 是 `authenticated`，录制前经 `login_status` 确认 `anonimousUser: false`（未落盘））；未登录（匿名）返回 `code: 600`（`musician_cloudbean.anonymous.json`），SDK 以 `status: 400` 转交原文；登录的非音乐人账号未录到，返回码与成功正文未验证。结构定义和类型是 `MusicianCloudbeanBody`，见[返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 音乐人登录后调用此接口，可获取账号云豆数

**接口地址 :** `/musician/cloudbean`

**调用例子 :** `/musician/cloudbean`
