# 合成数据与证据边界

人工构造的边界数据放这里，文件说明构造目的，不伪造上游来源。当前旧上传工具中的静态合成值会在工具迁移切片归入本目录；不用空数据文件预占结构。真实响应继续保留在 `../netease/`，回放测试位于 `tests/replay/`。

新增请求证据可在录制旁保存 `<name>.request-evidence.md`，按下表登记。缺少完整请求的旧录制保持 unknown，不因目录迁移改写 profile。响应录制只证明它实际保存的字段。

| 字段               | 内容                                                      |
| ------------------ | --------------------------------------------------------- |
| source             | 原始链接，或原始工件路径与内容 hash；无法追溯时写 unknown |
| observedAt         | 实际观察时间与时区；历史时间未知时写 unknown              |
| protocol / profile | 观察到的协议与身份配置；未知时分别写 unknown              |
| identityClass      | anonymous / authenticated，不能写入凭据                   |
| redaction          | 删除或替换了哪些敏感字段、对证据的影响                    |
| verifiedFields     | 实际核对的 URL、method、头、正文等字段及核对方法          |
| limitations        | 响应回放、合成、截断或缺请求证据带来的限制                |

这些 Markdown 不参与 JSON/gzip 响应审计。请求期望以独立证据为依据，严格假上游检查受控请求，真实 socket 检查本地传输；它们都不能替代当次真实上游结果。
