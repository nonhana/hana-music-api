# Phase 8 发布检查清单

发布时间前按顺序执行下面的检查。任何一步失败，都先修复再继续。

## 基线检查

- [ ] `git status --short`
- [ ] 确认只有本次发布相关改动，没有误碰其他 worker 的文件
- [ ] `bun install --frozen-lockfile`
- [ ] `bun run verify`

## 本地启动检查

- [ ] `HOST=127.0.0.1 PORT=3021 bun start`
- [ ] `curl -f http://127.0.0.1:3021/health`
- [ ] `curl "http://127.0.0.1:3021/search?keywords=周杰伦&limit=5"`

## 发布前检查

- [ ] `git tag vX.Y.Z`
- [ ] `git push origin vX.Y.Z`
- [ ] 发布说明包含安装方式
- [ ] 发布说明包含启动方式
- [ ] 发布说明包含 PM2 托管方式
- [ ] 发布说明包含环境变量
- [ ] 发布说明包含升级步骤
- [ ] 发布说明包含回滚步骤
- [ ] 发布说明包含健康检查方式

## 备注

- 建议在打 tag 之前再次确认 `bun run verify` 通过。
- 版本号应与仓库标签和 Release 页面保持一致。
- 如果 `curl /health` 失败，先检查 `PORT`、`HOST`、PM2 配置和匿名 token 持久路径。
