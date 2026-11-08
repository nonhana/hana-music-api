# #115 特殊链路的离线最终请求证据

来源为固定提交 `ea108c87a45cd8c0546949ab4d08d2d22aa74100` 的 `git archive`，副本位于 `.artifacts/testing/issue-115/baseline/`，没有创建 worktree。`capture-baseline.mts` 从副本的生成 client 执行完整模块编排，再在最终 fetch 边界独立解码 weapi 两轮 AES 和 eapi 路径/正文；plain 记录原始字节及实际头。真实命令、时间、退出码与原始输出见 `.artifacts/testing/issue-115/baseline-wire-6.*`。这些对照来自旧源码，候选执行另由 behavior 测试断言。

`special-chains.json` 的 source 保留观察时间、固定基线和证据类别。输入、会话、设备、IP、NOS 凭证、上传文件和阶段响应全是合成数据；viewer 为 synthetic authenticated，region 为 offline fake，没有访问真实上游。`dupkey` 只验证 UUID 格式后归一成占位符，二维码 web chainId 也只归一动态值；其余 API 路径/header/正文、plain URL/method/原始字节/头逐字段比较。Cookie 按字段比较，顺序不属于身份合同。multipart HTTP 字段是字符串，其专用分支也由固定旧 SDK 执行取证。

API profile 包括 weapiPc（浏览器 UA、PC Cookie）、eapi（既有 iPhone UA、PC Cookie）与 clientlogOsx（同一 iPhone UA、osx Cookie、clientlog 域名）。所有 API 的 e_r=false，无 x-aeapi。plainInterface/plainMusic 保持 GET JSON/HTML；plainImage/plainLookup/plainNos/plainVoice 保持原方法、目标、无显式 UA/Cookie 和原始正文，不称为官方客户端身份。动态 NOS 地址仍受原允许域名后缀与桶目录约束。

`special-chains-replays.json` 独立记录 23 份原历史文件的 SHA-256 和旧 SDK 输出 hash。playlist_tracks 保留既有 SDK 包装；封面按既有 data 包装回放；image_upload_token 的旧录制是 SDK 凭证包装，重建分配响应时使用合成 token；playlist_track_all 的早期录制只有最终歌曲正文，前置详情是明确标注的合成数据；scrobble 同一历史响应用于两个阶段；本地二维码无上游。原录制与 metadata 未修改，不能据此证明未录阶段的上游响应或当次可用性。其余六个模块没有历史录制，使用合成行为样本，不猜 Schema。

独立审查发现动态plain query会影响旧URI语义：audioFP为upload或related id为login时，固定旧SDK连接失败只发送一次，最初候选会发送三次。对应原生red记录为red-dynamic-retry；两个动作因此明确收紧为never，固定歌曲上传地址查询仍connect。这是重试策略收紧，不宣称所有输入下的错误请求次数等价，也不重新引入URI正则作为新判定源。
