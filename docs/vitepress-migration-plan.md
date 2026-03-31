# VitePress 文档系统迁移计划

> 最后更新：2026-03-31
> 本文档是 hana-music-api 文档系统从旧版 Docsify 单文件迁移到 VitePress 多层级文档站点的完整执行计划。
> 目标读者：后续接手的 LLM 或开发者。读完本文档后应能直接开工，无需再做全仓摸底。

---

## 一、背景与动机

### 1.1 旧文档系统的问题

旧项目 `netease-music-api` 使用 Docsify 作为文档框架，所有 321 个 API 接口的文档写在一个 `public/docs/home.md` 中（数千行），存在以下痛点：

1. **单文件过大**：用户无法快速定位需要的接口，只能靠浏览器 Ctrl+F 搜索
2. **无分类导航**：所有接口平铺排列，没有按功能域分组的侧边栏
3. **无全文搜索**：Docsify 自带搜索能力弱，大文件下性能差
4. **文档与代码脱节**：手写文档容易过时，新增模块后忘记更新文档

### 1.2 新文档系统的目标

1. **每个接口一个页面**：以 `src/modules/` 下的 366 个模块为基准，每个模块对应一个 `.md` 文件
2. **按功能域分组**：用户通过侧边栏即可按类别浏览（用户、音乐、歌单、搜索、评论等）
3. **内置全文搜索**：VitePress 内置 MiniSearch，支持中文搜索
4. **Bun 原生运行**：`bun run docs:dev` / `bun run docs:build` 开箱即用
5. **后续可扩展自动生成**：模块结构高度一致，为后续脚本化生成文档骨架留好口子

---

## 二、技术选型

**框架：VitePress**

| 维度 | 说明 |
|------|------|
| 版本 | `vitepress@latest`（当前稳定版） |
| 运行时 | Bun（Vite 对 Bun 有一等公民支持） |
| 主题 | VitePress 默认主题（已内置侧边栏、导航栏、搜索） |
| 搜索 | VitePress 内置 `local` 搜索（基于 MiniSearch，支持中文） |
| 部署产物 | 静态 HTML（可部署到任意静态托管） |

**不选 Starlight 的原因**：中文社区弱，自定义主题灵活度不如 VitePress。
**不选 HonoX 的原因**：不是文档框架，搜索/侧边栏/Markdown 渲染等全部需自建，性价比极低。

---

## 三、目录结构设计

### 3.1 文档目录（新增）

在项目根目录新建 `docs-site/` 目录（与现有 `docs/`（项目内部开发文档）区分）：

