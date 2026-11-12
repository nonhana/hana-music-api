# #128 双轴审查约定

审查对象是当前工作区相对基线 `c9c27fb` 的完整改动；已提交和未提交都算。审查者只读，不改代码。每个批次由两个独立审查者分别执行规范轴和需求轴。

## 规范轴

- 模块本地声明并导出 `ModuleInput`、`decodeModuleInput`、`moduleActions`；默认导出仍绑定 `ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions>`。
- 分配模块不再出现 `LegacyModuleInput`、`decodeLegacyModuleInput`、`QueryNumberLike`、`QueryIdentifier`、`QueryBooleanLike`、手写 `typeof query.x` 或重复的 `decodeModuleInput` 导出。
- 输入字段使用 `NumberId`、`NumberIdList`、`NumberValue`/`IntegerValue`/`NaturalValue`、`BooleanValue`、`NumberLiterals`、`Schema.Literals`、`Schema.String`、`Schema.Struct`、`Schema.Array`、`UploadedFile`、`EmptyInput`/`NoInput` 的约定；动作字段（`t`/`op`/`type` 等）没有被 `NumberValue` 放宽。
- 编码在模块内完成，使用 `String(id)` 保留十进制文本；不修改调用者数组/对象；请求 `data` 键名、默认值、固定字段、动作、请求次数和返回体 Schema 未变。
- 未声明共享文件（`src/core/`、`src/types/`、`scripts/`、`tests/suites.ts`、生成物、其他人领域文件）没有被本批次修改。
- 新增测试不是同义反复：contract 有正反用例，编码用例解码实际请求体，非法输入断言零网络副作用。
- `bun test` 窄测试实际运行通过；报告中的命令和结果可复现。

## 需求轴

- 分配模块逐个有结果：`migrated` 或 `already-compliant`；没有 pending、遗漏或“无需修改”但无依据的条目。
- 必填/可选/默认值来自现有代码、文档或 fixtures；有意收紧在清单 `notes` 说明。
- 集合、对象、布尔、标签、JSON 载荷由调用者传业务值，SDK 编码；旧逗号串/JSON 串/分号串/数字或布尔强转在解码阶段被拒绝。
- `docs/acceptance/issue-128/inputs/<domain>.json` 每个模块的 `current`、`businessInput`、`upstreamEncoding`、`legacyEncoding: []`、`evidence`、`status` 完整，evidence 文件存在。
- `tests/behavior/modules/input-contracts/<domain>.ts` 覆盖每个模块；`tests/behavior/modules/input-encoding/<domain>.ts` 覆盖所有发生转换的模块。
- 受影响的既有测试已更新，原有有效断言没有被删除或弱化；共享测试的改动留给主代理并在报告中列明。

## 输出

逐条给出：

- `severity`: blocking / non-blocking；
- `file`: 文件与行号；
- `issue`: 事实和为什么违反约定或 AC；
- `fix`: 具体修改建议；
- `verdict`: pass / fail（有 blocking 即 fail）。

同时列出审查者实际运行的命令和结果。不要用“未发现问题”代替逐项核对。

## 主代理最终审查

审查对象为当前工作区全部未提交改动。已逐项复核 AC-01 至 AC-09 的可执行部分，结论为通过；发布与合并仍未授权。

- 阻断项：无。
- 已修复的非阻断问题：`top_list` 的 `idx` 判定改回 `!== undefined` 并删除不再合法的 fixture 条目；`artist_list.initial` 恢复 `-1` 哨兵；`voicelist_trans.position` 拒绝 0；`batch` 保留历史非 `/api/` 键过滤并对 `/api/` 值校验；`voice_upload` 编码补充固定字段断言；样式列表 fixture 恢复固定 `sort: 0`。
- Fixture 边界：共享 request fixture 只保留新契约合法输入；旧协议输入的拒绝证据由 input-contracts 与 replay 的 `invalidInputPaths` 覆盖，package consumer 不再把预期 400 当 403。
- Mutation registry：同步更新因输入重构而失效的定位串，移除已被编号类型 decode 提前拦截、无法再从输入构造路径逃逸的 album 边界 mutation。
- 残余风险：`AC-09` 的发布证明未执行；仓库未配置远端真实运行证据时，CI 结果仍需独立确认。
