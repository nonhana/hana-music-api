import type { CreateHanaMusicApiConfig, SdkModuleInvoker } from '../../types/index.ts'

import { createModuleInvoker } from '../runtime.ts'
import { sdkModuleRegistry } from './registry.generated.ts'

export interface HanaMusicApiClient {
  activateInitProfile: SdkModuleInvoker<'activate_init_profile'>
  aidjContentRcmd: SdkModuleInvoker<'aidj_content_rcmd'>
  album: SdkModuleInvoker<'album'>
  albumDetail: SdkModuleInvoker<'album_detail'>
  albumDetailDynamic: SdkModuleInvoker<'album_detail_dynamic'>
  albumList: SdkModuleInvoker<'album_list'>
  albumListStyle: SdkModuleInvoker<'album_list_style'>
  albumNew: SdkModuleInvoker<'album_new'>
  albumNewest: SdkModuleInvoker<'album_newest'>
  albumPrivilege: SdkModuleInvoker<'album_privilege'>
  albumSongsaleboard: SdkModuleInvoker<'album_songsaleboard'>
  albumSub: SdkModuleInvoker<'album_sub'>
  albumSublist: SdkModuleInvoker<'album_sublist'>
  artistAlbum: SdkModuleInvoker<'artist_album'>
  artistDesc: SdkModuleInvoker<'artist_desc'>
  artistDetail: SdkModuleInvoker<'artist_detail'>
  artistDetailDynamic: SdkModuleInvoker<'artist_detail_dynamic'>
  artistFans: SdkModuleInvoker<'artist_fans'>
  artistFollowCount: SdkModuleInvoker<'artist_follow_count'>
  artistList: SdkModuleInvoker<'artist_list'>
  artistMv: SdkModuleInvoker<'artist_mv'>
  artistNewMv: SdkModuleInvoker<'artist_new_mv'>
  artistNewSong: SdkModuleInvoker<'artist_new_song'>
  artistSongs: SdkModuleInvoker<'artist_songs'>
  artistSub: SdkModuleInvoker<'artist_sub'>
  artistSublist: SdkModuleInvoker<'artist_sublist'>
  artistTopSong: SdkModuleInvoker<'artist_top_song'>
  artistVideo: SdkModuleInvoker<'artist_video'>
  artists: SdkModuleInvoker<'artists'>
  audioMatch: SdkModuleInvoker<'audio_match'>
  avatarUpload: SdkModuleInvoker<'avatar_upload'>
  banner: SdkModuleInvoker<'banner'>
  batch: SdkModuleInvoker<'batch'>
  broadcastCategoryRegionGet: SdkModuleInvoker<'broadcast_category_region_get'>
  broadcastChannelCollectList: SdkModuleInvoker<'broadcast_channel_collect_list'>
  broadcastChannelCurrentinfo: SdkModuleInvoker<'broadcast_channel_currentinfo'>
  broadcastChannelList: SdkModuleInvoker<'broadcast_channel_list'>
  broadcastSub: SdkModuleInvoker<'broadcast_sub'>
  calendar: SdkModuleInvoker<'calendar'>
  captchaSent: SdkModuleInvoker<'captcha_sent'>
  captchaVerify: SdkModuleInvoker<'captcha_verify'>
  cellphoneExistenceCheck: SdkModuleInvoker<'cellphone_existence_check'>
  checkMusic: SdkModuleInvoker<'check_music'>
  cloud: SdkModuleInvoker<'cloud'>
  cloudImport: SdkModuleInvoker<'cloud_import'>
  cloudMatch: SdkModuleInvoker<'cloud_match'>
  cloudsearch: SdkModuleInvoker<'cloudsearch'>
  comment: SdkModuleInvoker<'comment'>
  commentAlbum: SdkModuleInvoker<'comment_album'>
  commentDj: SdkModuleInvoker<'comment_dj'>
  commentEvent: SdkModuleInvoker<'comment_event'>
  commentFloor: SdkModuleInvoker<'comment_floor'>
  commentHot: SdkModuleInvoker<'comment_hot'>
  commentHugList: SdkModuleInvoker<'comment_hug_list'>
  commentLike: SdkModuleInvoker<'comment_like'>
  commentMusic: SdkModuleInvoker<'comment_music'>
  commentMv: SdkModuleInvoker<'comment_mv'>
  commentNew: SdkModuleInvoker<'comment_new'>
  commentPlaylist: SdkModuleInvoker<'comment_playlist'>
  commentVideo: SdkModuleInvoker<'comment_video'>
  countriesCodeList: SdkModuleInvoker<'countries_code_list'>
  dailySignin: SdkModuleInvoker<'daily_signin'>
  digitalAlbumDetail: SdkModuleInvoker<'digitalAlbum_detail'>
  digitalAlbumOrdering: SdkModuleInvoker<'digitalAlbum_ordering'>
  digitalAlbumPurchased: SdkModuleInvoker<'digitalAlbum_purchased'>
  digitalAlbumSales: SdkModuleInvoker<'digitalAlbum_sales'>
  djBanner: SdkModuleInvoker<'dj_banner'>
  djCategoryExcludehot: SdkModuleInvoker<'dj_category_excludehot'>
  djCategoryRecommend: SdkModuleInvoker<'dj_category_recommend'>
  djCatelist: SdkModuleInvoker<'dj_catelist'>
  djDetail: SdkModuleInvoker<'dj_detail'>
  djDifmAllStyleChannel: SdkModuleInvoker<'dj_difm_all_style_channel'>
  djDifmChannelSubscribe: SdkModuleInvoker<'dj_difm_channel_subscribe'>
  djDifmChannelUnsubscribe: SdkModuleInvoker<'dj_difm_channel_unsubscribe'>
  djDifmPlayingTracksList: SdkModuleInvoker<'dj_difm_playing_tracks_list'>
  djDifmSubscribeChannelsGet: SdkModuleInvoker<'dj_difm_subscribe_channels_get'>
  djHot: SdkModuleInvoker<'dj_hot'>
  djPaygift: SdkModuleInvoker<'dj_paygift'>
  djPersonalizeRecommend: SdkModuleInvoker<'dj_personalize_recommend'>
  djProgram: SdkModuleInvoker<'dj_program'>
  djProgramDetail: SdkModuleInvoker<'dj_program_detail'>
  djProgramToplist: SdkModuleInvoker<'dj_program_toplist'>
  djProgramToplistHours: SdkModuleInvoker<'dj_program_toplist_hours'>
  djRadioHot: SdkModuleInvoker<'dj_radio_hot'>
  djRecommend: SdkModuleInvoker<'dj_recommend'>
  djRecommendType: SdkModuleInvoker<'dj_recommend_type'>
  djSub: SdkModuleInvoker<'dj_sub'>
  djSublist: SdkModuleInvoker<'dj_sublist'>
  djSubscriber: SdkModuleInvoker<'dj_subscriber'>
  djTodayPerfered: SdkModuleInvoker<'dj_today_perfered'>
  djToplist: SdkModuleInvoker<'dj_toplist'>
  djToplistHours: SdkModuleInvoker<'dj_toplist_hours'>
  djToplistNewcomer: SdkModuleInvoker<'dj_toplist_newcomer'>
  djToplistPay: SdkModuleInvoker<'dj_toplist_pay'>
  djToplistPopular: SdkModuleInvoker<'dj_toplist_popular'>
  djRadioTop: SdkModuleInvoker<'djRadio_top'>
  event: SdkModuleInvoker<'event'>
  eventDel: SdkModuleInvoker<'event_del'>
  eventForward: SdkModuleInvoker<'event_forward'>
  fmTrash: SdkModuleInvoker<'fm_trash'>
  follow: SdkModuleInvoker<'follow'>
  getUserids: SdkModuleInvoker<'get_userids'>
  historyRecommendSongs: SdkModuleInvoker<'history_recommend_songs'>
  historyRecommendSongsDetail: SdkModuleInvoker<'history_recommend_songs_detail'>
  homepageBlockPage: SdkModuleInvoker<'homepage_block_page'>
  homepageDragonBall: SdkModuleInvoker<'homepage_dragon_ball'>
  hotTopic: SdkModuleInvoker<'hot_topic'>
  hugComment: SdkModuleInvoker<'hug_comment'>
  innerVersion: SdkModuleInvoker<'inner_version'>
  like: SdkModuleInvoker<'like'>
  likelist: SdkModuleInvoker<'likelist'>
  listenDataRealtimeReport: SdkModuleInvoker<'listen_data_realtime_report'>
  listenDataReport: SdkModuleInvoker<'listen_data_report'>
  listenDataTodaySong: SdkModuleInvoker<'listen_data_today_song'>
  listenDataTotal: SdkModuleInvoker<'listen_data_total'>
  listenDataYearReport: SdkModuleInvoker<'listen_data_year_report'>
  listentogetherAccept: SdkModuleInvoker<'listentogether_accept'>
  listentogetherEnd: SdkModuleInvoker<'listentogether_end'>
  listentogetherHeatbeat: SdkModuleInvoker<'listentogether_heatbeat'>
  listentogetherPlayCommand: SdkModuleInvoker<'listentogether_play_command'>
  listentogetherRoomCheck: SdkModuleInvoker<'listentogether_room_check'>
  listentogetherRoomCreate: SdkModuleInvoker<'listentogether_room_create'>
  listentogetherStatus: SdkModuleInvoker<'listentogether_status'>
  listentogetherSyncListCommand: SdkModuleInvoker<'listentogether_sync_list_command'>
  listentogetherSyncPlaylistGet: SdkModuleInvoker<'listentogether_sync_playlist_get'>
  login: SdkModuleInvoker<'login'>
  loginCellphone: SdkModuleInvoker<'login_cellphone'>
  loginQrCheck: SdkModuleInvoker<'login_qr_check'>
  loginQrCreate: SdkModuleInvoker<'login_qr_create'>
  loginQrKey: SdkModuleInvoker<'login_qr_key'>
  loginRefresh: SdkModuleInvoker<'login_refresh'>
  loginStatus: SdkModuleInvoker<'login_status'>
  logout: SdkModuleInvoker<'logout'>
  lyric: SdkModuleInvoker<'lyric'>
  lyricNew: SdkModuleInvoker<'lyric_new'>
  mlogMusicRcmd: SdkModuleInvoker<'mlog_music_rcmd'>
  mlogToVideo: SdkModuleInvoker<'mlog_to_video'>
  mlogUrl: SdkModuleInvoker<'mlog_url'>
  msgComments: SdkModuleInvoker<'msg_comments'>
  msgForwards: SdkModuleInvoker<'msg_forwards'>
  msgNotices: SdkModuleInvoker<'msg_notices'>
  msgPrivate: SdkModuleInvoker<'msg_private'>
  msgPrivateHistory: SdkModuleInvoker<'msg_private_history'>
  msgRecentcontact: SdkModuleInvoker<'msg_recentcontact'>
  musicFirstListenInfo: SdkModuleInvoker<'music_first_listen_info'>
  musicianCloudbean: SdkModuleInvoker<'musician_cloudbean'>
  musicianCloudbeanObtain: SdkModuleInvoker<'musician_cloudbean_obtain'>
  musicianDataOverview: SdkModuleInvoker<'musician_data_overview'>
  musicianPlayTrend: SdkModuleInvoker<'musician_play_trend'>
  musicianSign: SdkModuleInvoker<'musician_sign'>
  musicianTasks: SdkModuleInvoker<'musician_tasks'>
  musicianTasksNew: SdkModuleInvoker<'musician_tasks_new'>
  mvAll: SdkModuleInvoker<'mv_all'>
  mvDetail: SdkModuleInvoker<'mv_detail'>
  mvDetailInfo: SdkModuleInvoker<'mv_detail_info'>
  mvExclusiveRcmd: SdkModuleInvoker<'mv_exclusive_rcmd'>
  mvFirst: SdkModuleInvoker<'mv_first'>
  mvSub: SdkModuleInvoker<'mv_sub'>
  mvSublist: SdkModuleInvoker<'mv_sublist'>
  mvUrl: SdkModuleInvoker<'mv_url'>
  nicknameCheck: SdkModuleInvoker<'nickname_check'>
  personalFm: SdkModuleInvoker<'personal_fm'>
  personalFmMode: SdkModuleInvoker<'personal_fm_mode'>
  personalized: SdkModuleInvoker<'personalized'>
  personalizedDjprogram: SdkModuleInvoker<'personalized_djprogram'>
  personalizedMv: SdkModuleInvoker<'personalized_mv'>
  personalizedNewsong: SdkModuleInvoker<'personalized_newsong'>
  personalizedPrivatecontent: SdkModuleInvoker<'personalized_privatecontent'>
  personalizedPrivatecontentList: SdkModuleInvoker<'personalized_privatecontent_list'>
  plCount: SdkModuleInvoker<'pl_count'>
  playlistCatlist: SdkModuleInvoker<'playlist_catlist'>
  playlistCoverUpdate: SdkModuleInvoker<'playlist_cover_update'>
  playlistCreate: SdkModuleInvoker<'playlist_create'>
  playlistDelete: SdkModuleInvoker<'playlist_delete'>
  playlistDescUpdate: SdkModuleInvoker<'playlist_desc_update'>
  playlistDetail: SdkModuleInvoker<'playlist_detail'>
  playlistDetailDynamic: SdkModuleInvoker<'playlist_detail_dynamic'>
  playlistDetailRcmdGet: SdkModuleInvoker<'playlist_detail_rcmd_get'>
  playlistHighqualityTags: SdkModuleInvoker<'playlist_highquality_tags'>
  playlistHot: SdkModuleInvoker<'playlist_hot'>
  playlistImportNameTaskCreate: SdkModuleInvoker<'playlist_import_name_task_create'>
  playlistImportTaskStatus: SdkModuleInvoker<'playlist_import_task_status'>
  playlistMylike: SdkModuleInvoker<'playlist_mylike'>
  playlistNameUpdate: SdkModuleInvoker<'playlist_name_update'>
  playlistOrderUpdate: SdkModuleInvoker<'playlist_order_update'>
  playlistPrivacy: SdkModuleInvoker<'playlist_privacy'>
  playlistSubscribe: SdkModuleInvoker<'playlist_subscribe'>
  playlistSubscribers: SdkModuleInvoker<'playlist_subscribers'>
  playlistTagsUpdate: SdkModuleInvoker<'playlist_tags_update'>
  playlistTrackAdd: SdkModuleInvoker<'playlist_track_add'>
  playlistTrackAll: SdkModuleInvoker<'playlist_track_all'>
  playlistTrackDelete: SdkModuleInvoker<'playlist_track_delete'>
  playlistTracks: SdkModuleInvoker<'playlist_tracks'>
  playlistUpdate: SdkModuleInvoker<'playlist_update'>
  playlistUpdatePlaycount: SdkModuleInvoker<'playlist_update_playcount'>
  playlistVideoRecent: SdkModuleInvoker<'playlist_video_recent'>
  playmodeIntelligenceList: SdkModuleInvoker<'playmode_intelligence_list'>
  programRecommend: SdkModuleInvoker<'program_recommend'>
  rebind: SdkModuleInvoker<'rebind'>
  recentListenList: SdkModuleInvoker<'recent_listen_list'>
  recommendResource: SdkModuleInvoker<'recommend_resource'>
  recommendSongs: SdkModuleInvoker<'recommend_songs'>
  recommendSongsDislike: SdkModuleInvoker<'recommend_songs_dislike'>
  recordRecentAlbum: SdkModuleInvoker<'record_recent_album'>
  recordRecentDj: SdkModuleInvoker<'record_recent_dj'>
  recordRecentPlaylist: SdkModuleInvoker<'record_recent_playlist'>
  recordRecentSong: SdkModuleInvoker<'record_recent_song'>
  recordRecentVideo: SdkModuleInvoker<'record_recent_video'>
  recordRecentVoice: SdkModuleInvoker<'record_recent_voice'>
  registerAnonimous: SdkModuleInvoker<'register_anonimous'>
  registerCellphone: SdkModuleInvoker<'register_cellphone'>
  relatedAllvideo: SdkModuleInvoker<'related_allvideo'>
  relatedPlaylist: SdkModuleInvoker<'related_playlist'>
  resourceLike: SdkModuleInvoker<'resource_like'>
  scrobble: SdkModuleInvoker<'scrobble'>
  search: SdkModuleInvoker<'search'>
  searchDefault: SdkModuleInvoker<'search_default'>
  searchHot: SdkModuleInvoker<'search_hot'>
  searchHotDetail: SdkModuleInvoker<'search_hot_detail'>
  searchMatch: SdkModuleInvoker<'search_match'>
  searchMultimatch: SdkModuleInvoker<'search_multimatch'>
  searchSuggest: SdkModuleInvoker<'search_suggest'>
  sendAlbum: SdkModuleInvoker<'send_album'>
  sendPlaylist: SdkModuleInvoker<'send_playlist'>
  sendSong: SdkModuleInvoker<'send_song'>
  sendText: SdkModuleInvoker<'send_text'>
  setting: SdkModuleInvoker<'setting'>
  shareResource: SdkModuleInvoker<'share_resource'>
  sheetList: SdkModuleInvoker<'sheet_list'>
  sheetPreview: SdkModuleInvoker<'sheet_preview'>
  signHappyInfo: SdkModuleInvoker<'sign_happy_info'>
  signinProgress: SdkModuleInvoker<'signin_progress'>
  simiArtist: SdkModuleInvoker<'simi_artist'>
  simiMv: SdkModuleInvoker<'simi_mv'>
  simiPlaylist: SdkModuleInvoker<'simi_playlist'>
  simiSong: SdkModuleInvoker<'simi_song'>
  simiUser: SdkModuleInvoker<'simi_user'>
  songChorus: SdkModuleInvoker<'song_chorus'>
  songDetail: SdkModuleInvoker<'song_detail'>
  songDownlist: SdkModuleInvoker<'song_downlist'>
  songDownloadUrl: SdkModuleInvoker<'song_download_url'>
  songDownloadUrlV1: SdkModuleInvoker<'song_download_url_v1'>
  songDynamicCover: SdkModuleInvoker<'song_dynamic_cover'>
  songLikeCheck: SdkModuleInvoker<'song_like_check'>
  songLyricsMark: SdkModuleInvoker<'song_lyrics_mark'>
  songLyricsMarkAdd: SdkModuleInvoker<'song_lyrics_mark_add'>
  songLyricsMarkDel: SdkModuleInvoker<'song_lyrics_mark_del'>
  songLyricsMarkUserPage: SdkModuleInvoker<'song_lyrics_mark_user_page'>
  songMonthdownlist: SdkModuleInvoker<'song_monthdownlist'>
  songMusicDetail: SdkModuleInvoker<'song_music_detail'>
  songOrderUpdate: SdkModuleInvoker<'song_order_update'>
  songPurchased: SdkModuleInvoker<'song_purchased'>
  songRedCount: SdkModuleInvoker<'song_red_count'>
  songSingledownlist: SdkModuleInvoker<'song_singledownlist'>
  songUrl: SdkModuleInvoker<'song_url'>
  songUrlV1: SdkModuleInvoker<'song_url_v1'>
  songWikiSummary: SdkModuleInvoker<'song_wiki_summary'>
  starpickCommentsSummary: SdkModuleInvoker<'starpick_comments_summary'>
  styleAlbum: SdkModuleInvoker<'style_album'>
  styleArtist: SdkModuleInvoker<'style_artist'>
  styleDetail: SdkModuleInvoker<'style_detail'>
  styleList: SdkModuleInvoker<'style_list'>
  stylePlaylist: SdkModuleInvoker<'style_playlist'>
  stylePreference: SdkModuleInvoker<'style_preference'>
  styleSong: SdkModuleInvoker<'style_song'>
  summaryAnnual: SdkModuleInvoker<'summary_annual'>
  topAlbum: SdkModuleInvoker<'top_album'>
  topArtists: SdkModuleInvoker<'top_artists'>
  topList: SdkModuleInvoker<'top_list'>
  topMv: SdkModuleInvoker<'top_mv'>
  topPlaylist: SdkModuleInvoker<'top_playlist'>
  topPlaylistHighquality: SdkModuleInvoker<'top_playlist_highquality'>
  topSong: SdkModuleInvoker<'top_song'>
  topicDetail: SdkModuleInvoker<'topic_detail'>
  topicDetailEventHot: SdkModuleInvoker<'topic_detail_event_hot'>
  topicSublist: SdkModuleInvoker<'topic_sublist'>
  toplist: SdkModuleInvoker<'toplist'>
  toplistArtist: SdkModuleInvoker<'toplist_artist'>
  toplistDetail: SdkModuleInvoker<'toplist_detail'>
  ugcAlbumGet: SdkModuleInvoker<'ugc_album_get'>
  ugcArtistGet: SdkModuleInvoker<'ugc_artist_get'>
  ugcArtistSearch: SdkModuleInvoker<'ugc_artist_search'>
  ugcDetail: SdkModuleInvoker<'ugc_detail'>
  ugcMvGet: SdkModuleInvoker<'ugc_mv_get'>
  ugcSongGet: SdkModuleInvoker<'ugc_song_get'>
  ugcUserDevote: SdkModuleInvoker<'ugc_user_devote'>
  userAccount: SdkModuleInvoker<'user_account'>
  userAudio: SdkModuleInvoker<'user_audio'>
  userBinding: SdkModuleInvoker<'user_binding'>
  userCloud: SdkModuleInvoker<'user_cloud'>
  userCloudDel: SdkModuleInvoker<'user_cloud_del'>
  userCloudDetail: SdkModuleInvoker<'user_cloud_detail'>
  userCommentHistory: SdkModuleInvoker<'user_comment_history'>
  userDetail: SdkModuleInvoker<'user_detail'>
  userDj: SdkModuleInvoker<'user_dj'>
  userEvent: SdkModuleInvoker<'user_event'>
  userFollowMixed: SdkModuleInvoker<'user_follow_mixed'>
  userFolloweds: SdkModuleInvoker<'user_followeds'>
  userFollows: SdkModuleInvoker<'user_follows'>
  userLevel: SdkModuleInvoker<'user_level'>
  userMedal: SdkModuleInvoker<'user_medal'>
  userMutualfollowGet: SdkModuleInvoker<'user_mutualfollow_get'>
  userPlaylist: SdkModuleInvoker<'user_playlist'>
  userPlaylistCollect: SdkModuleInvoker<'user_playlist_collect'>
  userPlaylistCreate: SdkModuleInvoker<'user_playlist_create'>
  userRecord: SdkModuleInvoker<'user_record'>
  userReplacephone: SdkModuleInvoker<'user_replacephone'>
  userSocialStatus: SdkModuleInvoker<'user_social_status'>
  userSocialStatusEdit: SdkModuleInvoker<'user_social_status_edit'>
  userSocialStatusRcmd: SdkModuleInvoker<'user_social_status_rcmd'>
  userSocialStatusSupport: SdkModuleInvoker<'user_social_status_support'>
  userSubcount: SdkModuleInvoker<'user_subcount'>
  userUpdate: SdkModuleInvoker<'user_update'>
  verifyGetQr: SdkModuleInvoker<'verify_getQr'>
  verifyQrcodestatus: SdkModuleInvoker<'verify_qrcodestatus'>
  videoCategoryList: SdkModuleInvoker<'video_category_list'>
  videoDetail: SdkModuleInvoker<'video_detail'>
  videoDetailInfo: SdkModuleInvoker<'video_detail_info'>
  videoGroup: SdkModuleInvoker<'video_group'>
  videoGroupList: SdkModuleInvoker<'video_group_list'>
  videoSub: SdkModuleInvoker<'video_sub'>
  videoTimelineAll: SdkModuleInvoker<'video_timeline_all'>
  videoTimelineRecommend: SdkModuleInvoker<'video_timeline_recommend'>
  videoUrl: SdkModuleInvoker<'video_url'>
  vipGrowthpoint: SdkModuleInvoker<'vip_growthpoint'>
  vipGrowthpointDetails: SdkModuleInvoker<'vip_growthpoint_details'>
  vipGrowthpointGet: SdkModuleInvoker<'vip_growthpoint_get'>
  vipInfo: SdkModuleInvoker<'vip_info'>
  vipInfoV2: SdkModuleInvoker<'vip_info_v2'>
  vipTasks: SdkModuleInvoker<'vip_tasks'>
  vipTimemachine: SdkModuleInvoker<'vip_timemachine'>
  voiceDelete: SdkModuleInvoker<'voice_delete'>
  voiceDetail: SdkModuleInvoker<'voice_detail'>
  voiceLyric: SdkModuleInvoker<'voice_lyric'>
  voiceUpload: SdkModuleInvoker<'voice_upload'>
  voicelistDetail: SdkModuleInvoker<'voicelist_detail'>
  voicelistList: SdkModuleInvoker<'voicelist_list'>
  voicelistListSearch: SdkModuleInvoker<'voicelist_list_search'>
  voicelistSearch: SdkModuleInvoker<'voicelist_search'>
  voicelistTrans: SdkModuleInvoker<'voicelist_trans'>
  yunbei: SdkModuleInvoker<'yunbei'>
  yunbeiExpense: SdkModuleInvoker<'yunbei_expense'>
  yunbeiInfo: SdkModuleInvoker<'yunbei_info'>
  yunbeiRcmdSong: SdkModuleInvoker<'yunbei_rcmd_song'>
  yunbeiRcmdSongHistory: SdkModuleInvoker<'yunbei_rcmd_song_history'>
  yunbeiReceipt: SdkModuleInvoker<'yunbei_receipt'>
  yunbeiSign: SdkModuleInvoker<'yunbei_sign'>
  yunbeiTaskFinish: SdkModuleInvoker<'yunbei_task_finish'>
  yunbeiTasks: SdkModuleInvoker<'yunbei_tasks'>
  yunbeiTasksTodo: SdkModuleInvoker<'yunbei_tasks_todo'>
  yunbeiToday: SdkModuleInvoker<'yunbei_today'>
}

