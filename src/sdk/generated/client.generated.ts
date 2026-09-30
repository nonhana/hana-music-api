import type {
  CreateHanaMusicApiConfig,
  SdkModuleInvoker,
} from '../../types/index.ts';
import {
  createEffectModuleInvoker,
  createSdkClientContext,
} from '../runtime.ts';
import { sdkModuleRegistry } from './registry.generated.ts';

export interface HanaMusicApiClient {
  activateInitProfile: SdkModuleInvoker<'activate_init_profile'>;
  aidjContentRcmd: SdkModuleInvoker<'aidj_content_rcmd'>;
  album: SdkModuleInvoker<'album'>;
  albumDetail: SdkModuleInvoker<'album_detail'>;
  albumDetailDynamic: SdkModuleInvoker<'album_detail_dynamic'>;
  albumList: SdkModuleInvoker<'album_list'>;
  albumListStyle: SdkModuleInvoker<'album_list_style'>;
  albumNew: SdkModuleInvoker<'album_new'>;
  albumNewest: SdkModuleInvoker<'album_newest'>;
  albumPrivilege: SdkModuleInvoker<'album_privilege'>;
  albumSongsaleboard: SdkModuleInvoker<'album_songsaleboard'>;
  albumSub: SdkModuleInvoker<'album_sub'>;
  albumSublist: SdkModuleInvoker<'album_sublist'>;
  artistAlbum: SdkModuleInvoker<'artist_album'>;
  artistDesc: SdkModuleInvoker<'artist_desc'>;
  artistDetail: SdkModuleInvoker<'artist_detail'>;
  artistDetailDynamic: SdkModuleInvoker<'artist_detail_dynamic'>;
  artistFans: SdkModuleInvoker<'artist_fans'>;
  artistFollowCount: SdkModuleInvoker<'artist_follow_count'>;
  artistList: SdkModuleInvoker<'artist_list'>;
  artistMv: SdkModuleInvoker<'artist_mv'>;
  artistNewMv: SdkModuleInvoker<'artist_new_mv'>;
  artistNewSong: SdkModuleInvoker<'artist_new_song'>;
  artistSongs: SdkModuleInvoker<'artist_songs'>;
  artistSub: SdkModuleInvoker<'artist_sub'>;
  artistSublist: SdkModuleInvoker<'artist_sublist'>;
  artistTopSong: SdkModuleInvoker<'artist_top_song'>;
  artistVideo: SdkModuleInvoker<'artist_video'>;
  artists: SdkModuleInvoker<'artists'>;
  audioMatch: SdkModuleInvoker<'audio_match'>;
  avatarUpload: SdkModuleInvoker<'avatar_upload'>;
  banner: SdkModuleInvoker<'banner'>;
  batch: SdkModuleInvoker<'batch'>;
  broadcastCategoryRegionGet: SdkModuleInvoker<'broadcast_category_region_get'>;
  broadcastChannelCollectList: SdkModuleInvoker<'broadcast_channel_collect_list'>;
  broadcastChannelCurrentinfo: SdkModuleInvoker<'broadcast_channel_currentinfo'>;
  broadcastChannelList: SdkModuleInvoker<'broadcast_channel_list'>;
  broadcastSub: SdkModuleInvoker<'broadcast_sub'>;
  calendar: SdkModuleInvoker<'calendar'>;
  captchaSent: SdkModuleInvoker<'captcha_sent'>;
  captchaVerify: SdkModuleInvoker<'captcha_verify'>;
  cellphoneExistenceCheck: SdkModuleInvoker<'cellphone_existence_check'>;
  checkMusic: SdkModuleInvoker<'check_music'>;
  cloud: SdkModuleInvoker<'cloud'>;
  cloudImport: SdkModuleInvoker<'cloud_import'>;
  cloudMatch: SdkModuleInvoker<'cloud_match'>;
  cloudsearch: SdkModuleInvoker<'cloudsearch'>;
  comment: SdkModuleInvoker<'comment'>;
  commentAlbum: SdkModuleInvoker<'comment_album'>;
  commentDj: SdkModuleInvoker<'comment_dj'>;
  commentEvent: SdkModuleInvoker<'comment_event'>;
  commentFloor: SdkModuleInvoker<'comment_floor'>;
  commentHot: SdkModuleInvoker<'comment_hot'>;
  commentHugList: SdkModuleInvoker<'comment_hug_list'>;
  commentLike: SdkModuleInvoker<'comment_like'>;
  commentMusic: SdkModuleInvoker<'comment_music'>;
  commentMv: SdkModuleInvoker<'comment_mv'>;
  commentNew: SdkModuleInvoker<'comment_new'>;
  commentPlaylist: SdkModuleInvoker<'comment_playlist'>;
  commentVideo: SdkModuleInvoker<'comment_video'>;
  countriesCodeList: SdkModuleInvoker<'countries_code_list'>;
  dailySignin: SdkModuleInvoker<'daily_signin'>;
  digitalAlbumDetail: SdkModuleInvoker<'digitalAlbum_detail'>;
  digitalAlbumOrdering: SdkModuleInvoker<'digitalAlbum_ordering'>;
  digitalAlbumPurchased: SdkModuleInvoker<'digitalAlbum_purchased'>;
  digitalAlbumSales: SdkModuleInvoker<'digitalAlbum_sales'>;
  djBanner: SdkModuleInvoker<'dj_banner'>;
  djCategoryExcludehot: SdkModuleInvoker<'dj_category_excludehot'>;
  djCategoryRecommend: SdkModuleInvoker<'dj_category_recommend'>;
  djCatelist: SdkModuleInvoker<'dj_catelist'>;
  djDetail: SdkModuleInvoker<'dj_detail'>;
  djDifmAllStyleChannel: SdkModuleInvoker<'dj_difm_all_style_channel'>;
  djDifmChannelSubscribe: SdkModuleInvoker<'dj_difm_channel_subscribe'>;
  djDifmChannelUnsubscribe: SdkModuleInvoker<'dj_difm_channel_unsubscribe'>;
  djDifmPlayingTracksList: SdkModuleInvoker<'dj_difm_playing_tracks_list'>;
  djDifmSubscribeChannelsGet: SdkModuleInvoker<'dj_difm_subscribe_channels_get'>;
  djHot: SdkModuleInvoker<'dj_hot'>;
  djPaygift: SdkModuleInvoker<'dj_paygift'>;
  djPersonalizeRecommend: SdkModuleInvoker<'dj_personalize_recommend'>;
  djProgram: SdkModuleInvoker<'dj_program'>;
  djProgramDetail: SdkModuleInvoker<'dj_program_detail'>;
  djProgramToplist: SdkModuleInvoker<'dj_program_toplist'>;
  djProgramToplistHours: SdkModuleInvoker<'dj_program_toplist_hours'>;
  djRadioHot: SdkModuleInvoker<'dj_radio_hot'>;
  djRecommend: SdkModuleInvoker<'dj_recommend'>;
  djRecommendType: SdkModuleInvoker<'dj_recommend_type'>;
  djSub: SdkModuleInvoker<'dj_sub'>;
  djSublist: SdkModuleInvoker<'dj_sublist'>;
  djSubscriber: SdkModuleInvoker<'dj_subscriber'>;
  djTodayPerfered: SdkModuleInvoker<'dj_today_perfered'>;
  djToplist: SdkModuleInvoker<'dj_toplist'>;
  djToplistHours: SdkModuleInvoker<'dj_toplist_hours'>;
  djToplistNewcomer: SdkModuleInvoker<'dj_toplist_newcomer'>;
  djToplistPay: SdkModuleInvoker<'dj_toplist_pay'>;
  djToplistPopular: SdkModuleInvoker<'dj_toplist_popular'>;
  djRadioTop: SdkModuleInvoker<'djRadio_top'>;
  event: SdkModuleInvoker<'event'>;
  eventDel: SdkModuleInvoker<'event_del'>;
  eventForward: SdkModuleInvoker<'event_forward'>;
  fmTrash: SdkModuleInvoker<'fm_trash'>;
  follow: SdkModuleInvoker<'follow'>;
  getUserids: SdkModuleInvoker<'get_userids'>;
  historyRecommendSongs: SdkModuleInvoker<'history_recommend_songs'>;
  historyRecommendSongsDetail: SdkModuleInvoker<'history_recommend_songs_detail'>;
  homepageBlockPage: SdkModuleInvoker<'homepage_block_page'>;
  homepageDragonBall: SdkModuleInvoker<'homepage_dragon_ball'>;
  hotTopic: SdkModuleInvoker<'hot_topic'>;
  hugComment: SdkModuleInvoker<'hug_comment'>;
  innerVersion: SdkModuleInvoker<'inner_version'>;
  like: SdkModuleInvoker<'like'>;
  likelist: SdkModuleInvoker<'likelist'>;
  listenDataRealtimeReport: SdkModuleInvoker<'listen_data_realtime_report'>;
  listenDataReport: SdkModuleInvoker<'listen_data_report'>;
  listenDataTodaySong: SdkModuleInvoker<'listen_data_today_song'>;
  listenDataTotal: SdkModuleInvoker<'listen_data_total'>;
  listenDataYearReport: SdkModuleInvoker<'listen_data_year_report'>;
  listentogetherAccept: SdkModuleInvoker<'listentogether_accept'>;
  listentogetherEnd: SdkModuleInvoker<'listentogether_end'>;
  listentogetherHeatbeat: SdkModuleInvoker<'listentogether_heatbeat'>;
  listentogetherPlayCommand: SdkModuleInvoker<'listentogether_play_command'>;
  listentogetherRoomCheck: SdkModuleInvoker<'listentogether_room_check'>;
  listentogetherRoomCreate: SdkModuleInvoker<'listentogether_room_create'>;
  listentogetherStatus: SdkModuleInvoker<'listentogether_status'>;
  listentogetherSyncListCommand: SdkModuleInvoker<'listentogether_sync_list_command'>;
  listentogetherSyncPlaylistGet: SdkModuleInvoker<'listentogether_sync_playlist_get'>;
  login: SdkModuleInvoker<'login'>;
  loginCellphone: SdkModuleInvoker<'login_cellphone'>;
  loginQrCheck: SdkModuleInvoker<'login_qr_check'>;
  loginQrCreate: SdkModuleInvoker<'login_qr_create'>;
  loginQrKey: SdkModuleInvoker<'login_qr_key'>;
  loginRefresh: SdkModuleInvoker<'login_refresh'>;
  loginStatus: SdkModuleInvoker<'login_status'>;
  logout: SdkModuleInvoker<'logout'>;
  lyric: SdkModuleInvoker<'lyric'>;
  lyricNew: SdkModuleInvoker<'lyric_new'>;
  mlogMusicRcmd: SdkModuleInvoker<'mlog_music_rcmd'>;
  mlogToVideo: SdkModuleInvoker<'mlog_to_video'>;
  mlogUrl: SdkModuleInvoker<'mlog_url'>;
  msgComments: SdkModuleInvoker<'msg_comments'>;
  msgForwards: SdkModuleInvoker<'msg_forwards'>;
  msgNotices: SdkModuleInvoker<'msg_notices'>;
  msgPrivate: SdkModuleInvoker<'msg_private'>;
  msgPrivateHistory: SdkModuleInvoker<'msg_private_history'>;
  msgRecentcontact: SdkModuleInvoker<'msg_recentcontact'>;
  musicFirstListenInfo: SdkModuleInvoker<'music_first_listen_info'>;
  musicianCloudbean: SdkModuleInvoker<'musician_cloudbean'>;
  musicianCloudbeanObtain: SdkModuleInvoker<'musician_cloudbean_obtain'>;
  musicianDataOverview: SdkModuleInvoker<'musician_data_overview'>;
  musicianPlayTrend: SdkModuleInvoker<'musician_play_trend'>;
  musicianSign: SdkModuleInvoker<'musician_sign'>;
  musicianTasks: SdkModuleInvoker<'musician_tasks'>;
  musicianTasksNew: SdkModuleInvoker<'musician_tasks_new'>;
  mvAll: SdkModuleInvoker<'mv_all'>;
  mvDetail: SdkModuleInvoker<'mv_detail'>;
  mvDetailInfo: SdkModuleInvoker<'mv_detail_info'>;
  mvExclusiveRcmd: SdkModuleInvoker<'mv_exclusive_rcmd'>;
  mvFirst: SdkModuleInvoker<'mv_first'>;
  mvSub: SdkModuleInvoker<'mv_sub'>;
  mvSublist: SdkModuleInvoker<'mv_sublist'>;
  mvUrl: SdkModuleInvoker<'mv_url'>;
  nicknameCheck: SdkModuleInvoker<'nickname_check'>;
  personalFm: SdkModuleInvoker<'personal_fm'>;
  personalFmMode: SdkModuleInvoker<'personal_fm_mode'>;
  personalized: SdkModuleInvoker<'personalized'>;
  personalizedDjprogram: SdkModuleInvoker<'personalized_djprogram'>;
  personalizedMv: SdkModuleInvoker<'personalized_mv'>;
  personalizedNewsong: SdkModuleInvoker<'personalized_newsong'>;
  personalizedPrivatecontent: SdkModuleInvoker<'personalized_privatecontent'>;
  personalizedPrivatecontentList: SdkModuleInvoker<'personalized_privatecontent_list'>;
  plCount: SdkModuleInvoker<'pl_count'>;
  playlistCatlist: SdkModuleInvoker<'playlist_catlist'>;
  playlistCoverUpdate: SdkModuleInvoker<'playlist_cover_update'>;
  playlistCreate: SdkModuleInvoker<'playlist_create'>;
  playlistDelete: SdkModuleInvoker<'playlist_delete'>;
  playlistDescUpdate: SdkModuleInvoker<'playlist_desc_update'>;
  playlistDetail: SdkModuleInvoker<'playlist_detail'>;
  playlistDetailDynamic: SdkModuleInvoker<'playlist_detail_dynamic'>;
  playlistDetailRcmdGet: SdkModuleInvoker<'playlist_detail_rcmd_get'>;
  playlistHighqualityTags: SdkModuleInvoker<'playlist_highquality_tags'>;
  playlistHot: SdkModuleInvoker<'playlist_hot'>;
  playlistImportNameTaskCreate: SdkModuleInvoker<'playlist_import_name_task_create'>;
  playlistImportTaskStatus: SdkModuleInvoker<'playlist_import_task_status'>;
  playlistMylike: SdkModuleInvoker<'playlist_mylike'>;
  playlistNameUpdate: SdkModuleInvoker<'playlist_name_update'>;
  playlistOrderUpdate: SdkModuleInvoker<'playlist_order_update'>;
  playlistPrivacy: SdkModuleInvoker<'playlist_privacy'>;
  playlistSubscribe: SdkModuleInvoker<'playlist_subscribe'>;
  playlistSubscribers: SdkModuleInvoker<'playlist_subscribers'>;
  playlistTagsUpdate: SdkModuleInvoker<'playlist_tags_update'>;
  playlistTrackAdd: SdkModuleInvoker<'playlist_track_add'>;
  playlistTrackAll: SdkModuleInvoker<'playlist_track_all'>;
  playlistTrackDelete: SdkModuleInvoker<'playlist_track_delete'>;
  playlistTracks: SdkModuleInvoker<'playlist_tracks'>;
  playlistUpdate: SdkModuleInvoker<'playlist_update'>;
  playlistUpdatePlaycount: SdkModuleInvoker<'playlist_update_playcount'>;
  playlistVideoRecent: SdkModuleInvoker<'playlist_video_recent'>;
  playmodeIntelligenceList: SdkModuleInvoker<'playmode_intelligence_list'>;
  programRecommend: SdkModuleInvoker<'program_recommend'>;
  rebind: SdkModuleInvoker<'rebind'>;
  recentListenList: SdkModuleInvoker<'recent_listen_list'>;
  recommendResource: SdkModuleInvoker<'recommend_resource'>;
  recommendSongs: SdkModuleInvoker<'recommend_songs'>;
  recommendSongsDislike: SdkModuleInvoker<'recommend_songs_dislike'>;
  recordRecentAlbum: SdkModuleInvoker<'record_recent_album'>;
  recordRecentDj: SdkModuleInvoker<'record_recent_dj'>;
  recordRecentPlaylist: SdkModuleInvoker<'record_recent_playlist'>;
  recordRecentSong: SdkModuleInvoker<'record_recent_song'>;
  recordRecentVideo: SdkModuleInvoker<'record_recent_video'>;
  recordRecentVoice: SdkModuleInvoker<'record_recent_voice'>;
  registerAnonimous: SdkModuleInvoker<'register_anonimous'>;
  registerCellphone: SdkModuleInvoker<'register_cellphone'>;
  relatedAllvideo: SdkModuleInvoker<'related_allvideo'>;
  relatedPlaylist: SdkModuleInvoker<'related_playlist'>;
  resourceLike: SdkModuleInvoker<'resource_like'>;
  scrobble: SdkModuleInvoker<'scrobble'>;
  search: SdkModuleInvoker<'search'>;
  searchDefault: SdkModuleInvoker<'search_default'>;
  searchHot: SdkModuleInvoker<'search_hot'>;
  searchHotDetail: SdkModuleInvoker<'search_hot_detail'>;
  searchMatch: SdkModuleInvoker<'search_match'>;
  searchMultimatch: SdkModuleInvoker<'search_multimatch'>;
  searchSuggest: SdkModuleInvoker<'search_suggest'>;
  sendAlbum: SdkModuleInvoker<'send_album'>;
  sendPlaylist: SdkModuleInvoker<'send_playlist'>;
  sendSong: SdkModuleInvoker<'send_song'>;
  sendText: SdkModuleInvoker<'send_text'>;
  setting: SdkModuleInvoker<'setting'>;
  shareResource: SdkModuleInvoker<'share_resource'>;
  sheetList: SdkModuleInvoker<'sheet_list'>;
  sheetPreview: SdkModuleInvoker<'sheet_preview'>;
  signHappyInfo: SdkModuleInvoker<'sign_happy_info'>;
  signinProgress: SdkModuleInvoker<'signin_progress'>;
  simiArtist: SdkModuleInvoker<'simi_artist'>;
  simiMv: SdkModuleInvoker<'simi_mv'>;
  simiPlaylist: SdkModuleInvoker<'simi_playlist'>;
  simiSong: SdkModuleInvoker<'simi_song'>;
  simiUser: SdkModuleInvoker<'simi_user'>;
  songChorus: SdkModuleInvoker<'song_chorus'>;
  songDetail: SdkModuleInvoker<'song_detail'>;
  songDownlist: SdkModuleInvoker<'song_downlist'>;
  songDownloadUrl: SdkModuleInvoker<'song_download_url'>;
  songDownloadUrlV1: SdkModuleInvoker<'song_download_url_v1'>;
  songDynamicCover: SdkModuleInvoker<'song_dynamic_cover'>;
  songLikeCheck: SdkModuleInvoker<'song_like_check'>;
  songLyricsMark: SdkModuleInvoker<'song_lyrics_mark'>;
  songLyricsMarkAdd: SdkModuleInvoker<'song_lyrics_mark_add'>;
  songLyricsMarkDel: SdkModuleInvoker<'song_lyrics_mark_del'>;
  songLyricsMarkUserPage: SdkModuleInvoker<'song_lyrics_mark_user_page'>;
  songMonthdownlist: SdkModuleInvoker<'song_monthdownlist'>;
  songMusicDetail: SdkModuleInvoker<'song_music_detail'>;
  songOrderUpdate: SdkModuleInvoker<'song_order_update'>;
  songPurchased: SdkModuleInvoker<'song_purchased'>;
  songRedCount: SdkModuleInvoker<'song_red_count'>;
  songSingledownlist: SdkModuleInvoker<'song_singledownlist'>;
  songUrl: SdkModuleInvoker<'song_url'>;
  songUrlV1: SdkModuleInvoker<'song_url_v1'>;
  songWikiSummary: SdkModuleInvoker<'song_wiki_summary'>;
  starpickCommentsSummary: SdkModuleInvoker<'starpick_comments_summary'>;
  styleAlbum: SdkModuleInvoker<'style_album'>;
  styleArtist: SdkModuleInvoker<'style_artist'>;
  styleDetail: SdkModuleInvoker<'style_detail'>;
  styleList: SdkModuleInvoker<'style_list'>;
  stylePlaylist: SdkModuleInvoker<'style_playlist'>;
  stylePreference: SdkModuleInvoker<'style_preference'>;
  styleSong: SdkModuleInvoker<'style_song'>;
  summaryAnnual: SdkModuleInvoker<'summary_annual'>;
  topAlbum: SdkModuleInvoker<'top_album'>;
  topArtists: SdkModuleInvoker<'top_artists'>;
  topList: SdkModuleInvoker<'top_list'>;
  topMv: SdkModuleInvoker<'top_mv'>;
  topPlaylist: SdkModuleInvoker<'top_playlist'>;
  topPlaylistHighquality: SdkModuleInvoker<'top_playlist_highquality'>;
  topSong: SdkModuleInvoker<'top_song'>;
  topicDetail: SdkModuleInvoker<'topic_detail'>;
  topicDetailEventHot: SdkModuleInvoker<'topic_detail_event_hot'>;
  topicSublist: SdkModuleInvoker<'topic_sublist'>;
  toplist: SdkModuleInvoker<'toplist'>;
  toplistArtist: SdkModuleInvoker<'toplist_artist'>;
  toplistDetail: SdkModuleInvoker<'toplist_detail'>;
  ugcAlbumGet: SdkModuleInvoker<'ugc_album_get'>;
  ugcArtistGet: SdkModuleInvoker<'ugc_artist_get'>;
  ugcArtistSearch: SdkModuleInvoker<'ugc_artist_search'>;
  ugcDetail: SdkModuleInvoker<'ugc_detail'>;
  ugcMvGet: SdkModuleInvoker<'ugc_mv_get'>;
  ugcSongGet: SdkModuleInvoker<'ugc_song_get'>;
  ugcUserDevote: SdkModuleInvoker<'ugc_user_devote'>;
  userAccount: SdkModuleInvoker<'user_account'>;
  userAudio: SdkModuleInvoker<'user_audio'>;
  userBinding: SdkModuleInvoker<'user_binding'>;
  userCloud: SdkModuleInvoker<'user_cloud'>;
  userCloudDel: SdkModuleInvoker<'user_cloud_del'>;
  userCloudDetail: SdkModuleInvoker<'user_cloud_detail'>;
  userCommentHistory: SdkModuleInvoker<'user_comment_history'>;
  userDetail: SdkModuleInvoker<'user_detail'>;
  userDj: SdkModuleInvoker<'user_dj'>;
  userEvent: SdkModuleInvoker<'user_event'>;
  userFollowMixed: SdkModuleInvoker<'user_follow_mixed'>;
  userFolloweds: SdkModuleInvoker<'user_followeds'>;
  userFollows: SdkModuleInvoker<'user_follows'>;
  userLevel: SdkModuleInvoker<'user_level'>;
  userMedal: SdkModuleInvoker<'user_medal'>;
  userMutualfollowGet: SdkModuleInvoker<'user_mutualfollow_get'>;
  userPlaylist: SdkModuleInvoker<'user_playlist'>;
  userPlaylistCollect: SdkModuleInvoker<'user_playlist_collect'>;
  userPlaylistCreate: SdkModuleInvoker<'user_playlist_create'>;
  userRecord: SdkModuleInvoker<'user_record'>;
  userReplacephone: SdkModuleInvoker<'user_replacephone'>;
  userSocialStatus: SdkModuleInvoker<'user_social_status'>;
  userSocialStatusEdit: SdkModuleInvoker<'user_social_status_edit'>;
  userSocialStatusRcmd: SdkModuleInvoker<'user_social_status_rcmd'>;
  userSocialStatusSupport: SdkModuleInvoker<'user_social_status_support'>;
  userSubcount: SdkModuleInvoker<'user_subcount'>;
  userUpdate: SdkModuleInvoker<'user_update'>;
  verifyGetQr: SdkModuleInvoker<'verify_getQr'>;
  verifyQrcodestatus: SdkModuleInvoker<'verify_qrcodestatus'>;
  videoCategoryList: SdkModuleInvoker<'video_category_list'>;
  videoDetail: SdkModuleInvoker<'video_detail'>;
  videoDetailInfo: SdkModuleInvoker<'video_detail_info'>;
  videoGroup: SdkModuleInvoker<'video_group'>;
  videoGroupList: SdkModuleInvoker<'video_group_list'>;
  videoSub: SdkModuleInvoker<'video_sub'>;
  videoTimelineAll: SdkModuleInvoker<'video_timeline_all'>;
  videoTimelineRecommend: SdkModuleInvoker<'video_timeline_recommend'>;
  videoUrl: SdkModuleInvoker<'video_url'>;
  vipGrowthpoint: SdkModuleInvoker<'vip_growthpoint'>;
  vipGrowthpointDetails: SdkModuleInvoker<'vip_growthpoint_details'>;
  vipGrowthpointGet: SdkModuleInvoker<'vip_growthpoint_get'>;
  vipInfo: SdkModuleInvoker<'vip_info'>;
  vipInfoV2: SdkModuleInvoker<'vip_info_v2'>;
  vipTasks: SdkModuleInvoker<'vip_tasks'>;
  vipTimemachine: SdkModuleInvoker<'vip_timemachine'>;
  voiceDelete: SdkModuleInvoker<'voice_delete'>;
  voiceDetail: SdkModuleInvoker<'voice_detail'>;
  voiceLyric: SdkModuleInvoker<'voice_lyric'>;
  voiceUpload: SdkModuleInvoker<'voice_upload'>;
  voicelistDetail: SdkModuleInvoker<'voicelist_detail'>;
  voicelistList: SdkModuleInvoker<'voicelist_list'>;
  voicelistListSearch: SdkModuleInvoker<'voicelist_list_search'>;
  voicelistSearch: SdkModuleInvoker<'voicelist_search'>;
  voicelistTrans: SdkModuleInvoker<'voicelist_trans'>;
  yunbei: SdkModuleInvoker<'yunbei'>;
  yunbeiExpense: SdkModuleInvoker<'yunbei_expense'>;
  yunbeiInfo: SdkModuleInvoker<'yunbei_info'>;
  yunbeiRcmdSong: SdkModuleInvoker<'yunbei_rcmd_song'>;
  yunbeiRcmdSongHistory: SdkModuleInvoker<'yunbei_rcmd_song_history'>;
  yunbeiReceipt: SdkModuleInvoker<'yunbei_receipt'>;
  yunbeiSign: SdkModuleInvoker<'yunbei_sign'>;
  yunbeiTaskFinish: SdkModuleInvoker<'yunbei_task_finish'>;
  yunbeiTasks: SdkModuleInvoker<'yunbei_tasks'>;
  yunbeiTasksTodo: SdkModuleInvoker<'yunbei_tasks_todo'>;
  yunbeiToday: SdkModuleInvoker<'yunbei_today'>;
}