```
hana-music-api/
├── docs-site/                          # VitePress 文档站点根目录
│   ├── .vitepress/
│   │   ├── config.ts                   # VitePress 配置（导航栏、侧边栏、搜索等）
│   │   └── theme/
│   │       └── index.ts                # 自定义主题入口（如需扩展）
│   ├── index.md                        # 首页（Hero 风格）
│   ├── guide/
│   │   ├── getting-started.md          # 快速开始
│   │   ├── authentication.md           # 认证机制详解
│   │   ├── request-convention.md       # 调用约定（缓存、Cookie、代理、时间戳等）
│   │   └── programmatic-api.md         # 编程式调用（Node.js / Bun）
│   ├── api/
│   │   ├── user/                       # 用户相关
│   │   │   ├── login-cellphone.md
│   │   │   ├── login.md
│   │   │   ├── login-qr-key.md
│   │   │   ├── login-qr-create.md
│   │   │   ├── login-qr-check.md
│   │   │   ├── login-refresh.md
│   │   │   ├── login-status.md
│   │   │   ├── logout.md
│   │   │   ├── register-anonimous.md
│   │   │   ├── register-cellphone.md
│   │   │   ├── captcha-sent.md
│   │   │   ├── captcha-verify.md
│   │   │   ├── cellphone-existence-check.md
│   │   │   ├── user-detail.md
│   │   │   ├── user-account.md
│   │   │   ├── user-subcount.md
│   │   │   ├── user-level.md
│   │   │   ├── user-binding.md
│   │   │   ├── user-bindingcellphone.md
│   │   │   ├── user-replacephone.md
│   │   │   ├── user-update.md
│   │   │   ├── user-detail-new.md
│   │   │   ├── user-medal.md
│   │   │   ├── user-social-status.md
│   │   │   ├── user-social-status-edit.md
│   │   │   ├── user-social-status-rcmd.md
│   │   │   ├── user-social-status-support.md
│   │   │   ├── activate-init-profile.md
│   │   │   ├── nickname-check.md
│   │   │   ├── rebind.md
│   │   │   ├── avatar-upload.md
│   │   │   ├── setting.md
│   │   │   └── get-userids.md
│   │   ├── music/                      # 音乐/歌曲相关
│   │   │   ├── song-detail.md
│   │   │   ├── song-url.md
│   │   │   ├── song-url-v1.md
│   │   │   ├── song-download-url.md
│   │   │   ├── song-download-url-v1.md
│   │   │   ├── check-music.md
│   │   │   ├── lyric.md
│   │   │   ├── lyric-new.md
│   │   │   ├── song-chorus.md
│   │   │   ├── song-wiki-summary.md
│   │   │   ├── song-music-detail.md
│   │   │   ├── song-dynamic-cover.md
│   │   │   ├── song-like-check.md
│   │   │   ├── song-red-count.md
│   │   │   ├── song-downlist.md
│   │   │   ├── song-monthdownlist.md
│   │   │   ├── song-singledownlist.md
│   │   │   ├── song-order-update.md
│   │   │   ├── song-purchased.md
│   │   │   ├── like.md
│   │   │   ├── likelist.md
│   │   │   ├── scrobble.md
│   │   │   ├── personal-fm.md
│   │   │   ├── personal-fm-mode.md
│   │   │   ├── fm-trash.md
│   │   │   └── audio-match.md
│   │   ├── search/                     # 搜索相关
│   │   │   ├── search.md
│   │   │   ├── cloudsearch.md
│   │   │   ├── search-default.md
│   │   │   ├── search-hot.md
│   │   │   ├── search-hot-detail.md
│   │   │   ├── search-suggest.md
│   │   │   ├── search-multimatch.md
│   │   │   └── search-match.md
│   │   ├── playlist/                   # 歌单相关
│   │   │   ├── playlist-detail.md
│   │   │   ├── playlist-detail-dynamic.md
│   │   │   ├── playlist-detail-rcmd-get.md
│   │   │   ├── playlist-track-all.md
│   │   │   ├── playlist-track-add.md
│   │   │   ├── playlist-track-delete.md
│   │   │   ├── playlist-tracks.md
│   │   │   ├── playlist-create.md
│   │   │   ├── playlist-delete.md
│   │   │   ├── playlist-subscribe.md
│   │   │   ├── playlist-subscribers.md
│   │   │   ├── playlist-update.md
│   │   │   ├── playlist-name-update.md
│   │   │   ├── playlist-desc-update.md
│   │   │   ├── playlist-tags-update.md
│   │   │   ├── playlist-cover-update.md
│   │   │   ├── playlist-order-update.md
│   │   │   ├── playlist-update-playcount.md
│   │   │   ├── playlist-privacy.md
│   │   │   ├── playlist-catlist.md
│   │   │   ├── playlist-category-list.md
│   │   │   ├── playlist-hot.md
│   │   │   ├── playlist-highquality-tags.md
│   │   │   ├── playlist-mylike.md
│   │   │   ├── playlist-video-recent.md
│   │   │   ├── playlist-import-name-task-create.md
│   │   │   ├── playlist-import-task-status.md
│   │   │   ├── related-playlist.md
│   │   │   ├── top-playlist.md
│   │   │   ├── top-playlist-highquality.md
│   │   │   ├── user-playlist.md
│   │   │   ├── user-playlist-collect.md
│   │   │   └── user-playlist-create.md
│   │   ├── album/                      # 专辑相关
│   │   │   ├── album.md
│   │   │   ├── album-detail.md
│   │   │   ├── album-detail-dynamic.md
│   │   │   ├── album-list.md
│   │   │   ├── album-list-style.md
│   │   │   ├── album-new.md
│   │   │   ├── album-newest.md
│   │   │   ├── album-privilege.md
│   │   │   ├── album-songsaleboard.md
│   │   │   ├── album-sub.md
│   │   │   ├── album-sublist.md
│   │   │   ├── top-album.md
│   │   │   ├── digitalAlbum-detail.md
│   │   │   ├── digitalAlbum-ordering.md
│   │   │   ├── digitalAlbum-purchased.md
│   │   │   └── digitalAlbum-sales.md
│   │   ├── artist/                     # 歌手相关
│   │   │   ├── artists.md
│   │   │   ├── artist-detail.md
│   │   │   ├── artist-detail-dynamic.md
│   │   │   ├── artist-desc.md
│   │   │   ├── artist-songs.md
│   │   │   ├── artist-album.md
│   │   │   ├── artist-mv.md
│   │   │   ├── artist-new-mv.md
│   │   │   ├── artist-new-song.md
│   │   │   ├── artist-video.md
│   │   │   ├── artist-top-song.md
│   │   │   ├── artist-fans.md
│   │   │   ├── artist-follow-count.md
│   │   │   ├── artist-list.md
│   │   │   ├── artist-sub.md
│   │   │   ├── artist-sublist.md
│   │   │   ├── top-artists.md
│   │   │   ├── simi-artist.md
│   │   │   └── toplist-artist.md
│   │   ├── comment/                    # 评论相关
│   │   │   ├── comment.md
│   │   │   ├── comment-music.md
│   │   │   ├── comment-album.md
│   │   │   ├── comment-playlist.md
│   │   │   ├── comment-mv.md
│   │   │   ├── comment-dj.md
│   │   │   ├── comment-video.md
│   │   │   ├── comment-event.md
│   │   │   ├── comment-hot.md
│   │   │   ├── comment-new.md
│   │   │   ├── comment-floor.md
│   │   │   ├── comment-like.md
│   │   │   ├── comment-hug-list.md
│   │   │   ├── hug-comment.md
│   │   │   ├── starpick-comments-summary.md
│   │   │   └── user-comment-history.md
│   │   ├── recommend/                  # 推荐与发现
│   │   │   ├── recommend-resource.md
│   │   │   ├── recommend-songs.md
│   │   │   ├── recommend-songs-dislike.md
│   │   │   ├── personalized.md
│   │   │   ├── personalized-newsong.md
│   │   │   ├── personalized-mv.md
│   │   │   ├── personalized-djprogram.md
│   │   │   ├── personalized-privatecontent.md
│   │   │   ├── personalized-privatecontent-list.md
│   │   │   ├── banner.md
│   │   │   ├── homepage-block-page.md
│   │   │   ├── homepage-dragon-ball.md
│   │   │   ├── history-recommend-songs.md
│   │   │   ├── history-recommend-songs-detail.md
│   │   │   ├── calendar.md
│   │   │   ├── program-recommend.md
│   │   │   ├── playmode-intelligence-list.md
│   │   │   ├── playmode-song-vector.md
│   │   │   ├── simi-song.md
│   │   │   ├── simi-playlist.md
│   │   │   ├── simi-mv.md
│   │   │   ├── simi-user.md
│   │   │   └── aidj-content-rcmd.md
│   │   ├── toplist/                    # 排行榜
│   │   │   ├── toplist.md
│   │   │   ├── toplist-detail.md
│   │   │   ├── toplist-detail-v2.md
│   │   │   ├── top-list.md
│   │   │   ├── top-song.md
│   │   │   └── top-mv.md
│   │   ├── dj/                         # 电台/播客
│   │   │   ├── dj-banner.md
│   │   │   ├── dj-catelist.md
│   │   │   ├── dj-category-excludehot.md
│   │   │   ├── dj-category-recommend.md
│   │   │   ├── dj-detail.md
│   │   │   ├── dj-hot.md
│   │   │   ├── dj-paygift.md
│   │   │   ├── dj-personalize-recommend.md
│   │   │   ├── dj-program.md
│   │   │   ├── dj-program-detail.md
│   │   │   ├── dj-program-toplist.md
│   │   │   ├── dj-program-toplist-hours.md
│   │   │   ├── dj-radio-hot.md
│   │   │   ├── dj-recommend.md
│   │   │   ├── dj-recommend-type.md
│   │   │   ├── dj-sub.md
│   │   │   ├── dj-sublist.md
│   │   │   ├── dj-subscriber.md
│   │   │   ├── dj-today-perfered.md
│   │   │   ├── dj-toplist.md
│   │   │   ├── dj-toplist-hours.md
│   │   │   ├── dj-toplist-newcomer.md
│   │   │   ├── dj-toplist-pay.md
│   │   │   ├── dj-toplist-popular.md
│   │   │   ├── djRadio-top.md
│   │   │   ├── dj-difm-all-style-channel.md
│   │   │   ├── dj-difm-channel-subscribe.md
│   │   │   ├── dj-difm-channel-unsubscribe.md
│   │   │   ├── dj-difm-playing-tracks-list.md
│   │   │   ├── dj-difm-subscribe-channels-get.md
│   │   │   ├── user-audio.md
│   │   │   ├── user-dj.md
│   │   │   ├── voicelist-detail.md
│   │   │   ├── voicelist-list.md
│   │   │   ├── voicelist-list-search.md
│   │   │   ├── voicelist-search.md
│   │   │   ├── voicelist-trans.md
│   │   │   ├── voice-delete.md
│   │   │   ├── voice-detail.md
│   │   │   └── voice-lyric.md
│   │   ├── video/                      # 视频/MV
│   │   │   ├── mv-all.md
│   │   │   ├── mv-detail.md
│   │   │   ├── mv-detail-info.md
│   │   │   ├── mv-exclusive-rcmd.md
│   │   │   ├── mv-first.md
│   │   │   ├── mv-sub.md
│   │   │   ├── mv-sublist.md
│   │   │   ├── mv-url.md
│   │   │   ├── video-category-list.md
│   │   │   ├── video-detail.md
│   │   │   ├── video-detail-info.md
│   │   │   ├── video-group.md
│   │   │   ├── video-group-list.md
│   │   │   ├── video-sub.md
│   │   │   ├── video-timeline-all.md
│   │   │   ├── video-timeline-recommend.md
│   │   │   ├── video-url.md
│   │   │   ├── mlog-music-rcmd.md
│   │   │   ├── mlog-to-video.md
│   │   │   ├── mlog-url.md
│   │   │   ├── related-allvideo.md
│   │   │   └── playlist-video-recent.md
│   │   ├── social/                     # 社交/动态/私信
│   │   │   ├── event.md
│   │   │   ├── event-del.md
│   │   │   ├── event-forward.md
│   │   │   ├── follow.md
│   │   │   ├── user-event.md
│   │   │   ├── user-follows.md
│   │   │   ├── user-followeds.md
│   │   │   ├── user-follow-mixed.md
│   │   │   ├── user-mutualfollow-get.md
│   │   │   ├── send-text.md
│   │   │   ├── send-song.md
│   │   │   ├── send-album.md
│   │   │   ├── send-playlist.md
│   │   │   ├── msg-private.md
│   │   │   ├── msg-private-history.md
│   │   │   ├── msg-comments.md
│   │   │   ├── msg-forwards.md
│   │   │   ├── msg-notices.md
│   │   │   ├── msg-recentcontact.md
│   │   │   ├── share-resource.md
│   │   │   ├── resource-like.md
│   │   │   ├── hot-topic.md
│   │   │   ├── topic-detail.md
│   │   │   ├── topic-detail-event-hot.md
│   │   │   └── topic-sublist.md
│   │   ├── cloud/                      # 云盘/上传
│   │   │   ├── cloud.md
│   │   │   ├── cloud-import.md
│   │   │   ├── cloud-match.md
│   │   │   ├── user-cloud.md
│   │   │   ├── user-cloud-del.md
│   │   │   ├── user-cloud-detail.md
│   │   │   └── voice-upload.md
│   │   ├── listen/                     # 听歌记录/足迹
│   │   │   ├── user-record.md
│   │   │   ├── recent-listen-list.md
│   │   │   ├── record-recent-song.md
│   │   │   ├── record-recent-album.md
│   │   │   ├── record-recent-playlist.md
│   │   │   ├── record-recent-video.md
│   │   │   ├── record-recent-dj.md
│   │   │   ├── record-recent-voice.md
│   │   │   ├── listen-data-realtime-report.md
│   │   │   ├── listen-data-report.md
│   │   │   ├── listen-data-today-song.md
│   │   │   ├── listen-data-total.md
│   │   │   ├── listen-data-year-report.md
│   │   │   └── summary-annual.md
│   │   ├── together/                   # 一起听
│   │   │   ├── listentogether-accept.md
│   │   │   ├── listentogether-end.md
│   │   │   ├── listentogether-heatbeat.md
│   │   │   ├── listentogether-play-command.md
│   │   │   ├── listentogether-room-check.md
│   │   │   ├── listentogether-room-create.md
│   │   │   ├── listentogether-status.md
│   │   │   ├── listentogether-sync-list-command.md
│   │   │   └── listentogether-sync-playlist-get.md
│   │   ├── vip/                        # VIP/会员/云贝/音乐人
│   │   │   ├── vip-info.md
│   │   │   ├── vip-info-v2.md
│   │   │   ├── vip-tasks.md
│   │   │   ├── vip-growthpoint.md
│   │   │   ├── vip-growthpoint-details.md
│   │   │   ├── vip-growthpoint-get.md
│   │   │   ├── vip-timemachine.md
│   │   │   ├── yunbei.md
│   │   │   ├── yunbei-info.md
│   │   │   ├── yunbei-sign.md
│   │   │   ├── yunbei-today.md
│   │   │   ├── yunbei-tasks.md
│   │   │   ├── yunbei-tasks-todo.md
│   │   │   ├── yunbei-task-finish.md
│   │   │   ├── yunbei-expense.md
│   │   │   ├── yunbei-receipt.md
│   │   │   ├── yunbei-rcmd-song.md
│   │   │   ├── yunbei-rcmd-song-history.md
│   │   │   ├── musician-sign.md
│   │   │   ├── musician-tasks.md
│   │   │   ├── musician-tasks-new.md
│   │   │   ├── musician-data-overview.md
│   │   │   ├── musician-play-trend.md
│   │   │   ├── musician-cloudbean.md
│   │   │   ├── musician-cloudbean-obtain.md
│   │   │   ├── signin-progress.md
│   │   │   ├── sign-happy-info.md
│   │   │   └── daily-signin.md
│   │   ├── style/                      # 曲风
│   │   │   ├── style-list.md
│   │   │   ├── style-detail.md
│   │   │   ├── style-preference.md
│   │   │   ├── style-song.md
│   │   │   ├── style-album.md
│   │   │   ├── style-playlist.md
│   │   │   └── style-artist.md
│   │   ├── ugc/                        # UGC/百科
│   │   │   ├── ugc-album-get.md
│   │   │   ├── ugc-artist-get.md
│   │   │   ├── ugc-artist-search.md
│   │   │   ├── ugc-detail.md
│   │   │   ├── ugc-mv-get.md
│   │   │   ├── ugc-song-get.md
│   │   │   └── ugc-user-devote.md
│   │   ├── lyrics-mark/                # 歌词摘录
│   │   │   ├── song-lyrics-mark.md
│   │   │   ├── song-lyrics-mark-add.md
│   │   │   ├── song-lyrics-mark-del.md
│   │   │   └── song-lyrics-mark-user-page.md
│   │   ├── fanscenter/                 # 粉丝中心
│   │   │   ├── fanscenter-basicinfo-age-get.md
│   │   │   ├── fanscenter-basicinfo-gender-get.md
│   │   │   ├── fanscenter-basicinfo-province-get.md
│   │   │   ├── fanscenter-overview-get.md
│   │   │   └── fanscenter-trend-list.md
│   │   └── other/                      # 其他/工具
│   │       ├── batch.md
│   │       ├── countries-code-list.md
│   │       ├── weblog.md
│   │       ├── eapi-decrypt.md
│   │       ├── inner-version.md
│   │       ├── api.md
│   │       ├── pl-count.md
│   │       ├── sheet-list.md
│   │       ├── sheet-preview.md
│   │       ├── verify-getQr.md
│   │       ├── verify-qrcodestatus.md
│   │       ├── threshold-detail-get.md
│   │       ├── creator-authinfo-get.md
│   │       ├── music-first-listen-info.md
│   │       ├── broadcast-category-region-get.md
│   │       ├── broadcast-channel-collect-list.md
│   │       ├── broadcast-channel-currentinfo.md
│   │       ├── broadcast-channel-list.md
│   │       └── broadcast-sub.md
│   └── changelog.md                    # 更新日志
└── ...
```