export const activateInitProfile = createModuleInvoker(
  'activate_init_profile',
  sdkModuleRegistry.activate_init_profile,
)
export const aidjContentRcmd = createModuleInvoker(
  'aidj_content_rcmd',
  sdkModuleRegistry.aidj_content_rcmd,
)
export const album = createModuleInvoker('album', sdkModuleRegistry.album)
export const albumDetail = createModuleInvoker('album_detail', sdkModuleRegistry.album_detail)
export const albumDetailDynamic = createModuleInvoker(
  'album_detail_dynamic',
  sdkModuleRegistry.album_detail_dynamic,
)
export const albumList = createModuleInvoker('album_list', sdkModuleRegistry.album_list)
export const albumListStyle = createModuleInvoker(
  'album_list_style',
  sdkModuleRegistry.album_list_style,
)
export const albumNew = createModuleInvoker('album_new', sdkModuleRegistry.album_new)
export const albumNewest = createModuleInvoker('album_newest', sdkModuleRegistry.album_newest)
export const albumPrivilege = createModuleInvoker(
  'album_privilege',
  sdkModuleRegistry.album_privilege,
)
export const albumSongsaleboard = createModuleInvoker(
  'album_songsaleboard',
  sdkModuleRegistry.album_songsaleboard,
)
export const albumSub = createModuleInvoker('album_sub', sdkModuleRegistry.album_sub)
export const albumSublist = createModuleInvoker('album_sublist', sdkModuleRegistry.album_sublist)
export const artistAlbum = createModuleInvoker('artist_album', sdkModuleRegistry.artist_album)
export const artistDesc = createModuleInvoker('artist_desc', sdkModuleRegistry.artist_desc)
export const artistDetail = createModuleInvoker('artist_detail', sdkModuleRegistry.artist_detail)
export const artistDetailDynamic = createModuleInvoker(
  'artist_detail_dynamic',
  sdkModuleRegistry.artist_detail_dynamic,
)
export const artistFans = createModuleInvoker('artist_fans', sdkModuleRegistry.artist_fans)
export const artistFollowCount = createModuleInvoker(
  'artist_follow_count',
  sdkModuleRegistry.artist_follow_count,
)
export const artistList = createModuleInvoker('artist_list', sdkModuleRegistry.artist_list)
export const artistMv = createModuleInvoker('artist_mv', sdkModuleRegistry.artist_mv)
export const artistNewMv = createModuleInvoker('artist_new_mv', sdkModuleRegistry.artist_new_mv)
export const artistNewSong = createModuleInvoker(
  'artist_new_song',
  sdkModuleRegistry.artist_new_song,
)
export const artistSongs = createModuleInvoker('artist_songs', sdkModuleRegistry.artist_songs)
export const artistSub = createModuleInvoker('artist_sub', sdkModuleRegistry.artist_sub)
export const artistSublist = createModuleInvoker('artist_sublist', sdkModuleRegistry.artist_sublist)
export const artistTopSong = createModuleInvoker(
  'artist_top_song',
  sdkModuleRegistry.artist_top_song,
)
export const artistVideo = createModuleInvoker('artist_video', sdkModuleRegistry.artist_video)
export const artists = createModuleInvoker('artists', sdkModuleRegistry.artists)
export const audioMatch = createModuleInvoker('audio_match', sdkModuleRegistry.audio_match)
export const avatarUpload = createModuleInvoker('avatar_upload', sdkModuleRegistry.avatar_upload)
export const banner = createModuleInvoker('banner', sdkModuleRegistry.banner)
export const batch = createModuleInvoker('batch', sdkModuleRegistry.batch)
export const broadcastCategoryRegionGet = createModuleInvoker(
  'broadcast_category_region_get',
  sdkModuleRegistry.broadcast_category_region_get,
)
export const broadcastChannelCollectList = createModuleInvoker(
  'broadcast_channel_collect_list',
  sdkModuleRegistry.broadcast_channel_collect_list,
)
export const broadcastChannelCurrentinfo = createModuleInvoker(
  'broadcast_channel_currentinfo',
  sdkModuleRegistry.broadcast_channel_currentinfo,
)
export const broadcastChannelList = createModuleInvoker(
  'broadcast_channel_list',
  sdkModuleRegistry.broadcast_channel_list,
)
export const broadcastSub = createModuleInvoker('broadcast_sub', sdkModuleRegistry.broadcast_sub)
export const calendar = createModuleInvoker('calendar', sdkModuleRegistry.calendar)
export const captchaSent = createModuleInvoker('captcha_sent', sdkModuleRegistry.captcha_sent)
export const captchaVerify = createModuleInvoker('captcha_verify', sdkModuleRegistry.captcha_verify)
export const cellphoneExistenceCheck = createModuleInvoker(
  'cellphone_existence_check',
  sdkModuleRegistry.cellphone_existence_check,
)
export const checkMusic = createModuleInvoker('check_music', sdkModuleRegistry.check_music)
export const cloud = createModuleInvoker('cloud', sdkModuleRegistry.cloud)
export const cloudImport = createModuleInvoker('cloud_import', sdkModuleRegistry.cloud_import)
export const cloudMatch = createModuleInvoker('cloud_match', sdkModuleRegistry.cloud_match)
export const cloudsearch = createModuleInvoker('cloudsearch', sdkModuleRegistry.cloudsearch)
export const comment = createModuleInvoker('comment', sdkModuleRegistry.comment)
export const commentAlbum = createModuleInvoker('comment_album', sdkModuleRegistry.comment_album)
export const commentDj = createModuleInvoker('comment_dj', sdkModuleRegistry.comment_dj)
export const commentEvent = createModuleInvoker('comment_event', sdkModuleRegistry.comment_event)
export const commentFloor = createModuleInvoker('comment_floor', sdkModuleRegistry.comment_floor)
export const commentHot = createModuleInvoker('comment_hot', sdkModuleRegistry.comment_hot)
export const commentHugList = createModuleInvoker(
  'comment_hug_list',
  sdkModuleRegistry.comment_hug_list,
)
export const commentLike = createModuleInvoker('comment_like', sdkModuleRegistry.comment_like)
export const commentMusic = createModuleInvoker('comment_music', sdkModuleRegistry.comment_music)
export const commentMv = createModuleInvoker('comment_mv', sdkModuleRegistry.comment_mv)
export const commentNew = createModuleInvoker('comment_new', sdkModuleRegistry.comment_new)
export const commentPlaylist = createModuleInvoker(
  'comment_playlist',
  sdkModuleRegistry.comment_playlist,
)
export const commentVideo = createModuleInvoker('comment_video', sdkModuleRegistry.comment_video)
export const countriesCodeList = createModuleInvoker(
  'countries_code_list',
  sdkModuleRegistry.countries_code_list,
)
export const dailySignin = createModuleInvoker('daily_signin', sdkModuleRegistry.daily_signin)
export const digitalAlbumDetail = createModuleInvoker(
  'digitalAlbum_detail',
  sdkModuleRegistry.digitalAlbum_detail,
)
export const digitalAlbumOrdering = createModuleInvoker(
  'digitalAlbum_ordering',
  sdkModuleRegistry.digitalAlbum_ordering,
)
export const digitalAlbumPurchased = createModuleInvoker(
  'digitalAlbum_purchased',
  sdkModuleRegistry.digitalAlbum_purchased,
)
export const digitalAlbumSales = createModuleInvoker(
  'digitalAlbum_sales',
  sdkModuleRegistry.digitalAlbum_sales,
)
export const djBanner = createModuleInvoker('dj_banner', sdkModuleRegistry.dj_banner)
export const djCategoryExcludehot = createModuleInvoker(
  'dj_category_excludehot',
  sdkModuleRegistry.dj_category_excludehot,
)
export const djCategoryRecommend = createModuleInvoker(
  'dj_category_recommend',
  sdkModuleRegistry.dj_category_recommend,
)
export const djCatelist = createModuleInvoker('dj_catelist', sdkModuleRegistry.dj_catelist)
export const djDetail = createModuleInvoker('dj_detail', sdkModuleRegistry.dj_detail)
export const djDifmAllStyleChannel = createModuleInvoker(
  'dj_difm_all_style_channel',
  sdkModuleRegistry.dj_difm_all_style_channel,
)
export const djDifmChannelSubscribe = createModuleInvoker(
  'dj_difm_channel_subscribe',
  sdkModuleRegistry.dj_difm_channel_subscribe,
)
export const djDifmChannelUnsubscribe = createModuleInvoker(
  'dj_difm_channel_unsubscribe',
  sdkModuleRegistry.dj_difm_channel_unsubscribe,
)
export const djDifmPlayingTracksList = createModuleInvoker(
  'dj_difm_playing_tracks_list',
  sdkModuleRegistry.dj_difm_playing_tracks_list,
)
export const djDifmSubscribeChannelsGet = createModuleInvoker(
  'dj_difm_subscribe_channels_get',
  sdkModuleRegistry.dj_difm_subscribe_channels_get,
)
export const djHot = createModuleInvoker('dj_hot', sdkModuleRegistry.dj_hot)
export const djPaygift = createModuleInvoker('dj_paygift', sdkModuleRegistry.dj_paygift)
export const djPersonalizeRecommend = createModuleInvoker(
  'dj_personalize_recommend',
  sdkModuleRegistry.dj_personalize_recommend,
)
export const djProgram = createModuleInvoker('dj_program', sdkModuleRegistry.dj_program)
export const djProgramDetail = createModuleInvoker(
  'dj_program_detail',
  sdkModuleRegistry.dj_program_detail,
)
export const djProgramToplist = createModuleInvoker(
  'dj_program_toplist',
  sdkModuleRegistry.dj_program_toplist,
)
export const djProgramToplistHours = createModuleInvoker(
  'dj_program_toplist_hours',
  sdkModuleRegistry.dj_program_toplist_hours,
)
export const djRadioHot = createModuleInvoker('dj_radio_hot', sdkModuleRegistry.dj_radio_hot)
export const djRecommend = createModuleInvoker('dj_recommend', sdkModuleRegistry.dj_recommend)
export const djRecommendType = createModuleInvoker(
  'dj_recommend_type',
  sdkModuleRegistry.dj_recommend_type,
)
export const djSub = createModuleInvoker('dj_sub', sdkModuleRegistry.dj_sub)
export const djSublist = createModuleInvoker('dj_sublist', sdkModuleRegistry.dj_sublist)
export const djSubscriber = createModuleInvoker('dj_subscriber', sdkModuleRegistry.dj_subscriber)
export const djTodayPerfered = createModuleInvoker(
  'dj_today_perfered',
  sdkModuleRegistry.dj_today_perfered,
)
export const djToplist = createModuleInvoker('dj_toplist', sdkModuleRegistry.dj_toplist)
export const djToplistHours = createModuleInvoker(
  'dj_toplist_hours',
  sdkModuleRegistry.dj_toplist_hours,
)
export const djToplistNewcomer = createModuleInvoker(
  'dj_toplist_newcomer',
  sdkModuleRegistry.dj_toplist_newcomer,
)
export const djToplistPay = createModuleInvoker('dj_toplist_pay', sdkModuleRegistry.dj_toplist_pay)
export const djToplistPopular = createModuleInvoker(
  'dj_toplist_popular',
  sdkModuleRegistry.dj_toplist_popular,
)
export const djRadioTop = createModuleInvoker('djRadio_top', sdkModuleRegistry.djRadio_top)
export const event = createModuleInvoker('event', sdkModuleRegistry.event)
export const eventDel = createModuleInvoker('event_del', sdkModuleRegistry.event_del)
export const eventForward = createModuleInvoker('event_forward', sdkModuleRegistry.event_forward)
export const fmTrash = createModuleInvoker('fm_trash', sdkModuleRegistry.fm_trash)
export const follow = createModuleInvoker('follow', sdkModuleRegistry.follow)
export const getUserids = createModuleInvoker('get_userids', sdkModuleRegistry.get_userids)
export const historyRecommendSongs = createModuleInvoker(
  'history_recommend_songs',
  sdkModuleRegistry.history_recommend_songs,
)
export const historyRecommendSongsDetail = createModuleInvoker(
  'history_recommend_songs_detail',
  sdkModuleRegistry.history_recommend_songs_detail,
)
export const homepageBlockPage = createModuleInvoker(
  'homepage_block_page',
  sdkModuleRegistry.homepage_block_page,
)
export const homepageDragonBall = createModuleInvoker(
  'homepage_dragon_ball',
  sdkModuleRegistry.homepage_dragon_ball,
)
export const hotTopic = createModuleInvoker('hot_topic', sdkModuleRegistry.hot_topic)
export const hugComment = createModuleInvoker('hug_comment', sdkModuleRegistry.hug_comment)
export const innerVersion = createModuleInvoker('inner_version', sdkModuleRegistry.inner_version)
export const like = createModuleInvoker('like', sdkModuleRegistry.like)
export const likelist = createModuleInvoker('likelist', sdkModuleRegistry.likelist)
export const listenDataRealtimeReport = createModuleInvoker(
  'listen_data_realtime_report',
  sdkModuleRegistry.listen_data_realtime_report,
)
export const listenDataReport = createModuleInvoker(
  'listen_data_report',
  sdkModuleRegistry.listen_data_report,
)
export const listenDataTodaySong = createModuleInvoker(
  'listen_data_today_song',
  sdkModuleRegistry.listen_data_today_song,
)
export const listenDataTotal = createModuleInvoker(
  'listen_data_total',
  sdkModuleRegistry.listen_data_total,
)
export const listenDataYearReport = createModuleInvoker(
  'listen_data_year_report',
  sdkModuleRegistry.listen_data_year_report,
)
export const listentogetherAccept = createModuleInvoker(
  'listentogether_accept',
  sdkModuleRegistry.listentogether_accept,
)
export const listentogetherEnd = createModuleInvoker(
  'listentogether_end',
  sdkModuleRegistry.listentogether_end,
)
export const listentogetherHeatbeat = createModuleInvoker(
  'listentogether_heatbeat',
  sdkModuleRegistry.listentogether_heatbeat,
)
export const listentogetherPlayCommand = createModuleInvoker(
  'listentogether_play_command',
  sdkModuleRegistry.listentogether_play_command,
)
export const listentogetherRoomCheck = createModuleInvoker(
  'listentogether_room_check',
  sdkModuleRegistry.listentogether_room_check,
)
export const listentogetherRoomCreate = createModuleInvoker(
  'listentogether_room_create',
  sdkModuleRegistry.listentogether_room_create,
)
export const listentogetherStatus = createModuleInvoker(
  'listentogether_status',
  sdkModuleRegistry.listentogether_status,
)
export const listentogetherSyncListCommand = createModuleInvoker(
  'listentogether_sync_list_command',
  sdkModuleRegistry.listentogether_sync_list_command,
)
export const listentogetherSyncPlaylistGet = createModuleInvoker(
  'listentogether_sync_playlist_get',
  sdkModuleRegistry.listentogether_sync_playlist_get,
)
export const login = createModuleInvoker('login', sdkModuleRegistry.login)
export const loginCellphone = createModuleInvoker(
  'login_cellphone',
  sdkModuleRegistry.login_cellphone,
)
export const loginQrCheck = createModuleInvoker('login_qr_check', sdkModuleRegistry.login_qr_check)
export const loginQrCreate = createModuleInvoker(
  'login_qr_create',
  sdkModuleRegistry.login_qr_create,
)
export const loginQrKey = createModuleInvoker('login_qr_key', sdkModuleRegistry.login_qr_key)
export const loginRefresh = createModuleInvoker('login_refresh', sdkModuleRegistry.login_refresh)
export const loginStatus = createModuleInvoker('login_status', sdkModuleRegistry.login_status)
export const logout = createModuleInvoker('logout', sdkModuleRegistry.logout)
export const lyric = createModuleInvoker('lyric', sdkModuleRegistry.lyric)
export const lyricNew = createModuleInvoker('lyric_new', sdkModuleRegistry.lyric_new)
export const mlogMusicRcmd = createModuleInvoker(
  'mlog_music_rcmd',
  sdkModuleRegistry.mlog_music_rcmd,
)
export const mlogToVideo = createModuleInvoker('mlog_to_video', sdkModuleRegistry.mlog_to_video)
export const mlogUrl = createModuleInvoker('mlog_url', sdkModuleRegistry.mlog_url)
export const msgComments = createModuleInvoker('msg_comments', sdkModuleRegistry.msg_comments)
export const msgForwards = createModuleInvoker('msg_forwards', sdkModuleRegistry.msg_forwards)
export const msgNotices = createModuleInvoker('msg_notices', sdkModuleRegistry.msg_notices)
export const msgPrivate = createModuleInvoker('msg_private', sdkModuleRegistry.msg_private)
export const msgPrivateHistory = createModuleInvoker(
  'msg_private_history',
  sdkModuleRegistry.msg_private_history,
)
export const msgRecentcontact = createModuleInvoker(
  'msg_recentcontact',
  sdkModuleRegistry.msg_recentcontact,
)
export const musicFirstListenInfo = createModuleInvoker(
  'music_first_listen_info',
  sdkModuleRegistry.music_first_listen_info,
)
export const musicianCloudbean = createModuleInvoker(
  'musician_cloudbean',
  sdkModuleRegistry.musician_cloudbean,
)
export const musicianCloudbeanObtain = createModuleInvoker(
  'musician_cloudbean_obtain',
  sdkModuleRegistry.musician_cloudbean_obtain,
)
export const musicianDataOverview = createModuleInvoker(
  'musician_data_overview',
  sdkModuleRegistry.musician_data_overview,
)
export const musicianPlayTrend = createModuleInvoker(
  'musician_play_trend',
  sdkModuleRegistry.musician_play_trend,
)
export const musicianSign = createModuleInvoker('musician_sign', sdkModuleRegistry.musician_sign)
export const musicianTasks = createModuleInvoker('musician_tasks', sdkModuleRegistry.musician_tasks)
export const musicianTasksNew = createModuleInvoker(
  'musician_tasks_new',
  sdkModuleRegistry.musician_tasks_new,
)
export const mvAll = createModuleInvoker('mv_all', sdkModuleRegistry.mv_all)
export const mvDetail = createModuleInvoker('mv_detail', sdkModuleRegistry.mv_detail)
export const mvDetailInfo = createModuleInvoker('mv_detail_info', sdkModuleRegistry.mv_detail_info)
export const mvExclusiveRcmd = createModuleInvoker(
  'mv_exclusive_rcmd',
  sdkModuleRegistry.mv_exclusive_rcmd,
)
export const mvFirst = createModuleInvoker('mv_first', sdkModuleRegistry.mv_first)
export const mvSub = createModuleInvoker('mv_sub', sdkModuleRegistry.mv_sub)
export const mvSublist = createModuleInvoker('mv_sublist', sdkModuleRegistry.mv_sublist)
export const mvUrl = createModuleInvoker('mv_url', sdkModuleRegistry.mv_url)
export const nicknameCheck = createModuleInvoker('nickname_check', sdkModuleRegistry.nickname_check)
export const personalFm = createModuleInvoker('personal_fm', sdkModuleRegistry.personal_fm)
export const personalFmMode = createModuleInvoker(
  'personal_fm_mode',
  sdkModuleRegistry.personal_fm_mode,
)
export const personalized = createModuleInvoker('personalized', sdkModuleRegistry.personalized)
export const personalizedDjprogram = createModuleInvoker(
  'personalized_djprogram',
  sdkModuleRegistry.personalized_djprogram,
)
export const personalizedMv = createModuleInvoker(
  'personalized_mv',
  sdkModuleRegistry.personalized_mv,
)
export const personalizedNewsong = createModuleInvoker(
  'personalized_newsong',
  sdkModuleRegistry.personalized_newsong,
)
export const personalizedPrivatecontent = createModuleInvoker(
  'personalized_privatecontent',
  sdkModuleRegistry.personalized_privatecontent,
)
export const personalizedPrivatecontentList = createModuleInvoker(
  'personalized_privatecontent_list',
  sdkModuleRegistry.personalized_privatecontent_list,
)
export const plCount = createModuleInvoker('pl_count', sdkModuleRegistry.pl_count)
export const playlistCatlist = createModuleInvoker(
  'playlist_catlist',
  sdkModuleRegistry.playlist_catlist,
)
export const playlistCoverUpdate = createModuleInvoker(
  'playlist_cover_update',
  sdkModuleRegistry.playlist_cover_update,
)
export const playlistCreate = createModuleInvoker(
  'playlist_create',
  sdkModuleRegistry.playlist_create,
)
export const playlistDelete = createModuleInvoker(
  'playlist_delete',
  sdkModuleRegistry.playlist_delete,
)
export const playlistDescUpdate = createModuleInvoker(
  'playlist_desc_update',
  sdkModuleRegistry.playlist_desc_update,
)
export const playlistDetail = createModuleInvoker(
  'playlist_detail',
  sdkModuleRegistry.playlist_detail,
)
export const playlistDetailDynamic = createModuleInvoker(
  'playlist_detail_dynamic',
  sdkModuleRegistry.playlist_detail_dynamic,
)
export const playlistDetailRcmdGet = createModuleInvoker(
  'playlist_detail_rcmd_get',
  sdkModuleRegistry.playlist_detail_rcmd_get,
)
export const playlistHighqualityTags = createModuleInvoker(
  'playlist_highquality_tags',
  sdkModuleRegistry.playlist_highquality_tags,
)
export const playlistHot = createModuleInvoker('playlist_hot', sdkModuleRegistry.playlist_hot)
export const playlistImportNameTaskCreate = createModuleInvoker(
  'playlist_import_name_task_create',
  sdkModuleRegistry.playlist_import_name_task_create,
)
export const playlistImportTaskStatus = createModuleInvoker(
  'playlist_import_task_status',
  sdkModuleRegistry.playlist_import_task_status,
)
export const playlistMylike = createModuleInvoker(
  'playlist_mylike',
  sdkModuleRegistry.playlist_mylike,
)
export const playlistNameUpdate = createModuleInvoker(
  'playlist_name_update',
  sdkModuleRegistry.playlist_name_update,
)
export const playlistOrderUpdate = createModuleInvoker(
  'playlist_order_update',
  sdkModuleRegistry.playlist_order_update,
)
export const playlistPrivacy = createModuleInvoker(
  'playlist_privacy',
  sdkModuleRegistry.playlist_privacy,
)
export const playlistSubscribe = createModuleInvoker(
  'playlist_subscribe',
  sdkModuleRegistry.playlist_subscribe,
)
export const playlistSubscribers = createModuleInvoker(
  'playlist_subscribers',
  sdkModuleRegistry.playlist_subscribers,
)
export const playlistTagsUpdate = createModuleInvoker(
  'playlist_tags_update',
  sdkModuleRegistry.playlist_tags_update,
)
export const playlistTrackAdd = createModuleInvoker(
  'playlist_track_add',
  sdkModuleRegistry.playlist_track_add,
)
export const playlistTrackAll = createModuleInvoker(
  'playlist_track_all',
  sdkModuleRegistry.playlist_track_all,
)
export const playlistTrackDelete = createModuleInvoker(
  'playlist_track_delete',
  sdkModuleRegistry.playlist_track_delete,
)
export const playlistTracks = createModuleInvoker(
  'playlist_tracks',
  sdkModuleRegistry.playlist_tracks,
)
export const playlistUpdate = createModuleInvoker(
  'playlist_update',
  sdkModuleRegistry.playlist_update,
)
export const playlistUpdatePlaycount = createModuleInvoker(
  'playlist_update_playcount',
  sdkModuleRegistry.playlist_update_playcount,
)
export const playlistVideoRecent = createModuleInvoker(
  'playlist_video_recent',
  sdkModuleRegistry.playlist_video_recent,
)
export const playmodeIntelligenceList = createModuleInvoker(
  'playmode_intelligence_list',
  sdkModuleRegistry.playmode_intelligence_list,
)
export const programRecommend = createModuleInvoker(
  'program_recommend',
  sdkModuleRegistry.program_recommend,
)
export const rebind = createModuleInvoker('rebind', sdkModuleRegistry.rebind)
export const recentListenList = createModuleInvoker(
  'recent_listen_list',
  sdkModuleRegistry.recent_listen_list,
)
export const recommendResource = createModuleInvoker(
  'recommend_resource',
  sdkModuleRegistry.recommend_resource,
)
export const recommendSongs = createModuleInvoker(
  'recommend_songs',
  sdkModuleRegistry.recommend_songs,
)
export const recommendSongsDislike = createModuleInvoker(
  'recommend_songs_dislike',
  sdkModuleRegistry.recommend_songs_dislike,
)
export const recordRecentAlbum = createModuleInvoker(
  'record_recent_album',
  sdkModuleRegistry.record_recent_album,
)
export const recordRecentDj = createModuleInvoker(
  'record_recent_dj',
  sdkModuleRegistry.record_recent_dj,
)
export const recordRecentPlaylist = createModuleInvoker(
  'record_recent_playlist',
  sdkModuleRegistry.record_recent_playlist,
)
export const recordRecentSong = createModuleInvoker(
  'record_recent_song',
  sdkModuleRegistry.record_recent_song,
)
export const recordRecentVideo = createModuleInvoker(
  'record_recent_video',
  sdkModuleRegistry.record_recent_video,
)
export const recordRecentVoice = createModuleInvoker(
  'record_recent_voice',
  sdkModuleRegistry.record_recent_voice,
)
export const registerAnonimous = createModuleInvoker(
  'register_anonimous',
  sdkModuleRegistry.register_anonimous,
)
export const registerCellphone = createModuleInvoker(
  'register_cellphone',
  sdkModuleRegistry.register_cellphone,
)
export const relatedAllvideo = createModuleInvoker(
  'related_allvideo',
  sdkModuleRegistry.related_allvideo,
)
export const relatedPlaylist = createModuleInvoker(
  'related_playlist',
  sdkModuleRegistry.related_playlist,
)
export const resourceLike = createModuleInvoker('resource_like', sdkModuleRegistry.resource_like)
export const scrobble = createModuleInvoker('scrobble', sdkModuleRegistry.scrobble)
export const search = createModuleInvoker('search', sdkModuleRegistry.search)
export const searchDefault = createModuleInvoker('search_default', sdkModuleRegistry.search_default)
export const searchHot = createModuleInvoker('search_hot', sdkModuleRegistry.search_hot)
export const searchHotDetail = createModuleInvoker(
  'search_hot_detail',
  sdkModuleRegistry.search_hot_detail,
)
export const searchMatch = createModuleInvoker('search_match', sdkModuleRegistry.search_match)
export const searchMultimatch = createModuleInvoker(
  'search_multimatch',
  sdkModuleRegistry.search_multimatch,
)
export const searchSuggest = createModuleInvoker('search_suggest', sdkModuleRegistry.search_suggest)
export const sendAlbum = createModuleInvoker('send_album', sdkModuleRegistry.send_album)
export const sendPlaylist = createModuleInvoker('send_playlist', sdkModuleRegistry.send_playlist)
export const sendSong = createModuleInvoker('send_song', sdkModuleRegistry.send_song)
export const sendText = createModuleInvoker('send_text', sdkModuleRegistry.send_text)
export const setting = createModuleInvoker('setting', sdkModuleRegistry.setting)
export const shareResource = createModuleInvoker('share_resource', sdkModuleRegistry.share_resource)
export const sheetList = createModuleInvoker('sheet_list', sdkModuleRegistry.sheet_list)
export const sheetPreview = createModuleInvoker('sheet_preview', sdkModuleRegistry.sheet_preview)
export const signHappyInfo = createModuleInvoker(
  'sign_happy_info',
  sdkModuleRegistry.sign_happy_info,
)
export const signinProgress = createModuleInvoker(
  'signin_progress',
  sdkModuleRegistry.signin_progress,
)
export const simiArtist = createModuleInvoker('simi_artist', sdkModuleRegistry.simi_artist)
export const simiMv = createModuleInvoker('simi_mv', sdkModuleRegistry.simi_mv)
export const simiPlaylist = createModuleInvoker('simi_playlist', sdkModuleRegistry.simi_playlist)
export const simiSong = createModuleInvoker('simi_song', sdkModuleRegistry.simi_song)
export const simiUser = createModuleInvoker('simi_user', sdkModuleRegistry.simi_user)
export const songChorus = createModuleInvoker('song_chorus', sdkModuleRegistry.song_chorus)
export const songDetail = createModuleInvoker('song_detail', sdkModuleRegistry.song_detail)
export const songDownlist = createModuleInvoker('song_downlist', sdkModuleRegistry.song_downlist)
export const songDownloadUrl = createModuleInvoker(
  'song_download_url',
  sdkModuleRegistry.song_download_url,
)
export const songDownloadUrlV1 = createModuleInvoker(
  'song_download_url_v1',
  sdkModuleRegistry.song_download_url_v1,
)
export const songDynamicCover = createModuleInvoker(
  'song_dynamic_cover',
  sdkModuleRegistry.song_dynamic_cover,
)
export const songLikeCheck = createModuleInvoker(
  'song_like_check',
  sdkModuleRegistry.song_like_check,
)
export const songLyricsMark = createModuleInvoker(
  'song_lyrics_mark',
  sdkModuleRegistry.song_lyrics_mark,
)
export const songLyricsMarkAdd = createModuleInvoker(
  'song_lyrics_mark_add',
  sdkModuleRegistry.song_lyrics_mark_add,
)
export const songLyricsMarkDel = createModuleInvoker(
  'song_lyrics_mark_del',
  sdkModuleRegistry.song_lyrics_mark_del,
)
export const songLyricsMarkUserPage = createModuleInvoker(
  'song_lyrics_mark_user_page',
  sdkModuleRegistry.song_lyrics_mark_user_page,
)
export const songMonthdownlist = createModuleInvoker(
  'song_monthdownlist',
  sdkModuleRegistry.song_monthdownlist,
)
export const songMusicDetail = createModuleInvoker(
  'song_music_detail',
  sdkModuleRegistry.song_music_detail,
)
export const songOrderUpdate = createModuleInvoker(
  'song_order_update',
  sdkModuleRegistry.song_order_update,
)
export const songPurchased = createModuleInvoker('song_purchased', sdkModuleRegistry.song_purchased)
export const songRedCount = createModuleInvoker('song_red_count', sdkModuleRegistry.song_red_count)
export const songSingledownlist = createModuleInvoker(
  'song_singledownlist',
  sdkModuleRegistry.song_singledownlist,
)
export const songUrl = createModuleInvoker('song_url', sdkModuleRegistry.song_url)
export const songUrlV1 = createModuleInvoker('song_url_v1', sdkModuleRegistry.song_url_v1)
export const songWikiSummary = createModuleInvoker(
  'song_wiki_summary',
  sdkModuleRegistry.song_wiki_summary,
)
export const starpickCommentsSummary = createModuleInvoker(
  'starpick_comments_summary',
  sdkModuleRegistry.starpick_comments_summary,
)
export const styleAlbum = createModuleInvoker('style_album', sdkModuleRegistry.style_album)
export const styleArtist = createModuleInvoker('style_artist', sdkModuleRegistry.style_artist)
export const styleDetail = createModuleInvoker('style_detail', sdkModuleRegistry.style_detail)
export const styleList = createModuleInvoker('style_list', sdkModuleRegistry.style_list)
export const stylePlaylist = createModuleInvoker('style_playlist', sdkModuleRegistry.style_playlist)
export const stylePreference = createModuleInvoker(
  'style_preference',
  sdkModuleRegistry.style_preference,
)
export const styleSong = createModuleInvoker('style_song', sdkModuleRegistry.style_song)
export const summaryAnnual = createModuleInvoker('summary_annual', sdkModuleRegistry.summary_annual)
export const topAlbum = createModuleInvoker('top_album', sdkModuleRegistry.top_album)
export const topArtists = createModuleInvoker('top_artists', sdkModuleRegistry.top_artists)
export const topList = createModuleInvoker('top_list', sdkModuleRegistry.top_list)
export const topMv = createModuleInvoker('top_mv', sdkModuleRegistry.top_mv)
export const topPlaylist = createModuleInvoker('top_playlist', sdkModuleRegistry.top_playlist)
export const topPlaylistHighquality = createModuleInvoker(
  'top_playlist_highquality',
  sdkModuleRegistry.top_playlist_highquality,
)
export const topSong = createModuleInvoker('top_song', sdkModuleRegistry.top_song)
export const topicDetail = createModuleInvoker('topic_detail', sdkModuleRegistry.topic_detail)
export const topicDetailEventHot = createModuleInvoker(
  'topic_detail_event_hot',
  sdkModuleRegistry.topic_detail_event_hot,
)
export const topicSublist = createModuleInvoker('topic_sublist', sdkModuleRegistry.topic_sublist)
export const toplist = createModuleInvoker('toplist', sdkModuleRegistry.toplist)
export const toplistArtist = createModuleInvoker('toplist_artist', sdkModuleRegistry.toplist_artist)
export const toplistDetail = createModuleInvoker('toplist_detail', sdkModuleRegistry.toplist_detail)
export const ugcAlbumGet = createModuleInvoker('ugc_album_get', sdkModuleRegistry.ugc_album_get)
export const ugcArtistGet = createModuleInvoker('ugc_artist_get', sdkModuleRegistry.ugc_artist_get)
export const ugcArtistSearch = createModuleInvoker(
  'ugc_artist_search',
  sdkModuleRegistry.ugc_artist_search,
)
export const ugcDetail = createModuleInvoker('ugc_detail', sdkModuleRegistry.ugc_detail)
export const ugcMvGet = createModuleInvoker('ugc_mv_get', sdkModuleRegistry.ugc_mv_get)
export const ugcSongGet = createModuleInvoker('ugc_song_get', sdkModuleRegistry.ugc_song_get)
export const ugcUserDevote = createModuleInvoker(
  'ugc_user_devote',
  sdkModuleRegistry.ugc_user_devote,
)
export const userAccount = createModuleInvoker('user_account', sdkModuleRegistry.user_account)
export const userAudio = createModuleInvoker('user_audio', sdkModuleRegistry.user_audio)
export const userBinding = createModuleInvoker('user_binding', sdkModuleRegistry.user_binding)
export const userCloud = createModuleInvoker('user_cloud', sdkModuleRegistry.user_cloud)
export const userCloudDel = createModuleInvoker('user_cloud_del', sdkModuleRegistry.user_cloud_del)
export const userCloudDetail = createModuleInvoker(
  'user_cloud_detail',
  sdkModuleRegistry.user_cloud_detail,
)
export const userCommentHistory = createModuleInvoker(
  'user_comment_history',
  sdkModuleRegistry.user_comment_history,
)
export const userDetail = createModuleInvoker('user_detail', sdkModuleRegistry.user_detail)
export const userDj = createModuleInvoker('user_dj', sdkModuleRegistry.user_dj)
export const userEvent = createModuleInvoker('user_event', sdkModuleRegistry.user_event)
export const userFollowMixed = createModuleInvoker(
  'user_follow_mixed',
  sdkModuleRegistry.user_follow_mixed,
)
export const userFolloweds = createModuleInvoker('user_followeds', sdkModuleRegistry.user_followeds)
export const userFollows = createModuleInvoker('user_follows', sdkModuleRegistry.user_follows)
export const userLevel = createModuleInvoker('user_level', sdkModuleRegistry.user_level)
export const userMedal = createModuleInvoker('user_medal', sdkModuleRegistry.user_medal)
export const userMutualfollowGet = createModuleInvoker(
  'user_mutualfollow_get',
  sdkModuleRegistry.user_mutualfollow_get,
)
export const userPlaylist = createModuleInvoker('user_playlist', sdkModuleRegistry.user_playlist)
export const userPlaylistCollect = createModuleInvoker(
  'user_playlist_collect',
  sdkModuleRegistry.user_playlist_collect,
)
export const userPlaylistCreate = createModuleInvoker(
  'user_playlist_create',
  sdkModuleRegistry.user_playlist_create,
)
export const userRecord = createModuleInvoker('user_record', sdkModuleRegistry.user_record)
export const userReplacephone = createModuleInvoker(
  'user_replacephone',
  sdkModuleRegistry.user_replacephone,
)
export const userSocialStatus = createModuleInvoker(
  'user_social_status',
  sdkModuleRegistry.user_social_status,
)
export const userSocialStatusEdit = createModuleInvoker(
  'user_social_status_edit',
  sdkModuleRegistry.user_social_status_edit,
)
export const userSocialStatusRcmd = createModuleInvoker(
  'user_social_status_rcmd',
  sdkModuleRegistry.user_social_status_rcmd,
)
export const userSocialStatusSupport = createModuleInvoker(
  'user_social_status_support',
  sdkModuleRegistry.user_social_status_support,
)
export const userSubcount = createModuleInvoker('user_subcount', sdkModuleRegistry.user_subcount)
export const userUpdate = createModuleInvoker('user_update', sdkModuleRegistry.user_update)
export const verifyGetQr = createModuleInvoker('verify_getQr', sdkModuleRegistry.verify_getQr)
export const verifyQrcodestatus = createModuleInvoker(
  'verify_qrcodestatus',
  sdkModuleRegistry.verify_qrcodestatus,
)
export const videoCategoryList = createModuleInvoker(
  'video_category_list',
  sdkModuleRegistry.video_category_list,
)
export const videoDetail = createModuleInvoker('video_detail', sdkModuleRegistry.video_detail)
export const videoDetailInfo = createModuleInvoker(
  'video_detail_info',
  sdkModuleRegistry.video_detail_info,
)
export const videoGroup = createModuleInvoker('video_group', sdkModuleRegistry.video_group)
export const videoGroupList = createModuleInvoker(
  'video_group_list',
  sdkModuleRegistry.video_group_list,
)
export const videoSub = createModuleInvoker('video_sub', sdkModuleRegistry.video_sub)
export const videoTimelineAll = createModuleInvoker(
  'video_timeline_all',
  sdkModuleRegistry.video_timeline_all,
)
export const videoTimelineRecommend = createModuleInvoker(
  'video_timeline_recommend',
  sdkModuleRegistry.video_timeline_recommend,
)
export const videoUrl = createModuleInvoker('video_url', sdkModuleRegistry.video_url)
export const vipGrowthpoint = createModuleInvoker(
  'vip_growthpoint',
  sdkModuleRegistry.vip_growthpoint,
)
export const vipGrowthpointDetails = createModuleInvoker(
  'vip_growthpoint_details',
  sdkModuleRegistry.vip_growthpoint_details,
)
export const vipGrowthpointGet = createModuleInvoker(
  'vip_growthpoint_get',
  sdkModuleRegistry.vip_growthpoint_get,
)
export const vipInfo = createModuleInvoker('vip_info', sdkModuleRegistry.vip_info)
export const vipInfoV2 = createModuleInvoker('vip_info_v2', sdkModuleRegistry.vip_info_v2)
export const vipTasks = createModuleInvoker('vip_tasks', sdkModuleRegistry.vip_tasks)
export const vipTimemachine = createModuleInvoker(
  'vip_timemachine',
  sdkModuleRegistry.vip_timemachine,
)
export const voiceDelete = createModuleInvoker('voice_delete', sdkModuleRegistry.voice_delete)
export const voiceDetail = createModuleInvoker('voice_detail', sdkModuleRegistry.voice_detail)
export const voiceLyric = createModuleInvoker('voice_lyric', sdkModuleRegistry.voice_lyric)
export const voiceUpload = createModuleInvoker('voice_upload', sdkModuleRegistry.voice_upload)
export const voicelistDetail = createModuleInvoker(
  'voicelist_detail',
  sdkModuleRegistry.voicelist_detail,
)
export const voicelistList = createModuleInvoker('voicelist_list', sdkModuleRegistry.voicelist_list)
export const voicelistListSearch = createModuleInvoker(
  'voicelist_list_search',
  sdkModuleRegistry.voicelist_list_search,
)
export const voicelistSearch = createModuleInvoker(
  'voicelist_search',
  sdkModuleRegistry.voicelist_search,
)
export const voicelistTrans = createModuleInvoker(
  'voicelist_trans',
  sdkModuleRegistry.voicelist_trans,
)
export const yunbei = createModuleInvoker('yunbei', sdkModuleRegistry.yunbei)
export const yunbeiExpense = createModuleInvoker('yunbei_expense', sdkModuleRegistry.yunbei_expense)
export const yunbeiInfo = createModuleInvoker('yunbei_info', sdkModuleRegistry.yunbei_info)
export const yunbeiRcmdSong = createModuleInvoker(
  'yunbei_rcmd_song',
  sdkModuleRegistry.yunbei_rcmd_song,
)
export const yunbeiRcmdSongHistory = createModuleInvoker(
  'yunbei_rcmd_song_history',
  sdkModuleRegistry.yunbei_rcmd_song_history,
)
export const yunbeiReceipt = createModuleInvoker('yunbei_receipt', sdkModuleRegistry.yunbei_receipt)
export const yunbeiSign = createModuleInvoker('yunbei_sign', sdkModuleRegistry.yunbei_sign)
export const yunbeiTaskFinish = createModuleInvoker(
  'yunbei_task_finish',
  sdkModuleRegistry.yunbei_task_finish,
)
export const yunbeiTasks = createModuleInvoker('yunbei_tasks', sdkModuleRegistry.yunbei_tasks)
export const yunbeiTasksTodo = createModuleInvoker(
  'yunbei_tasks_todo',
  sdkModuleRegistry.yunbei_tasks_todo,
)
export const yunbeiToday = createModuleInvoker('yunbei_today', sdkModuleRegistry.yunbei_today)

