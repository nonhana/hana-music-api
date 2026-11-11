---
'hana-music-api': major
---

模块输入统一为具体业务结构：编号集合、JSON 对象、标签和布尔参数改由 SDK 编码，旧的逗号串、JSON 串、分号串和宽泛 `Record<string, unknown>` 输入不再接受。`LegacyModuleInput` 与根导出的 `LegacyModule*` 类型删除，未声明字段在发送前以 400 拒绝。