export const activateInitProfile = createEffectModuleInvoker(
  'activate_init_profile',
  sdkModuleRegistry.activate_init_profile,
);
export const aidjContentRcmd = createEffectModuleInvoker(
  'aidj_content_rcmd',
  sdkModuleRegistry.aidj_content_rcmd,
);
export const album = createEffectModuleInvoker(
  'album',
  sdkModuleRegistry.album,
);
export const albumDetail = createEffectModuleInvoker(
  'album_detail',
  sdkModuleRegistry.album_detail,
);
export const albumDetailDynamic = createEffectModuleInvoker(
  'album_detail_dynamic',
  sdkModuleRegistry.album_detail_dynamic,
);
export const albumList = createEffectModuleInvoker(
  'album_list',
  sdkModuleRegistry.album_list,
);
export const albumListStyle = createEffectModuleInvoker(
  'album_list_style',
  sdkModuleRegistry.album_list_style,
);
export const albumNew = createEffectModuleInvoker(
  'album_new',
  sdkModuleRegistry.album_new,
);
export const albumNewest = createEffectModuleInvoker(
  'album_newest',
  sdkModuleRegistry.album_newest,
);
export const albumPrivilege = createEffectModuleInvoker(
  'album_privilege',
  sdkModuleRegistry.album_privilege,
);
export const albumSongsaleboard = createEffectModuleInvoker(
  'album_songsaleboard',
  sdkModuleRegistry.album_songsaleboard,
);
export const albumSub = createEffectModuleInvoker(
  'album_sub',
  sdkModuleRegistry.album_sub,
);
export const albumSublist = createEffectModuleInvoker(
  'album_sublist',
  sdkModuleRegistry.album_sublist,
);
export const artistAlbum = createEffectModuleInvoker(
  'artist_album',
  sdkModuleRegistry.artist_album,
);
export const artistDesc = createEffectModuleInvoker(
  'artist_desc',
  sdkModuleRegistry.artist_desc,
);
export const artistDetail = createEffectModuleInvoker(
  'artist_detail',
  sdkModuleRegistry.artist_detail,
);
export const artistDetailDynamic = createEffectModuleInvoker(
  'artist_detail_dynamic',
  sdkModuleRegistry.artist_detail_dynamic,
);
export const artistFans = createEffectModuleInvoker(
  'artist_fans',
  sdkModuleRegistry.artist_fans,
);
export const artistFollowCount = createEffectModuleInvoker(
  'artist_follow_count',
  sdkModuleRegistry.artist_follow_count,
);
export const artistList = createEffectModuleInvoker(
  'artist_list',
  sdkModuleRegistry.artist_list,
);
export const artistMv = createEffectModuleInvoker(
  'artist_mv',
  sdkModuleRegistry.artist_mv,
);
export const artistNewMv = createEffectModuleInvoker(
  'artist_new_mv',
  sdkModuleRegistry.artist_new_mv,
);
export const artistNewSong = createEffectModuleInvoker(
  'artist_new_song',
  sdkModuleRegistry.artist_new_song,
);
export const artistSongs = createEffectModuleInvoker(
  'artist_songs',
  sdkModuleRegistry.artist_songs,
);
export const artistSub = createEffectModuleInvoker(
  'artist_sub',
  sdkModuleRegistry.artist_sub,
);
export const artistSublist = createEffectModuleInvoker(
  'artist_sublist',
  sdkModuleRegistry.artist_sublist,
);
export const artistTopSong = createEffectModuleInvoker(
  'artist_top_song',
  sdkModuleRegistry.artist_top_song,
);
export const artistVideo = createEffectModuleInvoker(
  'artist_video',
  sdkModuleRegistry.artist_video,
);
export const artists = createEffectModuleInvoker(
  'artists',
  sdkModuleRegistry.artists,
);
export const audioMatch = createEffectModuleInvoker(
  'audio_match',
  sdkModuleRegistry.audio_match,
);
export const avatarUpload = createEffectModuleInvoker(
  'avatar_upload',
  sdkModuleRegistry.avatar_upload,
);
export const banner = createEffectModuleInvoker(
  'banner',
  sdkModuleRegistry.banner,
);
export const batch = createEffectModuleInvoker(
  'batch',
  sdkModuleRegistry.batch,
);
export const broadcastCategoryRegionGet = createEffectModuleInvoker(
  'broadcast_category_region_get',
  sdkModuleRegistry.broadcast_category_region_get,
);
export const broadcastChannelCollectList = createEffectModuleInvoker(
  'broadcast_channel_collect_list',
  sdkModuleRegistry.broadcast_channel_collect_list,
);
export const broadcastChannelCurrentinfo = createEffectModuleInvoker(
  'broadcast_channel_currentinfo',
  sdkModuleRegistry.broadcast_channel_currentinfo,
);
export const broadcastChannelList = createEffectModuleInvoker(
  'broadcast_channel_list',
  sdkModuleRegistry.broadcast_channel_list,
);
export const broadcastSub = createEffectModuleInvoker(
  'broadcast_sub',
  sdkModuleRegistry.broadcast_sub,
);
export const calendar = createEffectModuleInvoker(
  'calendar',
  sdkModuleRegistry.calendar,
);
export const captchaSent = createEffectModuleInvoker(
  'captcha_sent',
  sdkModuleRegistry.captcha_sent,
);
export const captchaVerify = createEffectModuleInvoker(
  'captcha_verify',
  sdkModuleRegistry.captcha_verify,
);
export const cellphoneExistenceCheck = createEffectModuleInvoker(
  'cellphone_existence_check',
  sdkModuleRegistry.cellphone_existence_check,
);
export const checkMusic = createEffectModuleInvoker(
  'check_music',
  sdkModuleRegistry.check_music,
);
export const cloud = createEffectModuleInvoker(
  'cloud',
  sdkModuleRegistry.cloud,
);
export const cloudImport = createEffectModuleInvoker(
  'cloud_import',
  sdkModuleRegistry.cloud_import,
);
export const cloudMatch = createEffectModuleInvoker(
  'cloud_match',
  sdkModuleRegistry.cloud_match,
);
export const cloudsearch = createEffectModuleInvoker(
  'cloudsearch',
  sdkModuleRegistry.cloudsearch,
);
export const comment = createEffectModuleInvoker(
  'comment',
  sdkModuleRegistry.comment,
);
export const commentAlbum = createEffectModuleInvoker(
  'comment_album',
  sdkModuleRegistry.comment_album,
);
export const commentDj = createEffectModuleInvoker(
  'comment_dj',
  sdkModuleRegistry.comment_dj,
);
export const commentEvent = createEffectModuleInvoker(
  'comment_event',
  sdkModuleRegistry.comment_event,
);
export const commentFloor = createEffectModuleInvoker(
  'comment_floor',
  sdkModuleRegistry.comment_floor,
);
export const commentHot = createEffectModuleInvoker(
  'comment_hot',
  sdkModuleRegistry.comment_hot,
);
export const commentHugList = createEffectModuleInvoker(
  'comment_hug_list',
  sdkModuleRegistry.comment_hug_list,
);
export const commentLike = createEffectModuleInvoker(
  'comment_like',
  sdkModuleRegistry.comment_like,
);
export const commentMusic = createEffectModuleInvoker(
  'comment_music',
  sdkModuleRegistry.comment_music,
);
export const commentMv = createEffectModuleInvoker(
  'comment_mv',
  sdkModuleRegistry.comment_mv,
);
export const commentNew = createEffectModuleInvoker(
  'comment_new',
  sdkModuleRegistry.comment_new,
);
export const commentPlaylist = createEffectModuleInvoker(
  'comment_playlist',
  sdkModuleRegistry.comment_playlist,
);
export const commentVideo = createEffectModuleInvoker(
  'comment_video',
  sdkModuleRegistry.comment_video,
);
export const countriesCodeList = createEffectModuleInvoker(
  'countries_code_list',
  sdkModuleRegistry.countries_code_list,
);
export const dailySignin = createEffectModuleInvoker(
  'daily_signin',
  sdkModuleRegistry.daily_signin,
);
export const digitalAlbumDetail = createEffectModuleInvoker(
  'digitalAlbum_detail',
  sdkModuleRegistry.digitalAlbum_detail,
);
export const digitalAlbumOrdering = createEffectModuleInvoker(
  'digitalAlbum_ordering',
  sdkModuleRegistry.digitalAlbum_ordering,
);
export const digitalAlbumPurchased = createEffectModuleInvoker(
  'digitalAlbum_purchased',
  sdkModuleRegistry.digitalAlbum_purchased,
);
export const digitalAlbumSales = createEffectModuleInvoker(
  'digitalAlbum_sales',
  sdkModuleRegistry.digitalAlbum_sales,
);
export const djBanner = createEffectModuleInvoker(
  'dj_banner',
  sdkModuleRegistry.dj_banner,
);
export const djCategoryExcludehot = createEffectModuleInvoker(
  'dj_category_excludehot',
  sdkModuleRegistry.dj_category_excludehot,
);
export const djCategoryRecommend = createEffectModuleInvoker(
  'dj_category_recommend',
  sdkModuleRegistry.dj_category_recommend,
);
export const djCatelist = createEffectModuleInvoker(
  'dj_catelist',
  sdkModuleRegistry.dj_catelist,
);
export const djDetail = createEffectModuleInvoker(
  'dj_detail',
  sdkModuleRegistry.dj_detail,
);
export const djDifmAllStyleChannel = createEffectModuleInvoker(
  'dj_difm_all_style_channel',
  sdkModuleRegistry.dj_difm_all_style_channel,
);
export const djDifmChannelSubscribe = createEffectModuleInvoker(
  'dj_difm_channel_subscribe',
  sdkModuleRegistry.dj_difm_channel_subscribe,
);
export const djDifmChannelUnsubscribe = createEffectModuleInvoker(
  'dj_difm_channel_unsubscribe',
  sdkModuleRegistry.dj_difm_channel_unsubscribe,
);
export const djDifmPlayingTracksList = createEffectModuleInvoker(
  'dj_difm_playing_tracks_list',
  sdkModuleRegistry.dj_difm_playing_tracks_list,
);
export const djDifmSubscribeChannelsGet = createEffectModuleInvoker(
  'dj_difm_subscribe_channels_get',
  sdkModuleRegistry.dj_difm_subscribe_channels_get,
);
export const djHot = createEffectModuleInvoker(
  'dj_hot',
  sdkModuleRegistry.dj_hot,
);
export const djPaygift = createEffectModuleInvoker(
  'dj_paygift',
  sdkModuleRegistry.dj_paygift,
);
export const djPersonalizeRecommend = createEffectModuleInvoker(
  'dj_personalize_recommend',
  sdkModuleRegistry.dj_personalize_recommend,
);
export const djProgram = createEffectModuleInvoker(
  'dj_program',
  sdkModuleRegistry.dj_program,
);
export const djProgramDetail = createEffectModuleInvoker(
  'dj_program_detail',
  sdkModuleRegistry.dj_program_detail,
);
export const djProgramToplist = createEffectModuleInvoker(
  'dj_program_toplist',
  sdkModuleRegistry.dj_program_toplist,
);
export const djProgramToplistHours = createEffectModuleInvoker(
  'dj_program_toplist_hours',
  sdkModuleRegistry.dj_program_toplist_hours,
);
export const djRadioHot = createEffectModuleInvoker(
  'dj_radio_hot',
  sdkModuleRegistry.dj_radio_hot,
);
export const djRecommend = createEffectModuleInvoker(
  'dj_recommend',
  sdkModuleRegistry.dj_recommend,
);
export const djRecommendType = createEffectModuleInvoker(
  'dj_recommend_type',
  sdkModuleRegistry.dj_recommend_type,
);
export const djSub = createEffectModuleInvoker(
  'dj_sub',
  sdkModuleRegistry.dj_sub,
);
export const djSublist = createEffectModuleInvoker(
  'dj_sublist',
  sdkModuleRegistry.dj_sublist,
);
export const djSubscriber = createEffectModuleInvoker(
  'dj_subscriber',
  sdkModuleRegistry.dj_subscriber,
);
export const djTodayPerfered = createEffectModuleInvoker(
  'dj_today_perfered',
  sdkModuleRegistry.dj_today_perfered,
);
export const djToplist = createEffectModuleInvoker(
  'dj_toplist',
  sdkModuleRegistry.dj_toplist,
);
export const djToplistHours = createEffectModuleInvoker(
  'dj_toplist_hours',
  sdkModuleRegistry.dj_toplist_hours,
);
export const djToplistNewcomer = createEffectModuleInvoker(
  'dj_toplist_newcomer',
  sdkModuleRegistry.dj_toplist_newcomer,
);
export const djToplistPay = createEffectModuleInvoker(
  'dj_toplist_pay',
  sdkModuleRegistry.dj_toplist_pay,
);
export const djToplistPopular = createEffectModuleInvoker(
  'dj_toplist_popular',
  sdkModuleRegistry.dj_toplist_popular,
);
export const djRadioTop = createEffectModuleInvoker(
  'djRadio_top',
  sdkModuleRegistry.djRadio_top,
);
export const event = createEffectModuleInvoker(
  'event',
  sdkModuleRegistry.event,
);
export const eventDel = createEffectModuleInvoker(
  'event_del',
  sdkModuleRegistry.event_del,
);
export const eventForward = createEffectModuleInvoker(
  'event_forward',
  sdkModuleRegistry.event_forward,
);
export const fmTrash = createEffectModuleInvoker(
  'fm_trash',
  sdkModuleRegistry.fm_trash,
);
export const follow = createEffectModuleInvoker(
  'follow',
  sdkModuleRegistry.follow,
);
export const getUserids = createEffectModuleInvoker(
  'get_userids',
  sdkModuleRegistry.get_userids,
);
export const historyRecommendSongs = createEffectModuleInvoker(
  'history_recommend_songs',
  sdkModuleRegistry.history_recommend_songs,
);
export const historyRecommendSongsDetail = createEffectModuleInvoker(
  'history_recommend_songs_detail',
  sdkModuleRegistry.history_recommend_songs_detail,
);
export const homepageBlockPage = createEffectModuleInvoker(
  'homepage_block_page',
  sdkModuleRegistry.homepage_block_page,
);
export const homepageDragonBall = createEffectModuleInvoker(
  'homepage_dragon_ball',
  sdkModuleRegistry.homepage_dragon_ball,
);
export const hotTopic = createEffectModuleInvoker(
  'hot_topic',
  sdkModuleRegistry.hot_topic,
);
export const hugComment = createEffectModuleInvoker(
  'hug_comment',
  sdkModuleRegistry.hug_comment,
);
export const innerVersion = createEffectModuleInvoker(
  'inner_version',
  sdkModuleRegistry.inner_version,
);
export const like = createEffectModuleInvoker('like', sdkModuleRegistry.like);
export const likelist = createEffectModuleInvoker(
  'likelist',
  sdkModuleRegistry.likelist,
);
export const listenDataRealtimeReport = createEffectModuleInvoker(
  'listen_data_realtime_report',
  sdkModuleRegistry.listen_data_realtime_report,
);
export const listenDataReport = createEffectModuleInvoker(
  'listen_data_report',
  sdkModuleRegistry.listen_data_report,
);
export const listenDataTodaySong = createEffectModuleInvoker(
  'listen_data_today_song',
  sdkModuleRegistry.listen_data_today_song,
);
export const listenDataTotal = createEffectModuleInvoker(
  'listen_data_total',
  sdkModuleRegistry.listen_data_total,
);
export const listenDataYearReport = createEffectModuleInvoker(
  'listen_data_year_report',
  sdkModuleRegistry.listen_data_year_report,
);
export const listentogetherAccept = createEffectModuleInvoker(
  'listentogether_accept',
  sdkModuleRegistry.listentogether_accept,
);
export const listentogetherEnd = createEffectModuleInvoker(
  'listentogether_end',
  sdkModuleRegistry.listentogether_end,
);
export const listentogetherHeatbeat = createEffectModuleInvoker(
  'listentogether_heatbeat',
  sdkModuleRegistry.listentogether_heatbeat,
);
export const listentogetherPlayCommand = createEffectModuleInvoker(
  'listentogether_play_command',
  sdkModuleRegistry.listentogether_play_command,
);
export const listentogetherRoomCheck = createEffectModuleInvoker(
  'listentogether_room_check',
  sdkModuleRegistry.listentogether_room_check,
);
export const listentogetherRoomCreate = createEffectModuleInvoker(
  'listentogether_room_create',
  sdkModuleRegistry.listentogether_room_create,
);
export const listentogetherStatus = createEffectModuleInvoker(
  'listentogether_status',
  sdkModuleRegistry.listentogether_status,
);
export const listentogetherSyncListCommand = createEffectModuleInvoker(
  'listentogether_sync_list_command',
  sdkModuleRegistry.listentogether_sync_list_command,
);
export const listentogetherSyncPlaylistGet = createEffectModuleInvoker(
  'listentogether_sync_playlist_get',
  sdkModuleRegistry.listentogether_sync_playlist_get,
);
export const login = createEffectModuleInvoker(
  'login',
  sdkModuleRegistry.login,
);
export const loginCellphone = createEffectModuleInvoker(
  'login_cellphone',
  sdkModuleRegistry.login_cellphone,
);
export const loginQrCheck = createEffectModuleInvoker(
  'login_qr_check',
  sdkModuleRegistry.login_qr_check,
);
export const loginQrCreate = createEffectModuleInvoker(
  'login_qr_create',
  sdkModuleRegistry.login_qr_create,
);
export const loginQrKey = createEffectModuleInvoker(
  'login_qr_key',
  sdkModuleRegistry.login_qr_key,
);
export const loginRefresh = createEffectModuleInvoker(
  'login_refresh',
  sdkModuleRegistry.login_refresh,
);
export const loginStatus = createEffectModuleInvoker(
  'login_status',
  sdkModuleRegistry.login_status,
);
export const logout = createEffectModuleInvoker(
  'logout',
  sdkModuleRegistry.logout,
);
export const lyric = createEffectModuleInvoker(
  'lyric',
  sdkModuleRegistry.lyric,
);
export const lyricNew = createEffectModuleInvoker(
  'lyric_new',
  sdkModuleRegistry.lyric_new,
);
export const mlogMusicRcmd = createEffectModuleInvoker(
  'mlog_music_rcmd',
  sdkModuleRegistry.mlog_music_rcmd,
);
export const mlogToVideo = createEffectModuleInvoker(
  'mlog_to_video',
  sdkModuleRegistry.mlog_to_video,
);
export const mlogUrl = createEffectModuleInvoker(
  'mlog_url',
  sdkModuleRegistry.mlog_url,
);
export const msgComments = createEffectModuleInvoker(
  'msg_comments',
  sdkModuleRegistry.msg_comments,
);
export const msgForwards = createEffectModuleInvoker(
  'msg_forwards',
  sdkModuleRegistry.msg_forwards,
);
export const msgNotices = createEffectModuleInvoker(
  'msg_notices',
  sdkModuleRegistry.msg_notices,
);
export const msgPrivate = createEffectModuleInvoker(
  'msg_private',
  sdkModuleRegistry.msg_private,
);
export const msgPrivateHistory = createEffectModuleInvoker(
  'msg_private_history',
  sdkModuleRegistry.msg_private_history,
);
export const msgRecentcontact = createEffectModuleInvoker(
  'msg_recentcontact',
  sdkModuleRegistry.msg_recentcontact,
);
export const musicFirstListenInfo = createEffectModuleInvoker(
  'music_first_listen_info',
  sdkModuleRegistry.music_first_listen_info,
);
export const musicianCloudbean = createEffectModuleInvoker(
  'musician_cloudbean',
  sdkModuleRegistry.musician_cloudbean,
);
export const musicianCloudbeanObtain = createEffectModuleInvoker(
  'musician_cloudbean_obtain',
  sdkModuleRegistry.musician_cloudbean_obtain,
);
export const musicianDataOverview = createEffectModuleInvoker(
  'musician_data_overview',
  sdkModuleRegistry.musician_data_overview,
);
export const musicianPlayTrend = createEffectModuleInvoker(
  'musician_play_trend',
  sdkModuleRegistry.musician_play_trend,
);
export const musicianSign = createEffectModuleInvoker(
  'musician_sign',
  sdkModuleRegistry.musician_sign,
);
export const musicianTasks = createEffectModuleInvoker(
  'musician_tasks',
  sdkModuleRegistry.musician_tasks,
);
export const musicianTasksNew = createEffectModuleInvoker(
  'musician_tasks_new',
  sdkModuleRegistry.musician_tasks_new,
);
export const mvAll = createEffectModuleInvoker(
  'mv_all',
  sdkModuleRegistry.mv_all,
);
export const mvDetail = createEffectModuleInvoker(
  'mv_detail',
  sdkModuleRegistry.mv_detail,
);
export const mvDetailInfo = createEffectModuleInvoker(
  'mv_detail_info',
  sdkModuleRegistry.mv_detail_info,
);
export const mvExclusiveRcmd = createEffectModuleInvoker(
  'mv_exclusive_rcmd',
  sdkModuleRegistry.mv_exclusive_rcmd,
);
export const mvFirst = createEffectModuleInvoker(
  'mv_first',
  sdkModuleRegistry.mv_first,
);
export const mvSub = createEffectModuleInvoker(
  'mv_sub',
  sdkModuleRegistry.mv_sub,
);
export const mvSublist = createEffectModuleInvoker(
  'mv_sublist',
  sdkModuleRegistry.mv_sublist,
);
export const mvUrl = createEffectModuleInvoker(
  'mv_url',
  sdkModuleRegistry.mv_url,
);
export const nicknameCheck = createEffectModuleInvoker(
  'nickname_check',
  sdkModuleRegistry.nickname_check,
);
export const personalFm = createEffectModuleInvoker(
  'personal_fm',
  sdkModuleRegistry.personal_fm,
);
export const personalFmMode = createEffectModuleInvoker(
  'personal_fm_mode',
  sdkModuleRegistry.personal_fm_mode,
);
export const personalized = createEffectModuleInvoker(
  'personalized',
  sdkModuleRegistry.personalized,
);
export const personalizedDjprogram = createEffectModuleInvoker(
  'personalized_djprogram',
  sdkModuleRegistry.personalized_djprogram,
);
export const personalizedMv = createEffectModuleInvoker(
  'personalized_mv',
  sdkModuleRegistry.personalized_mv,
);
export const personalizedNewsong = createEffectModuleInvoker(
  'personalized_newsong',
  sdkModuleRegistry.personalized_newsong,
);
export const personalizedPrivatecontent = createEffectModuleInvoker(
  'personalized_privatecontent',
  sdkModuleRegistry.personalized_privatecontent,
);
export const personalizedPrivatecontentList = createEffectModuleInvoker(
  'personalized_privatecontent_list',
  sdkModuleRegistry.personalized_privatecontent_list,
);
export const plCount = createEffectModuleInvoker(
  'pl_count',
  sdkModuleRegistry.pl_count,
);
export const playlistCatlist = createEffectModuleInvoker(
  'playlist_catlist',
  sdkModuleRegistry.playlist_catlist,
);
export const playlistCoverUpdate = createEffectModuleInvoker(
  'playlist_cover_update',
  sdkModuleRegistry.playlist_cover_update,
);
export const playlistCreate = createEffectModuleInvoker(
  'playlist_create',
  sdkModuleRegistry.playlist_create,
);
export const playlistDelete = createEffectModuleInvoker(
  'playlist_delete',
  sdkModuleRegistry.playlist_delete,
);
export const playlistDescUpdate = createEffectModuleInvoker(
  'playlist_desc_update',
  sdkModuleRegistry.playlist_desc_update,
);
export const playlistDetail = createEffectModuleInvoker(
  'playlist_detail',
  sdkModuleRegistry.playlist_detail,
);
export const playlistDetailDynamic = createEffectModuleInvoker(
  'playlist_detail_dynamic',
  sdkModuleRegistry.playlist_detail_dynamic,
);
export const playlistDetailRcmdGet = createEffectModuleInvoker(
  'playlist_detail_rcmd_get',
  sdkModuleRegistry.playlist_detail_rcmd_get,
);
export const playlistHighqualityTags = createEffectModuleInvoker(
  'playlist_highquality_tags',
  sdkModuleRegistry.playlist_highquality_tags,
);
export const playlistHot = createEffectModuleInvoker(
  'playlist_hot',
  sdkModuleRegistry.playlist_hot,
);
export const playlistImportNameTaskCreate = createEffectModuleInvoker(
  'playlist_import_name_task_create',
  sdkModuleRegistry.playlist_import_name_task_create,
);
export const playlistImportTaskStatus = createEffectModuleInvoker(
  'playlist_import_task_status',
  sdkModuleRegistry.playlist_import_task_status,
);
export const playlistMylike = createEffectModuleInvoker(
  'playlist_mylike',
  sdkModuleRegistry.playlist_mylike,
);
export const playlistNameUpdate = createEffectModuleInvoker(
  'playlist_name_update',
  sdkModuleRegistry.playlist_name_update,
);
export const playlistOrderUpdate = createEffectModuleInvoker(
  'playlist_order_update',
  sdkModuleRegistry.playlist_order_update,
);
export const playlistPrivacy = createEffectModuleInvoker(
  'playlist_privacy',
  sdkModuleRegistry.playlist_privacy,
);
export const playlistSubscribe = createEffectModuleInvoker(
  'playlist_subscribe',
  sdkModuleRegistry.playlist_subscribe,
);
export const playlistSubscribers = createEffectModuleInvoker(
  'playlist_subscribers',
  sdkModuleRegistry.playlist_subscribers,
);
export const playlistTagsUpdate = createEffectModuleInvoker(
  'playlist_tags_update',
  sdkModuleRegistry.playlist_tags_update,
);
export const playlistTrackAdd = createEffectModuleInvoker(
  'playlist_track_add',
  sdkModuleRegistry.playlist_track_add,
);
export const playlistTrackAll = createEffectModuleInvoker(
  'playlist_track_all',
  sdkModuleRegistry.playlist_track_all,
);
export const playlistTrackDelete = createEffectModuleInvoker(
  'playlist_track_delete',
  sdkModuleRegistry.playlist_track_delete,
);
export const playlistTracks = createEffectModuleInvoker(
  'playlist_tracks',
  sdkModuleRegistry.playlist_tracks,
);
export const playlistUpdate = createEffectModuleInvoker(
  'playlist_update',
  sdkModuleRegistry.playlist_update,
);
export const playlistUpdatePlaycount = createEffectModuleInvoker(
  'playlist_update_playcount',
  sdkModuleRegistry.playlist_update_playcount,
);
export const playlistVideoRecent = createEffectModuleInvoker(
  'playlist_video_recent',
  sdkModuleRegistry.playlist_video_recent,
);
export const playmodeIntelligenceList = createEffectModuleInvoker(
  'playmode_intelligence_list',
  sdkModuleRegistry.playmode_intelligence_list,
);
export const programRecommend = createEffectModuleInvoker(
  'program_recommend',
  sdkModuleRegistry.program_recommend,
);
export const rebind = createEffectModuleInvoker(
  'rebind',
  sdkModuleRegistry.rebind,
);
export const recentListenList = createEffectModuleInvoker(
  'recent_listen_list',
  sdkModuleRegistry.recent_listen_list,
);
export const recommendResource = createEffectModuleInvoker(
  'recommend_resource',
  sdkModuleRegistry.recommend_resource,
);
export const recommendSongs = createEffectModuleInvoker(
  'recommend_songs',
  sdkModuleRegistry.recommend_songs,
);
export const recommendSongsDislike = createEffectModuleInvoker(
  'recommend_songs_dislike',
  sdkModuleRegistry.recommend_songs_dislike,
);
export const recordRecentAlbum = createEffectModuleInvoker(
  'record_recent_album',
  sdkModuleRegistry.record_recent_album,
);
export const recordRecentDj = createEffectModuleInvoker(
  'record_recent_dj',
  sdkModuleRegistry.record_recent_dj,
);
export const recordRecentPlaylist = createEffectModuleInvoker(
  'record_recent_playlist',
  sdkModuleRegistry.record_recent_playlist,
);
export const recordRecentSong = createEffectModuleInvoker(
  'record_recent_song',
  sdkModuleRegistry.record_recent_song,
);
export const recordRecentVideo = createEffectModuleInvoker(
  'record_recent_video',
  sdkModuleRegistry.record_recent_video,
);
export const recordRecentVoice = createEffectModuleInvoker(
  'record_recent_voice',
  sdkModuleRegistry.record_recent_voice,
);
export const registerAnonimous = createEffectModuleInvoker(
  'register_anonimous',
  sdkModuleRegistry.register_anonimous,
);
export const registerCellphone = createEffectModuleInvoker(
  'register_cellphone',
  sdkModuleRegistry.register_cellphone,
);
export const relatedAllvideo = createEffectModuleInvoker(
  'related_allvideo',
  sdkModuleRegistry.related_allvideo,
);
export const relatedPlaylist = createEffectModuleInvoker(
  'related_playlist',
  sdkModuleRegistry.related_playlist,
);
export const resourceLike = createEffectModuleInvoker(
  'resource_like',
  sdkModuleRegistry.resource_like,
);
export const scrobble = createEffectModuleInvoker(
  'scrobble',
  sdkModuleRegistry.scrobble,
);
export const search = createEffectModuleInvoker(
  'search',
  sdkModuleRegistry.search,
);
export const searchDefault = createEffectModuleInvoker(
  'search_default',
  sdkModuleRegistry.search_default,
);
export const searchHot = createEffectModuleInvoker(
  'search_hot',
  sdkModuleRegistry.search_hot,
);
export const searchHotDetail = createEffectModuleInvoker(
  'search_hot_detail',
  sdkModuleRegistry.search_hot_detail,
);
export const searchMatch = createEffectModuleInvoker(
  'search_match',
  sdkModuleRegistry.search_match,
);
export const searchMultimatch = createEffectModuleInvoker(
  'search_multimatch',
  sdkModuleRegistry.search_multimatch,
);
export const searchSuggest = createEffectModuleInvoker(
  'search_suggest',
  sdkModuleRegistry.search_suggest,
);
export const sendAlbum = createEffectModuleInvoker(
  'send_album',
  sdkModuleRegistry.send_album,
);
export const sendPlaylist = createEffectModuleInvoker(
  'send_playlist',
  sdkModuleRegistry.send_playlist,
);
export const sendSong = createEffectModuleInvoker(
  'send_song',
  sdkModuleRegistry.send_song,
);
export const sendText = createEffectModuleInvoker(
  'send_text',
  sdkModuleRegistry.send_text,
);
export const setting = createEffectModuleInvoker(
  'setting',
  sdkModuleRegistry.setting,
);
export const shareResource = createEffectModuleInvoker(
  'share_resource',
  sdkModuleRegistry.share_resource,
);
export const sheetList = createEffectModuleInvoker(
  'sheet_list',
  sdkModuleRegistry.sheet_list,
);
export const sheetPreview = createEffectModuleInvoker(
  'sheet_preview',
  sdkModuleRegistry.sheet_preview,
);
export const signHappyInfo = createEffectModuleInvoker(
  'sign_happy_info',
  sdkModuleRegistry.sign_happy_info,
);
export const signinProgress = createEffectModuleInvoker(
  'signin_progress',
  sdkModuleRegistry.signin_progress,
);
export const simiArtist = createEffectModuleInvoker(
  'simi_artist',
  sdkModuleRegistry.simi_artist,
);
export const simiMv = createEffectModuleInvoker(
  'simi_mv',
  sdkModuleRegistry.simi_mv,
);
export const simiPlaylist = createEffectModuleInvoker(
  'simi_playlist',
  sdkModuleRegistry.simi_playlist,
);
export const simiSong = createEffectModuleInvoker(
  'simi_song',
  sdkModuleRegistry.simi_song,
);
export const simiUser = createEffectModuleInvoker(
  'simi_user',
  sdkModuleRegistry.simi_user,
);
export const songChorus = createEffectModuleInvoker(
  'song_chorus',
  sdkModuleRegistry.song_chorus,
);
export const songDetail = createEffectModuleInvoker(
  'song_detail',
  sdkModuleRegistry.song_detail,
);
export const songDownlist = createEffectModuleInvoker(
  'song_downlist',
  sdkModuleRegistry.song_downlist,
);
export const songDownloadUrl = createEffectModuleInvoker(
  'song_download_url',
  sdkModuleRegistry.song_download_url,
);
export const songDownloadUrlV1 = createEffectModuleInvoker(
  'song_download_url_v1',
  sdkModuleRegistry.song_download_url_v1,
);
export const songDynamicCover = createEffectModuleInvoker(
  'song_dynamic_cover',
  sdkModuleRegistry.song_dynamic_cover,
);
export const songLikeCheck = createEffectModuleInvoker(
  'song_like_check',
  sdkModuleRegistry.song_like_check,
);
export const songLyricsMark = createEffectModuleInvoker(
  'song_lyrics_mark',
  sdkModuleRegistry.song_lyrics_mark,
);
export const songLyricsMarkAdd = createEffectModuleInvoker(
  'song_lyrics_mark_add',
  sdkModuleRegistry.song_lyrics_mark_add,
);
export const songLyricsMarkDel = createEffectModuleInvoker(
  'song_lyrics_mark_del',
  sdkModuleRegistry.song_lyrics_mark_del,
);
export const songLyricsMarkUserPage = createEffectModuleInvoker(
  'song_lyrics_mark_user_page',
  sdkModuleRegistry.song_lyrics_mark_user_page,
);
export const songMonthdownlist = createEffectModuleInvoker(
  'song_monthdownlist',
  sdkModuleRegistry.song_monthdownlist,
);
export const songMusicDetail = createEffectModuleInvoker(
  'song_music_detail',
  sdkModuleRegistry.song_music_detail,
);
export const songOrderUpdate = createEffectModuleInvoker(
  'song_order_update',
  sdkModuleRegistry.song_order_update,
);
export const songPurchased = createEffectModuleInvoker(
  'song_purchased',
  sdkModuleRegistry.song_purchased,
);
export const songRedCount = createEffectModuleInvoker(
  'song_red_count',
  sdkModuleRegistry.song_red_count,
);
export const songSingledownlist = createEffectModuleInvoker(
  'song_singledownlist',
  sdkModuleRegistry.song_singledownlist,
);
export const songUrl = createEffectModuleInvoker(
  'song_url',
  sdkModuleRegistry.song_url,
);
export const songUrlV1 = createEffectModuleInvoker(
  'song_url_v1',
  sdkModuleRegistry.song_url_v1,
);
export const songWikiSummary = createEffectModuleInvoker(
  'song_wiki_summary',
  sdkModuleRegistry.song_wiki_summary,
);
export const starpickCommentsSummary = createEffectModuleInvoker(
  'starpick_comments_summary',
  sdkModuleRegistry.starpick_comments_summary,
);
export const styleAlbum = createEffectModuleInvoker(
  'style_album',
  sdkModuleRegistry.style_album,
);
export const styleArtist = createEffectModuleInvoker(
  'style_artist',
  sdkModuleRegistry.style_artist,
);
export const styleDetail = createEffectModuleInvoker(
  'style_detail',
  sdkModuleRegistry.style_detail,
);
export const styleList = createEffectModuleInvoker(
  'style_list',
  sdkModuleRegistry.style_list,
);
export const stylePlaylist = createEffectModuleInvoker(
  'style_playlist',
  sdkModuleRegistry.style_playlist,
);
export const stylePreference = createEffectModuleInvoker(
  'style_preference',
  sdkModuleRegistry.style_preference,
);
export const styleSong = createEffectModuleInvoker(
  'style_song',
  sdkModuleRegistry.style_song,
);
export const summaryAnnual = createEffectModuleInvoker(
  'summary_annual',
  sdkModuleRegistry.summary_annual,
);
export const topAlbum = createEffectModuleInvoker(
  'top_album',
  sdkModuleRegistry.top_album,
);
export const topArtists = createEffectModuleInvoker(
  'top_artists',
  sdkModuleRegistry.top_artists,
);
export const topList = createEffectModuleInvoker(
  'top_list',
  sdkModuleRegistry.top_list,
);
export const topMv = createEffectModuleInvoker(
  'top_mv',
  sdkModuleRegistry.top_mv,
);
export const topPlaylist = createEffectModuleInvoker(
  'top_playlist',
  sdkModuleRegistry.top_playlist,
);
export const topPlaylistHighquality = createEffectModuleInvoker(
  'top_playlist_highquality',
  sdkModuleRegistry.top_playlist_highquality,
);
export const topSong = createEffectModuleInvoker(
  'top_song',
  sdkModuleRegistry.top_song,
);
export const topicDetail = createEffectModuleInvoker(
  'topic_detail',
  sdkModuleRegistry.topic_detail,
);
export const topicDetailEventHot = createEffectModuleInvoker(
  'topic_detail_event_hot',
  sdkModuleRegistry.topic_detail_event_hot,
);
export const topicSublist = createEffectModuleInvoker(
  'topic_sublist',
  sdkModuleRegistry.topic_sublist,
);
export const toplist = createEffectModuleInvoker(
  'toplist',
  sdkModuleRegistry.toplist,
);
export const toplistArtist = createEffectModuleInvoker(
  'toplist_artist',
  sdkModuleRegistry.toplist_artist,
);
export const toplistDetail = createEffectModuleInvoker(
  'toplist_detail',
  sdkModuleRegistry.toplist_detail,
);
export const ugcAlbumGet = createEffectModuleInvoker(
  'ugc_album_get',
  sdkModuleRegistry.ugc_album_get,
);
export const ugcArtistGet = createEffectModuleInvoker(
  'ugc_artist_get',
  sdkModuleRegistry.ugc_artist_get,
);
export const ugcArtistSearch = createEffectModuleInvoker(
  'ugc_artist_search',
  sdkModuleRegistry.ugc_artist_search,
);
export const ugcDetail = createEffectModuleInvoker(
  'ugc_detail',
  sdkModuleRegistry.ugc_detail,
);
export const ugcMvGet = createEffectModuleInvoker(
  'ugc_mv_get',
  sdkModuleRegistry.ugc_mv_get,
);
export const ugcSongGet = createEffectModuleInvoker(
  'ugc_song_get',
  sdkModuleRegistry.ugc_song_get,
);
export const ugcUserDevote = createEffectModuleInvoker(
  'ugc_user_devote',
  sdkModuleRegistry.ugc_user_devote,
);
export const userAccount = createEffectModuleInvoker(
  'user_account',
  sdkModuleRegistry.user_account,
);
export const userAudio = createEffectModuleInvoker(
  'user_audio',
  sdkModuleRegistry.user_audio,
);
export const userBinding = createEffectModuleInvoker(
  'user_binding',
  sdkModuleRegistry.user_binding,
);
export const userCloud = createEffectModuleInvoker(
  'user_cloud',
  sdkModuleRegistry.user_cloud,
);
export const userCloudDel = createEffectModuleInvoker(
  'user_cloud_del',
  sdkModuleRegistry.user_cloud_del,
);
export const userCloudDetail = createEffectModuleInvoker(
  'user_cloud_detail',
  sdkModuleRegistry.user_cloud_detail,
);
export const userCommentHistory = createEffectModuleInvoker(
  'user_comment_history',
  sdkModuleRegistry.user_comment_history,
);
export const userDetail = createEffectModuleInvoker(
  'user_detail',
  sdkModuleRegistry.user_detail,
);
export const userDj = createEffectModuleInvoker(
  'user_dj',
  sdkModuleRegistry.user_dj,
);
export const userEvent = createEffectModuleInvoker(
  'user_event',
  sdkModuleRegistry.user_event,
);
export const userFollowMixed = createEffectModuleInvoker(
  'user_follow_mixed',
  sdkModuleRegistry.user_follow_mixed,
);
export const userFolloweds = createEffectModuleInvoker(
  'user_followeds',
  sdkModuleRegistry.user_followeds,
);
export const userFollows = createEffectModuleInvoker(
  'user_follows',
  sdkModuleRegistry.user_follows,
);
export const userLevel = createEffectModuleInvoker(
  'user_level',
  sdkModuleRegistry.user_level,
);
export const userMedal = createEffectModuleInvoker(
  'user_medal',
  sdkModuleRegistry.user_medal,
);
export const userMutualfollowGet = createEffectModuleInvoker(
  'user_mutualfollow_get',
  sdkModuleRegistry.user_mutualfollow_get,
);
export const userPlaylist = createEffectModuleInvoker(
  'user_playlist',
  sdkModuleRegistry.user_playlist,
);
export const userPlaylistCollect = createEffectModuleInvoker(
  'user_playlist_collect',
  sdkModuleRegistry.user_playlist_collect,
);
export const userPlaylistCreate = createEffectModuleInvoker(
  'user_playlist_create',
  sdkModuleRegistry.user_playlist_create,
);
export const userRecord = createEffectModuleInvoker(
  'user_record',
  sdkModuleRegistry.user_record,
);
export const userReplacephone = createEffectModuleInvoker(
  'user_replacephone',
  sdkModuleRegistry.user_replacephone,
);
export const userSocialStatus = createEffectModuleInvoker(
  'user_social_status',
  sdkModuleRegistry.user_social_status,
);
export const userSocialStatusEdit = createEffectModuleInvoker(
  'user_social_status_edit',
  sdkModuleRegistry.user_social_status_edit,
);
export const userSocialStatusRcmd = createEffectModuleInvoker(
  'user_social_status_rcmd',
  sdkModuleRegistry.user_social_status_rcmd,
);
export const userSocialStatusSupport = createEffectModuleInvoker(
  'user_social_status_support',
  sdkModuleRegistry.user_social_status_support,
);
export const userSubcount = createEffectModuleInvoker(
  'user_subcount',
  sdkModuleRegistry.user_subcount,
);
export const userUpdate = createEffectModuleInvoker(
  'user_update',
  sdkModuleRegistry.user_update,
);
export const verifyGetQr = createEffectModuleInvoker(
  'verify_getQr',
  sdkModuleRegistry.verify_getQr,
);
export const verifyQrcodestatus = createEffectModuleInvoker(
  'verify_qrcodestatus',
  sdkModuleRegistry.verify_qrcodestatus,
);
export const videoCategoryList = createEffectModuleInvoker(
  'video_category_list',
  sdkModuleRegistry.video_category_list,
);
export const videoDetail = createEffectModuleInvoker(
  'video_detail',
  sdkModuleRegistry.video_detail,
);
export const videoDetailInfo = createEffectModuleInvoker(
  'video_detail_info',
  sdkModuleRegistry.video_detail_info,
);
export const videoGroup = createEffectModuleInvoker(
  'video_group',
  sdkModuleRegistry.video_group,
);
export const videoGroupList = createEffectModuleInvoker(
  'video_group_list',
  sdkModuleRegistry.video_group_list,
);
export const videoSub = createEffectModuleInvoker(
  'video_sub',
  sdkModuleRegistry.video_sub,
);
export const videoTimelineAll = createEffectModuleInvoker(
  'video_timeline_all',
  sdkModuleRegistry.video_timeline_all,
);
export const videoTimelineRecommend = createEffectModuleInvoker(
  'video_timeline_recommend',
  sdkModuleRegistry.video_timeline_recommend,
);
export const videoUrl = createEffectModuleInvoker(
  'video_url',
  sdkModuleRegistry.video_url,
);
export const vipGrowthpoint = createEffectModuleInvoker(
  'vip_growthpoint',
  sdkModuleRegistry.vip_growthpoint,
);
export const vipGrowthpointDetails = createEffectModuleInvoker(
  'vip_growthpoint_details',
  sdkModuleRegistry.vip_growthpoint_details,
);
export const vipGrowthpointGet = createEffectModuleInvoker(
  'vip_growthpoint_get',
  sdkModuleRegistry.vip_growthpoint_get,
);
export const vipInfo = createEffectModuleInvoker(
  'vip_info',
  sdkModuleRegistry.vip_info,
);
export const vipInfoV2 = createEffectModuleInvoker(
  'vip_info_v2',
  sdkModuleRegistry.vip_info_v2,
);
export const vipTasks = createEffectModuleInvoker(
  'vip_tasks',
  sdkModuleRegistry.vip_tasks,
);
export const vipTimemachine = createEffectModuleInvoker(
  'vip_timemachine',
  sdkModuleRegistry.vip_timemachine,
);
export const voiceDelete = createEffectModuleInvoker(
  'voice_delete',
  sdkModuleRegistry.voice_delete,
);
export const voiceDetail = createEffectModuleInvoker(
  'voice_detail',
  sdkModuleRegistry.voice_detail,
);
export const voiceLyric = createEffectModuleInvoker(
  'voice_lyric',
  sdkModuleRegistry.voice_lyric,
);
export const voiceUpload = createEffectModuleInvoker(
  'voice_upload',
  sdkModuleRegistry.voice_upload,
);
export const voicelistDetail = createEffectModuleInvoker(
  'voicelist_detail',
  sdkModuleRegistry.voicelist_detail,
);
export const voicelistList = createEffectModuleInvoker(
  'voicelist_list',
  sdkModuleRegistry.voicelist_list,
);
export const voicelistListSearch = createEffectModuleInvoker(
  'voicelist_list_search',
  sdkModuleRegistry.voicelist_list_search,
);
export const voicelistSearch = createEffectModuleInvoker(
  'voicelist_search',
  sdkModuleRegistry.voicelist_search,
);
export const voicelistTrans = createEffectModuleInvoker(
  'voicelist_trans',
  sdkModuleRegistry.voicelist_trans,
);
export const yunbei = createEffectModuleInvoker(
  'yunbei',
  sdkModuleRegistry.yunbei,
);
export const yunbeiExpense = createEffectModuleInvoker(
  'yunbei_expense',
  sdkModuleRegistry.yunbei_expense,
);
export const yunbeiInfo = createEffectModuleInvoker(
  'yunbei_info',
  sdkModuleRegistry.yunbei_info,
);
export const yunbeiRcmdSong = createEffectModuleInvoker(
  'yunbei_rcmd_song',
  sdkModuleRegistry.yunbei_rcmd_song,
);
export const yunbeiRcmdSongHistory = createEffectModuleInvoker(
  'yunbei_rcmd_song_history',
  sdkModuleRegistry.yunbei_rcmd_song_history,
);
export const yunbeiReceipt = createEffectModuleInvoker(
  'yunbei_receipt',
  sdkModuleRegistry.yunbei_receipt,
);
export const yunbeiSign = createEffectModuleInvoker(
  'yunbei_sign',
  sdkModuleRegistry.yunbei_sign,
);
export const yunbeiTaskFinish = createEffectModuleInvoker(
  'yunbei_task_finish',
  sdkModuleRegistry.yunbei_task_finish,
);
export const yunbeiTasks = createEffectModuleInvoker(
  'yunbei_tasks',
  sdkModuleRegistry.yunbei_tasks,
);
export const yunbeiTasksTodo = createEffectModuleInvoker(
  'yunbei_tasks_todo',
  sdkModuleRegistry.yunbei_tasks_todo,
);
export const yunbeiToday = createEffectModuleInvoker(
  'yunbei_today',
  sdkModuleRegistry.yunbei_today,
);

