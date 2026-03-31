export const apiNavLink = {
  "text": "API 参考",
  "link": "/api/user/login-cellphone"
} as const

export const apiSidebar = [
  {
    "text": "用户与登录",
    "collapsed": false,
    "items": [
      {
        "text": "手机登录",
        "link": "/api/user/login-cellphone"
      },
      {
        "text": "邮箱登录",
        "link": "/api/user/login"
      },
      {
        "text": "二维码 key 生成接口",
        "link": "/api/user/login-qr-key"
      },
      {
        "text": "二维码生成接口",
        "link": "/api/user/login-qr-create"
      },
      {
        "text": "二维码检测扫码状态接口",
        "link": "/api/user/login-qr-check"
      },
      {
        "text": "游客登录",
        "link": "/api/user/register-anonimous"
      },
      {
        "text": "刷新登录",
        "link": "/api/user/login-refresh"
      },
      {
        "text": "发送验证码",
        "link": "/api/user/captcha-sent"
      },
      {
        "text": "验证验证码",
        "link": "/api/user/captcha-verify"
      },
      {
        "text": "注册(修改密码)",
        "link": "/api/user/register-cellphone"
      },
      {
        "text": "检测手机号码是否已注册",
        "link": "/api/user/cellphone-existence-check"
      },
      {
        "text": "初始化昵称",
        "link": "/api/user/activate-init-profile"
      },
      {
        "text": "重复昵称检测",
        "link": "/api/user/nickname-check"
      },
      {
        "text": "更换绑定手机",
        "link": "/api/user/rebind"
      },
      {
        "text": "退出登录",
        "link": "/api/user/logout"
      },
      {
        "text": "登录状态",
        "link": "/api/user/login-status"
      },
      {
        "text": "获取用户详情",
        "link": "/api/user/user-detail"
      },
      {
        "text": "获取账号信息",
        "link": "/api/user/user-account"
      },
      {
        "text": "获取用户信息 , 歌单，收藏，mv, dj 数量",
        "link": "/api/user/user-subcount"
      },
      {
        "text": "获取用户等级信息",
        "link": "/api/user/user-level"
      },
      {
        "text": "获取用户绑定信息",
        "link": "/api/user/user-binding"
      },
      {
        "text": "用户绑定手机",
        "link": "/api/user/user-replacephone"
      },
      {
        "text": "更新用户信息",
        "link": "/api/user/user-update"
      },
      {
        "text": "更新头像",
        "link": "/api/user/avatar-upload"
      },
      {
        "text": "设置",
        "link": "/api/user/setting"
      },
      {
        "text": "根据nickname获取userid",
        "link": "/api/user/get-userids"
      },
      {
        "text": "用户徽章",
        "link": "/api/user/user-medal"
      },
      {
        "text": "用户状态",
        "link": "/api/user/user-social-status"
      },
      {
        "text": "用户状态 - 支持设置的状态",
        "link": "/api/user/user-social-status-support"
      },
      {
        "text": "用户状态 - 相同状态的用户",
        "link": "/api/user/user-social-status-rcmd"
      },
      {
        "text": "用户状态 - 编辑",
        "link": "/api/user/user-social-status-edit"
      },
      {
        "text": "user bindingcellphone",
        "link": "/api/user/user-bindingcellphone"
      },
      {
        "text": "user detail new",
        "link": "/api/user/user-detail-new"
      }
    ]
  },
  {
    "text": "歌曲与播放",
    "collapsed": false,
    "items": [
      {
        "text": "调整歌曲顺序",
        "link": "/api/music/song-order-update"
      },
      {
        "text": "获取音乐 url",
        "link": "/api/music/song-url"
      },
      {
        "text": "获取音乐 url - 新版",
        "link": "/api/music/song-url-v1"
      },
      {
        "text": "音乐是否可用",
        "link": "/api/music/check-music"
      },
      {
        "text": "获取歌词",
        "link": "/api/music/lyric"
      },
      {
        "text": "获取逐字歌词",
        "link": "/api/music/lyric-new"
      },
      {
        "text": "获取歌曲详情",
        "link": "/api/music/song-detail"
      },
      {
        "text": "私人 FM",
        "link": "/api/music/personal-fm"
      },
      {
        "text": "喜欢音乐",
        "link": "/api/music/like"
      },
      {
        "text": "喜欢音乐列表",
        "link": "/api/music/likelist"
      },
      {
        "text": "垃圾桶",
        "link": "/api/music/fm-trash"
      },
      {
        "text": "听歌打卡",
        "link": "/api/music/scrobble"
      },
      {
        "text": "已购单曲",
        "link": "/api/music/song-purchased"
      },
      {
        "text": "获取客户端歌曲下载 url",
        "link": "/api/music/song-download-url"
      },
      {
        "text": "音乐百科 - 简要信息",
        "link": "/api/music/song-wiki-summary"
      },
      {
        "text": "听歌识曲",
        "link": "/api/music/audio-match"
      },
      {
        "text": "歌曲音质详情",
        "link": "/api/music/song-music-detail"
      },
      {
        "text": "歌曲红心数量",
        "link": "/api/music/song-red-count"
      },
      {
        "text": "私人 FM 模式选择",
        "link": "/api/music/personal-fm-mode"
      },
      {
        "text": "获取客户端歌曲下载链接 - 新版",
        "link": "/api/music/song-download-url-v1"
      },
      {
        "text": "会员下载歌曲记录",
        "link": "/api/music/song-downlist"
      },
      {
        "text": "会员本月下载歌曲记录",
        "link": "/api/music/song-monthdownlist"
      },
      {
        "text": "已购买单曲",
        "link": "/api/music/song-singledownlist"
      },
      {
        "text": "歌曲是否喜爱",
        "link": "/api/music/song-like-check"
      },
      {
        "text": "歌曲动态封面",
        "link": "/api/music/song-dynamic-cover"
      },
      {
        "text": "副歌时间",
        "link": "/api/music/song-chorus"
      }
    ]
  },
  {
    "text": "搜索",
    "collapsed": false,
    "items": [
      {
        "text": "搜索",
        "link": "/api/search/search"
      },
      {
        "text": "云搜索",
        "link": "/api/search/cloudsearch"
      },
      {
        "text": "默认搜索关键词",
        "link": "/api/search/search-default"
      },
      {
        "text": "热搜列表(简略)",
        "link": "/api/search/search-hot"
      },
      {
        "text": "热搜列表(详细)",
        "link": "/api/search/search-hot-detail"
      },
      {
        "text": "搜索建议",
        "link": "/api/search/search-suggest"
      },
      {
        "text": "搜索多重匹配",
        "link": "/api/search/search-multimatch"
      },
      {
        "text": "本地歌曲文件匹配网易云歌曲信息",
        "link": "/api/search/search-match"
      }
    ]
  },
  {
    "text": "歌单",
    "collapsed": true,
    "items": [
      {
        "text": "获取用户歌单",
        "link": "/api/playlist/user-playlist"
      },
      {
        "text": "更新歌单",
        "link": "/api/playlist/playlist-update"
      },
      {
        "text": "更新歌单描述",
        "link": "/api/playlist/playlist-desc-update"
      },
      {
        "text": "更新歌单名",
        "link": "/api/playlist/playlist-name-update"
      },
      {
        "text": "更新歌单标签",
        "link": "/api/playlist/playlist-tags-update"
      },
      {
        "text": "歌单封面上传",
        "link": "/api/playlist/playlist-cover-update"
      },
      {
        "text": "调整歌单顺序",
        "link": "/api/playlist/playlist-order-update"
      },
      {
        "text": "歌单分类",
        "link": "/api/playlist/playlist-catlist"
      },
      {
        "text": "热门歌单分类",
        "link": "/api/playlist/playlist-hot"
      },
      {
        "text": "歌单 ( 网友精选碟 )",
        "link": "/api/playlist/top-playlist"
      },
      {
        "text": "精品歌单标签列表",
        "link": "/api/playlist/playlist-highquality-tags"
      },
      {
        "text": "获取精品歌单",
        "link": "/api/playlist/top-playlist-highquality"
      },
      {
        "text": "相关歌单",
        "link": "/api/playlist/related-playlist"
      },
      {
        "text": "获取歌单详情",
        "link": "/api/playlist/playlist-detail"
      },
      {
        "text": "获取歌单所有歌曲",
        "link": "/api/playlist/playlist-track-all"
      },
      {
        "text": "歌单详情动态",
        "link": "/api/playlist/playlist-detail-dynamic"
      },
      {
        "text": "歌单更新播放量",
        "link": "/api/playlist/playlist-update-playcount"
      },
      {
        "text": "新建歌单",
        "link": "/api/playlist/playlist-create"
      },
      {
        "text": "删除歌单",
        "link": "/api/playlist/playlist-delete"
      },
      {
        "text": "收藏/取消收藏歌单",
        "link": "/api/playlist/playlist-subscribe"
      },
      {
        "text": "歌单收藏者",
        "link": "/api/playlist/playlist-subscribers"
      },
      {
        "text": "对歌单添加或删除歌曲",
        "link": "/api/playlist/playlist-tracks"
      },
      {
        "text": "收藏视频到视频歌单",
        "link": "/api/playlist/playlist-track-add"
      },
      {
        "text": "删除视频歌单里的视频",
        "link": "/api/playlist/playlist-track-delete"
      },
      {
        "text": "最近播放的视频",
        "link": "/api/playlist/playlist-video-recent"
      },
      {
        "text": "获取点赞过的视频",
        "link": "/api/playlist/playlist-mylike"
      },
      {
        "text": "公开隐私歌单",
        "link": "/api/playlist/playlist-privacy"
      },
      {
        "text": "歌单导入 - 元数据/文字/链接导入",
        "link": "/api/playlist/playlist-import-name-task-create"
      },
      {
        "text": "歌单导入 - 任务状态",
        "link": "/api/playlist/playlist-import-task-status"
      },
      {
        "text": "相关歌单推荐",
        "link": "/api/playlist/playlist-detail-rcmd-get"
      },
      {
        "text": "用户的创建歌单列表",
        "link": "/api/playlist/user-playlist-create"
      },
      {
        "text": "用户的收藏歌单列表",
        "link": "/api/playlist/user-playlist-collect"
      },
      {
        "text": "playlist category list",
        "link": "/api/playlist/playlist-category-list"
      }
    ]
  },
  {
    "text": "专辑",
    "collapsed": true,
    "items": [
      {
        "text": "获取专辑内容",
        "link": "/api/album/album"
      },
      {
        "text": "专辑动态信息",
        "link": "/api/album/album-detail-dynamic"
      },
      {
        "text": "收藏/取消收藏专辑",
        "link": "/api/album/album-sub"
      },
      {
        "text": "获取已收藏专辑列表",
        "link": "/api/album/album-sublist"
      },
      {
        "text": "新碟上架",
        "link": "/api/album/top-album"
      },
      {
        "text": "全部新碟",
        "link": "/api/album/album-new"
      },
      {
        "text": "最新专辑",
        "link": "/api/album/album-newest"
      },
      {
        "text": "数字专辑-新碟上架",
        "link": "/api/album/album-list"
      },
      {
        "text": "数字专辑-语种风格馆",
        "link": "/api/album/album-list-style"
      },
      {
        "text": "数字专辑详情",
        "link": "/api/album/album-detail"
      },
      {
        "text": "我的数字专辑",
        "link": "/api/album/digital-album-purchased"
      },
      {
        "text": "购买数字专辑",
        "link": "/api/album/digital-album-ordering"
      },
      {
        "text": "数字专辑详情",
        "link": "/api/album/digital-album-detail"
      },
      {
        "text": "数字专辑销量",
        "link": "/api/album/digital-album-sales"
      },
      {
        "text": "获取专辑歌曲的音质",
        "link": "/api/album/album-privilege"
      },
      {
        "text": "album songsaleboard",
        "link": "/api/album/album-songsaleboard"
      }
    ]
  },
  {
    "text": "歌手",
    "collapsed": true,
    "items": [
      {
        "text": "歌手分类列表",
        "link": "/api/artist/artist-list"
      },
      {
        "text": "收藏/取消收藏歌手",
        "link": "/api/artist/artist-sub"
      },
      {
        "text": "歌手热门 50 首歌曲",
        "link": "/api/artist/artist-top-song"
      },
      {
        "text": "歌手全部歌曲",
        "link": "/api/artist/artist-songs"
      },
      {
        "text": "收藏的歌手列表",
        "link": "/api/artist/artist-sublist"
      },
      {
        "text": "获取歌手单曲",
        "link": "/api/artist/artists"
      },
      {
        "text": "获取歌手 mv",
        "link": "/api/artist/artist-mv"
      },
      {
        "text": "获取歌手专辑",
        "link": "/api/artist/artist-album"
      },
      {
        "text": "获取歌手描述",
        "link": "/api/artist/artist-desc"
      },
      {
        "text": "获取歌手详情",
        "link": "/api/artist/artist-detail"
      },
      {
        "text": "获取相似歌手",
        "link": "/api/artist/simi-artist"
      },
      {
        "text": "热门歌手",
        "link": "/api/artist/top-artists"
      },
      {
        "text": "歌手榜",
        "link": "/api/artist/toplist-artist"
      },
      {
        "text": "关注歌手新歌",
        "link": "/api/artist/artist-new-song"
      },
      {
        "text": "关注歌手新 MV",
        "link": "/api/artist/artist-new-mv"
      },
      {
        "text": "歌手粉丝",
        "link": "/api/artist/artist-fans"
      },
      {
        "text": "歌手粉丝数量",
        "link": "/api/artist/artist-follow-count"
      },
      {
        "text": "获取歌手视频",
        "link": "/api/artist/artist-video"
      },
      {
        "text": "歌手详情动态",
        "link": "/api/artist/artist-detail-dynamic"
      }
    ]
  },
  {
    "text": "评论",
    "collapsed": true,
    "items": [
      {
        "text": "获取用户历史评论",
        "link": "/api/comment/user-comment-history"
      },
      {
        "text": "获取动态评论",
        "link": "/api/comment/comment-event"
      },
      {
        "text": "歌曲评论",
        "link": "/api/comment/comment-music"
      },
      {
        "text": "楼层评论",
        "link": "/api/comment/comment-floor"
      },
      {
        "text": "专辑评论",
        "link": "/api/comment/comment-album"
      },
      {
        "text": "歌单评论",
        "link": "/api/comment/comment-playlist"
      },
      {
        "text": "mv 评论",
        "link": "/api/comment/comment-mv"
      },
      {
        "text": "电台节目评论",
        "link": "/api/comment/comment-dj"
      },
      {
        "text": "视频评论",
        "link": "/api/comment/comment-video"
      },
      {
        "text": "热门评论",
        "link": "/api/comment/comment-hot"
      },
      {
        "text": "新版评论接口",
        "link": "/api/comment/comment-new"
      },
      {
        "text": "给评论点赞",
        "link": "/api/comment/comment-like"
      },
      {
        "text": "抱一抱评论",
        "link": "/api/comment/hug-comment"
      },
      {
        "text": "评论抱一抱列表",
        "link": "/api/comment/comment-hug-list"
      },
      {
        "text": "发送/删除评论",
        "link": "/api/comment/comment"
      },
      {
        "text": "云村星评馆 - 简要评论",
        "link": "/api/comment/starpick-comments-summary"
      }
    ]
  },
  {
    "text": "推荐与发现",
    "collapsed": true,
    "items": [
      {
        "text": "心动模式/智能播放",
        "link": "/api/recommend/playmode-intelligence-list"
      },
      {
        "text": "首页-发现",
        "link": "/api/recommend/homepage-block-page"
      },
      {
        "text": "首页-发现-圆形图标入口列表",
        "link": "/api/recommend/homepage-dragon-ball"
      },
      {
        "text": "banner",
        "link": "/api/recommend/banner"
      },
      {
        "text": "获取相似歌单",
        "link": "/api/recommend/simi-playlist"
      },
      {
        "text": "相似 mv",
        "link": "/api/recommend/simi-mv"
      },
      {
        "text": "获取相似音乐",
        "link": "/api/recommend/simi-song"
      },
      {
        "text": "获取最近 5 个听了这首歌的用户",
        "link": "/api/recommend/simi-user"
      },
      {
        "text": "获取每日推荐歌单",
        "link": "/api/recommend/recommend-resource"
      },
      {
        "text": "获取每日推荐歌曲",
        "link": "/api/recommend/recommend-songs"
      },
      {
        "text": "每日推荐歌曲-不感兴趣",
        "link": "/api/recommend/recommend-songs-dislike"
      },
      {
        "text": "获取历史日推可用日期列表",
        "link": "/api/recommend/history-recommend-songs"
      },
      {
        "text": "获取历史日推详情数据",
        "link": "/api/recommend/history-recommend-songs-detail"
      },
      {
        "text": "推荐 mv",
        "link": "/api/recommend/personalized-mv"
      },
      {
        "text": "推荐歌单",
        "link": "/api/recommend/personalized"
      },
      {
        "text": "推荐新音乐",
        "link": "/api/recommend/personalized-newsong"
      },
      {
        "text": "推荐电台",
        "link": "/api/recommend/personalized-djprogram"
      },
      {
        "text": "推荐节目",
        "link": "/api/recommend/program-recommend"
      },
      {
        "text": "独家放送(入口列表)",
        "link": "/api/recommend/personalized-privatecontent"
      },
      {
        "text": "独家放送列表",
        "link": "/api/recommend/personalized-privatecontent-list"
      },
      {
        "text": "音乐日历",
        "link": "/api/recommend/calendar"
      },
      {
        "text": "私人 DJ",
        "link": "/api/recommend/aidj-content-rcmd"
      },
      {
        "text": "playmode song vector",
        "link": "/api/recommend/playmode-song-vector"
      }
    ]
  },
  {
    "text": "排行榜",
    "collapsed": true,
    "items": [
      {
        "text": "新歌速递",
        "link": "/api/toplist/top-song"
      },
      {
        "text": "mv 排行",
        "link": "/api/toplist/top-mv"
      },
      {
        "text": "所有榜单",
        "link": "/api/toplist/toplist"
      },
      {
        "text": "排行榜详情",
        "link": "/api/toplist/top-list"
      },
      {
        "text": "所有榜单内容摘要",
        "link": "/api/toplist/toplist-detail"
      },
      {
        "text": "toplist detail v2",
        "link": "/api/toplist/toplist-detail-v2"
      }
    ]
  },
  {
    "text": "电台与播客",
    "collapsed": true,
    "items": [
      {
        "text": "获取用户电台",
        "link": "/api/dj/user-dj"
      },
      {
        "text": "电台 banner",
        "link": "/api/dj/dj-banner"
      },
      {
        "text": "电台个性推荐",
        "link": "/api/dj/dj-personalize-recommend"
      },
      {
        "text": "电台订阅者列表",
        "link": "/api/dj/dj-subscriber"
      },
      {
        "text": "用户电台",
        "link": "/api/dj/user-audio"
      },
      {
        "text": "热门电台",
        "link": "/api/dj/dj-hot"
      },
      {
        "text": "电台 - 节目榜",
        "link": "/api/dj/dj-program-toplist"
      },
      {
        "text": "电台 - 付费精品",
        "link": "/api/dj/dj-toplist-pay"
      },
      {
        "text": "电台 - 24 小时节目榜",
        "link": "/api/dj/dj-program-toplist-hours"
      },
      {
        "text": "电台 - 24 小时主播榜",
        "link": "/api/dj/dj-toplist-hours"
      },
      {
        "text": "电台 - 主播新人榜",
        "link": "/api/dj/dj-toplist-newcomer"
      },
      {
        "text": "电台 - 最热主播榜",
        "link": "/api/dj/dj-toplist-popular"
      },
      {
        "text": "电台 - 新晋电台榜/热门电台榜",
        "link": "/api/dj/dj-toplist"
      },
      {
        "text": "电台 - 类别热门电台",
        "link": "/api/dj/dj-radio-hot"
      },
      {
        "text": "电台 - 推荐",
        "link": "/api/dj/dj-recommend"
      },
      {
        "text": "电台 - 分类",
        "link": "/api/dj/dj-catelist"
      },
      {
        "text": "电台 - 分类推荐",
        "link": "/api/dj/dj-recommend-type"
      },
      {
        "text": "电台 - 订阅",
        "link": "/api/dj/dj-sub"
      },
      {
        "text": "电台的订阅列表",
        "link": "/api/dj/dj-sublist"
      },
      {
        "text": "电台 - 付费精选",
        "link": "/api/dj/dj-paygift"
      },
      {
        "text": "电台 - 非热门类型",
        "link": "/api/dj/dj-category-excludehot"
      },
      {
        "text": "电台 - 推荐类型",
        "link": "/api/dj/dj-category-recommend"
      },
      {
        "text": "电台 - 今日优选",
        "link": "/api/dj/dj-today-perfered"
      },
      {
        "text": "电台 - 详情",
        "link": "/api/dj/dj-detail"
      },
      {
        "text": "电台 - 节目",
        "link": "/api/dj/dj-program"
      },
      {
        "text": "电台 - 节目详情",
        "link": "/api/dj/dj-program-detail"
      },
      {
        "text": "播客列表",
        "link": "/api/dj/voicelist-search"
      },
      {
        "text": "播客声音列表",
        "link": "/api/dj/voicelist-list"
      },
      {
        "text": "播客声音搜索",
        "link": "/api/dj/voicelist-list-search"
      },
      {
        "text": "播客声音详情",
        "link": "/api/dj/voice-detail"
      },
      {
        "text": "播客声音排序",
        "link": "/api/dj/voicelist-trans"
      },
      {
        "text": "播客列表详情",
        "link": "/api/dj/voicelist-detail"
      },
      {
        "text": "播客删除",
        "link": "/api/dj/voice-delete"
      },
      {
        "text": "播客上传声音",
        "link": "/api/dj/voice-upload"
      },
      {
        "text": "电台排行榜获取",
        "link": "/api/dj/dj-radio-top"
      },
      {
        "text": "获取声音歌词",
        "link": "/api/dj/voice-lyric"
      },
      {
        "text": "DIFM电台 - 分类",
        "link": "/api/dj/dj-difm-all-style-channel"
      },
      {
        "text": "DIFM电台 - 收藏列表",
        "link": "/api/dj/dj-difm-subscribe-channels-get"
      },
      {
        "text": "DIFM电台 - 收藏频道",
        "link": "/api/dj/dj-difm-channel-subscribe"
      },
      {
        "text": "DIFM电台 - 取消收藏频道",
        "link": "/api/dj/dj-difm-channel-unsubscribe"
      },
      {
        "text": "DIFM电台 - 播放列表",
        "link": "/api/dj/dj-difm-playing-tracks-list"
      }
    ]
  },
  {
    "text": "视频与 MV",
    "collapsed": true,
    "items": [
      {
        "text": "收藏视频",
        "link": "/api/video/video-sub"
      },
      {
        "text": "收藏/取消收藏 MV",
        "link": "/api/video/mv-sub"
      },
      {
        "text": "收藏的 MV 列表",
        "link": "/api/video/mv-sublist"
      },
      {
        "text": "全部 mv",
        "link": "/api/video/mv-all"
      },
      {
        "text": "最新 mv",
        "link": "/api/video/mv-first"
      },
      {
        "text": "网易出品 mv",
        "link": "/api/video/mv-exclusive-rcmd"
      },
      {
        "text": "获取 mv 数据",
        "link": "/api/video/mv-detail"
      },
      {
        "text": "获取 mv 点赞转发评论数数据",
        "link": "/api/video/mv-detail-info"
      },
      {
        "text": "mv 地址",
        "link": "/api/video/mv-url"
      },
      {
        "text": "获取视频标签列表",
        "link": "/api/video/video-group-list"
      },
      {
        "text": "获取视频分类列表",
        "link": "/api/video/video-category-list"
      },
      {
        "text": "获取视频标签/分类下的视频",
        "link": "/api/video/video-group"
      },
      {
        "text": "获取全部视频列表",
        "link": "/api/video/video-timeline-all"
      },
      {
        "text": "获取推荐视频",
        "link": "/api/video/video-timeline-recommend"
      },
      {
        "text": "相关视频",
        "link": "/api/video/related-allvideo"
      },
      {
        "text": "视频详情",
        "link": "/api/video/video-detail"
      },
      {
        "text": "获取视频点赞转发评论数数据",
        "link": "/api/video/video-detail-info"
      },
      {
        "text": "获取视频播放地址",
        "link": "/api/video/video-url"
      },
      {
        "text": "获取 mlog 播放地址",
        "link": "/api/video/mlog-url"
      },
      {
        "text": "将 mlog id 转为视频 id",
        "link": "/api/video/mlog-to-video"
      },
      {
        "text": "歌曲相关视频",
        "link": "/api/video/mlog-music-rcmd"
      }
    ]
  },
  {
    "text": "社交与消息",
    "collapsed": true,
    "items": [
      {
        "text": "获取用户关注列表",
        "link": "/api/social/user-follows"
      },
      {
        "text": "获取用户粉丝列表",
        "link": "/api/social/user-followeds"
      },
      {
        "text": "获取用户动态",
        "link": "/api/social/user-event"
      },
      {
        "text": "转发用户动态",
        "link": "/api/social/event-forward"
      },
      {
        "text": "删除用户动态",
        "link": "/api/social/event-del"
      },
      {
        "text": "分享文本、歌曲、歌单、mv、电台、电台节目到动态",
        "link": "/api/social/share-resource"
      },
      {
        "text": "关注/取消关注用户",
        "link": "/api/social/follow"
      },
      {
        "text": "获取热门话题",
        "link": "/api/social/hot-topic"
      },
      {
        "text": "获取话题详情",
        "link": "/api/social/topic-detail"
      },
      {
        "text": "获取话题详情热门动态",
        "link": "/api/social/topic-detail-event-hot"
      },
      {
        "text": "获取动态列表",
        "link": "/api/social/event"
      },
      {
        "text": "收藏的专栏",
        "link": "/api/social/topic-sublist"
      },
      {
        "text": "资源点赞( MV,电台,视频)",
        "link": "/api/social/resource-like"
      },
      {
        "text": "通知 - 私信",
        "link": "/api/social/msg-private"
      },
      {
        "text": "发送私信",
        "link": "/api/social/send-text"
      },
      {
        "text": "发送私信(带歌曲)",
        "link": "/api/social/send-song"
      },
      {
        "text": "发送私信(带专辑)",
        "link": "/api/social/send-album"
      },
      {
        "text": "发送私信(带歌单)",
        "link": "/api/social/send-playlist"
      },
      {
        "text": "最近联系人",
        "link": "/api/social/msg-recentcontact"
      },
      {
        "text": "私信内容",
        "link": "/api/social/msg-private-history"
      },
      {
        "text": "通知 - 评论",
        "link": "/api/social/msg-comments"
      },
      {
        "text": "通知 - @我",
        "link": "/api/social/msg-forwards"
      },
      {
        "text": "通知 - 通知",
        "link": "/api/social/msg-notices"
      },
      {
        "text": "当前账号关注的用户/歌手",
        "link": "/api/social/user-follow-mixed"
      },
      {
        "text": "用户是否互相关注",
        "link": "/api/social/user-mutualfollow-get"
      }
    ]
  },
  {
    "text": "云盘与上传",
    "collapsed": true,
    "items": [
      {
        "text": "云盘",
        "link": "/api/cloud/user-cloud"
      },
      {
        "text": "云盘数据详情",
        "link": "/api/cloud/user-cloud-detail"
      },
      {
        "text": "云盘歌曲删除",
        "link": "/api/cloud/user-cloud-del"
      },
      {
        "text": "云盘上传",
        "link": "/api/cloud/cloud"
      },
      {
        "text": "云盘歌曲信息匹配纠正",
        "link": "/api/cloud/cloud-match"
      },
      {
        "text": "云盘导入歌曲",
        "link": "/api/cloud/cloud-import"
      }
    ]
  },
  {
    "text": "听歌记录",
    "collapsed": true,
    "items": [
      {
        "text": "获取用户播放记录",
        "link": "/api/listen/user-record"
      },
      {
        "text": "最近播放-歌曲",
        "link": "/api/listen/record-recent-song"
      },
      {
        "text": "最近播放-视频",
        "link": "/api/listen/record-recent-video"
      },
      {
        "text": "最近播放-声音",
        "link": "/api/listen/record-recent-voice"
      },
      {
        "text": "最近播放-歌单",
        "link": "/api/listen/record-recent-playlist"
      },
      {
        "text": "最近播放-专辑",
        "link": "/api/listen/record-recent-album"
      },
      {
        "text": "最近播放-播客",
        "link": "/api/listen/record-recent-dj"
      },
      {
        "text": "年度听歌报告",
        "link": "/api/listen/summary-annual"
      },
      {
        "text": "最近听歌列表",
        "link": "/api/listen/recent-listen-list"
      },
      {
        "text": "听歌足迹 - 年度听歌足迹",
        "link": "/api/listen/listen-data-year-report"
      },
      {
        "text": "听歌足迹 - 今日收听",
        "link": "/api/listen/listen-data-today-song"
      },
      {
        "text": "听歌足迹 - 总收听时长",
        "link": "/api/listen/listen-data-total"
      },
      {
        "text": "听歌足迹 - 本周/本月收听时长",
        "link": "/api/listen/listen-data-realtime-report"
      },
      {
        "text": "听歌足迹 - 周/月/年收听报告",
        "link": "/api/listen/listen-data-report"
      }
    ]
  },
  {
    "text": "一起听",
    "collapsed": true,
    "items": [
      {
        "text": "listentogether accept",
        "link": "/api/together/listentogether-accept"
      },
      {
        "text": "listentogether end",
        "link": "/api/together/listentogether-end"
      },
      {
        "text": "listentogether heatbeat",
        "link": "/api/together/listentogether-heatbeat"
      },
      {
        "text": "listentogether play command",
        "link": "/api/together/listentogether-play-command"
      },
      {
        "text": "listentogether room check",
        "link": "/api/together/listentogether-room-check"
      },
      {
        "text": "listentogether room create",
        "link": "/api/together/listentogether-room-create"
      },
      {
        "text": "listentogether status",
        "link": "/api/together/listentogether-status"
      },
      {
        "text": "listentogether sync list command",
        "link": "/api/together/listentogether-sync-list-command"
      },
      {
        "text": "listentogether sync playlist get",
        "link": "/api/together/listentogether-sync-playlist-get"
      }
    ]
  },
  {
    "text": "会员与云贝",
    "collapsed": true,
    "items": [
      {
        "text": "签到",
        "link": "/api/vip/daily-signin"
      },
      {
        "text": "乐签信息",
        "link": "/api/vip/sign-happy-info"
      },
      {
        "text": "云贝",
        "link": "/api/vip/yunbei"
      },
      {
        "text": "云贝今日签到信息",
        "link": "/api/vip/yunbei-today"
      },
      {
        "text": "云贝签到",
        "link": "/api/vip/yunbei-sign"
      },
      {
        "text": "云贝账户信息",
        "link": "/api/vip/yunbei-info"
      },
      {
        "text": "云贝所有任务",
        "link": "/api/vip/yunbei-tasks"
      },
      {
        "text": "云贝 todo 任务",
        "link": "/api/vip/yunbei-tasks-todo"
      },
      {
        "text": "云贝完成任务",
        "link": "/api/vip/yunbei-task-finish"
      },
      {
        "text": "云贝推歌",
        "link": "/api/vip/yunbei-rcmd-song"
      },
      {
        "text": "云贝推歌历史记录",
        "link": "/api/vip/yunbei-rcmd-song-history"
      },
      {
        "text": "vip 成长值",
        "link": "/api/vip/vip-growthpoint"
      },
      {
        "text": "vip 成长值获取记录",
        "link": "/api/vip/vip-growthpoint-details"
      },
      {
        "text": "vip 任务",
        "link": "/api/vip/vip-tasks"
      },
      {
        "text": "领取 vip 成长值",
        "link": "/api/vip/vip-growthpoint-get"
      },
      {
        "text": "音乐人数据概况",
        "link": "/api/vip/musician-data-overview"
      },
      {
        "text": "音乐人播放趋势",
        "link": "/api/vip/musician-play-trend"
      },
      {
        "text": "音乐人任务",
        "link": "/api/vip/musician-tasks"
      },
      {
        "text": "音乐人任务(新)",
        "link": "/api/vip/musician-tasks-new"
      },
      {
        "text": "账号云豆数",
        "link": "/api/vip/musician-cloudbean"
      },
      {
        "text": "领取云豆",
        "link": "/api/vip/musician-cloudbean-obtain"
      },
      {
        "text": "获取 VIP 信息",
        "link": "/api/vip/vip-info"
      },
      {
        "text": "获取 VIP 信息(app端)",
        "link": "/api/vip/vip-info-v2"
      },
      {
        "text": "音乐人签到",
        "link": "/api/vip/musician-sign"
      },
      {
        "text": "签到进度",
        "link": "/api/vip/signin-progress"
      },
      {
        "text": "黑胶时光机",
        "link": "/api/vip/vip-timemachine"
      },
      {
        "text": "yunbei expense",
        "link": "/api/vip/yunbei-expense"
      },
      {
        "text": "yunbei receipt",
        "link": "/api/vip/yunbei-receipt"
      }
    ]
  },
  {
    "text": "曲风",
    "collapsed": true,
    "items": [
      {
        "text": "曲风列表",
        "link": "/api/style/style-list"
      },
      {
        "text": "曲风偏好",
        "link": "/api/style/style-preference"
      },
      {
        "text": "曲风详情",
        "link": "/api/style/style-detail"
      },
      {
        "text": "曲风-歌曲",
        "link": "/api/style/style-song"
      },
      {
        "text": "曲风-专辑",
        "link": "/api/style/style-album"
      },
      {
        "text": "曲风-歌单",
        "link": "/api/style/style-playlist"
      },
      {
        "text": "曲风-歌手",
        "link": "/api/style/style-artist"
      }
    ]
  },
  {
    "text": "百科与用户贡献",
    "collapsed": true,
    "items": [
      {
        "text": "专辑简要百科信息",
        "link": "/api/ugc/ugc-album-get"
      },
      {
        "text": "歌曲简要百科信息",
        "link": "/api/ugc/ugc-song-get"
      },
      {
        "text": "歌手简要百科信息",
        "link": "/api/ugc/ugc-artist-get"
      },
      {
        "text": "mv简要百科信息",
        "link": "/api/ugc/ugc-mv-get"
      },
      {
        "text": "搜索歌手",
        "link": "/api/ugc/ugc-artist-search"
      },
      {
        "text": "用户贡献内容",
        "link": "/api/ugc/ugc-detail"
      },
      {
        "text": "用户贡献条目、积分、云贝数量",
        "link": "/api/ugc/ugc-user-devote"
      }
    ]
  },
  {
    "text": "歌词摘录",
    "collapsed": true,
    "items": [
      {
        "text": "歌词摘录 - 歌词摘录信息",
        "link": "/api/lyrics-mark/song-lyrics-mark"
      },
      {
        "text": "歌词摘录 - 我的歌词本",
        "link": "/api/lyrics-mark/song-lyrics-mark-user-page"
      },
      {
        "text": "歌词摘录 - 添加/修改摘录歌词",
        "link": "/api/lyrics-mark/song-lyrics-mark-add"
      },
      {
        "text": "歌词摘录 - 删除摘录歌词",
        "link": "/api/lyrics-mark/song-lyrics-mark-del"
      }
    ]
  },
  {
    "text": "粉丝中心",
    "collapsed": true,
    "items": [
      {
        "text": "fanscenter basicinfo age get",
        "link": "/api/fanscenter/fanscenter-basicinfo-age-get"
      },
      {
        "text": "fanscenter basicinfo gender get",
        "link": "/api/fanscenter/fanscenter-basicinfo-gender-get"
      },
      {
        "text": "fanscenter basicinfo province get",
        "link": "/api/fanscenter/fanscenter-basicinfo-province-get"
      },
      {
        "text": "fanscenter overview get",
        "link": "/api/fanscenter/fanscenter-overview-get"
      },
      {
        "text": "fanscenter trend list",
        "link": "/api/fanscenter/fanscenter-trend-list"
      }
    ]
  },
  {
    "text": "其他工具",
    "collapsed": true,
    "items": [
      {
        "text": "私信和通知接口",
        "link": "/api/other/pl-count"
      },
      {
        "text": "国家编码列表",
        "link": "/api/other/countries-code-list"
      },
      {
        "text": "batch 批量请求接口",
        "link": "/api/other/batch"
      },
      {
        "text": "内部版本接口",
        "link": "/api/other/inner-version"
      },
      {
        "text": "乐谱列表",
        "link": "/api/other/sheet-list"
      },
      {
        "text": "乐谱内容",
        "link": "/api/other/sheet-preview"
      },
      {
        "text": "回忆坐标",
        "link": "/api/other/music-first-listen-info"
      },
      {
        "text": "验证接口 - 二维码生成",
        "link": "/api/other/verify-get-qr"
      },
      {
        "text": "验证接口 - 二维码检测",
        "link": "/api/other/verify-qrcodestatus"
      },
      {
        "text": "广播电台 - 分类/地区信息",
        "link": "/api/other/broadcast-category-region-get"
      },
      {
        "text": "广播电台 - 我的收藏",
        "link": "/api/other/broadcast-channel-collect-list"
      },
      {
        "text": "广播电台 - 电台信息",
        "link": "/api/other/broadcast-channel-currentinfo"
      },
      {
        "text": "广播电台 - 全部电台",
        "link": "/api/other/broadcast-channel-list"
      },
      {
        "text": "api",
        "link": "/api/other/api"
      },
      {
        "text": "broadcast sub",
        "link": "/api/other/broadcast-sub"
      },
      {
        "text": "creator authinfo get",
        "link": "/api/other/creator-authinfo-get"
      },
      {
        "text": "eapi decrypt",
        "link": "/api/other/eapi-decrypt"
      },
      {
        "text": "threshold detail get",
        "link": "/api/other/threshold-detail-get"
      },
      {
        "text": "weblog",
        "link": "/api/other/weblog"
      }
    ]
  }
] as const
