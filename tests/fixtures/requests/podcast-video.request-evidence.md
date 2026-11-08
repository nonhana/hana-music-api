# #113 离线请求证据

来源：feature/refactor固定HEAD fa40cad6b56b9fcb4b666a80bb84c4b487551919的67模块；固定旧SDK由完整生成client编排至严格fake网络边界，独立AES解密370个有效分支。观察时间见podcast-video.json的source.observedAt，逐模块原源码hash在source.moduleSha256，67份迁移前模块原文在.artifacts/testing/issue-113/baseline/，初轮366分支的baseline-wire-3._日志保留；最终370分支来自同目录original/下的固定git archive旧SDK，实际捕获命令、时间、退出码与原始日志见baseline-extended.json及baseline-extended.stdout/.stderr，155份公开返回对照见baseline-extended-replays._。

profile为weapiPc/eapi，协议为weapi/eapi；viewer为合成账号/匿名会话，region为offline fake，上游地区unknown。verifiedFields为最终URL、POST、User-Agent、来源页请求头、PC身份Cookie、e_r、x-aeapi、eapi加密路径/header、weapi加密正文及业务字段。账号Cookie、资源ID与拒绝响应均合成，不是官方抓包；不证明网易云当前接受该身份组合。

podcast-video-replays.json是另行执行155份原录制后捕获的公开status/body/cookie hash；原文件及metadata未改，响应中的合成Set-Cookie只为对照传输外壳。无录制的声音删除/排序及未录到工作台成功字段不猜Schema；策略测试的合成成功样本不当作新上游录制。候选另经生成client、真实HTTP loader和当前tarball的Node/Bun三入口检查；包消费者在独立进程固定Math.random以解密weapi，未更改生产协议实现。