export function createHanaMusicApi(config: CreateHanaMusicApiConfig = {}): HanaMusicApiClient {
  return {
    activateInitProfile: createModuleInvoker(
      'activate_init_profile',
      sdkModuleRegistry.activate_init_profile,
      config,
    ),
    aidjContentRcmd: createModuleInvoker(
      'aidj_content_rcmd',
      sdkModuleRegistry.aidj_content_rcmd,
      config,
    ),
    album: createModuleInvoker('album', sdkModuleRegistry.album, config),
    albumDetail: createModuleInvoker('album_detail', sdkModuleRegistry.album_detail, config),
    albumDetailDynamic: createModuleInvoker(
      'album_detail_dynamic',
      sdkModuleRegistry.album_detail_dynamic,
      config,
    ),
    albumList: createModuleInvoker('album_list', sdkModuleRegistry.album_list, config),
    albumListStyle: createModuleInvoker(
      'album_list_style',
      sdkModuleRegistry.album_list_style,
      config,
    ),
    albumNew: createModuleInvoker('album_new', sdkModuleRegistry.album_new, config),
    albumNewest: createModuleInvoker('album_newest', sdkModuleRegistry.album_newest, config),
    albumPrivilege: createModuleInvoker(
      'album_privilege',
      sdkModuleRegistry.album_privilege,
      config,
    ),
    albumSongsaleboard: createModuleInvoker(
      'album_songsaleboard',
      sdkModuleRegistry.album_songsaleboard,
      config,
    ),
    albumSub: createModuleInvoker('album_sub', sdkModuleRegistry.album_sub, config),
    albumSublist: createModuleInvoker('album_sublist', sdkModuleRegistry.album_sublist, config),
    artistAlbum: createModuleInvoker('artist_album', sdkModuleRegistry.artist_album, config),
    artistDesc: createModuleInvoker('artist_desc', sdkModuleRegistry.artist_desc, config),
    artistDetail: createModuleInvoker('artist_detail', sdkModuleRegistry.artist_detail, config),
    artistDetailDynamic: createModuleInvoker(
      'artist_detail_dynamic',
      sdkModuleRegistry.artist_detail_dynamic,
      config,
    ),
    artistFans: createModuleInvoker('artist_fans', sdkModuleRegistry.artist_fans, config),
    artistFollowCount: createModuleInvoker(
      'artist_follow_count',
      sdkModuleRegistry.artist_follow_count,
      config,
    ),
    artistList: createModuleInvoker('artist_list', sdkModuleRegistry.artist_list, config),
    artistMv: createModuleInvoker('artist_mv', sdkModuleRegistry.artist_mv, config),
    artistNewMv: createModuleInvoker('artist_new_mv', sdkModuleRegistry.artist_new_mv, config),
    artistNewSong: createModuleInvoker(
      'artist_new_song',
      sdkModuleRegistry.artist_new_song,
      config,
    ),
    artistSongs: createModuleInvoker('artist_songs', sdkModuleRegistry.artist_songs, config),
    artistSub: createModuleInvoker('artist_sub', sdkModuleRegistry.artist_sub, config),
    artistSublist: createModuleInvoker('artist_sublist', sdkModuleRegistry.artist_sublist, config),
    artistTopSong: createModuleInvoker(
      'artist_top_song',
      sdkModuleRegistry.artist_top_song,
      config,
    ),
    artistVideo: createModuleInvoker('artist_video', sdkModuleRegistry.artist_video, config),
    artists: createModuleInvoker('artists', sdkModuleRegistry.artists, config),
    audioMatch: createModuleInvoker('audio_match', sdkModuleRegistry.audio_match, config),
    avatarUpload: createModuleInvoker('avatar_upload', sdkModuleRegistry.avatar_upload, config),
    banner: createModuleInvoker('banner', sdkModuleRegistry.banner, config),
    batch: createModuleInvoker('batch', sdkModuleRegistry.batch, config),
    broadcastCategoryRegionGet: createModuleInvoker(
      'broadcast_category_region_get',
      sdkModuleRegistry.broadcast_category_region_get,
      config,
    ),
    broadcastChannelCollectList: createModuleInvoker(
      'broadcast_channel_collect_list',
      sdkModuleRegistry.broadcast_channel_collect_list,
      config,
    ),
    broadcastChannelCurrentinfo: createModuleInvoker(
      'broadcast_channel_currentinfo',
      sdkModuleRegistry.broadcast_channel_currentinfo,
      config,
    ),
    broadcastChannelList: createModuleInvoker(
      'broadcast_channel_list',
      sdkModuleRegistry.broadcast_channel_list,
      config,
    ),
    broadcastSub: createModuleInvoker('broadcast_sub', sdkModuleRegistry.broadcast_sub, config),
    calendar: createModuleInvoker('calendar', sdkModuleRegistry.calendar, config),
    captchaSent: createModuleInvoker('captcha_sent', sdkModuleRegistry.captcha_sent, config),
    captchaVerify: createModuleInvoker('captcha_verify', sdkModuleRegistry.captcha_verify, config),
    cellphoneExistenceCheck: createModuleInvoker(
      'cellphone_existence_check',
      sdkModuleRegistry.cellphone_existence_check,
      config,
    ),
    checkMusic: createModuleInvoker('check_music', sdkModuleRegistry.check_music, config),
    cloud: createModuleInvoker('cloud', sdkModuleRegistry.cloud, config),
    cloudImport: createModuleInvoker('cloud_import', sdkModuleRegistry.cloud_import, config),
    cloudMatch: createModuleInvoker('cloud_match', sdkModuleRegistry.cloud_match, config),
    cloudsearch: createModuleInvoker('cloudsearch', sdkModuleRegistry.cloudsearch, config),
    comment: createModuleInvoker('comment', sdkModuleRegistry.comment, config),
    commentAlbum: createModuleInvoker('comment_album', sdkModuleRegistry.comment_album, config),
    commentDj: createModuleInvoker('comment_dj', sdkModuleRegistry.comment_dj, config),
    commentEvent: createModuleInvoker('comment_event', sdkModuleRegistry.comment_event, config),
    commentFloor: createModuleInvoker('comment_floor', sdkModuleRegistry.comment_floor, config),
    commentHot: createModuleInvoker('comment_hot', sdkModuleRegistry.comment_hot, config),
    commentHugList: createModuleInvoker(
      'comment_hug_list',
      sdkModuleRegistry.comment_hug_list,
      config,
    ),
    commentLike: createModuleInvoker('comment_like', sdkModuleRegistry.comment_like, config),
    commentMusic: createModuleInvoker('comment_music', sdkModuleRegistry.comment_music, config),
    commentMv: createModuleInvoker('comment_mv', sdkModuleRegistry.comment_mv, config),
    commentNew: createModuleInvoker('comment_new', sdkModuleRegistry.comment_new, config),
    commentPlaylist: createModuleInvoker(
      'comment_playlist',
      sdkModuleRegistry.comment_playlist,
      config,
    ),
    commentVideo: createModuleInvoker('comment_video', sdkModuleRegistry.comment_video, config),
    countriesCodeList: createModuleInvoker(
      'countries_code_list',
      sdkModuleRegistry.countries_code_list,
      config,
    ),
    dailySignin: createModuleInvoker('daily_signin', sdkModuleRegistry.daily_signin, config),
    digitalAlbumDetail: createModuleInvoker(
      'digitalAlbum_detail',
      sdkModuleRegistry.digitalAlbum_detail,
      config,
    ),
    digitalAlbumOrdering: createModuleInvoker(
      'digitalAlbum_ordering',
      sdkModuleRegistry.digitalAlbum_ordering,
      config,
    ),
    digitalAlbumPurchased: createModuleInvoker(
      'digitalAlbum_purchased',
      sdkModuleRegistry.digitalAlbum_purchased,
      config,
    ),
    digitalAlbumSales: createModuleInvoker(
      'digitalAlbum_sales',
      sdkModuleRegistry.digitalAlbum_sales,
      config,
    ),
    djBanner: createModuleInvoker('dj_banner', sdkModuleRegistry.dj_banner, config),
    djCategoryExcludehot: createModuleInvoker(
      'dj_category_excludehot',
      sdkModuleRegistry.dj_category_excludehot,
      config,
    ),
    djCategoryRecommend: createModuleInvoker(
      'dj_category_recommend',
      sdkModuleRegistry.dj_category_recommend,
      config,
    ),
    djCatelist: createModuleInvoker('dj_catelist', sdkModuleRegistry.dj_catelist, config),
    djDetail: createModuleInvoker('dj_detail', sdkModuleRegistry.dj_detail, config),
    djDifmAllStyleChannel: createModuleInvoker(
      'dj_difm_all_style_channel',
      sdkModuleRegistry.dj_difm_all_style_channel,
      config,
    ),
    djDifmChannelSubscribe: createModuleInvoker(
      'dj_difm_channel_subscribe',
      sdkModuleRegistry.dj_difm_channel_subscribe,
      config,
    ),
    djDifmChannelUnsubscribe: createModuleInvoker(
      'dj_difm_channel_unsubscribe',
      sdkModuleRegistry.dj_difm_channel_unsubscribe,
      config,
    ),
    djDifmPlayingTracksList: createModuleInvoker(
      'dj_difm_playing_tracks_list',
      sdkModuleRegistry.dj_difm_playing_tracks_list,
      config,
    ),
    djDifmSubscribeChannelsGet: createModuleInvoker(
      'dj_difm_subscribe_channels_get',
      sdkModuleRegistry.dj_difm_subscribe_channels_get,
      config,
    ),
    djHot: createModuleInvoker('dj_hot', sdkModuleRegistry.dj_hot, config),
    djPaygift: createModuleInvoker('dj_paygift', sdkModuleRegistry.dj_paygift, config),
    djPersonalizeRecommend: createModuleInvoker(
      'dj_personalize_recommend',
      sdkModuleRegistry.dj_personalize_recommend,
      config,
    ),
    djProgram: createModuleInvoker('dj_program', sdkModuleRegistry.dj_program, config),
    djProgramDetail: createModuleInvoker(
      'dj_program_detail',
      sdkModuleRegistry.dj_program_detail,
      config,
    ),
    djProgramToplist: createModuleInvoker(
      'dj_program_toplist',
      sdkModuleRegistry.dj_program_toplist,
      config,
    ),
    djProgramToplistHours: createModuleInvoker(
      'dj_program_toplist_hours',
      sdkModuleRegistry.dj_program_toplist_hours,
      config,
    ),
    djRadioHot: createModuleInvoker('dj_radio_hot', sdkModuleRegistry.dj_radio_hot, config),
    djRecommend: createModuleInvoker('dj_recommend', sdkModuleRegistry.dj_recommend, config),
    djRecommendType: createModuleInvoker(
      'dj_recommend_type',
      sdkModuleRegistry.dj_recommend_type,
      config,
    ),
    djSub: createModuleInvoker('dj_sub', sdkModuleRegistry.dj_sub, config),
    djSublist: createModuleInvoker('dj_sublist', sdkModuleRegistry.dj_sublist, config),
    djSubscriber: createModuleInvoker('dj_subscriber', sdkModuleRegistry.dj_subscriber, config),
    djTodayPerfered: createModuleInvoker(
      'dj_today_perfered',
      sdkModuleRegistry.dj_today_perfered,
      config,
    ),
    djToplist: createModuleInvoker('dj_toplist', sdkModuleRegistry.dj_toplist, config),
    djToplistHours: createModuleInvoker(
      'dj_toplist_hours',
      sdkModuleRegistry.dj_toplist_hours,
      config,
    ),
    djToplistNewcomer: createModuleInvoker(
      'dj_toplist_newcomer',
      sdkModuleRegistry.dj_toplist_newcomer,
      config,
    ),
    djToplistPay: createModuleInvoker('dj_toplist_pay', sdkModuleRegistry.dj_toplist_pay, config),
    djToplistPopular: createModuleInvoker(
      'dj_toplist_popular',
      sdkModuleRegistry.dj_toplist_popular,
      config,
    ),
    djRadioTop: createModuleInvoker('djRadio_top', sdkModuleRegistry.djRadio_top, config),
    event: createModuleInvoker('event', sdkModuleRegistry.event, config),
    eventDel: createModuleInvoker('event_del', sdkModuleRegistry.event_del, config),
    eventForward: createModuleInvoker('event_forward', sdkModuleRegistry.event_forward, config),
    fmTrash: createModuleInvoker('fm_trash', sdkModuleRegistry.fm_trash, config),
    follow: createModuleInvoker('follow', sdkModuleRegistry.follow, config),
    getUserids: createModuleInvoker('get_userids', sdkModuleRegistry.get_userids, config),
    historyRecommendSongs: createModuleInvoker(
      'history_recommend_songs',
      sdkModuleRegistry.history_recommend_songs,
      config,
    ),
    historyRecommendSongsDetail: createModuleInvoker(
      'history_recommend_songs_detail',
      sdkModuleRegistry.history_recommend_songs_detail,
      config,
    ),
    homepageBlockPage: createModuleInvoker(
      'homepage_block_page',
      sdkModuleRegistry.homepage_block_page,
      config,
    ),
    homepageDragonBall: createModuleInvoker(
      'homepage_dragon_ball',
      sdkModuleRegistry.homepage_dragon_ball,
      config,
    ),
    hotTopic: createModuleInvoker('hot_topic', sdkModuleRegistry.hot_topic, config),
    hugComment: createModuleInvoker('hug_comment', sdkModuleRegistry.hug_comment, config),
    innerVersion: createModuleInvoker('inner_version', sdkModuleRegistry.inner_version, config),
    like: createModuleInvoker('like', sdkModuleRegistry.like, config),
    likelist: createModuleInvoker('likelist', sdkModuleRegistry.likelist, config),
    listenDataRealtimeReport: createModuleInvoker(
      'listen_data_realtime_report',
      sdkModuleRegistry.listen_data_realtime_report,
      config,
    ),
    listenDataReport: createModuleInvoker(
      'listen_data_report',
      sdkModuleRegistry.listen_data_report,
      config,
    ),
    listenDataTodaySong: createModuleInvoker(
      'listen_data_today_song',
      sdkModuleRegistry.listen_data_today_song,
      config,
    ),
    listenDataTotal: createModuleInvoker(
      'listen_data_total',
      sdkModuleRegistry.listen_data_total,
      config,
    ),
    listenDataYearReport: createModuleInvoker(
      'listen_data_year_report',
      sdkModuleRegistry.listen_data_year_report,
      config,
    ),
    listentogetherAccept: createModuleInvoker(
      'listentogether_accept',
      sdkModuleRegistry.listentogether_accept,
      config,
    ),
    listentogetherEnd: createModuleInvoker(
      'listentogether_end',
      sdkModuleRegistry.listentogether_end,
      config,
    ),
    listentogetherHeatbeat: createModuleInvoker(
      'listentogether_heatbeat',
      sdkModuleRegistry.listentogether_heatbeat,
      config,
    ),
    listentogetherPlayCommand: createModuleInvoker(
      'listentogether_play_command',
      sdkModuleRegistry.listentogether_play_command,
      config,
    ),
    listentogetherRoomCheck: createModuleInvoker(
      'listentogether_room_check',
      sdkModuleRegistry.listentogether_room_check,
      config,
    ),
    listentogetherRoomCreate: createModuleInvoker(
      'listentogether_room_create',
      sdkModuleRegistry.listentogether_room_create,
      config,
    ),
    listentogetherStatus: createModuleInvoker(
      'listentogether_status',
      sdkModuleRegistry.listentogether_status,
      config,
    ),
    listentogetherSyncListCommand: createModuleInvoker(
      'listentogether_sync_list_command',
      sdkModuleRegistry.listentogether_sync_list_command,
      config,
    ),
    listentogetherSyncPlaylistGet: createModuleInvoker(
      'listentogether_sync_playlist_get',
      sdkModuleRegistry.listentogether_sync_playlist_get,
      config,
    ),
    login: createModuleInvoker('login', sdkModuleRegistry.login, config),
    loginCellphone: createModuleInvoker(
      'login_cellphone',
      sdkModuleRegistry.login_cellphone,
      config,
    ),
    loginQrCheck: createModuleInvoker('login_qr_check', sdkModuleRegistry.login_qr_check, config),
    loginQrCreate: createModuleInvoker(
      'login_qr_create',
      sdkModuleRegistry.login_qr_create,
      config,
    ),
    loginQrKey: createModuleInvoker('login_qr_key', sdkModuleRegistry.login_qr_key, config),
    loginRefresh: createModuleInvoker('login_refresh', sdkModuleRegistry.login_refresh, config),
    loginStatus: createModuleInvoker('login_status', sdkModuleRegistry.login_status, config),
    logout: createModuleInvoker('logout', sdkModuleRegistry.logout, config),
    lyric: createModuleInvoker('lyric', sdkModuleRegistry.lyric, config),
    lyricNew: createModuleInvoker('lyric_new', sdkModuleRegistry.lyric_new, config),
    mlogMusicRcmd: createModuleInvoker(
      'mlog_music_rcmd',
      sdkModuleRegistry.mlog_music_rcmd,
      config,
    ),
    mlogToVideo: createModuleInvoker('mlog_to_video', sdkModuleRegistry.mlog_to_video, config),
    mlogUrl: createModuleInvoker('mlog_url', sdkModuleRegistry.mlog_url, config),
    msgComments: createModuleInvoker('msg_comments', sdkModuleRegistry.msg_comments, config),
    msgForwards: createModuleInvoker('msg_forwards', sdkModuleRegistry.msg_forwards, config),
    msgNotices: createModuleInvoker('msg_notices', sdkModuleRegistry.msg_notices, config),
    msgPrivate: createModuleInvoker('msg_private', sdkModuleRegistry.msg_private, config),
    msgPrivateHistory: createModuleInvoker(
      'msg_private_history',
      sdkModuleRegistry.msg_private_history,
      config,
    ),
    msgRecentcontact: createModuleInvoker(
      'msg_recentcontact',
      sdkModuleRegistry.msg_recentcontact,
      config,
    ),
    musicFirstListenInfo: createModuleInvoker(
      'music_first_listen_info',
      sdkModuleRegistry.music_first_listen_info,
      config,
    ),
    musicianCloudbean: createModuleInvoker(
      'musician_cloudbean',
      sdkModuleRegistry.musician_cloudbean,
      config,
    ),
    musicianCloudbeanObtain: createModuleInvoker(
      'musician_cloudbean_obtain',
      sdkModuleRegistry.musician_cloudbean_obtain,
      config,
    ),
    musicianDataOverview: createModuleInvoker(
      'musician_data_overview',
      sdkModuleRegistry.musician_data_overview,
      config,
    ),
    musicianPlayTrend: createModuleInvoker(
      'musician_play_trend',
      sdkModuleRegistry.musician_play_trend,
      config,
    ),
    musicianSign: createModuleInvoker('musician_sign', sdkModuleRegistry.musician_sign, config),
    musicianTasks: createModuleInvoker('musician_tasks', sdkModuleRegistry.musician_tasks, config),
    musicianTasksNew: createModuleInvoker(
      'musician_tasks_new',
      sdkModuleRegistry.musician_tasks_new,
      config,
    ),
    mvAll: createModuleInvoker('mv_all', sdkModuleRegistry.mv_all, config),
    mvDetail: createModuleInvoker('mv_detail', sdkModuleRegistry.mv_detail, config),
    mvDetailInfo: createModuleInvoker('mv_detail_info', sdkModuleRegistry.mv_detail_info, config),
    mvExclusiveRcmd: createModuleInvoker(
      'mv_exclusive_rcmd',
      sdkModuleRegistry.mv_exclusive_rcmd,
      config,
    ),
    mvFirst: createModuleInvoker('mv_first', sdkModuleRegistry.mv_first, config),
    mvSub: createModuleInvoker('mv_sub', sdkModuleRegistry.mv_sub, config),
    mvSublist: createModuleInvoker('mv_sublist', sdkModuleRegistry.mv_sublist, config),
    mvUrl: createModuleInvoker('mv_url', sdkModuleRegistry.mv_url, config),
    nicknameCheck: createModuleInvoker('nickname_check', sdkModuleRegistry.nickname_check, config),
    personalFm: createModuleInvoker('personal_fm', sdkModuleRegistry.personal_fm, config),
    personalFmMode: createModuleInvoker(
      'personal_fm_mode',
      sdkModuleRegistry.personal_fm_mode,
      config,
    ),
    personalized: createModuleInvoker('personalized', sdkModuleRegistry.personalized, config),
    personalizedDjprogram: createModuleInvoker(
      'personalized_djprogram',
      sdkModuleRegistry.personalized_djprogram,
      config,
    ),
    personalizedMv: createModuleInvoker(
      'personalized_mv',
      sdkModuleRegistry.personalized_mv,
      config,
    ),
    personalizedNewsong: createModuleInvoker(
      'personalized_newsong',
      sdkModuleRegistry.personalized_newsong,
      config,
    ),
    personalizedPrivatecontent: createModuleInvoker(
      'personalized_privatecontent',
      sdkModuleRegistry.personalized_privatecontent,
      config,
    ),
    personalizedPrivatecontentList: createModuleInvoker(
      'personalized_privatecontent_list',
      sdkModuleRegistry.personalized_privatecontent_list,
      config,
    ),
    plCount: createModuleInvoker('pl_count', sdkModuleRegistry.pl_count, config),
    playlistCatlist: createModuleInvoker(
      'playlist_catlist',
      sdkModuleRegistry.playlist_catlist,
      config,
    ),
    playlistCoverUpdate: createModuleInvoker(
      'playlist_cover_update',
      sdkModuleRegistry.playlist_cover_update,
      config,
    ),
    playlistCreate: createModuleInvoker(
      'playlist_create',
      sdkModuleRegistry.playlist_create,
      config,
    ),
    playlistDelete: createModuleInvoker(
      'playlist_delete',
      sdkModuleRegistry.playlist_delete,
      config,
    ),
    playlistDescUpdate: createModuleInvoker(
      'playlist_desc_update',
      sdkModuleRegistry.playlist_desc_update,
      config,
    ),
    playlistDetail: createModuleInvoker(
      'playlist_detail',
      sdkModuleRegistry.playlist_detail,
      config,
    ),
    playlistDetailDynamic: createModuleInvoker(
      'playlist_detail_dynamic',
      sdkModuleRegistry.playlist_detail_dynamic,
      config,
    ),
    playlistDetailRcmdGet: createModuleInvoker(
      'playlist_detail_rcmd_get',
      sdkModuleRegistry.playlist_detail_rcmd_get,
      config,
    ),
    playlistHighqualityTags: createModuleInvoker(
      'playlist_highquality_tags',
      sdkModuleRegistry.playlist_highquality_tags,
      config,
    ),
    playlistHot: createModuleInvoker('playlist_hot', sdkModuleRegistry.playlist_hot, config),
    playlistImportNameTaskCreate: createModuleInvoker(
      'playlist_import_name_task_create',
      sdkModuleRegistry.playlist_import_name_task_create,
      config,
    ),
    playlistImportTaskStatus: createModuleInvoker(
      'playlist_import_task_status',
      sdkModuleRegistry.playlist_import_task_status,
      config,
    ),
    playlistMylike: createModuleInvoker(
      'playlist_mylike',
      sdkModuleRegistry.playlist_mylike,
      config,
    ),
    playlistNameUpdate: createModuleInvoker(
      'playlist_name_update',
      sdkModuleRegistry.playlist_name_update,
      config,
    ),
    playlistOrderUpdate: createModuleInvoker(
      'playlist_order_update',
      sdkModuleRegistry.playlist_order_update,
      config,
    ),
    playlistPrivacy: createModuleInvoker(
      'playlist_privacy',
      sdkModuleRegistry.playlist_privacy,
      config,
    ),
    playlistSubscribe: createModuleInvoker(
      'playlist_subscribe',
      sdkModuleRegistry.playlist_subscribe,
      config,
    ),
    playlistSubscribers: createModuleInvoker(
      'playlist_subscribers',
      sdkModuleRegistry.playlist_subscribers,
      config,
    ),
    playlistTagsUpdate: createModuleInvoker(
      'playlist_tags_update',
      sdkModuleRegistry.playlist_tags_update,
      config,
    ),
    playlistTrackAdd: createModuleInvoker(
      'playlist_track_add',
      sdkModuleRegistry.playlist_track_add,
      config,
    ),
    playlistTrackAll: createModuleInvoker(
      'playlist_track_all',
      sdkModuleRegistry.playlist_track_all,
      config,
    ),
    playlistTrackDelete: createModuleInvoker(
      'playlist_track_delete',
      sdkModuleRegistry.playlist_track_delete,
      config,
    ),
    playlistTracks: createModuleInvoker(
      'playlist_tracks',
      sdkModuleRegistry.playlist_tracks,
      config,
    ),
    playlistUpdate: createModuleInvoker(
      'playlist_update',
      sdkModuleRegistry.playlist_update,
      config,
    ),
    playlistUpdatePlaycount: createModuleInvoker(
      'playlist_update_playcount',
      sdkModuleRegistry.playlist_update_playcount,
      config,
    ),
    playlistVideoRecent: createModuleInvoker(
      'playlist_video_recent',
      sdkModuleRegistry.playlist_video_recent,
      config,
    ),
    playmodeIntelligenceList: createModuleInvoker(
      'playmode_intelligence_list',
      sdkModuleRegistry.playmode_intelligence_list,
      config,
    ),
    programRecommend: createModuleInvoker(
      'program_recommend',
      sdkModuleRegistry.program_recommend,
      config,
    ),
    rebind: createModuleInvoker('rebind', sdkModuleRegistry.rebind, config),
    recentListenList: createModuleInvoker(
      'recent_listen_list',
      sdkModuleRegistry.recent_listen_list,
      config,
    ),
    recommendResource: createModuleInvoker(
      'recommend_resource',
      sdkModuleRegistry.recommend_resource,
      config,
    ),
    recommendSongs: createModuleInvoker(
      'recommend_songs',
      sdkModuleRegistry.recommend_songs,
      config,
    ),
    recommendSongsDislike: createModuleInvoker(
      'recommend_songs_dislike',
      sdkModuleRegistry.recommend_songs_dislike,
      config,
    ),
    recordRecentAlbum: createModuleInvoker(
      'record_recent_album',
      sdkModuleRegistry.record_recent_album,
      config,
    ),
    recordRecentDj: createModuleInvoker(
      'record_recent_dj',
      sdkModuleRegistry.record_recent_dj,
      config,
    ),
    recordRecentPlaylist: createModuleInvoker(
      'record_recent_playlist',
      sdkModuleRegistry.record_recent_playlist,
      config,
    ),
    recordRecentSong: createModuleInvoker(
      'record_recent_song',
      sdkModuleRegistry.record_recent_song,
      config,
    ),
    recordRecentVideo: createModuleInvoker(
      'record_recent_video',
      sdkModuleRegistry.record_recent_video,
      config,
    ),
    recordRecentVoice: createModuleInvoker(
      'record_recent_voice',
      sdkModuleRegistry.record_recent_voice,
      config,
    ),
    registerAnonimous: createModuleInvoker(
      'register_anonimous',
      sdkModuleRegistry.register_anonimous,
      config,
    ),
    registerCellphone: createModuleInvoker(
      'register_cellphone',
      sdkModuleRegistry.register_cellphone,
      config,
    ),
    relatedAllvideo: createModuleInvoker(
      'related_allvideo',
      sdkModuleRegistry.related_allvideo,
      config,
    ),
    relatedPlaylist: createModuleInvoker(
      'related_playlist',
      sdkModuleRegistry.related_playlist,
      config,
    ),
    resourceLike: createModuleInvoker('resource_like', sdkModuleRegistry.resource_like, config),
    scrobble: createModuleInvoker('scrobble', sdkModuleRegistry.scrobble, config),
    search: createModuleInvoker('search', sdkModuleRegistry.search, config),
    searchDefault: createModuleInvoker('search_default', sdkModuleRegistry.search_default, config),
    searchHot: createModuleInvoker('search_hot', sdkModuleRegistry.search_hot, config),
    searchHotDetail: createModuleInvoker(
      'search_hot_detail',
      sdkModuleRegistry.search_hot_detail,
      config,
    ),
    searchMatch: createModuleInvoker('search_match', sdkModuleRegistry.search_match, config),
    searchMultimatch: createModuleInvoker(
      'search_multimatch',
      sdkModuleRegistry.search_multimatch,
      config,
    ),
    searchSuggest: createModuleInvoker('search_suggest', sdkModuleRegistry.search_suggest, config),
    sendAlbum: createModuleInvoker('send_album', sdkModuleRegistry.send_album, config),
    sendPlaylist: createModuleInvoker('send_playlist', sdkModuleRegistry.send_playlist, config),
    sendSong: createModuleInvoker('send_song', sdkModuleRegistry.send_song, config),
    sendText: createModuleInvoker('send_text', sdkModuleRegistry.send_text, config),
    setting: createModuleInvoker('setting', sdkModuleRegistry.setting, config),
    shareResource: createModuleInvoker('share_resource', sdkModuleRegistry.share_resource, config),
    sheetList: createModuleInvoker('sheet_list', sdkModuleRegistry.sheet_list, config),
    sheetPreview: createModuleInvoker('sheet_preview', sdkModuleRegistry.sheet_preview, config),
    signHappyInfo: createModuleInvoker(
      'sign_happy_info',
      sdkModuleRegistry.sign_happy_info,
      config,
    ),
    signinProgress: createModuleInvoker(
      'signin_progress',
      sdkModuleRegistry.signin_progress,
      config,
    ),
    simiArtist: createModuleInvoker('simi_artist', sdkModuleRegistry.simi_artist, config),
    simiMv: createModuleInvoker('simi_mv', sdkModuleRegistry.simi_mv, config),
    simiPlaylist: createModuleInvoker('simi_playlist', sdkModuleRegistry.simi_playlist, config),
    simiSong: createModuleInvoker('simi_song', sdkModuleRegistry.simi_song, config),
    simiUser: createModuleInvoker('simi_user', sdkModuleRegistry.simi_user, config),
    songChorus: createModuleInvoker('song_chorus', sdkModuleRegistry.song_chorus, config),
    songDetail: createModuleInvoker('song_detail', sdkModuleRegistry.song_detail, config),
    songDownlist: createModuleInvoker('song_downlist', sdkModuleRegistry.song_downlist, config),
    songDownloadUrl: createModuleInvoker(
      'song_download_url',
      sdkModuleRegistry.song_download_url,
      config,
    ),
    songDownloadUrlV1: createModuleInvoker(
      'song_download_url_v1',
      sdkModuleRegistry.song_download_url_v1,
      config,
    ),
    songDynamicCover: createModuleInvoker(
      'song_dynamic_cover',
      sdkModuleRegistry.song_dynamic_cover,
      config,
    ),
    songLikeCheck: createModuleInvoker(
      'song_like_check',
      sdkModuleRegistry.song_like_check,
      config,
    ),
    songLyricsMark: createModuleInvoker(
      'song_lyrics_mark',
      sdkModuleRegistry.song_lyrics_mark,
      config,
    ),
    songLyricsMarkAdd: createModuleInvoker(
      'song_lyrics_mark_add',
      sdkModuleRegistry.song_lyrics_mark_add,
      config,
    ),
    songLyricsMarkDel: createModuleInvoker(
      'song_lyrics_mark_del',
      sdkModuleRegistry.song_lyrics_mark_del,
      config,
    ),
    songLyricsMarkUserPage: createModuleInvoker(
      'song_lyrics_mark_user_page',
      sdkModuleRegistry.song_lyrics_mark_user_page,
      config,
    ),
    songMonthdownlist: createModuleInvoker(
      'song_monthdownlist',
      sdkModuleRegistry.song_monthdownlist,
      config,
    ),
    songMusicDetail: createModuleInvoker(
      'song_music_detail',
      sdkModuleRegistry.song_music_detail,
      config,
    ),
    songOrderUpdate: createModuleInvoker(
      'song_order_update',
      sdkModuleRegistry.song_order_update,
      config,
    ),
    songPurchased: createModuleInvoker('song_purchased', sdkModuleRegistry.song_purchased, config),
    songRedCount: createModuleInvoker('song_red_count', sdkModuleRegistry.song_red_count, config),
    songSingledownlist: createModuleInvoker(
      'song_singledownlist',
      sdkModuleRegistry.song_singledownlist,
      config,
    ),
    songUrl: createModuleInvoker('song_url', sdkModuleRegistry.song_url, config),
    songUrlV1: createModuleInvoker('song_url_v1', sdkModuleRegistry.song_url_v1, config),
    songWikiSummary: createModuleInvoker(
      'song_wiki_summary',
      sdkModuleRegistry.song_wiki_summary,
      config,
    ),
    starpickCommentsSummary: createModuleInvoker(
      'starpick_comments_summary',
      sdkModuleRegistry.starpick_comments_summary,
      config,
    ),
    styleAlbum: createModuleInvoker('style_album', sdkModuleRegistry.style_album, config),
    styleArtist: createModuleInvoker('style_artist', sdkModuleRegistry.style_artist, config),
    styleDetail: createModuleInvoker('style_detail', sdkModuleRegistry.style_detail, config),
    styleList: createModuleInvoker('style_list', sdkModuleRegistry.style_list, config),
    stylePlaylist: createModuleInvoker('style_playlist', sdkModuleRegistry.style_playlist, config),
    stylePreference: createModuleInvoker(
      'style_preference',
      sdkModuleRegistry.style_preference,
      config,
    ),
    styleSong: createModuleInvoker('style_song', sdkModuleRegistry.style_song, config),
    summaryAnnual: createModuleInvoker('summary_annual', sdkModuleRegistry.summary_annual, config),
    topAlbum: createModuleInvoker('top_album', sdkModuleRegistry.top_album, config),
    topArtists: createModuleInvoker('top_artists', sdkModuleRegistry.top_artists, config),
    topList: createModuleInvoker('top_list', sdkModuleRegistry.top_list, config),
    topMv: createModuleInvoker('top_mv', sdkModuleRegistry.top_mv, config),
    topPlaylist: createModuleInvoker('top_playlist', sdkModuleRegistry.top_playlist, config),
    topPlaylistHighquality: createModuleInvoker(
      'top_playlist_highquality',
      sdkModuleRegistry.top_playlist_highquality,
      config,
    ),
    topSong: createModuleInvoker('top_song', sdkModuleRegistry.top_song, config),
    topicDetail: createModuleInvoker('topic_detail', sdkModuleRegistry.topic_detail, config),
    topicDetailEventHot: createModuleInvoker(
      'topic_detail_event_hot',
      sdkModuleRegistry.topic_detail_event_hot,
      config,
    ),
    topicSublist: createModuleInvoker('topic_sublist', sdkModuleRegistry.topic_sublist, config),
    toplist: createModuleInvoker('toplist', sdkModuleRegistry.toplist, config),
    toplistArtist: createModuleInvoker('toplist_artist', sdkModuleRegistry.toplist_artist, config),
    toplistDetail: createModuleInvoker('toplist_detail', sdkModuleRegistry.toplist_detail, config),
    ugcAlbumGet: createModuleInvoker('ugc_album_get', sdkModuleRegistry.ugc_album_get, config),
    ugcArtistGet: createModuleInvoker('ugc_artist_get', sdkModuleRegistry.ugc_artist_get, config),
    ugcArtistSearch: createModuleInvoker(
      'ugc_artist_search',
      sdkModuleRegistry.ugc_artist_search,
      config,
    ),
    ugcDetail: createModuleInvoker('ugc_detail', sdkModuleRegistry.ugc_detail, config),
    ugcMvGet: createModuleInvoker('ugc_mv_get', sdkModuleRegistry.ugc_mv_get, config),
    ugcSongGet: createModuleInvoker('ugc_song_get', sdkModuleRegistry.ugc_song_get, config),
    ugcUserDevote: createModuleInvoker(
      'ugc_user_devote',
      sdkModuleRegistry.ugc_user_devote,
      config,
    ),
    userAccount: createModuleInvoker('user_account', sdkModuleRegistry.user_account, config),
    userAudio: createModuleInvoker('user_audio', sdkModuleRegistry.user_audio, config),
    userBinding: createModuleInvoker('user_binding', sdkModuleRegistry.user_binding, config),
    userCloud: createModuleInvoker('user_cloud', sdkModuleRegistry.user_cloud, config),
    userCloudDel: createModuleInvoker('user_cloud_del', sdkModuleRegistry.user_cloud_del, config),
    userCloudDetail: createModuleInvoker(
      'user_cloud_detail',
      sdkModuleRegistry.user_cloud_detail,
      config,
    ),
    userCommentHistory: createModuleInvoker(
      'user_comment_history',
      sdkModuleRegistry.user_comment_history,
      config,
    ),
    userDetail: createModuleInvoker('user_detail', sdkModuleRegistry.user_detail, config),
    userDj: createModuleInvoker('user_dj', sdkModuleRegistry.user_dj, config),
    userEvent: createModuleInvoker('user_event', sdkModuleRegistry.user_event, config),
    userFollowMixed: createModuleInvoker(
      'user_follow_mixed',
      sdkModuleRegistry.user_follow_mixed,
      config,
    ),
    userFolloweds: createModuleInvoker('user_followeds', sdkModuleRegistry.user_followeds, config),
    userFollows: createModuleInvoker('user_follows', sdkModuleRegistry.user_follows, config),
    userLevel: createModuleInvoker('user_level', sdkModuleRegistry.user_level, config),
    userMedal: createModuleInvoker('user_medal', sdkModuleRegistry.user_medal, config),
    userMutualfollowGet: createModuleInvoker(
      'user_mutualfollow_get',
      sdkModuleRegistry.user_mutualfollow_get,
      config,
    ),
    userPlaylist: createModuleInvoker('user_playlist', sdkModuleRegistry.user_playlist, config),
    userPlaylistCollect: createModuleInvoker(
      'user_playlist_collect',
      sdkModuleRegistry.user_playlist_collect,
      config,
    ),
    userPlaylistCreate: createModuleInvoker(
      'user_playlist_create',
      sdkModuleRegistry.user_playlist_create,
      config,
    ),
    userRecord: createModuleInvoker('user_record', sdkModuleRegistry.user_record, config),
    userReplacephone: createModuleInvoker(
      'user_replacephone',
      sdkModuleRegistry.user_replacephone,
      config,
    ),
    userSocialStatus: createModuleInvoker(
      'user_social_status',
      sdkModuleRegistry.user_social_status,
      config,
    ),
    userSocialStatusEdit: createModuleInvoker(
      'user_social_status_edit',
      sdkModuleRegistry.user_social_status_edit,
      config,
    ),
    userSocialStatusRcmd: createModuleInvoker(
      'user_social_status_rcmd',
      sdkModuleRegistry.user_social_status_rcmd,
      config,
    ),
    userSocialStatusSupport: createModuleInvoker(
      'user_social_status_support',
      sdkModuleRegistry.user_social_status_support,
      config,
    ),
    userSubcount: createModuleInvoker('user_subcount', sdkModuleRegistry.user_subcount, config),
    userUpdate: createModuleInvoker('user_update', sdkModuleRegistry.user_update, config),
    verifyGetQr: createModuleInvoker('verify_getQr', sdkModuleRegistry.verify_getQr, config),
    verifyQrcodestatus: createModuleInvoker(
      'verify_qrcodestatus',
      sdkModuleRegistry.verify_qrcodestatus,
      config,
    ),
    videoCategoryList: createModuleInvoker(
      'video_category_list',
      sdkModuleRegistry.video_category_list,
      config,
    ),
    videoDetail: createModuleInvoker('video_detail', sdkModuleRegistry.video_detail, config),
    videoDetailInfo: createModuleInvoker(
      'video_detail_info',
      sdkModuleRegistry.video_detail_info,
      config,
    ),
    videoGroup: createModuleInvoker('video_group', sdkModuleRegistry.video_group, config),
    videoGroupList: createModuleInvoker(
      'video_group_list',
      sdkModuleRegistry.video_group_list,
      config,
    ),
    videoSub: createModuleInvoker('video_sub', sdkModuleRegistry.video_sub, config),
    videoTimelineAll: createModuleInvoker(
      'video_timeline_all',
      sdkModuleRegistry.video_timeline_all,
      config,
    ),
    videoTimelineRecommend: createModuleInvoker(
      'video_timeline_recommend',
      sdkModuleRegistry.video_timeline_recommend,
      config,
    ),
    videoUrl: createModuleInvoker('video_url', sdkModuleRegistry.video_url, config),
    vipGrowthpoint: createModuleInvoker(
      'vip_growthpoint',
      sdkModuleRegistry.vip_growthpoint,
      config,
    ),
    vipGrowthpointDetails: createModuleInvoker(
      'vip_growthpoint_details',
      sdkModuleRegistry.vip_growthpoint_details,
      config,
    ),
    vipGrowthpointGet: createModuleInvoker(
      'vip_growthpoint_get',
      sdkModuleRegistry.vip_growthpoint_get,
      config,
    ),
    vipInfo: createModuleInvoker('vip_info', sdkModuleRegistry.vip_info, config),
    vipInfoV2: createModuleInvoker('vip_info_v2', sdkModuleRegistry.vip_info_v2, config),
    vipTasks: createModuleInvoker('vip_tasks', sdkModuleRegistry.vip_tasks, config),
    vipTimemachine: createModuleInvoker(
      'vip_timemachine',
      sdkModuleRegistry.vip_timemachine,
      config,
    ),
    voiceDelete: createModuleInvoker('voice_delete', sdkModuleRegistry.voice_delete, config),
    voiceDetail: createModuleInvoker('voice_detail', sdkModuleRegistry.voice_detail, config),
    voiceLyric: createModuleInvoker('voice_lyric', sdkModuleRegistry.voice_lyric, config),
    voiceUpload: createModuleInvoker('voice_upload', sdkModuleRegistry.voice_upload, config),
    voicelistDetail: createModuleInvoker(
      'voicelist_detail',
      sdkModuleRegistry.voicelist_detail,
      config,
    ),
    voicelistList: createModuleInvoker('voicelist_list', sdkModuleRegistry.voicelist_list, config),
    voicelistListSearch: createModuleInvoker(
      'voicelist_list_search',
      sdkModuleRegistry.voicelist_list_search,
      config,
    ),
    voicelistSearch: createModuleInvoker(
      'voicelist_search',
      sdkModuleRegistry.voicelist_search,
      config,
    ),
    voicelistTrans: createModuleInvoker(
      'voicelist_trans',
      sdkModuleRegistry.voicelist_trans,
      config,
    ),
    yunbei: createModuleInvoker('yunbei', sdkModuleRegistry.yunbei, config),
    yunbeiExpense: createModuleInvoker('yunbei_expense', sdkModuleRegistry.yunbei_expense, config),
    yunbeiInfo: createModuleInvoker('yunbei_info', sdkModuleRegistry.yunbei_info, config),
    yunbeiRcmdSong: createModuleInvoker(
      'yunbei_rcmd_song',
      sdkModuleRegistry.yunbei_rcmd_song,
      config,
    ),
    yunbeiRcmdSongHistory: createModuleInvoker(
      'yunbei_rcmd_song_history',
      sdkModuleRegistry.yunbei_rcmd_song_history,
      config,
    ),
    yunbeiReceipt: createModuleInvoker('yunbei_receipt', sdkModuleRegistry.yunbei_receipt, config),
    yunbeiSign: createModuleInvoker('yunbei_sign', sdkModuleRegistry.yunbei_sign, config),
    yunbeiTaskFinish: createModuleInvoker(
      'yunbei_task_finish',
      sdkModuleRegistry.yunbei_task_finish,
      config,
    ),
    yunbeiTasks: createModuleInvoker('yunbei_tasks', sdkModuleRegistry.yunbei_tasks, config),
    yunbeiTasksTodo: createModuleInvoker(
      'yunbei_tasks_todo',
      sdkModuleRegistry.yunbei_tasks_todo,
      config,
    ),
    yunbeiToday: createModuleInvoker('yunbei_today', sdkModuleRegistry.yunbei_today, config),
  }
}
