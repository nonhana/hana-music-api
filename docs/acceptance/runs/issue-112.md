# #112 当次验收

当前结论：完成。AC-01～AC-14、全部适用自动门禁与独立双轴审查通过，无本票未解决阻断项。以下为最终候选，后附全部失败/修复过程；旧轮次不代替本轮证据。

## 最终候选与证据

分支feature/refactor，HEAD仍为11f7b81bae94e542645c06df7977dfdc3fc99823；起始工作区干净，没有切分支/reset/新建worktree，所有本次改动未提交。实际总模块352、已声明222、pending130；本票83模块89动作，46weapiPc/37eapi。业务输入/返回Schema不变，普通覆盖收口有major changeset，低层createRequest保持。

- 内容SHA-256：`3a6595e84b26f175fe223ea5a9d11a03264fe9b3c1328036e9691355a4f902da`。
- diff SHA-256：`48db989c3988c272cf4e3cfbfec106c0fdc7582d30f66d463b9bc895ef9247a9`。
- 锁文件SHA-256：`68762384acdb3b96e20542b15eec10ea70a1d560b9b5d43f2f41966dbfb10ded`，bun.lock未改。
- 同包tarball SHA-256：`f4d357709721ad9b0e83460cd25defe2de889c3c9411357887e05b74117f15fe`。

六项串行执行，全部退出0且每条前后指纹一致。实际命令数组/起止时间/退出码/锁hash/前后指纹与原始stdout/stderr在.artifacts/testing/issue-112/final-3/gates.json，结构化核对在同目录final-evidence.json。每项sink发送前显式清空，没有旧尾部字节。verify:sdk实际包含build:check/test:sdk-contract，不冒称独立命令；verify包含文档构建。lint零warning/error；构建的既有生成器弃用/文档chunk提示没有降级检查或改配置。

| 实际命令                              | 退出码 | 原始stdout（同目录同名.stderr）                            |
| ------------------------------------- | ------ | ---------------------------------------------------------- |
| `bun run types:modules:check`         | 0      | `.artifacts/testing/issue-112/final-3/modules-check.log`   |
| `bun run verify`                      | 0      | `.artifacts/testing/issue-112/final-3/verify.log`          |
| `bun run verify:sdk`                  | 0      | `.artifacts/testing/issue-112/final-3/verify-sdk.log`      |
| `bun run verify:fixtures`             | 0      | `.artifacts/testing/issue-112/final-3/verify-fixtures.log` |
| `bun run test:load:smoke`             | 0      | `.artifacts/testing/issue-112/final-3/load-smoke.log`      |
| `bun scripts/mutation-test.mts --all` | 0      | `.artifacts/testing/issue-112/final-3/mutation-all.log`    |

| 集合     | pass / fail / skip | 原生证据摘要                                                                                  |
| -------- | ------------------ | --------------------------------------------------------------------------------------------- |
| local    | 5764 / 0 / 0       | `.artifacts/testing/local/1794109222484-87e7b98a-ba04-46ea-ba12-6af9626a4781/summary.json`    |
| sdk      | 32 / 0 / 0         | `.artifacts/testing/sdk/1794109339263-073bfaca-f167-4c98-b671-bc5c8e276f60/summary.json`      |
| package  | 1 / 0 / 0          | `.artifacts/testing/package/2ef71a02-16d5-4ea4-b3df-d0d6d6ce87ed/summary.json`                |
| smoke    | 146 / 0 / 0        | `.artifacts/testing/smoke/1794109370479-d880a35e-8b7c-4e42-86c3-43d21fc6c2b4/summary.json`    |
| load     | 1 / 0 / 0          | `.artifacts/testing/load/smoke-1794109374353/summary.json`                                    |
| mutation | 48 / 0 / 0         | `.artifacts/testing/mutation/1794109374673-6767cf30-afdb-4d1c-a2b3-f507e6d4b01d/summary.json` |

每个runner保留原生命令/逐子stdout/stderr和JUnit；package原生用例在local/sdk的release子XML。981项账号专项包含267case各client/HTTP最终请求与16token用例、149份固定旧SDK公开响应对照、270项政策/取消期限/本地拒绝/快照和12项会话/匿名/HTTP隔离测试。计数不替代AC证据。

同一tarball的Node26.13.0/Bun1.4.4各267case/83模块/801请求/267provider，真实包三入口轮换执行；eapi独立解码、weapi目标/UA/Cookie/token头核对，源码受控熵另独立解码两协议。包/公开类型/serverless/browser/CSP边界通过，713个包文件hash可逐个核对。

loopback实际完整500样本，failures=[]、upstreamActive=0、inflight=0。48项登记变异均有效killed，本票8项关联原生AssertionError，9组非空基线/编译通过，工具错误/编译错误/超时/空选择没有充数，原工作区指纹不变。