### 3.2 命名约定

- 文件名：模块名中的 `_` 替换为 `-`，如 `login_cellphone.ts` → `login-cellphone.md`
- 分组目录名：用英文小写，有意义的简短名称
- 每个 `.md` 文件仅描述一个接口

---

## 四、VitePress 配置方案

### 4.1 `.vitepress/config.ts` 核心配置

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'hana-music-api',
  description: '网易云音乐 API - Bun + TypeScript + Hono',
  lang: 'zh-CN',

  // 构建输出到 docs-site/.vitepress/dist
  outDir: './.vitepress/dist',

  themeConfig: {
    logo: '/logo.svg', // 可选，后续补 logo
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API 参考', link: '/api/user/login-cellphone' },
      { text: 'GitHub', link: 'https://github.com/nonhana/hana-music-api' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '入门',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '认证机制', link: '/guide/authentication' },
            { text: '调用约定', link: '/guide/request-convention' },
            { text: '编程式调用', link: '/guide/programmatic-api' },
          ],
        },
      ],
      '/api/': [
        {
          text: '用户',
          collapsed: false,
          items: [
            { text: '手机登录', link: '/api/user/login-cellphone' },
            { text: '邮箱登录', link: '/api/user/login' },
            // ... 其余接口
          ],
        },
        {
          text: '音乐',
          collapsed: true,
          items: [
            { text: '歌曲详情', link: '/api/music/song-detail' },
            { text: '歌曲链接', link: '/api/music/song-url' },
            // ...
          ],
        },
        // ... 其余分组
      ],
    },

    search: {
      provider: 'local', // 内置 MiniSearch，支持中文
    },

    outline: {
      level: [2, 3],
      label: '页面导航',
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    lastUpdated: {
      text: '最后更新于',
    },
  },
})
```

### 4.2 `package.json` 新增 scripts

```jsonc
{
  "scripts": {
    // ... 现有 scripts 保持不变
    "docs:dev": "vitepress dev docs-site",
    "docs:build": "vitepress build docs-site",
    "docs:preview": "vitepress preview docs-site"
  }
}
```

### 4.3 安装依赖

```bash
bun add -D vitepress
```

---

## 五、文档内容规范

### 5.1 单接口文档模板

每个 API 接口页面必须遵循以下结构：

```markdown
# 手机登录

