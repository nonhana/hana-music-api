# 定向变异

这些目标检查现有断言能不能发现指定错误，不是一套重复业务测试，也不追求全仓分数。

```bash
bun scripts/mutation-test.mts --target candidate-package
bun scripts/mutation-test.mts --target request-identity
bun scripts/mutation-test.mts --target special-chains
bun scripts/mutation-test.mts --target membership-business
bun scripts/mutation-test.mts --target podcast-video
bun scripts/mutation-test.mts --target account-social
bun scripts/mutation-test.mts --target check-token
bun scripts/mutation-test.mts --target playlist-subscribe
bun scripts/mutation-test.mts --target shared-reads
bun scripts/mutation-test.mts --target upload
bun scripts/mutation-test.mts --target watchman
bun scripts/mutation-test.mts --target browser-types
bun scripts/mutation-test.mts --all
bun scripts/mutation-test.mts --all --dry-run
```

CLI 从当前候选（含未提交、非忽略未跟踪文件）建立临时副本，只读复用依赖，预加载 offline 防护；先运行对应有限测试基线。补丁须精确命中一次，每个故障执行后恢复副本，结束时核对原工作区内容指纹。测试关联只在 `tests/suites.ts` 的 mutation selection 登记。

browser-types 的两个有限故障分别省略浏览器和服务端 typecheck 阶段，关联用例必须发现该环境中的错误被放行；类型环境混合导致编译失败不充当有效 killed。

candidate-package 的有限故障分别省略候选包 hash 与 next tag 检查；控制用例实际执行 workflow 的候选检查命令，必须由错误候选被放行后的原生断言检出，不能把命令/编译错误当作有效 kill。

| 结果       | 含义                                                    |
| ---------- | ------------------------------------------------------- |
| killed     | 类型检查通过，目标关联的原生 JUnit 用例出现预期断言失败 |
| survived   | 相关测试确实执行且仍通过，是覆盖缺口                    |
| invalid    | 编译、导入或非关联断言等失败，不能计作有效 kill         |
| timeout    | 编译/进程/用例达到期限，不能计作有效 kill               |
| tool-error | 基线、选择、补丁或报告工具条件不成立                    |

`--dry-run` 只核对基线和补丁范围，不注入故障，不声称 kill。产物位于 `.artifacts/testing/mutation/`，包含原始命令、日志、JUnit、候选、故障位置和失败标题。任一 survived/invalid/timeout/tool-error 令实际变异命令非零退出；控制样本自测故意验证这些非零结果。

#113 的 podcast-video 目标覆盖视频资源ID转发、DIFM已收藏频道列表的重试上限、协议、取消目标、广播取消标志、声音排序重放、时间线重放、推荐缓存、声音免费过滤假值和小时榜分页；每项关联当前领域用例的原生断言。

#114 的 membership-business 目标覆盖协议、下单资源JSON、下单/batch/奖励单次、报告与收入明细的旧重试上限、会员缓存、时光机范围默认、云贝历史游标和旧年度路径；每项关联本领域原生断言。

#115 的 special-chains 目标覆盖日志特殊域名、导入依赖ID、512条件、旧读取重试上限及动态plain输入的单次边界、plain方法/响应模式/域名边界、外部token隔离、上传字节和本地空动作；关联本票原生断言。

#122 的 request-identity 目标覆盖调用方设备优先级、身份池兜底、低层部分OS覆盖、混合UA、大小写清理、无依据buildver及隐式匿名username；九项都要求对应网络边界用例原生断言有效检出。

身份池返回的有效设备不会被空白或undefined的state.deviceId抹掉；注册等待期间其他调用更新runtime时，username、注册Cookie和后续业务Cookie仍用同一池设备。对应回退故障也登记定向mutation。

#116 删除顶层deviceId后，旧兼容入口的mutation由配置拒绝目标承接；request-identity保留九项，新增同一匿名凭据切换runtime设备时的共享缓存指纹故障。新module-config组覆盖旧键拒绝、query分离、client构造、强制动作、空动作零发送及生成器非法声明。都要求关联用例的原生AssertionError，工具或编译失败不算killed。