export const createHanaMusicApi = (
  config: CreateHanaMusicApiConfig = {},
): HanaMusicApiClient => {
  const context = createSdkClientContext(config);
  return {
    activateInitProfile: createEffectModuleInvoker(
      'activate_init_profile',
      sdkModuleRegistry.activate_init_profile,
      config,
      context,
    ),
    aidjContentRcmd: createEffectModuleInvoker(
      'aidj_content_rcmd',
      sdkModuleRegistry.aidj_content_rcmd,
      config,
      context,
    ),
    album: createEffectModuleInvoker(
      'album',
      sdkModuleRegistry.album,
      config,
      context,
    ),
    albumDetail: createEffectModuleInvoker(
      'album_detail',
      sdkModuleRegistry.album_detail,
      config,
      context,
    ),
    albumDetailDynamic: createEffectModuleInvoker(
      'album_detail_dynamic',
      sdkModuleRegistry.album_detail_dynamic,
      config,
      context,
    ),
    albumList: createEffectModuleInvoker(
      'album_list',
      sdkModuleRegistry.album_list,
      config,
      context,
    ),
    albumListStyle: createEffectModuleInvoker(
      'album_list_style',
      sdkModuleRegistry.album_list_style,
      config,
      context,
    ),
    albumNew: createEffectModuleInvoker(
      'album_new',
      sdkModuleRegistry.album_new,
      config,
      context,
    ),
    albumNewest: createEffectModuleInvoker(
      'album_newest',
      sdkModuleRegistry.album_newest,
      config,
      context,
    ),
    albumPrivilege: createEffectModuleInvoker(
      'album_privilege',
      sdkModuleRegistry.album_privilege,
      config,
      context,
    ),
    albumSongsaleboard: createEffectModuleInvoker(
      'album_songsaleboard',
      sdkModuleRegistry.album_songsaleboard,
      config,
      context,
    ),
    albumSub: createEffectModuleInvoker(
      'album_sub',
      sdkModuleRegistry.album_sub,
      config,
      context,
    ),
    albumSublist: createEffectModuleInvoker(
      'album_sublist',
      sdkModuleRegistry.album_sublist,
      config,
      context,
    ),
    artistAlbum: createEffectModuleInvoker(
      'artist_album',
      sdkModuleRegistry.artist_album,
      config,
      context,
    ),
    artistDesc: createEffectModuleInvoker(
      'artist_desc',
      sdkModuleRegistry.artist_desc,
      config,
      context,
    ),
    artistDetail: createEffectModuleInvoker(
      'artist_detail',
      sdkModuleRegistry.artist_detail,
      config,
      context,
    ),
    artistDetailDynamic: createEffectModuleInvoker(
      'artist_detail_dynamic',
      sdkModuleRegistry.artist_detail_dynamic,
      config,
      context,
    ),
    artistFans: createEffectModuleInvoker(
      'artist_fans',
      sdkModuleRegistry.artist_fans,
      config,
      context,
    ),
    artistFollowCount: createEffectModuleInvoker(
      'artist_follow_count',
      sdkModuleRegistry.artist_follow_count,
      config,
      context,
    ),
    artistList: createEffectModuleInvoker(
      'artist_list',
      sdkModuleRegistry.artist_list,
      config,
      context,
    ),
    artistMv: createEffectModuleInvoker(
      'artist_mv',
      sdkModuleRegistry.artist_mv,
      config,
      context,
    ),
    artistNewMv: createEffectModuleInvoker(
      'artist_new_mv',
      sdkModuleRegistry.artist_new_mv,
      config,
      context,
    ),
    artistNewSong: createEffectModuleInvoker(
      'artist_new_song',
      sdkModuleRegistry.artist_new_song,
      config,
      context,
    ),
    artistSongs: createEffectModuleInvoker(
      'artist_songs',
      sdkModuleRegistry.artist_songs,
      config,
      context,
    ),
    artistSub: createEffectModuleInvoker(
      'artist_sub',
      sdkModuleRegistry.artist_sub,
      config,
      context,
    ),
    artistSublist: createEffectModuleInvoker(
      'artist_sublist',
      sdkModuleRegistry.artist_sublist,
      config,
      context,
    ),
    artistTopSong: createEffectModuleInvoker(
      'artist_top_song',
      sdkModuleRegistry.artist_top_song,
      config,
      context,
    ),
    artistVideo: createEffectModuleInvoker(
      'artist_video',
      sdkModuleRegistry.artist_video,
      config,
      context,
    ),
    artists: createEffectModuleInvoker(
      'artists',
      sdkModuleRegistry.artists,
      config,
      context,
    ),
    audioMatch: createEffectModuleInvoker(
      'audio_match',
      sdkModuleRegistry.audio_match,
      config,
      context,
    ),
    avatarUpload: createEffectModuleInvoker(
      'avatar_upload',
      sdkModuleRegistry.avatar_upload,
      config,
      context,
    ),
    banner: createEffectModuleInvoker(
      'banner',
      sdkModuleRegistry.banner,
      config,
      context,
    ),
    batch: createEffectModuleInvoker(
      'batch',
      sdkModuleRegistry.batch,
      config,
      context,
    ),
    broadcastCategoryRegionGet: createEffectModuleInvoker(
      'broadcast_category_region_get',
      sdkModuleRegistry.broadcast_category_region_get,
      config,
      context,
    ),
    broadcastChannelCollectList: createEffectModuleInvoker(
      'broadcast_channel_collect_list',
      sdkModuleRegistry.broadcast_channel_collect_list,
      config,
      context,
    ),
    broadcastChannelCurrentinfo: createEffectModuleInvoker(
      'broadcast_channel_currentinfo',
      sdkModuleRegistry.broadcast_channel_currentinfo,
      config,
      context,
    ),
    broadcastChannelList: createEffectModuleInvoker(
      'broadcast_channel_list',
      sdkModuleRegistry.broadcast_channel_list,
      config,
      context,
    ),
    broadcastSub: createEffectModuleInvoker(
      'broadcast_sub',
      sdkModuleRegistry.broadcast_sub,
      config,
      context,
    ),
    calendar: createEffectModuleInvoker(
      'calendar',
      sdkModuleRegistry.calendar,
      config,
      context,
    ),
    captchaSent: createEffectModuleInvoker(
      'captcha_sent',
      sdkModuleRegistry.captcha_sent,
      config,
      context,
    ),
    captchaVerify: createEffectModuleInvoker(
      'captcha_verify',
      sdkModuleRegistry.captcha_verify,
      config,
      context,
    ),
    cellphoneExistenceCheck: createEffectModuleInvoker(
      'cellphone_existence_check',
      sdkModuleRegistry.cellphone_existence_check,
      config,
      context,
    ),
    checkMusic: createEffectModuleInvoker(
      'check_music',
      sdkModuleRegistry.check_music,
      config,
      context,
    ),
    cloud: createEffectModuleInvoker(
      'cloud',
      sdkModuleRegistry.cloud,
      config,
      context,
    ),
    cloudImport: createEffectModuleInvoker(
      'cloud_import',
      sdkModuleRegistry.cloud_import,
      config,
      context,
    ),
    cloudMatch: createEffectModuleInvoker(
      'cloud_match',
      sdkModuleRegistry.cloud_match,
      config,
      context,
    ),
    cloudsearch: createEffectModuleInvoker(
      'cloudsearch',
      sdkModuleRegistry.cloudsearch,
      config,
      context,
    ),
    comment: createEffectModuleInvoker(
      'comment',
      sdkModuleRegistry.comment,
      config,
      context,
    ),
    commentAlbum: createEffectModuleInvoker(
      'comment_album',
      sdkModuleRegistry.comment_album,
      config,
      context,
    ),
    commentDj: createEffectModuleInvoker(
      'comment_dj',
      sdkModuleRegistry.comment_dj,
      config,
      context,
    ),
    commentEvent: createEffectModuleInvoker(
      'comment_event',
      sdkModuleRegistry.comment_event,
      config,
      context,
    ),
    commentFloor: createEffectModuleInvoker(
      'comment_floor',
      sdkModuleRegistry.comment_floor,
      config,
      context,
    ),
    commentHot: createEffectModuleInvoker(
      'comment_hot',
      sdkModuleRegistry.comment_hot,
      config,
      context,
    ),
    commentHugList: createEffectModuleInvoker(
      'comment_hug_list',
      sdkModuleRegistry.comment_hug_list,
      config,
      context,
    ),
    commentLike: createEffectModuleInvoker(
      'comment_like',
      sdkModuleRegistry.comment_like,
      config,
      context,
    ),
    commentMusic: createEffectModuleInvoker(
      'comment_music',
      sdkModuleRegistry.comment_music,
      config,
      context,
    ),
    commentMv: createEffectModuleInvoker(
      'comment_mv',
      sdkModuleRegistry.comment_mv,
      config,
      context,
    ),
    commentNew: createEffectModuleInvoker(
      'comment_new',
      sdkModuleRegistry.comment_new,
      config,
      context,
    ),
    commentPlaylist: createEffectModuleInvoker(
      'comment_playlist',
      sdkModuleRegistry.comment_playlist,
      config,
      context,
    ),
    commentVideo: createEffectModuleInvoker(
      'comment_video',
      sdkModuleRegistry.comment_video,
      config,
      context,
    ),
    countriesCodeList: createEffectModuleInvoker(
      'countries_code_list',
      sdkModuleRegistry.countries_code_list,
      config,
      context,
    ),
    dailySignin: createEffectModuleInvoker(
      'daily_signin',
      sdkModuleRegistry.daily_signin,
      config,
      context,
    ),
    digitalAlbumDetail: createEffectModuleInvoker(
      'digitalAlbum_detail',
      sdkModuleRegistry.digitalAlbum_detail,
      config,
      context,
    ),
    digitalAlbumOrdering: createEffectModuleInvoker(
      'digitalAlbum_ordering',
      sdkModuleRegistry.digitalAlbum_ordering,
      config,
      context,
    ),
    digitalAlbumPurchased: createEffectModuleInvoker(
      'digitalAlbum_purchased',
      sdkModuleRegistry.digitalAlbum_purchased,
      config,
      context,
    ),
    digitalAlbumSales: createEffectModuleInvoker(
      'digitalAlbum_sales',
      sdkModuleRegistry.digitalAlbum_sales,
      config,
      context,
    ),
    djBanner: createEffectModuleInvoker(
      'dj_banner',
      sdkModuleRegistry.dj_banner,
      config,
      context,
    ),
    djCategoryExcludehot: createEffectModuleInvoker(
      'dj_category_excludehot',
      sdkModuleRegistry.dj_category_excludehot,
      config,
      context,
    ),
    djCategoryRecommend: createEffectModuleInvoker(
      'dj_category_recommend',
      sdkModuleRegistry.dj_category_recommend,
      config,
      context,
    ),
    djCatelist: createEffectModuleInvoker(
      'dj_catelist',
      sdkModuleRegistry.dj_catelist,
      config,
      context,
    ),
    djDetail: createEffectModuleInvoker(
      'dj_detail',
      sdkModuleRegistry.dj_detail,
      config,
      context,
    ),
    djDifmAllStyleChannel: createEffectModuleInvoker(
      'dj_difm_all_style_channel',
      sdkModuleRegistry.dj_difm_all_style_channel,
      config,
      context,
    ),
    djDifmChannelSubscribe: createEffectModuleInvoker(
      'dj_difm_channel_subscribe',
      sdkModuleRegistry.dj_difm_channel_subscribe,
      config,
      context,
    ),
    djDifmChannelUnsubscribe: createEffectModuleInvoker(
      'dj_difm_channel_unsubscribe',
      sdkModuleRegistry.dj_difm_channel_unsubscribe,
      config,
      context,
    ),
    djDifmPlayingTracksList: createEffectModuleInvoker(
      'dj_difm_playing_tracks_list',
      sdkModuleRegistry.dj_difm_playing_tracks_list,
      config,
      context,
    ),
    djDifmSubscribeChannelsGet: createEffectModuleInvoker(
      'dj_difm_subscribe_channels_get',
      sdkModuleRegistry.dj_difm_subscribe_channels_get,
      config,
      context,
    ),
    djHot: createEffectModuleInvoker(
      'dj_hot',
      sdkModuleRegistry.dj_hot,
      config,
      context,
    ),
    djPaygift: createEffectModuleInvoker(
      'dj_paygift',
      sdkModuleRegistry.dj_paygift,
      config,
      context,
    ),
    djPersonalizeRecommend: createEffectModuleInvoker(
      'dj_personalize_recommend',
      sdkModuleRegistry.dj_personalize_recommend,
      config,
      context,
    ),
    djProgram: createEffectModuleInvoker(
      'dj_program',
      sdkModuleRegistry.dj_program,
      config,
      context,
    ),
    djProgramDetail: createEffectModuleInvoker(
      'dj_program_detail',
      sdkModuleRegistry.dj_program_detail,
      config,
      context,
    ),
    djProgramToplist: createEffectModuleInvoker(
      'dj_program_toplist',
      sdkModuleRegistry.dj_program_toplist,
      config,
      context,
    ),
    djProgramToplistHours: createEffectModuleInvoker(
      'dj_program_toplist_hours',
      sdkModuleRegistry.dj_program_toplist_hours,
      config,
      context,
    ),
    djRadioHot: createEffectModuleInvoker(
      'dj_radio_hot',
      sdkModuleRegistry.dj_radio_hot,
      config,
      context,
    ),
    djRecommend: createEffectModuleInvoker(
      'dj_recommend',
      sdkModuleRegistry.dj_recommend,
      config,
      context,
    ),
    djRecommendType: createEffectModuleInvoker(
      'dj_recommend_type',
      sdkModuleRegistry.dj_recommend_type,
      config,
      context,
    ),
    djSub: createEffectModuleInvoker(
      'dj_sub',
      sdkModuleRegistry.dj_sub,
      config,
      context,
    ),
    djSublist: createEffectModuleInvoker(
      'dj_sublist',
      sdkModuleRegistry.dj_sublist,
      config,
      context,
    ),
    djSubscriber: createEffectModuleInvoker(
      'dj_subscriber',
      sdkModuleRegistry.dj_subscriber,
      config,
      context,
    ),
    djTodayPerfered: createEffectModuleInvoker(
      'dj_today_perfered',
      sdkModuleRegistry.dj_today_perfered,
      config,
      context,
    ),
    djToplist: createEffectModuleInvoker(
      'dj_toplist',
      sdkModuleRegistry.dj_toplist,
      config,
      context,
    ),
    djToplistHours: createEffectModuleInvoker(
      'dj_toplist_hours',
      sdkModuleRegistry.dj_toplist_hours,
      config,
      context,
    ),
    djToplistNewcomer: createEffectModuleInvoker(
      'dj_toplist_newcomer',
      sdkModuleRegistry.dj_toplist_newcomer,
      config,
      context,
    ),
    djToplistPay: createEffectModuleInvoker(
      'dj_toplist_pay',
      sdkModuleRegistry.dj_toplist_pay,
      config,
      context,
    ),
    djToplistPopular: createEffectModuleInvoker(
      'dj_toplist_popular',
      sdkModuleRegistry.dj_toplist_popular,
      config,
      context,
    ),
    djRadioTop: createEffectModuleInvoker(
      'djRadio_top',
      sdkModuleRegistry.djRadio_top,
      config,
      context,
    ),
    event: createEffectModuleInvoker(
      'event',
      sdkModuleRegistry.event,
      config,
      context,
    ),
    eventDel: createEffectModuleInvoker(
      'event_del',
      sdkModuleRegistry.event_del,
      config,
      context,
    ),
    eventForward: createEffectModuleInvoker(
      'event_forward',
      sdkModuleRegistry.event_forward,
      config,
      context,
    ),
    fmTrash: createEffectModuleInvoker(
      'fm_trash',
      sdkModuleRegistry.fm_trash,
      config,
      context,
    ),
    follow: createEffectModuleInvoker(
      'follow',
      sdkModuleRegistry.follow,
      config,
      context,
    ),
    getUserids: createEffectModuleInvoker(
      'get_userids',
      sdkModuleRegistry.get_userids,
      config,
      context,
    ),
    historyRecommendSongs: createEffectModuleInvoker(
      'history_recommend_songs',
      sdkModuleRegistry.history_recommend_songs,
      config,
      context,
    ),
    historyRecommendSongsDetail: createEffectModuleInvoker(
      'history_recommend_songs_detail',
      sdkModuleRegistry.history_recommend_songs_detail,
      config,
      context,
    ),
    homepageBlockPage: createEffectModuleInvoker(
      'homepage_block_page',
      sdkModuleRegistry.homepage_block_page,
      config,
      context,
    ),
    homepageDragonBall: createEffectModuleInvoker(
      'homepage_dragon_ball',
      sdkModuleRegistry.homepage_dragon_ball,
      config,
      context,
    ),
    hotTopic: createEffectModuleInvoker(
      'hot_topic',
      sdkModuleRegistry.hot_topic,
      config,
      context,
    ),
    hugComment: createEffectModuleInvoker(
      'hug_comment',
      sdkModuleRegistry.hug_comment,
      config,
      context,
    ),
    innerVersion: createEffectModuleInvoker(
      'inner_version',
      sdkModuleRegistry.inner_version,
      config,
      context,
    ),
    like: createEffectModuleInvoker(
      'like',
      sdkModuleRegistry.like,
      config,
      context,
    ),
    likelist: createEffectModuleInvoker(
      'likelist',
      sdkModuleRegistry.likelist,
      config,
      context,
    ),
    listenDataRealtimeReport: createEffectModuleInvoker(
      'listen_data_realtime_report',
      sdkModuleRegistry.listen_data_realtime_report,
      config,
      context,
    ),
    listenDataReport: createEffectModuleInvoker(
      'listen_data_report',
      sdkModuleRegistry.listen_data_report,
      config,
      context,
    ),
    listenDataTodaySong: createEffectModuleInvoker(
      'listen_data_today_song',
      sdkModuleRegistry.listen_data_today_song,
      config,
      context,
    ),
    listenDataTotal: createEffectModuleInvoker(
      'listen_data_total',
      sdkModuleRegistry.listen_data_total,
      config,
      context,
    ),
    listenDataYearReport: createEffectModuleInvoker(
      'listen_data_year_report',
      sdkModuleRegistry.listen_data_year_report,
      config,
      context,
    ),
    listentogetherAccept: createEffectModuleInvoker(
      'listentogether_accept',
      sdkModuleRegistry.listentogether_accept,
      config,
      context,
    ),
    listentogetherEnd: createEffectModuleInvoker(
      'listentogether_end',
      sdkModuleRegistry.listentogether_end,
      config,
      context,
    ),
    listentogetherHeatbeat: createEffectModuleInvoker(
      'listentogether_heatbeat',
      sdkModuleRegistry.listentogether_heatbeat,
      config,
      context,
    ),
    listentogetherPlayCommand: createEffectModuleInvoker(
      'listentogether_play_command',
      sdkModuleRegistry.listentogether_play_command,
      config,
      context,
    ),
    listentogetherRoomCheck: createEffectModuleInvoker(
      'listentogether_room_check',
      sdkModuleRegistry.listentogether_room_check,
      config,
      context,
    ),
    listentogetherRoomCreate: createEffectModuleInvoker(
      'listentogether_room_create',
      sdkModuleRegistry.listentogether_room_create,
      config,
      context,
    ),
    listentogetherStatus: createEffectModuleInvoker(
      'listentogether_status',
      sdkModuleRegistry.listentogether_status,
      config,
      context,
    ),
    listentogetherSyncListCommand: createEffectModuleInvoker(
      'listentogether_sync_list_command',
      sdkModuleRegistry.listentogether_sync_list_command,
      config,
      context,
    ),
    listentogetherSyncPlaylistGet: createEffectModuleInvoker(
      'listentogether_sync_playlist_get',
      sdkModuleRegistry.listentogether_sync_playlist_get,
      config,
      context,
    ),
    login: createEffectModuleInvoker(
      'login',
      sdkModuleRegistry.login,
      config,
      context,
    ),
    loginCellphone: createEffectModuleInvoker(
      'login_cellphone',
      sdkModuleRegistry.login_cellphone,
      config,
      context,
    ),
    loginQrCheck: createEffectModuleInvoker(
      'login_qr_check',
      sdkModuleRegistry.login_qr_check,
      config,
      context,
    ),
    loginQrCreate: createEffectModuleInvoker(
      'login_qr_create',
      sdkModuleRegistry.login_qr_create,
      config,
      context,
    ),
    loginQrKey: createEffectModuleInvoker(
      'login_qr_key',
      sdkModuleRegistry.login_qr_key,
      config,
      context,
    ),
    loginRefresh: createEffectModuleInvoker(
      'login_refresh',
      sdkModuleRegistry.login_refresh,
      config,
      context,
    ),
    loginStatus: createEffectModuleInvoker(
      'login_status',
      sdkModuleRegistry.login_status,
      config,
      context,
    ),
    logout: createEffectModuleInvoker(
      'logout',
      sdkModuleRegistry.logout,
      config,
      context,
    ),
    lyric: createEffectModuleInvoker(
      'lyric',
      sdkModuleRegistry.lyric,
      config,
      context,
    ),
    lyricNew: createEffectModuleInvoker(
      'lyric_new',
      sdkModuleRegistry.lyric_new,
      config,
      context,
    ),
    mlogMusicRcmd: createEffectModuleInvoker(
      'mlog_music_rcmd',
      sdkModuleRegistry.mlog_music_rcmd,
      config,
      context,
    ),
    mlogToVideo: createEffectModuleInvoker(
      'mlog_to_video',
      sdkModuleRegistry.mlog_to_video,
      config,
      context,
    ),
    mlogUrl: createEffectModuleInvoker(
      'mlog_url',
      sdkModuleRegistry.mlog_url,
      config,
      context,
    ),
    msgComments: createEffectModuleInvoker(
      'msg_comments',
      sdkModuleRegistry.msg_comments,
      config,
      context,
    ),
    msgForwards: createEffectModuleInvoker(
      'msg_forwards',
      sdkModuleRegistry.msg_forwards,
      config,
      context,
    ),
    msgNotices: createEffectModuleInvoker(
      'msg_notices',
      sdkModuleRegistry.msg_notices,
      config,
      context,
    ),
    msgPrivate: createEffectModuleInvoker(
      'msg_private',
      sdkModuleRegistry.msg_private,
      config,
      context,
    ),
    msgPrivateHistory: createEffectModuleInvoker(
      'msg_private_history',
      sdkModuleRegistry.msg_private_history,
      config,
      context,
    ),
    msgRecentcontact: createEffectModuleInvoker(
      'msg_recentcontact',
      sdkModuleRegistry.msg_recentcontact,
      config,
      context,
    ),
    musicFirstListenInfo: createEffectModuleInvoker(
      'music_first_listen_info',
      sdkModuleRegistry.music_first_listen_info,
      config,
      context,
    ),
    musicianCloudbean: createEffectModuleInvoker(
      'musician_cloudbean',
      sdkModuleRegistry.musician_cloudbean,
      config,
      context,
    ),
    musicianCloudbeanObtain: createEffectModuleInvoker(
      'musician_cloudbean_obtain',
      sdkModuleRegistry.musician_cloudbean_obtain,
      config,
      context,
    ),
    musicianDataOverview: createEffectModuleInvoker(
      'musician_data_overview',
      sdkModuleRegistry.musician_data_overview,
      config,
      context,
    ),
    musicianPlayTrend: createEffectModuleInvoker(
      'musician_play_trend',
      sdkModuleRegistry.musician_play_trend,
      config,
      context,
    ),
    musicianSign: createEffectModuleInvoker(
      'musician_sign',
      sdkModuleRegistry.musician_sign,
      config,
      context,
    ),
    musicianTasks: createEffectModuleInvoker(
      'musician_tasks',
      sdkModuleRegistry.musician_tasks,
      config,
      context,
    ),
    musicianTasksNew: createEffectModuleInvoker(
      'musician_tasks_new',
      sdkModuleRegistry.musician_tasks_new,
      config,
      context,
    ),
    mvAll: createEffectModuleInvoker(
      'mv_all',
      sdkModuleRegistry.mv_all,
      config,
      context,
    ),
    mvDetail: createEffectModuleInvoker(
      'mv_detail',
      sdkModuleRegistry.mv_detail,
      config,
      context,
    ),
    mvDetailInfo: createEffectModuleInvoker(
      'mv_detail_info',
      sdkModuleRegistry.mv_detail_info,
      config,
      context,
    ),
    mvExclusiveRcmd: createEffectModuleInvoker(
      'mv_exclusive_rcmd',
      sdkModuleRegistry.mv_exclusive_rcmd,
      config,
      context,
    ),
    mvFirst: createEffectModuleInvoker(
      'mv_first',
      sdkModuleRegistry.mv_first,
      config,
      context,
    ),
    mvSub: createEffectModuleInvoker(
      'mv_sub',
      sdkModuleRegistry.mv_sub,
      config,
      context,
    ),
    mvSublist: createEffectModuleInvoker(
      'mv_sublist',
      sdkModuleRegistry.mv_sublist,
      config,
      context,
    ),
    mvUrl: createEffectModuleInvoker(
      'mv_url',
      sdkModuleRegistry.mv_url,
      config,
      context,
    ),
    nicknameCheck: createEffectModuleInvoker(
      'nickname_check',
      sdkModuleRegistry.nickname_check,
      config,
      context,
    ),
    personalFm: createEffectModuleInvoker(
      'personal_fm',
      sdkModuleRegistry.personal_fm,
      config,
      context,
    ),
    personalFmMode: createEffectModuleInvoker(
      'personal_fm_mode',
      sdkModuleRegistry.personal_fm_mode,
      config,
      context,
    ),
    personalized: createEffectModuleInvoker(
      'personalized',
      sdkModuleRegistry.personalized,
      config,
      context,
    ),
    personalizedDjprogram: createEffectModuleInvoker(
      'personalized_djprogram',
      sdkModuleRegistry.personalized_djprogram,
      config,
      context,
    ),
    personalizedMv: createEffectModuleInvoker(
      'personalized_mv',
      sdkModuleRegistry.personalized_mv,
      config,
      context,
    ),
    personalizedNewsong: createEffectModuleInvoker(
      'personalized_newsong',
      sdkModuleRegistry.personalized_newsong,
      config,
      context,
    ),
    personalizedPrivatecontent: createEffectModuleInvoker(
      'personalized_privatecontent',
      sdkModuleRegistry.personalized_privatecontent,
      config,
      context,
    ),
    personalizedPrivatecontentList: createEffectModuleInvoker(
      'personalized_privatecontent_list',
      sdkModuleRegistry.personalized_privatecontent_list,
      config,
      context,
    ),
    plCount: createEffectModuleInvoker(
      'pl_count',
      sdkModuleRegistry.pl_count,
      config,
      context,
    ),
    playlistCatlist: createEffectModuleInvoker(
      'playlist_catlist',
      sdkModuleRegistry.playlist_catlist,
      config,
      context,
    ),
    playlistCoverUpdate: createEffectModuleInvoker(
      'playlist_cover_update',
      sdkModuleRegistry.playlist_cover_update,
      config,
      context,
    ),
    playlistCreate: createEffectModuleInvoker(
      'playlist_create',
      sdkModuleRegistry.playlist_create,
      config,
      context,
    ),
    playlistDelete: createEffectModuleInvoker(
      'playlist_delete',
      sdkModuleRegistry.playlist_delete,
      config,
      context,
    ),
    playlistDescUpdate: createEffectModuleInvoker(
      'playlist_desc_update',
      sdkModuleRegistry.playlist_desc_update,
      config,
      context,
    ),
    playlistDetail: createEffectModuleInvoker(
      'playlist_detail',
      sdkModuleRegistry.playlist_detail,
      config,
      context,
    ),
    playlistDetailDynamic: createEffectModuleInvoker(
      'playlist_detail_dynamic',
      sdkModuleRegistry.playlist_detail_dynamic,
      config,
      context,
    ),
    playlistDetailRcmdGet: createEffectModuleInvoker(
      'playlist_detail_rcmd_get',
      sdkModuleRegistry.playlist_detail_rcmd_get,
      config,
      context,
    ),
    playlistHighqualityTags: createEffectModuleInvoker(
      'playlist_highquality_tags',
      sdkModuleRegistry.playlist_highquality_tags,
      config,
      context,
    ),
    playlistHot: createEffectModuleInvoker(
      'playlist_hot',
      sdkModuleRegistry.playlist_hot,
      config,
      context,
    ),
    playlistImportNameTaskCreate: createEffectModuleInvoker(
      'playlist_import_name_task_create',
      sdkModuleRegistry.playlist_import_name_task_create,
      config,
      context,
    ),
    playlistImportTaskStatus: createEffectModuleInvoker(
      'playlist_import_task_status',
      sdkModuleRegistry.playlist_import_task_status,
      config,
      context,
    ),
    playlistMylike: createEffectModuleInvoker(
      'playlist_mylike',
      sdkModuleRegistry.playlist_mylike,
      config,
      context,
    ),
    playlistNameUpdate: createEffectModuleInvoker(
      'playlist_name_update',
      sdkModuleRegistry.playlist_name_update,
      config,
      context,
    ),
    playlistOrderUpdate: createEffectModuleInvoker(
      'playlist_order_update',
      sdkModuleRegistry.playlist_order_update,
      config,
      context,
    ),
    playlistPrivacy: createEffectModuleInvoker(
      'playlist_privacy',
      sdkModuleRegistry.playlist_privacy,
      config,
      context,
    ),
    playlistSubscribe: createEffectModuleInvoker(
      'playlist_subscribe',
      sdkModuleRegistry.playlist_subscribe,
      config,
      context,
    ),
    playlistSubscribers: createEffectModuleInvoker(
      'playlist_subscribers',
      sdkModuleRegistry.playlist_subscribers,
      config,
      context,
    ),
    playlistTagsUpdate: createEffectModuleInvoker(
      'playlist_tags_update',
      sdkModuleRegistry.playlist_tags_update,
      config,
      context,
    ),
    playlistTrackAdd: createEffectModuleInvoker(
      'playlist_track_add',
      sdkModuleRegistry.playlist_track_add,
      config,
      context,
    ),
    playlistTrackAll: createEffectModuleInvoker(
      'playlist_track_all',
      sdkModuleRegistry.playlist_track_all,
      config,
      context,
    ),
    playlistTrackDelete: createEffectModuleInvoker(
      'playlist_track_delete',
      sdkModuleRegistry.playlist_track_delete,
      config,
      context,
    ),
    playlistTracks: createEffectModuleInvoker(
      'playlist_tracks',
      sdkModuleRegistry.playlist_tracks,
      config,
      context,
    ),
    playlistUpdate: createEffectModuleInvoker(
      'playlist_update',
      sdkModuleRegistry.playlist_update,
      config,
      context,
    ),
    playlistUpdatePlaycount: createEffectModuleInvoker(
      'playlist_update_playcount',
      sdkModuleRegistry.playlist_update_playcount,
      config,
      context,
    ),
    playlistVideoRecent: createEffectModuleInvoker(
      'playlist_video_recent',
      sdkModuleRegistry.playlist_video_recent,
      config,
      context,
    ),
    playmodeIntelligenceList: createEffectModuleInvoker(
      'playmode_intelligence_list',
      sdkModuleRegistry.playmode_intelligence_list,
      config,
      context,
    ),
    programRecommend: createEffectModuleInvoker(
      'program_recommend',
      sdkModuleRegistry.program_recommend,
      config,
      context,
    ),
    rebind: createEffectModuleInvoker(
      'rebind',
      sdkModuleRegistry.rebind,
      config,
      context,
    ),
    recentListenList: createEffectModuleInvoker(
      'recent_listen_list',
      sdkModuleRegistry.recent_listen_list,
      config,
      context,
    ),
    recommendResource: createEffectModuleInvoker(
      'recommend_resource',
      sdkModuleRegistry.recommend_resource,
      config,
      context,
    ),
    recommendSongs: createEffectModuleInvoker(
      'recommend_songs',
      sdkModuleRegistry.recommend_songs,
      config,
      context,
    ),
    recommendSongsDislike: createEffectModuleInvoker(
      'recommend_songs_dislike',
      sdkModuleRegistry.recommend_songs_dislike,
      config,
      context,
    ),
    recordRecentAlbum: createEffectModuleInvoker(
      'record_recent_album',
      sdkModuleRegistry.record_recent_album,
      config,
      context,
    ),
    recordRecentDj: createEffectModuleInvoker(
      'record_recent_dj',
      sdkModuleRegistry.record_recent_dj,
      config,
      context,
    ),
    recordRecentPlaylist: createEffectModuleInvoker(
      'record_recent_playlist',
      sdkModuleRegistry.record_recent_playlist,
      config,
      context,
    ),
    recordRecentSong: createEffectModuleInvoker(
      'record_recent_song',
      sdkModuleRegistry.record_recent_song,
      config,
      context,
    ),
    recordRecentVideo: createEffectModuleInvoker(
      'record_recent_video',
      sdkModuleRegistry.record_recent_video,
      config,
      context,
    ),
    recordRecentVoice: createEffectModuleInvoker(
      'record_recent_voice',
      sdkModuleRegistry.record_recent_voice,
      config,
      context,
    ),
    registerAnonimous: createEffectModuleInvoker(
      'register_anonimous',
      sdkModuleRegistry.register_anonimous,
      config,
      context,
    ),
    registerCellphone: createEffectModuleInvoker(
      'register_cellphone',
      sdkModuleRegistry.register_cellphone,
      config,
      context,
    ),
    relatedAllvideo: createEffectModuleInvoker(
      'related_allvideo',
      sdkModuleRegistry.related_allvideo,
      config,
      context,
    ),
    relatedPlaylist: createEffectModuleInvoker(
      'related_playlist',
      sdkModuleRegistry.related_playlist,
      config,
      context,
    ),
    resourceLike: createEffectModuleInvoker(
      'resource_like',
      sdkModuleRegistry.resource_like,
      config,
      context,
    ),
    scrobble: createEffectModuleInvoker(
      'scrobble',
      sdkModuleRegistry.scrobble,
      config,
      context,
    ),
    search: createEffectModuleInvoker(
      'search',
      sdkModuleRegistry.search,
      config,
      context,
    ),
    searchDefault: createEffectModuleInvoker(
      'search_default',
      sdkModuleRegistry.search_default,
      config,
      context,
    ),
    searchHot: createEffectModuleInvoker(
      'search_hot',
      sdkModuleRegistry.search_hot,
      config,
      context,
    ),
    searchHotDetail: createEffectModuleInvoker(
      'search_hot_detail',
      sdkModuleRegistry.search_hot_detail,
      config,
      context,
    ),
    searchMatch: createEffectModuleInvoker(
      'search_match',
      sdkModuleRegistry.search_match,
      config,
      context,
    ),
    searchMultimatch: createEffectModuleInvoker(
      'search_multimatch',
      sdkModuleRegistry.search_multimatch,
      config,
      context,
    ),
    searchSuggest: createEffectModuleInvoker(
      'search_suggest',
      sdkModuleRegistry.search_suggest,
      config,
      context,
    ),
    sendAlbum: createEffectModuleInvoker(
      'send_album',
      sdkModuleRegistry.send_album,
      config,
      context,
    ),
    sendPlaylist: createEffectModuleInvoker(
      'send_playlist',
      sdkModuleRegistry.send_playlist,
      config,
      context,
    ),
    sendSong: createEffectModuleInvoker(
      'send_song',
      sdkModuleRegistry.send_song,
      config,
      context,
    ),
    sendText: createEffectModuleInvoker(
      'send_text',
      sdkModuleRegistry.send_text,
      config,
      context,
    ),
    setting: createEffectModuleInvoker(
      'setting',
      sdkModuleRegistry.setting,
      config,
      context,
    ),
    shareResource: createEffectModuleInvoker(
      'share_resource',
      sdkModuleRegistry.share_resource,
      config,
      context,
    ),
    sheetList: createEffectModuleInvoker(
      'sheet_list',
      sdkModuleRegistry.sheet_list,
      config,
      context,
    ),
    sheetPreview: createEffectModuleInvoker(
      'sheet_preview',
      sdkModuleRegistry.sheet_preview,
      config,
      context,
    ),
    signHappyInfo: createEffectModuleInvoker(
      'sign_happy_info',
      sdkModuleRegistry.sign_happy_info,
      config,
      context,
    ),
    signinProgress: createEffectModuleInvoker(
      'signin_progress',
      sdkModuleRegistry.signin_progress,
      config,
      context,
    ),
    simiArtist: createEffectModuleInvoker(
      'simi_artist',
      sdkModuleRegistry.simi_artist,
      config,
      context,
    ),
    simiMv: createEffectModuleInvoker(
      'simi_mv',
      sdkModuleRegistry.simi_mv,
      config,
      context,
    ),
    simiPlaylist: createEffectModuleInvoker(
      'simi_playlist',
      sdkModuleRegistry.simi_playlist,
      config,
      context,
    ),
    simiSong: createEffectModuleInvoker(
      'simi_song',
      sdkModuleRegistry.simi_song,
      config,
      context,
    ),
    simiUser: createEffectModuleInvoker(
      'simi_user',
      sdkModuleRegistry.simi_user,
      config,
      context,
    ),
    songChorus: createEffectModuleInvoker(
      'song_chorus',
      sdkModuleRegistry.song_chorus,
      config,
      context,
    ),
    songDetail: createEffectModuleInvoker(
      'song_detail',
      sdkModuleRegistry.song_detail,
      config,
      context,
    ),
    songDownlist: createEffectModuleInvoker(
      'song_downlist',
      sdkModuleRegistry.song_downlist,
      config,
      context,
    ),
    songDownloadUrl: createEffectModuleInvoker(
      'song_download_url',
      sdkModuleRegistry.song_download_url,
      config,
      context,
    ),
    songDownloadUrlV1: createEffectModuleInvoker(
      'song_download_url_v1',
      sdkModuleRegistry.song_download_url_v1,
      config,
      context,
    ),
    songDynamicCover: createEffectModuleInvoker(
      'song_dynamic_cover',
      sdkModuleRegistry.song_dynamic_cover,
      config,
      context,
    ),
    songLikeCheck: createEffectModuleInvoker(
      'song_like_check',
      sdkModuleRegistry.song_like_check,
      config,
      context,
    ),
    songLyricsMark: createEffectModuleInvoker(
      'song_lyrics_mark',
      sdkModuleRegistry.song_lyrics_mark,
      config,
      context,
    ),
    songLyricsMarkAdd: createEffectModuleInvoker(
      'song_lyrics_mark_add',
      sdkModuleRegistry.song_lyrics_mark_add,
      config,
      context,
    ),
    songLyricsMarkDel: createEffectModuleInvoker(
      'song_lyrics_mark_del',
      sdkModuleRegistry.song_lyrics_mark_del,
      config,
      context,
    ),
    songLyricsMarkUserPage: createEffectModuleInvoker(
      'song_lyrics_mark_user_page',
      sdkModuleRegistry.song_lyrics_mark_user_page,
      config,
      context,
    ),
    songMonthdownlist: createEffectModuleInvoker(
      'song_monthdownlist',
      sdkModuleRegistry.song_monthdownlist,
      config,
      context,
    ),
    songMusicDetail: createEffectModuleInvoker(
      'song_music_detail',
      sdkModuleRegistry.song_music_detail,
      config,
      context,
    ),
    songOrderUpdate: createEffectModuleInvoker(
      'song_order_update',
      sdkModuleRegistry.song_order_update,
      config,
      context,
    ),
    songPurchased: createEffectModuleInvoker(
      'song_purchased',
      sdkModuleRegistry.song_purchased,
      config,
      context,
    ),
    songRedCount: createEffectModuleInvoker(
      'song_red_count',
      sdkModuleRegistry.song_red_count,
      config,
      context,
    ),
    songSingledownlist: createEffectModuleInvoker(
      'song_singledownlist',
      sdkModuleRegistry.song_singledownlist,
      config,
      context,
    ),
    songUrl: createEffectModuleInvoker(
      'song_url',
      sdkModuleRegistry.song_url,
      config,
      context,
    ),
    songUrlV1: createEffectModuleInvoker(
      'song_url_v1',
      sdkModuleRegistry.song_url_v1,
      config,
      context,
    ),
    songWikiSummary: createEffectModuleInvoker(
      'song_wiki_summary',
      sdkModuleRegistry.song_wiki_summary,
      config,
      context,
    ),
    starpickCommentsSummary: createEffectModuleInvoker(
      'starpick_comments_summary',
      sdkModuleRegistry.starpick_comments_summary,
      config,
      context,
    ),
    styleAlbum: createEffectModuleInvoker(
      'style_album',
      sdkModuleRegistry.style_album,
      config,
      context,
    ),
    styleArtist: createEffectModuleInvoker(
      'style_artist',
      sdkModuleRegistry.style_artist,
      config,
      context,
    ),
    styleDetail: createEffectModuleInvoker(
      'style_detail',
      sdkModuleRegistry.style_detail,
      config,
      context,
    ),
    styleList: createEffectModuleInvoker(
      'style_list',
      sdkModuleRegistry.style_list,
      config,
      context,
    ),
    stylePlaylist: createEffectModuleInvoker(
      'style_playlist',
      sdkModuleRegistry.style_playlist,
      config,
      context,
    ),
    stylePreference: createEffectModuleInvoker(
      'style_preference',
      sdkModuleRegistry.style_preference,
      config,
      context,
    ),
    styleSong: createEffectModuleInvoker(
      'style_song',
      sdkModuleRegistry.style_song,
      config,
      context,
    ),
    summaryAnnual: createEffectModuleInvoker(
      'summary_annual',
      sdkModuleRegistry.summary_annual,
      config,
      context,
    ),
    topAlbum: createEffectModuleInvoker(
      'top_album',
      sdkModuleRegistry.top_album,
      config,
      context,
    ),
    topArtists: createEffectModuleInvoker(
      'top_artists',
      sdkModuleRegistry.top_artists,
      config,
      context,
    ),
    topList: createEffectModuleInvoker(
      'top_list',
      sdkModuleRegistry.top_list,
      config,
      context,
    ),
    topMv: createEffectModuleInvoker(
      'top_mv',
      sdkModuleRegistry.top_mv,
      config,
      context,
    ),
    topPlaylist: createEffectModuleInvoker(
      'top_playlist',
      sdkModuleRegistry.top_playlist,
      config,
      context,
    ),
    topPlaylistHighquality: createEffectModuleInvoker(
      'top_playlist_highquality',
      sdkModuleRegistry.top_playlist_highquality,
      config,
      context,
    ),
    topSong: createEffectModuleInvoker(
      'top_song',
      sdkModuleRegistry.top_song,
      config,
      context,
    ),
    topicDetail: createEffectModuleInvoker(
      'topic_detail',
      sdkModuleRegistry.topic_detail,
      config,
      context,
    ),
    topicDetailEventHot: createEffectModuleInvoker(
      'topic_detail_event_hot',
      sdkModuleRegistry.topic_detail_event_hot,
      config,
      context,
    ),
    topicSublist: createEffectModuleInvoker(
      'topic_sublist',
      sdkModuleRegistry.topic_sublist,
      config,
      context,
    ),
    toplist: createEffectModuleInvoker(
      'toplist',
      sdkModuleRegistry.toplist,
      config,
      context,
    ),
    toplistArtist: createEffectModuleInvoker(
      'toplist_artist',
      sdkModuleRegistry.toplist_artist,
      config,
      context,
    ),
    toplistDetail: createEffectModuleInvoker(
      'toplist_detail',
      sdkModuleRegistry.toplist_detail,
      config,
      context,
    ),
    ugcAlbumGet: createEffectModuleInvoker(
      'ugc_album_get',
      sdkModuleRegistry.ugc_album_get,
      config,
      context,
    ),
    ugcArtistGet: createEffectModuleInvoker(
      'ugc_artist_get',
      sdkModuleRegistry.ugc_artist_get,
      config,
      context,
    ),
    ugcArtistSearch: createEffectModuleInvoker(
      'ugc_artist_search',
      sdkModuleRegistry.ugc_artist_search,
      config,
      context,
    ),
    ugcDetail: createEffectModuleInvoker(
      'ugc_detail',
      sdkModuleRegistry.ugc_detail,
      config,
      context,
    ),
    ugcMvGet: createEffectModuleInvoker(
      'ugc_mv_get',
      sdkModuleRegistry.ugc_mv_get,
      config,
      context,
    ),
    ugcSongGet: createEffectModuleInvoker(
      'ugc_song_get',
      sdkModuleRegistry.ugc_song_get,
      config,
      context,
    ),
    ugcUserDevote: createEffectModuleInvoker(
      'ugc_user_devote',
      sdkModuleRegistry.ugc_user_devote,
      config,
      context,
    ),
    userAccount: createEffectModuleInvoker(
      'user_account',
      sdkModuleRegistry.user_account,
      config,
      context,
    ),
    userAudio: createEffectModuleInvoker(
      'user_audio',
      sdkModuleRegistry.user_audio,
      config,
      context,
    ),
    userBinding: createEffectModuleInvoker(
      'user_binding',
      sdkModuleRegistry.user_binding,
      config,
      context,
    ),
    userCloud: createEffectModuleInvoker(
      'user_cloud',
      sdkModuleRegistry.user_cloud,
      config,
      context,
    ),
    userCloudDel: createEffectModuleInvoker(
      'user_cloud_del',
      sdkModuleRegistry.user_cloud_del,
      config,
      context,
    ),
    userCloudDetail: createEffectModuleInvoker(
      'user_cloud_detail',
      sdkModuleRegistry.user_cloud_detail,
      config,
      context,
    ),
    userCommentHistory: createEffectModuleInvoker(
      'user_comment_history',
      sdkModuleRegistry.user_comment_history,
      config,
      context,
    ),
    userDetail: createEffectModuleInvoker(
      'user_detail',
      sdkModuleRegistry.user_detail,
      config,
      context,
    ),
    userDj: createEffectModuleInvoker(
      'user_dj',
      sdkModuleRegistry.user_dj,
      config,
      context,
    ),
    userEvent: createEffectModuleInvoker(
      'user_event',
      sdkModuleRegistry.user_event,
      config,
      context,
    ),
    userFollowMixed: createEffectModuleInvoker(
      'user_follow_mixed',
      sdkModuleRegistry.user_follow_mixed,
      config,
      context,
    ),
    userFolloweds: createEffectModuleInvoker(
      'user_followeds',
      sdkModuleRegistry.user_followeds,
      config,
      context,
    ),
    userFollows: createEffectModuleInvoker(
      'user_follows',
      sdkModuleRegistry.user_follows,
      config,
      context,
    ),
    userLevel: createEffectModuleInvoker(
      'user_level',
      sdkModuleRegistry.user_level,
      config,
      context,
    ),
    userMedal: createEffectModuleInvoker(
      'user_medal',
      sdkModuleRegistry.user_medal,
      config,
      context,
    ),
    userMutualfollowGet: createEffectModuleInvoker(
      'user_mutualfollow_get',
      sdkModuleRegistry.user_mutualfollow_get,
      config,
      context,
    ),
    userPlaylist: createEffectModuleInvoker(
      'user_playlist',
      sdkModuleRegistry.user_playlist,
      config,
      context,
    ),
    userPlaylistCollect: createEffectModuleInvoker(
      'user_playlist_collect',
      sdkModuleRegistry.user_playlist_collect,
      config,
      context,
    ),
    userPlaylistCreate: createEffectModuleInvoker(
      'user_playlist_create',
      sdkModuleRegistry.user_playlist_create,
      config,
      context,
    ),
    userRecord: createEffectModuleInvoker(
      'user_record',
      sdkModuleRegistry.user_record,
      config,
      context,
    ),
    userReplacephone: createEffectModuleInvoker(
      'user_replacephone',
      sdkModuleRegistry.user_replacephone,
      config,
      context,
    ),
    userSocialStatus: createEffectModuleInvoker(
      'user_social_status',
      sdkModuleRegistry.user_social_status,
      config,
      context,
    ),
    userSocialStatusEdit: createEffectModuleInvoker(
      'user_social_status_edit',
      sdkModuleRegistry.user_social_status_edit,
      config,
      context,
    ),
    userSocialStatusRcmd: createEffectModuleInvoker(
      'user_social_status_rcmd',
      sdkModuleRegistry.user_social_status_rcmd,
      config,
      context,
    ),
    userSocialStatusSupport: createEffectModuleInvoker(
      'user_social_status_support',
      sdkModuleRegistry.user_social_status_support,
      config,
      context,
    ),
    userSubcount: createEffectModuleInvoker(
      'user_subcount',
      sdkModuleRegistry.user_subcount,
      config,
      context,
    ),
    userUpdate: createEffectModuleInvoker(
      'user_update',
      sdkModuleRegistry.user_update,
      config,
      context,
    ),
    verifyGetQr: createEffectModuleInvoker(
      'verify_getQr',
      sdkModuleRegistry.verify_getQr,
      config,
      context,
    ),
    verifyQrcodestatus: createEffectModuleInvoker(
      'verify_qrcodestatus',
      sdkModuleRegistry.verify_qrcodestatus,
      config,
      context,
    ),
    videoCategoryList: createEffectModuleInvoker(
      'video_category_list',
      sdkModuleRegistry.video_category_list,
      config,
      context,
    ),
    videoDetail: createEffectModuleInvoker(
      'video_detail',
      sdkModuleRegistry.video_detail,
      config,
      context,
    ),
    videoDetailInfo: createEffectModuleInvoker(
      'video_detail_info',
      sdkModuleRegistry.video_detail_info,
      config,
      context,
    ),
    videoGroup: createEffectModuleInvoker(
      'video_group',
      sdkModuleRegistry.video_group,
      config,
      context,
    ),
    videoGroupList: createEffectModuleInvoker(
      'video_group_list',
      sdkModuleRegistry.video_group_list,
      config,
      context,
    ),
    videoSub: createEffectModuleInvoker(
      'video_sub',
      sdkModuleRegistry.video_sub,
      config,
      context,
    ),
    videoTimelineAll: createEffectModuleInvoker(
      'video_timeline_all',
      sdkModuleRegistry.video_timeline_all,
      config,
      context,
    ),
    videoTimelineRecommend: createEffectModuleInvoker(
      'video_timeline_recommend',
      sdkModuleRegistry.video_timeline_recommend,
      config,
      context,
    ),
    videoUrl: createEffectModuleInvoker(
      'video_url',
      sdkModuleRegistry.video_url,
      config,
      context,
    ),
    vipGrowthpoint: createEffectModuleInvoker(
      'vip_growthpoint',
      sdkModuleRegistry.vip_growthpoint,
      config,
      context,
    ),
    vipGrowthpointDetails: createEffectModuleInvoker(
      'vip_growthpoint_details',
      sdkModuleRegistry.vip_growthpoint_details,
      config,
      context,
    ),
    vipGrowthpointGet: createEffectModuleInvoker(
      'vip_growthpoint_get',
      sdkModuleRegistry.vip_growthpoint_get,
      config,
      context,
    ),
    vipInfo: createEffectModuleInvoker(
      'vip_info',
      sdkModuleRegistry.vip_info,
      config,
      context,
    ),
    vipInfoV2: createEffectModuleInvoker(
      'vip_info_v2',
      sdkModuleRegistry.vip_info_v2,
      config,
      context,
    ),
    vipTasks: createEffectModuleInvoker(
      'vip_tasks',
      sdkModuleRegistry.vip_tasks,
      config,
      context,
    ),
    vipTimemachine: createEffectModuleInvoker(
      'vip_timemachine',
      sdkModuleRegistry.vip_timemachine,
      config,
      context,
    ),
    voiceDelete: createEffectModuleInvoker(
      'voice_delete',
      sdkModuleRegistry.voice_delete,
      config,
      context,
    ),
    voiceDetail: createEffectModuleInvoker(
      'voice_detail',
      sdkModuleRegistry.voice_detail,
      config,
      context,
    ),
    voiceLyric: createEffectModuleInvoker(
      'voice_lyric',
      sdkModuleRegistry.voice_lyric,
      config,
      context,
    ),
    voiceUpload: createEffectModuleInvoker(
      'voice_upload',
      sdkModuleRegistry.voice_upload,
      config,
      context,
    ),
    voicelistDetail: createEffectModuleInvoker(
      'voicelist_detail',
      sdkModuleRegistry.voicelist_detail,
      config,
      context,
    ),
    voicelistList: createEffectModuleInvoker(
      'voicelist_list',
      sdkModuleRegistry.voicelist_list,
      config,
      context,
    ),
    voicelistListSearch: createEffectModuleInvoker(
      'voicelist_list_search',
      sdkModuleRegistry.voicelist_list_search,
      config,
      context,
    ),
    voicelistSearch: createEffectModuleInvoker(
      'voicelist_search',
      sdkModuleRegistry.voicelist_search,
      config,
      context,
    ),
    voicelistTrans: createEffectModuleInvoker(
      'voicelist_trans',
      sdkModuleRegistry.voicelist_trans,
      config,
      context,
    ),
    yunbei: createEffectModuleInvoker(
      'yunbei',
      sdkModuleRegistry.yunbei,
      config,
      context,
    ),
    yunbeiExpense: createEffectModuleInvoker(
      'yunbei_expense',
      sdkModuleRegistry.yunbei_expense,
      config,
      context,
    ),
    yunbeiInfo: createEffectModuleInvoker(
      'yunbei_info',
      sdkModuleRegistry.yunbei_info,
      config,
      context,
    ),
    yunbeiRcmdSong: createEffectModuleInvoker(
      'yunbei_rcmd_song',
      sdkModuleRegistry.yunbei_rcmd_song,
      config,
      context,
    ),
    yunbeiRcmdSongHistory: createEffectModuleInvoker(
      'yunbei_rcmd_song_history',
      sdkModuleRegistry.yunbei_rcmd_song_history,
      config,
      context,
    ),
    yunbeiReceipt: createEffectModuleInvoker(
      'yunbei_receipt',
      sdkModuleRegistry.yunbei_receipt,
      config,
      context,
    ),
    yunbeiSign: createEffectModuleInvoker(
      'yunbei_sign',
      sdkModuleRegistry.yunbei_sign,
      config,
      context,
    ),
    yunbeiTaskFinish: createEffectModuleInvoker(
      'yunbei_task_finish',
      sdkModuleRegistry.yunbei_task_finish,
      config,
      context,
    ),
    yunbeiTasks: createEffectModuleInvoker(
      'yunbei_tasks',
      sdkModuleRegistry.yunbei_tasks,
      config,
      context,
    ),
    yunbeiTasksTodo: createEffectModuleInvoker(
      'yunbei_tasks_todo',
      sdkModuleRegistry.yunbei_tasks_todo,
      config,
      context,
    ),
    yunbeiToday: createEffectModuleInvoker(
      'yunbei_today',
      sdkModuleRegistry.yunbei_today,
      config,
      context,
    ),
  };
};