> 使用手机号码登录网易云音乐账号。

## 接口信息

| 项目 | 值 |
|------|-----|
| 接口地址 | `/login/cellphone` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `login_cellphone` |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|:----:|--------|------|
| phone | string | ✅ | - | 手机号码 |
| password | string | - | - | 密码（与 `captcha` 二选一） |
| md5_password | string | - | - | MD5 加密后的密码，传入后 `password` 失效 |
| countrycode | string | - | `86` | 国家码，例如美国传入 `1` |
| captcha | string | - | - | 验证码（通过 `/captcha/sent` 获取），传入后 `password` 失效 |

## 调用示例

### HTTP 请求

```bash
# 密码登录
GET /login/cellphone?phone=13800138000&password=your_password

# MD5 密码登录
GET /login/cellphone?phone=13800138000&md5_password=e10adc3949ba59abbe56e057f20f883e

# 验证码登录
GET /login/cellphone?phone=13800138000&captcha=1234
```

### 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()
const result = await api.login_cellphone({
  phone: '13800138000',
  password: 'your_password',
})
console.log(result.body)
```

## 返回说明

成功时返回用户信息和登录 Cookie：

```json
{
  "code": 200,
  "loginType": 1,
  "account": { "id": 123456, "userName": "..." },
  "profile": { "nickname": "...", "avatarUrl": "..." },
  "cookie": "MUSIC_U=xxx;..."
}
```

## 注意事项

- 不要频繁调用登录接口，否则可能触发风控
- 建议使用验证码登录或二维码登录，避免密码泄露风险
- 登录成功后返回的 `cookie` 字段可保存，后续请求通过 `cookie` 参数传入

```

