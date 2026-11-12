# 发布验收

Version Packages 合入后，在可信 master 运行上打包一次。离线门禁、严格包校验、安装后的 Node/Bun/浏览器消费者、同包匿名 live、所有登记变异目标必须通过后，才能从同次运行取回 tarball，以通过验证的 SHA-256 和版本交给 npm。任何 job 失败、摘要不符、包名或版本错误都不允许上传。next 额外核对调用者批准的版本、摘要与预发布状态，不推 tag。

验证以 release 的只读 dry-run 为主，记录实际 Actions 的总时间及模拟发布 job 时间，并和旧 release 分开比较。正式写 registry、tag、GitHub Release 不属于本次演练。普通 PR 不访问真实上游。
