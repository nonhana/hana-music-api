# 发布路径与耗时实测

基于 PR #134 的 b47fc3f；本阶段在 PR #135 里演练，不向 npm 上传、不写 GitHub Release。墙钟含排队。

| 样本                                                                                          | 总计  | 主要步骤                                                         |
| --------------------------------------------------------------------------------------------- | ----- | ---------------------------------------------------------------- |
| [原 release #89](https://github.com/nonhana/hana-music-api/actions/runs/43235579838)          | 38:22 | 单 job 38:14；preflight 33:57，其中变异 25:01                    |
| [第一次只读 release 演练](https://github.com/nonhana/hana-music-api/actions/runs/43245261299) | 4:11  | 最终下载归档及 npm dry-run 的 job 为 20 秒                       |
| [绑定版本提交后的演练](https://github.com/nonhana/hana-music-api/actions/runs/43245682253)    | 4:32  | 最慢变异组 3:33；发包演练 job 18 秒；成功 job 运行时间合计 32:13 |

从旧 run 和 17d51db 新 run 下载所有变异结果，按目标、故障编号和判定比较：16 个目标共 126 个故障逐项相等，全部 killed。下载新 run 的包和两份报告：包消费者、匿名 live 和归档的 SHA-256 都是 `5989fffaba911576dd521670ea50ab1381aa5b81fd0b33497d0130dd2fd042d1`。演练用的 5.0.1 仅存在 runner 上。

隔离进程控制使用真实 tarball，替代 registry 和 npm：稳定版和 next 仅把指定 tarball 交给 npm 一次；摘要不符、registry 中已有不同字节、试图回退 latest 时失败且零上传；相同版本、相同字节重试时成功且零上传。原有候选版本、next 标签及 preflight 故障控制也保留。此次不证明正式 npm 权限、provenance 签发或 GitHub Release 写入成功；正式发布才会执行这些动作。