### 5.2 指南文档内容来源

指南文档的内容从旧版 `home.md` 的通用说明部分提取并重写：

| 新文档 | 内容来源 | 说明 |
|--------|----------|------|
| `getting-started.md` | 旧版「安装」「运行」段落 | 用 Bun 命令重写，补充环境要求 |
| `authentication.md` | 旧版「登录」说明 + Cookie 传递机制 | 整合手机/邮箱/二维码/游客登录的完整认证流程 |
| `request-convention.md` | 旧版「调用前须知」 | 缓存策略、时间戳、Cookie、CORS、realIP、代理等 |
| `programmatic-api.md` | 旧版「Node.js 调用」「TypeScript」 | 用 hana-music-api 的新 API 重写示例 |

### 5.3 内容润色原则

1. **精简中文表述**：去除旧文档中的口语化表达，使用简洁准确的技术用语
2. **补充使用示例**：每个接口必须包含 HTTP 请求示例和编程式调用示例
3. **标注登录要求**：明确标注每个接口是否需要登录态
4. **参数表格化**：所有参数用表格展示，标注类型、必填、默认值
5. **核心内容不变**：接口地址、参数名、参数含义与旧版保持一致

---

## 六、与 Hono 服务集成

### 6.1 开发模式（推荐分离运行）

文档站点独立于 API 服务运行，互不干扰：

```bash
# 终端 1：API 服务
bun run dev

# 终端 2：文档站点
bun run docs:dev
```

VitePress 开发服务默认监听 `5173` 端口，API 服务监听 `3000` 端口。

### 6.2 生产模式（静态托管）

`bun run docs:build` 产物为纯静态 HTML，有两种部署方式：

**方式 A：由 Hono 服务托管（推荐简单场景）**

将构建产物复制到 `public/docs/`，由现有的静态资源中间件托管：

```bash
bun run docs:build
cp -r docs-site/.vitepress/dist/* public/docs/
```

此方式与旧版 Docsify 的访问路径保持一致：`http://localhost:3000/docs/`。

**方式 B：独立部署（推荐大规模场景）**

直接将 `docs-site/.vitepress/dist/` 部署到 Vercel / Netlify /  Cloudflare Pages 等静态托管平台。VitePress 官方文档对这些平台有完整的部署指南。

### 6.3 `src/server/static.ts` 无需改动

当前 `registerStaticRoutes()` 已经把 `public/` 目录通过 Hono 的 `serveStatic` 中间件暴露。VitePress 构建产物只要放入 `public/docs/`，就能自动被访问。

---

## 七、执行步骤（LLM 直接开工清单）

