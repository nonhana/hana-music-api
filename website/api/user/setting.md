---
title: '设置'
description: '登录后调用此接口 ,可获取用户设置'
---

# 设置

> 登录后调用此接口 ,可获取用户设置

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/setting`     |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `setting`      |
| 文档分类 | 用户与登录     |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /setting
```

## 编程式调用

```ts
import { setting } from 'hana-music-api';

const result = await setting();

console.log(result.body);
```

## 返回内容

`body` 是网易云原文；`code`、设置路径 `setting` 和 `setting.userId` 收紧。`setting.userId` 是这份设置所属账号的编号，其余设置项（通知开关、隐私、播放记录、广告推荐等）全部宽松；缺失、`null` 或类型不对都只丢这一项。

`setting` 匿名也可调用，这时返回匿名账号的设置，`userId` 是匿名账号编号；登录和匿名的字段集合相同。只见过 `null` 的 `newSongDiskSetting` 没有声明，原样保留。结构定义和类型是 `SettingBody`，见 [返回体结构](/guide/response-bodies#用户资料)。

## 补充说明

说明 : 登录后调用此接口 ,可获取用户设置

**接口地址 :** `/setting`

**调用例子 :** `/setting`