267份请求来自固定旧11f7b81普通archive副本/旧SDK完整编排独立解码，149份历史原文/旧包装回放与请求证据分开。原fixture与recordedAt/viewer/region/provenance未改。#38/8821无真实样本，保留未知业务拒绝处理；11模块无录制、17模块的cache成功场景用合成上游，不声称真实可用。默认仅离线，live和十分钟soak预先不适用且未运行；没有沿用旧账号/目标/token或写入恢复授权。

## 当前AC核对

| AC    | 决定性证据                                                                                                            | 状态 |
| ----- | --------------------------------------------------------------------------------------------------------------------- | ---- |
| AC-01 | 83源码/原始issue快照、83行六列矩阵、固定基线267完整请求、149公开响应hash                                              | 通过 |
| AC-02 | 46weapiPc/37eapi实际组合，267冲突config client与HTTP独立解码，无新执行器/产品接缝                                     | 通过 |
| AC-03 | 267case各SDK/HTTP最终URL/POST/UA/Cookie/协议选项/路径/正文独立解码，实际prefix与唯一分支名                            | 通过 |
| AC-04 | 密码/md5/验证码/空验证码/匿名设备与状态、登录刷新退出Cookie、跨client及不同HTTP账号六请求隔离                         | 通过 |
| AC-05 | 一起听progress=0/缺省与列表JSON、扫码/风控/本地二维码、#38缺口及P11归属保持                                           | 通过 |
| AC-06 | 评论三动作/资源与事件threadId、点赞取消/关注/动态/消息/账号设置实际边界，保守政策注明证据限制                         | 通过 |
| AC-07 | 83模块连接前/已连接失败次数与成功连续并发异身份不共享，正文中断/业务拒绝单发，原共享读取与负载回归                    | 通过 |
| AC-08 | 两profile可选token、通用四协议编码/非法目标防护、provider/完整正文取消与期限、交错快照/HTTP拒绝及原边界               | 通过 |
| AC-09 | 149份原始/旧包装逐份回放与旧SDK响应hash，原文件hash不变；缺口/合成/结构审计分开                                       | 通过 |
| AC-10 | generate/check与真实发现352/222/130、83/89一致；手工匿名动作、通用协议probe、live控制精确目标同步                     | 通过 |
| AC-11 | 当前同tarball Node/Bun各267case/801请求/267provider，公开类型/导出/serverless/browser边界                             | 通过 |
| AC-12 | 原生256项profile red与16项政策red、最终981账号专项green，本票8项和全48项有效mutation                                  | 通过 |
| AC-13 | 六项同候选门禁全部0，500完整loopback与资源归零，原始日志/JUnit/源码锁文件包hash齐全                                   | 通过 |
| AC-14 | 必要文档/ADR/major changeset已同步；独立review_112已直接读取最终完整工作区与实际证据，规范轴/需求轴PASS，无未解决发现 | 通过 |

## 独立审查包与授权边界

review_112未参与实现。原始用户指令/#112/#80、更新AC、当前矩阵与完整工作区的base...HEAD/cached/diff、12份非忽略untracked原文和全部六门禁真实日志/JUnit/包/变异/500load证据，见.artifacts/testing/issue-112/final-3/review-inputs.json、review-*.diff、review-untracked.json和final-evidence.json。没有原有用户改动；审查不自动提交。

未提交、推送、创建PR、关票、合并或发布。独立最终结论：规范轴PASS、需求轴PASS、14条AC全部PASS，无未解决可操作发现。原文在.artifacts/testing/issue-112/review-final.md。reviewer直接核对最终完整diff/12份untracked原文、原始来源、六项完整日志与local/sdk/smoke的134份子XML、713包文件hash、500全部samples及48变异/9组非空基线/57XML/228份原始日志；重算源码/锁/包hash一致。最后仅更新排除于候选指纹的runs结果，并再次检查该报告的格式/拼写和源码指纹；矩阵/源码保持冻结。

## 过程与历史记录

当前状态：实施中。第一阶段已调查83模块，迁移前256份完整最终请求对照通过；尚未实施、未运行最终门禁，不报告完成。

固定基线feature/refactor / 11f7b81bae94e542645c06df7977dfdc3fc99823，工作区初始干净，远端一致；原生oxfmt/oxlint/tsdown和Chromium加载检查通过，Bun1.4.4、Node26.13.0。源码/issue快照、调查清单在.artifacts/testing/issue-112/baseline/。

baseline-wire-2.stdout退出0，83模块256份请求独立解码。第一次采样user_follow_mixed的cursor使用了非数字字符串，原decoder400，已修正采样为数字；该失败是装配错误，不计新行为red，原日志保留baseline-wire.stderr。

全部149份可用原始响应与无录制的11模块已登记；历史响应尚未逐份执行，不写已回放。默认离线，无真实上游或旧账号授权继承；未提交、推送或关票。

## 实施与修复过程

原生red：red-profile-2为272pass/256fail/0skip，256项client冲突配置断言失败；HTTP和无冲突token部分已有行为直接回归。red-policy-2为249pass/16fail/0skip，16项消息/会话/刷新read-never的连接前失败断言证明旧实现仍重放。第一次profile额外一项匿名设备状态采样不固定、第一次policy两项响应Cookie装配和一项user_follow_mixed资格预期错误，不计新行为red；均修正后重新取证。