### Step 1：初始化 VitePress 项目骨架

**预计操作**：

1. 安装 VitePress：`bun add -D vitepress`
2. 在 `package.json` 中新增 `docs:dev`、`docs:build`、`docs:preview` 三个 script
3. 创建 `docs-site/` 目录结构：
   - `docs-site/.vitepress/config.ts`（按第四节的配置方案编写）
   - `docs-site/index.md`（首页 Hero）
   - `docs-site/guide/`（4 个指南文档，先写骨架）
   - `docs-site/api/`（按第三节的分组创建目录）
4. 运行 `bun run docs:dev` 验证站点能正常启动

**验收标准**：

- `bun run docs:dev` 能启动，浏览器可访问
- 首页显示 Hero 区块
- 侧边栏导航正常渲染
- 本地搜索功能可用

### Step 2：编写指南文档

**预计操作**：

1. 从旧版 `home.md` 提取通用说明内容
2. 按第 5.2 节的对应关系编写 4 个指南文档
3. 用 hana-music-api 的新 API 格式重写所有代码示例

**验收标准**：

- 4 个指南文档内容完整、语句通顺
- 代码示例使用 `hana-music-api` 的导出接口
- 无 Bun/TS 相关的事实性错误

### Step 3：编写高频接口文档（首批优先级接口）

**首批范围**（约 35 个高频接口）：

| 分组 | 接口数 | 优先接口 |
|------|--------|---------|
| 用户/登录 | ~10 | `login_cellphone`, `login`, `login_qr_*`, `register_anonimous`, `login_status`, `logout`, `user_detail`, `user_account` |
| 音乐 | ~8 | `song_detail`, `song_url`, `lyric`, `check_music`, `like`, `likelist`, `personal_fm`, `scrobble` |
| 搜索 | ~5 | `search`, `cloudsearch`, `search_hot_detail`, `search_suggest`, `search_default` |
| 歌单 | ~6 | `playlist_detail`, `playlist_track_all`, `playlist_create`, `playlist_tracks`, `top_playlist`, `user_playlist` |
| 推荐 | ~4 | `recommend_songs`, `personalized`, `banner`, `recommend_resource` |
| 评论 | ~2 | `comment_music`, `comment_new` |

**操作方式**：

1. 读取旧版 `home.md` 中对应接口的文档段落
2. 读取对应 `src/modules/*.ts` 源码，确认真实参数名、默认值、请求路径
3. 按第 5.1 节的模板编写每个接口文档
4. 如该模块在 `src/types/modules.ts` 中有显式 query 类型，直接以类型定义为参数依据

**验收标准**：

- 首批 35 个接口文档完成，每页结构一致
- 参数表格与 `src/modules/*.ts` 源码一致
- 侧边栏对应条目可正常导航

### Step 4：编写剩余接口文档

**操作方式**：

对 `src/modules/` 下剩余约 330 个模块，按分组批量编写。操作方式同 Step 3，可按以下顺序推进：

1. 专辑 → 歌手 → 排行榜 → 视频/MV
2. 电台/播客 → 社交/私信 → 云盘/上传
3. 一起听 → VIP/云贝 → 曲风 → UGC → 歌词摘录 → 其他

**验收标准**：

- 366 个模块每个都有对应的 `.md` 文件
- `bun run docs:build` 成功，无报错
- 全文搜索可搜到所有接口

### Step 5: 编写侧边栏自动生成脚本(可选)

由于接口数量庞大（366 个），手工维护 `config.ts` 中的 sidebar 配置容易遗漏。可编写一个脚本自动从 `docs-site/api/` 目录结构和文件 frontmatter 生成 sidebar 配置：

```ts
// scripts/generate-sidebar.ts
// 1. 扫描 docs-site/api/**/*.md
// 2. 从每个文件的 frontmatter 提取 title 和 order
// 3. 按目录结构生成 sidebar 对象
// 4. 写入 docs-site/.vitepress/sidebar-generated.ts
```

**验收标准**：

- `bun run scripts/generate-sidebar.ts` 可执行
- 生成的 sidebar 配置与手写版功能一致

### Step 6：构建验证与集成

1. `bun run docs:build` 确认零错误构建
2. `bun run docs:preview` 本地预览完整站点
3. 确认搜索、导航、移动端适配均正常
4. 选择部署方案（Hono 内嵌或独立部署），完成首次发布

---

## 八、分组映射表

以下是 `src/modules/` 下所有模块到文档分组的完整映射：

