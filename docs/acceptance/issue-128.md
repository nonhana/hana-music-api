# #128 SDK 输入：统一全模块业务类型、运行时校验与请求编码

来源：GitHub issue [#128](https://github.com/nonhana/hana-music-api/issues/128)，用户 2026-11-11 明确要求全量收窄、major changeset、不保留旧输入形式。基线：`c9c27fb3c07340476b998bf6c30675c547ccd10a`，352 个模块、284 个声明 `LegacyModuleInput`；实施分支 `refactor/issue-128-input-contracts`，开工时工作区干净。

目标：所有公开业务模块的输入改为模块本地 `ModuleInput` + 严格运行时 decoder；调用者传业务值，SDK 完成上游编码；`LegacyModuleInput` 及其导出彻底删除。非目标：返回体 Schema、成功码、响应外壳、协议/身份/目标/token/缓存/重试政策、分页与业务同步策略。不做真实账号写操作。

## AC 与证据

| AC ID | 来源与内容摘要                                                                              | 入口与预期                                                       | 测试标题或独立证据                                                                                   | 适用性与理由       | 必要条件 | 最终状态 |
| ----- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------ | -------- | -------- |
| AC-01 | 全量清单与当前公开注册表逐项一致，352 个模块全部有结果                                      | 读取 `docs/acceptance/issue-128/inputs/*.json` 与 `src/modules/` | `bun run inputs:check --final` 模块集合比对；清单 Markdown 由脚本生成                                | 代码变更           | 无       | 通过     |
| AC-02 | 全部公开模块有准确业务 `ModuleInput`/decoder，生成类型与运行一致                            | 公共 SDK 入口与 `src/types/generated/`                           | `bun run types:modules:check`、`bun run inputs:check --final`、表驱动 decoder 契约测试               | 代码变更           | 无       | 通过     |
| AC-03 | 需要调用者预编码的集合/对象字段改为业务值入口，SDK 编码                                     | 公开 SDK 入口                                                    | 领域 behavior 测试的真实请求体解码断言；清单“旧编码”列为空                                           | 代码变更           | 无       | 通过     |
| AC-04 | 顺序、重复项、精度、缺省、空集合语义成立；非法输入在 token/匿名/网络前失败                  | `invokeModule`、具名函数、client、HTTP                           | 编号原语单测；领域 behavior 测试的非法输入零请求断言                                                 | 代码变更           | 无       | 通过     |
| AC-05 | 变更编码路径有公开入口与独立解码证据；旧输入/路由/返回 Schema/写入次数/上传阶段无非预期变化 | 公开 SDK 与 HTTP 入口                                            | 领域 behavior/replay 测试；`bun run test`                                                            | 代码变更           | 无       | 通过     |
| AC-06 | 同包 Node/Bun 消费者、全量生成类型、跨领域正负向类型消费者通过                              | `tests/package/`                                                 | `bun run verify:sdk`、`bun run test:sdk-contract`                                                    | 公开表面变更       | 无       | 通过     |
| AC-07 | 检查流程防止新模块重新引入未建模输入；文档与 changeset 同步                                 | 生成器/检查脚本与 docs                                           | `bun run inputs:check --final`、`bun run verify`、docs 审查                                          | 代码变更           | 无       | 通过     |
| AC-08 | 最终候选通过全部门禁并记录指纹                                                              | 仓库命令                                                         | `types:modules:check`、`verify`、`verify:sdk`、`verify:fixtures`、`test:load:smoke`、受影响 mutation | 代码与请求编码变更 | 无       | 通过     |
| AC-09 | 所有领域批次和全量验收完成后才关闭本票                                                      | 交付记录                                                         | `runs/issue-128.md` 与最终审查                                                                       | 交付流程           | 无       | 待发布   |

## 实施约束

- major changeset；不保留旧逗号串、JSON 串、分号串输入，不做 union 兼容或 deprecated 别名。
- 编号集合成员接受正安全整数或纯十进制正数字符串；拒绝分隔符、嵌套、对象、布尔、null、NaN、Infinity、负数、小数和空数组。
- 模块 decoder 统一拒绝未声明字段（`onExcessProperty: 'error'`）。
- 唯一保留的开放字典是 `batch`：键为 `/api/...` 路由，值为普通对象；在清单中单列理由。
- 共享编码 helper 只在至少三个模块复用时提取；其余在模块内就地编码。
- 生成物、共享输入原语、`tests/suites.ts`、文档和 changeset 由主代理统一维护，批次只改自己的模块与领域测试。

当次运行记录：`runs/issue-128.md`。