83模块迁移为89动作，复用46weapiPc/37eapi，源码业务处理/Schema未改。green-domain第一次54fail来自六个资源评论动态路径的段前缀使用错误，已按现有normalizeActionTarget改为真实目录prefix，未放宽内核；green-domain-2为942pass。green-domain-3的四项HTTP测试误以为Cookie来源逐键合并，实际整体按header/query/body优先级选择，已修正测试守住既有行为；green-domain-4为958pass/0fail/0skip。

typecheck-initial发现新测试未使用导入，加入对应公开入口回归后消除；typecheck-2另暴露两处旧library测试对联合Promise推断过窄，改为明确NcmApiResponse边界，typecheck-3通过。lint-initial通过（零warning/error）。consumer-wiring原生27pass/0fail，精确同步离线live控制的weapi账号目标并独立解码；没有执行真实live。

mutation-initial退出0，新增8项均有效killed，关联原生AssertionError与typecheck基线在.artifacts/testing/mutation/1794108314227-86ed4b8d-82e6-4640-900b-10cffca52b34/，该轮尚非最终候选。

独立review_112初审发现一起听progress零值/缺省、时间排序缺省cursor未采样，以及矩阵动态prefix未直列。已用git archive导出固定11f7b81普通副本（未新建worktree/切分支），重新从旧SDK完整编排267份请求：追加上述边界，以及事件评论/取消和缺threadId、动态分享缺id。baseline-wire-extended.stdout退出0，fixture仍注明固定旧HEAD与离线来源；同包计数同步267case/801请求/267provider。当前矩阵83行格式化后每行六列，动态行列出实际声明prefix。此前256对照/旧轮次保留，不冒称新候选已验收。

149份历史响应已逐份通过固定旧SDK捕获公开体hash，candidate实际逐份回放已在green-domain-2/4执行；其中login_qr_key/login_status的旧录制包含SDK包装，按既有测试提取data，原文/context未改；合成传输Set-Cookie只补脱敏条件，17模块无成功原文时的cache成功用例明确使用合成上游（11模块无录制，另6模块仅有拒绝或包装）。QR生成也沿既有合成边界，不伪造真实8821。

## 最终门禁失败轮次与消费者修复

final-0固定候选8ee6928d的modules-check通过；verify在完整local为5756pass/7fail/0skip，故该轮失败且后续门禁未执行。原始gates/stdout/stderr保留在.artifacts/testing/issue-112/final-0/，原生JUnit在.artifacts/testing/local/1794108627705-34ebe3a8-9708-4dda-8461-3ddf2ccc2f99/。

6项失败来自通用token协议/外送边界测试借get_userids覆盖crypto/domain，而本票已收口该真实模块；改为明确测试protocol_probe定义，经runCall、buildApiRequestIntent和原requestEffect验证通用编码与非法目标零发送，不改业务profile、不借其他pending业务接口或放宽fake。真实get_userids三公开入口token回归保留，标题改为declared。一项失败来自call-runtime手工register_anonimous定义漏actions且按api表单解码；现传真实动作并用受控熵独立解码weapi，验证真实目标与Call设备快照。consumer-fixes原生72pass/0fail/0skip，typecheck-5通过，独立reviewer已核对修复方案；全候选六门禁需重新执行。

final-1候选a0143964的完整local为5763pass/0fail/0skip，typecheck通过，但verify仍在lint失败：新同步匿名测试用String(url)处理Request/URL联合，触发no-base-to-string。已改为显式读取string/URL.href/Request.url，不改产品行为；该轮仍计失败，后续门禁未执行，原始日志保留final-1。修复后换新候选重跑全部六门禁。

独立reviewer再指出原“两HTTP实例”用同一账号只能证明Cookie来源/属性，不能证明跨账号隔离。已新增两个不同账号/返回Cookie/uid的六请求严格场景，交错验证原会话和显式新会话，http-isolation原生12pass、定向lint通过，属于既有合同直接回归。reviewer已读原文/XML复核补齐AC-04。

final-2运行期间纳入这项审查修复，完整local因此返回Candidate changed during validation（5763pass/0fail/0skip），outer指纹guard也为unchanged=false；该轮无功能断言失败，但候选变化使整轮失效，后续门禁未执行。日志保留final-2，不计最终通过；新候选冻结后重新执行全部六门禁。

## 后续提交与关票授权

用户在本聊天明确授权提交、推送本次改动并关闭#112，提交信息使用单行 `<type>: <message>` 且不带scope。沿用feature/refactor，交付内容为上述通过验收的候选；不创建PR、不合并或发布。实际提交、远端分支与关票回执保存到.artifacts/testing/issue-112/closeout.json。原testedHead、候选指纹和包hash保留验收原值，不改标为提交后重新测试。