| 文档分组 | 模块文件（`_` 分隔） | 接口数量 |
|----------|---------------------|---------|
| `api/user/` | `activate_init_profile`, `avatar_upload`, `captcha_sent`, `captcha_verify`, `cellphone_existence_check`, `get_userids`, `login`, `login_cellphone`, `login_qr_check`, `login_qr_create`, `login_qr_key`, `login_refresh`, `login_status`, `logout`, `nickname_check`, `rebind`, `register_anonimous`, `register_cellphone`, `setting`, `user_account`, `user_binding`, `user_bindingcellphone`, `user_detail`, `user_detail_new`, `user_level`, `user_medal`, `user_replacephone`, `user_social_status`, `user_social_status_edit`, `user_social_status_rcmd`, `user_social_status_support`, `user_subcount`, `user_update` | ~33 |
| `api/music/` | `audio_match`, `check_music`, `fm_trash`, `like`, `likelist`, `lyric`, `lyric_new`, `personal_fm`, `personal_fm_mode`, `scrobble`, `song_chorus`, `song_detail`, `song_download_url`, `song_download_url_v1`, `song_downlist`, `song_dynamic_cover`, `song_like_check`, `song_monthdownlist`, `song_music_detail`, `song_order_update`, `song_purchased`, `song_red_count`, `song_singledownlist`, `song_url`, `song_url_v1`, `song_wiki_summary` | ~26 |
| `api/search/` | `cloudsearch`, `search`, `search_default`, `search_hot`, `search_hot_detail`, `search_match`, `search_multimatch`, `search_suggest` | 8 |
| `api/playlist/` | `playlist_catlist`, `playlist_category_list`, `playlist_cover_update`, `playlist_create`, `playlist_delete`, `playlist_desc_update`, `playlist_detail`, `playlist_detail_dynamic`, `playlist_detail_rcmd_get`, `playlist_highquality_tags`, `playlist_hot`, `playlist_import_name_task_create`, `playlist_import_task_status`, `playlist_mylike`, `playlist_name_update`, `playlist_order_update`, `playlist_privacy`, `playlist_subscribe`, `playlist_subscribers`, `playlist_tags_update`, `playlist_track_add`, `playlist_track_all`, `playlist_track_delete`, `playlist_tracks`, `playlist_update`, `playlist_update_playcount`, `playlist_video_recent`, `related_playlist`, `top_playlist`, `top_playlist_highquality`, `user_playlist`, `user_playlist_collect`, `user_playlist_create` | ~33 |
| `api/album/` | `album`, `album_detail`, `album_detail_dynamic`, `album_list`, `album_list_style`, `album_new`, `album_newest`, `album_privilege`, `album_songsaleboard`, `album_sub`, `album_sublist`, `digitalAlbum_detail`, `digitalAlbum_ordering`, `digitalAlbum_purchased`, `digitalAlbum_sales`, `top_album` | ~16 |
| `api/artist/` | `artist_album`, `artist_desc`, `artist_detail`, `artist_detail_dynamic`, `artist_fans`, `artist_follow_count`, `artist_list`, `artist_mv`, `artist_new_mv`, `artist_new_song`, `artist_songs`, `artist_sub`, `artist_sublist`, `artist_top_song`, `artist_video`, `artists`, `simi_artist`, `top_artists`, `toplist_artist` | ~19 |
| `api/comment/` | `comment`, `comment_album`, `comment_dj`, `comment_event`, `comment_floor`, `comment_hot`, `comment_hug_list`, `comment_like`, `comment_music`, `comment_mv`, `comment_new`, `comment_playlist`, `comment_video`, `hug_comment`, `starpick_comments_summary`, `user_comment_history` | ~16 |
| `api/recommend/` | `aidj_content_rcmd`, `banner`, `calendar`, `history_recommend_songs`, `history_recommend_songs_detail`, `homepage_block_page`, `homepage_dragon_ball`, `personalized`, `personalized_djprogram`, `personalized_mv`, `personalized_newsong`, `personalized_privatecontent`, `personalized_privatecontent_list`, `playmode_intelligence_list`, `playmode_song_vector`, `program_recommend`, `recommend_resource`, `recommend_songs`, `recommend_songs_dislike`, `simi_mv`, `simi_playlist`, `simi_song`, `simi_user` | ~23 |
| `api/toplist/` | `top_list`, `top_mv`, `top_song`, `toplist`, `toplist_detail`, `toplist_detail_v2` | 6 |
| `api/dj/` | `dj_banner`, `dj_catelist`, `dj_category_excludehot`, `dj_category_recommend`, `dj_detail`, `dj_difm_all_style_channel`, `dj_difm_channel_subscribe`, `dj_difm_channel_unsubscribe`, `dj_difm_playing_tracks_list`, `dj_difm_subscribe_channels_get`, `dj_hot`, `dj_paygift`, `dj_personalize_recommend`, `dj_program`, `dj_program_detail`, `dj_program_toplist`, `dj_program_toplist_hours`, `dj_radio_hot`, `dj_recommend`, `dj_recommend_type`, `dj_sub`, `dj_sublist`, `dj_subscriber`, `dj_today_perfered`, `dj_toplist`, `dj_toplist_hours`, `dj_toplist_newcomer`, `dj_toplist_pay`, `dj_toplist_popular`, `djRadio_top`, `user_audio`, `user_dj`, `voice_delete`, `voice_detail`, `voice_lyric`, `voicelist_detail`, `voicelist_list`, `voicelist_list_search`, `voicelist_search`, `voicelist_trans` | ~40 |
| `api/video/` | `mlog_music_rcmd`, `mlog_to_video`, `mlog_url`, `mv_all`, `mv_detail`, `mv_detail_info`, `mv_exclusive_rcmd`, `mv_first`, `mv_sub`, `mv_sublist`, `mv_url`, `related_allvideo`, `video_category_list`, `video_detail`, `video_detail_info`, `video_group`, `video_group_list`, `video_sub`, `video_timeline_all`, `video_timeline_recommend`, `video_url` | ~21 |
| `api/social/` | `event`, `event_del`, `event_forward`, `follow`, `hot_topic`, `msg_comments`, `msg_forwards`, `msg_notices`, `msg_private`, `msg_private_history`, `msg_recentcontact`, `resource_like`, `send_album`, `send_playlist`, `send_song`, `send_text`, `share_resource`, `topic_detail`, `topic_detail_event_hot`, `topic_sublist`, `user_event`, `user_follow_mixed`, `user_followeds`, `user_follows`, `user_mutualfollow_get` | ~25 |
| `api/cloud/` | `cloud`, `cloud_import`, `cloud_match`, `user_cloud`, `user_cloud_del`, `user_cloud_detail`, `voice_upload` | 7 |
| `api/listen/` | `listen_data_realtime_report`, `listen_data_report`, `listen_data_today_song`, `listen_data_total`, `listen_data_year_report`, `recent_listen_list`, `record_recent_album`, `record_recent_dj`, `record_recent_playlist`, `record_recent_song`, `record_recent_video`, `record_recent_voice`, `summary_annual`, `user_record` | ~14 |
| `api/together/` | `listentogether_accept`, `listentogether_end`, `listentogether_heatbeat`, `listentogether_play_command`, `listentogether_room_check`, `listentogether_room_create`, `listentogether_status`, `listentogether_sync_list_command`, `listentogether_sync_playlist_get` | 9 |
| `api/vip/` | `daily_signin`, `musician_cloudbean`, `musician_cloudbean_obtain`, `musician_data_overview`, `musician_play_trend`, `musician_sign`, `musician_tasks`, `musician_tasks_new`, `sign_happy_info`, `signin_progress`, `vip_growthpoint`, `vip_growthpoint_details`, `vip_growthpoint_get`, `vip_info`, `vip_info_v2`, `vip_tasks`, `vip_timemachine`, `yunbei`, `yunbei_expense`, `yunbei_info`, `yunbei_rcmd_song`, `yunbei_rcmd_song_history`, `yunbei_receipt`, `yunbei_sign`, `yunbei_task_finish`, `yunbei_tasks`, `yunbei_tasks_todo`, `yunbei_today` | ~28 |
| `api/style/` | `style_album`, `style_artist`, `style_detail`, `style_list`, `style_playlist`, `style_preference`, `style_song` | 7 |
| `api/ugc/` | `ugc_album_get`, `ugc_artist_get`, `ugc_artist_search`, `ugc_detail`, `ugc_mv_get`, `ugc_song_get`, `ugc_user_devote` | 7 |
| `api/lyrics-mark/` | `song_lyrics_mark`, `song_lyrics_mark_add`, `song_lyrics_mark_del`, `song_lyrics_mark_user_page` | 4 |
| `api/fanscenter/` | `fanscenter_basicinfo_age_get`, `fanscenter_basicinfo_gender_get`, `fanscenter_basicinfo_province_get`, `fanscenter_overview_get`, `fanscenter_trend_list` | 5 |
| `api/other/` | `api`, `batch`, `broadcast_category_region_get`, `broadcast_channel_collect_list`, `broadcast_channel_currentinfo`, `broadcast_channel_list`, `broadcast_sub`, `countries_code_list`, `creator_authinfo_get`, `eapi_decrypt`, `inner_version`, `music_first_listen_info`, `pl_count`, `sheet_list`, `sheet_preview`, `threshold_detail_get`, `verify_getQr`, `verify_qrcodestatus`, `weblog` | ~19 |

