# hana-music-api 发布日志

## 1.1.0

### 次要变更

- 786e9b6: 强化高频调用场景下的请求层能力与流量伪装策略。

  重点摘要：

  - 修复 weapi (`e_r`) 加密响应的解密逻辑，使其与旧实现保持一致；现在 eapi 与 weapi 的加密响应都会正确解密
  - SDK 调用路径下，当未显式提供 `ip` 或 `realIP` 时，默认注入运行时中国 IP（`cnIp`）；显式配置仍然优先，HTTP 服务路径不受影响
  - 为单次请求尝试引入保守的默认超时 8 秒；可通过 `timeoutMs: 0` 关闭
  - 默认重试“连接尚未建立”类传输错误；这类错误没有重复提交风险，而歧义性 socket 错误与业务状态码仍需显式开启重试
  - 支持通过 `acceptGzip` 显式开启 gzip eapi 响应
  - SDK 调用路径会懒加载匿名 token，并通过 single-flight 去重
  - 新增可选的 SDK 响应缓存（`cache`），同时支持 single-flight 请求去重
  - 新增可选的匿名身份池（`identityPool`），可在多次调用之间轮换 `deviceId`、`cnIp` 与 token

## 1.0.0

### 重大变更

- 9b71f47: 以 `1.0.0` 正式发布首个以 SDK 为中心的 npm 包契约。

  重点摘要：

  - 将根包导出面收敛为以 `createHanaMusicApi` 为核心的冻结 SDK 契约
  - 在根 SDK 导出面补齐 camelCase 形式的原始模块导出
  - 提供基于 tsdown 的纯 ESM 构建产物，并声明明确的 package exports
  - 补齐面向包消费者的契约校验、changesets 发版流程与 GitHub Release 自动化
