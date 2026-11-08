# #114 离线请求证据

来源：feature/refactor固定HEAD 06f1791161d60970b906b09d2564293d1602f73a，50模块原源码hash在membership-business.json的source.moduleSha256，原文在.artifacts/testing/issue-114/baseline/。迁移前由完整生成client编排至严格fake网络边界，独立AES解码240个有效分支；实际命令、时间、退出码和原始日志见baseline-wire-3.json及stdout/stderr。早期准备失败轮次保留，不计通过。

profile为weapiPc/eapi、协议weapi/eapi；viewer为合成账号和匿名会话，region为offline fake，上游地区unknown。verifiedFields包括最终URL/POST/UA/来源页头/PC身份Cookie、e_r、x-aeapi、eapi加密路径/header及weapi业务正文。输入、账号、拒绝和传输Set-Cookie均合成，不是官方抓包，不证明当前上游可用。默认值用真正省略字段的输入，年度路径、双时间条件、分页游标和JSON序列化另有有效分支。

membership-business-replays.json单独保存102份原录制经旧SDK模块执行后的公开status/body/cookie hash；原metadata/文件不改。十个无录制模块及下单缺成功样本不猜Schema，合成成功仅测试单次与不共享策略。候选从生成client、真实HTTP loader和同tarball Node/Bun三入口独立解码；包进程固定Math.random只控制测试熵，不更改生产协议。