**合计**：366 个模块，20 个分组

---

## 九、首页设计（`index.md`）

```markdown
---
layout: home

hero:
  name: hana-music-api
  text: 网易云音乐 API
  tagline: Bun + TypeScript + Hono 驱动的现代化音乐 API 服务
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: API 参考
      link: /api/user/login-cellphone
    - theme: alt
      text: GitHub
      link: https://github.com/nonhana/hana-music-api

features:
  - icon: 🚀
    title: 极致性能
    details: Bun 运行时 + Hono 框架，冷启动极快，内存占用低
  - icon: 📦
    title: 366 个接口
    details: 完整覆盖网易云音乐全平台功能，持续更新
  - icon: 🔒
    title: 类型安全
    details: 全量 TypeScript，编程式调用享受完整类型推导
  - icon: 🔍
    title: 全文搜索
    details: 内置中文搜索，快速定位任意接口
---
```

---

## 十、约束与注意事项

1. **`docs-site/` 独立于 `docs/`**：`docs/` 是项目内部开发文档（architecture、migration-notes 等），`docs-site/` 是面向用户的公开文档站点，二者职责不同，不要混合
2. **不删除现有 `public/docs/`**：在新文档站点完全就绪之前，旧版 Docsify 文档保持可用作为备份
3. **模块私有文件不生成文档**：`_migration.ts`、`_module-inputs.ts`、`_voice-upload-xml.ts` 等以 `_` 开头的文件是内部辅助，不需要对应文档
4. **文档内容以源码为准**：当旧版 `home.md` 的描述与 `src/modules/*.ts` 实际实现不一致时，以源码为准
5. **渐进式完成**：不要求一次写完 366 个接口文档。按 Step 3 → Step 4 的顺序，先覆盖高频接口，再批量补齐长尾接口
6. **工程校验不受影响**：文档站点的增减不应影响 `bun test`、`bun run typecheck`、`bun run lint:full` 的结果。VitePress 相关文件天然不在 TypeScript 和 oxlint 的检查范围内

---

## 十一、验收里程碑

| 里程碑 | 内容 | 验收标准 |
|--------|------|---------|
| M1 | VitePress 骨架搭建完成 | `bun run docs:dev` 可运行，首页和空白侧边栏可见 |
| M2 | 指南文档 4 篇完成 | 指南页面内容完整，代码示例可理解 |
| M3 | 高频接口 35 篇完成 | 首批接口文档结构一致，参数与源码对应 |
| M4 | 全量接口 366 篇完成 | 每个模块有对应文档，`bun run docs:build` 零错误 |
| M5 | 发布就绪 | 全文搜索、移动端适配、部署方案验证完成 |
