import type { SdkModuleRegistry } from '../../types/index.ts'

import activateInitProfileModule from '../../modules/activate_init_profile.ts'
import aidjContentRcmdModule from '../../modules/aidj_content_rcmd.ts'
import albumModule from '../../modules/album.ts'
import albumDetailModule from '../../modules/album_detail.ts'
import albumDetailDynamicModule from '../../modules/album_detail_dynamic.ts'
import albumListModule from '../../modules/album_list.ts'
import albumListStyleModule from '../../modules/album_list_style.ts'
import albumNewModule from '../../modules/album_new.ts'
import albumNewestModule from '../../modules/album_newest.ts'
import albumPrivilegeModule from '../../modules/album_privilege.ts'
import albumSongsaleboardModule from '../../modules/album_songsaleboard.ts'
import albumSubModule from '../../modules/album_sub.ts'
import albumSublistModule from '../../modules/album_sublist.ts'
import artistAlbumModule from '../../modules/artist_album.ts'
import artistDescModule from '../../modules/artist_desc.ts'
import artistDetailModule from '../../modules/artist_detail.ts'
import artistDetailDynamicModule from '../../modules/artist_detail_dynamic.ts'
import artistFansModule from '../../modules/artist_fans.ts'
import artistFollowCountModule from '../../modules/artist_follow_count.ts'
import artistListModule from '../../modules/artist_list.ts'
import artistMvModule from '../../modules/artist_mv.ts'
import artistNewMvModule from '../../modules/artist_new_mv.ts'
import artistNewSongModule from '../../modules/artist_new_song.ts'
import artistSongsModule from '../../modules/artist_songs.ts'
import artistSubModule from '../../modules/artist_sub.ts'
import artistSublistModule from '../../modules/artist_sublist.ts'
import artistTopSongModule from '../../modules/artist_top_song.ts'
import artistVideoModule from '../../modules/artist_video.ts'
import artistsModule from '../../modules/artists.ts'
import audioMatchModule from '../../modules/audio_match.ts'
import avatarUploadModule from '../../modules/avatar_upload.ts'
import bannerModule from '../../modules/banner.ts'
import batchModule from '../../modules/batch.ts'
import broadcastCategoryRegionGetModule from '../../modules/broadcast_category_region_get.ts'
import broadcastChannelCollectListModule from '../../modules/broadcast_channel_collect_list.ts'
import broadcastChannelCurrentinfoModule from '../../modules/broadcast_channel_currentinfo.ts'
import broadcastChannelListModule from '../../modules/broadcast_channel_list.ts'
import broadcastSubModule from '../../modules/broadcast_sub.ts'
import calendarModule from '../../modules/calendar.ts'
import captchaSentModule from '../../modules/captcha_sent.ts'
import captchaVerifyModule from '../../modules/captcha_verify.ts'
import cellphoneExistenceCheckModule from '../../modules/cellphone_existence_check.ts'
import checkMusicModule from '../../modules/check_music.ts'
import cloudModule from '../../modules/cloud.ts'
import cloudImportModule from '../../modules/cloud_import.ts'
import cloudMatchModule from '../../modules/cloud_match.ts'
import cloudsearchModule from '../../modules/cloudsearch.ts'
import commentModule from '../../modules/comment.ts'
import commentAlbumModule from '../../modules/comment_album.ts'
import commentDjModule from '../../modules/comment_dj.ts'
import commentEventModule from '../../modules/comment_event.ts'
import commentFloorModule from '../../modules/comment_floor.ts'
import commentHotModule from '../../modules/comment_hot.ts'
import commentHugListModule from '../../modules/comment_hug_list.ts'
import commentLikeModule from '../../modules/comment_like.ts'
import commentMusicModule from '../../modules/comment_music.ts'
import commentMvModule from '../../modules/comment_mv.ts'
import commentNewModule from '../../modules/comment_new.ts'
import commentPlaylistModule from '../../modules/comment_playlist.ts'
import commentVideoModule from '../../modules/comment_video.ts'
import countriesCodeListModule from '../../modules/countries_code_list.ts'
import dailySigninModule from '../../modules/daily_signin.ts'
import digitalAlbumDetailModule from '../../modules/digitalAlbum_detail.ts'
import digitalAlbumOrderingModule from '../../modules/digitalAlbum_ordering.ts'
import digitalAlbumPurchasedModule from '../../modules/digitalAlbum_purchased.ts'
import digitalAlbumSalesModule from '../../modules/digitalAlbum_sales.ts'
import djBannerModule from '../../modules/dj_banner.ts'
import djCategoryExcludehotModule from '../../modules/dj_category_excludehot.ts'
import djCategoryRecommendModule from '../../modules/dj_category_recommend.ts'
import djCatelistModule from '../../modules/dj_catelist.ts'
import djDetailModule from '../../modules/dj_detail.ts'
import djDifmAllStyleChannelModule from '../../modules/dj_difm_all_style_channel.ts'
import djDifmChannelSubscribeModule from '../../modules/dj_difm_channel_subscribe.ts'
import djDifmChannelUnsubscribeModule from '../../modules/dj_difm_channel_unsubscribe.ts'
import djDifmPlayingTracksListModule from '../../modules/dj_difm_playing_tracks_list.ts'
import djDifmSubscribeChannelsGetModule from '../../modules/dj_difm_subscribe_channels_get.ts'
import djHotModule from '../../modules/dj_hot.ts'
import djPaygiftModule from '../../modules/dj_paygift.ts'
import djPersonalizeRecommendModule from '../../modules/dj_personalize_recommend.ts'
import djProgramModule from '../../modules/dj_program.ts'
import djProgramDetailModule from '../../modules/dj_program_detail.ts'
import djProgramToplistModule from '../../modules/dj_program_toplist.ts'
import djProgramToplistHoursModule from '../../modules/dj_program_toplist_hours.ts'
import djRadioHotModule from '../../modules/dj_radio_hot.ts'
import djRecommendModule from '../../modules/dj_recommend.ts'
import djRecommendTypeModule from '../../modules/dj_recommend_type.ts'
import djSubModule from '../../modules/dj_sub.ts'
import djSublistModule from '../../modules/dj_sublist.ts'
import djSubscriberModule from '../../modules/dj_subscriber.ts'
import djTodayPerferedModule from '../../modules/dj_today_perfered.ts'
import djToplistModule from '../../modules/dj_toplist.ts'
import djToplistHoursModule from '../../modules/dj_toplist_hours.ts'
import djToplistNewcomerModule from '../../modules/dj_toplist_newcomer.ts'
import djToplistPayModule from '../../modules/dj_toplist_pay.ts'
import djToplistPopularModule from '../../modules/dj_toplist_popular.ts'
import djRadioTopModule from '../../modules/djRadio_top.ts'
import eventModule from '../../modules/event.ts'
import eventDelModule from '../../modules/event_del.ts'
import eventForwardModule from '../../modules/event_forward.ts'
import fmTrashModule from '../../modules/fm_trash.ts'
import followModule from '../../modules/follow.ts'
import getUseridsModule from '../../modules/get_userids.ts'
import historyRecommendSongsModule from '../../modules/history_recommend_songs.ts'
import historyRecommendSongsDetailModule from '../../modules/history_recommend_songs_detail.ts'
import homepageBlockPageModule from '../../modules/homepage_block_page.ts'
import homepageDragonBallModule from '../../modules/homepage_dragon_ball.ts'
import hotTopicModule from '../../modules/hot_topic.ts'
import hugCommentModule from '../../modules/hug_comment.ts'
import innerVersionModule from '../../modules/inner_version.ts'
import likeModule from '../../modules/like.ts'
import likelistModule from '../../modules/likelist.ts'
import listenDataRealtimeReportModule from '../../modules/listen_data_realtime_report.ts'
import listenDataReportModule from '../../modules/listen_data_report.ts'
import listenDataTodaySongModule from '../../modules/listen_data_today_song.ts'
import listenDataTotalModule from '../../modules/listen_data_total.ts'
import listenDataYearReportModule from '../../modules/listen_data_year_report.ts'
import listentogetherAcceptModule from '../../modules/listentogether_accept.ts'
import listentogetherEndModule from '../../modules/listentogether_end.ts'
import listentogetherHeatbeatModule from '../../modules/listentogether_heatbeat.ts'
import listentogetherPlayCommandModule from '../../modules/listentogether_play_command.ts'
import listentogetherRoomCheckModule from '../../modules/listentogether_room_check.ts'
import listentogetherRoomCreateModule from '../../modules/listentogether_room_create.ts'
import listentogetherStatusModule from '../../modules/listentogether_status.ts'
import listentogetherSyncListCommandModule from '../../modules/listentogether_sync_list_command.ts'
import listentogetherSyncPlaylistGetModule from '../../modules/listentogether_sync_playlist_get.ts'
import loginModule from '../../modules/login.ts'
import loginCellphoneModule from '../../modules/login_cellphone.ts'
import loginQrCheckModule from '../../modules/login_qr_check.ts'
import loginQrCreateModule from '../../modules/login_qr_create.ts'
import loginQrKeyModule from '../../modules/login_qr_key.ts'
import loginRefreshModule from '../../modules/login_refresh.ts'
import loginStatusModule from '../../modules/login_status.ts'
import logoutModule from '../../modules/logout.ts'
import lyricModule from '../../modules/lyric.ts'
import lyricNewModule from '../../modules/lyric_new.ts'
import mlogMusicRcmdModule from '../../modules/mlog_music_rcmd.ts'
import mlogToVideoModule from '../../modules/mlog_to_video.ts'
import mlogUrlModule from '../../modules/mlog_url.ts'
import msgCommentsModule from '../../modules/msg_comments.ts'
import msgForwardsModule from '../../modules/msg_forwards.ts'
import msgNoticesModule from '../../modules/msg_notices.ts'
import msgPrivateModule from '../../modules/msg_private.ts'
import msgPrivateHistoryModule from '../../modules/msg_private_history.ts'
import msgRecentcontactModule from '../../modules/msg_recentcontact.ts'
import musicFirstListenInfoModule from '../../modules/music_first_listen_info.ts'
import musicianCloudbeanModule from '../../modules/musician_cloudbean.ts'
import musicianCloudbeanObtainModule from '../../modules/musician_cloudbean_obtain.ts'
import musicianDataOverviewModule from '../../modules/musician_data_overview.ts'
import musicianPlayTrendModule from '../../modules/musician_play_trend.ts'
import musicianSignModule from '../../modules/musician_sign.ts'
import musicianTasksModule from '../../modules/musician_tasks.ts'
import musicianTasksNewModule from '../../modules/musician_tasks_new.ts'
import mvAllModule from '../../modules/mv_all.ts'
import mvDetailModule from '../../modules/mv_detail.ts'
import mvDetailInfoModule from '../../modules/mv_detail_info.ts'
import mvExclusiveRcmdModule from '../../modules/mv_exclusive_rcmd.ts'
import mvFirstModule from '../../modules/mv_first.ts'
import mvSubModule from '../../modules/mv_sub.ts'
import mvSublistModule from '../../modules/mv_sublist.ts'
import mvUrlModule from '../../modules/mv_url.ts'
import nicknameCheckModule from '../../modules/nickname_check.ts'
import personalFmModule from '../../modules/personal_fm.ts'
import personalFmModeModule from '../../modules/personal_fm_mode.ts'
import personalizedModule from '../../modules/personalized.ts'
import personalizedDjprogramModule from '../../modules/personalized_djprogram.ts'
import personalizedMvModule from '../../modules/personalized_mv.ts'
import personalizedNewsongModule from '../../modules/personalized_newsong.ts'
import personalizedPrivatecontentModule from '../../modules/personalized_privatecontent.ts'
import personalizedPrivatecontentListModule from '../../modules/personalized_privatecontent_list.ts'
import plCountModule from '../../modules/pl_count.ts'
import playlistCatlistModule from '../../modules/playlist_catlist.ts'
import playlistCoverUpdateModule from '../../modules/playlist_cover_update.ts'
import playlistCreateModule from '../../modules/playlist_create.ts'
import playlistDeleteModule from '../../modules/playlist_delete.ts'
import playlistDescUpdateModule from '../../modules/playlist_desc_update.ts'
import playlistDetailModule from '../../modules/playlist_detail.ts'
import playlistDetailDynamicModule from '../../modules/playlist_detail_dynamic.ts'
import playlistDetailRcmdGetModule from '../../modules/playlist_detail_rcmd_get.ts'
import playlistHighqualityTagsModule from '../../modules/playlist_highquality_tags.ts'
import playlistHotModule from '../../modules/playlist_hot.ts'
import playlistImportNameTaskCreateModule from '../../modules/playlist_import_name_task_create.ts'
import playlistImportTaskStatusModule from '../../modules/playlist_import_task_status.ts'
import playlistMylikeModule from '../../modules/playlist_mylike.ts'
import playlistNameUpdateModule from '../../modules/playlist_name_update.ts'
import playlistOrderUpdateModule from '../../modules/playlist_order_update.ts'
import playlistPrivacyModule from '../../modules/playlist_privacy.ts'
import playlistSubscribeModule from '../../modules/playlist_subscribe.ts'
import playlistSubscribersModule from '../../modules/playlist_subscribers.ts'
import playlistTagsUpdateModule from '../../modules/playlist_tags_update.ts'
import playlistTrackAddModule from '../../modules/playlist_track_add.ts'
import playlistTrackAllModule from '../../modules/playlist_track_all.ts'
import playlistTrackDeleteModule from '../../modules/playlist_track_delete.ts'
import playlistTracksModule from '../../modules/playlist_tracks.ts'
import playlistUpdateModule from '../../modules/playlist_update.ts'
import playlistUpdatePlaycountModule from '../../modules/playlist_update_playcount.ts'
import playlistVideoRecentModule from '../../modules/playlist_video_recent.ts'
import playmodeIntelligenceListModule from '../../modules/playmode_intelligence_list.ts'
import programRecommendModule from '../../modules/program_recommend.ts'
import rebindModule from '../../modules/rebind.ts'
import recentListenListModule from '../../modules/recent_listen_list.ts'
import recommendResourceModule from '../../modules/recommend_resource.ts'
import recommendSongsModule from '../../modules/recommend_songs.ts'
import recommendSongsDislikeModule from '../../modules/recommend_songs_dislike.ts'
import recordRecentAlbumModule from '../../modules/record_recent_album.ts'
import recordRecentDjModule from '../../modules/record_recent_dj.ts'
import recordRecentPlaylistModule from '../../modules/record_recent_playlist.ts'
import recordRecentSongModule from '../../modules/record_recent_song.ts'
import recordRecentVideoModule from '../../modules/record_recent_video.ts'
import recordRecentVoiceModule from '../../modules/record_recent_voice.ts'
import registerAnonimousModule from '../../modules/register_anonimous.ts'
import registerCellphoneModule from '../../modules/register_cellphone.ts'
import relatedAllvideoModule from '../../modules/related_allvideo.ts'
import relatedPlaylistModule from '../../modules/related_playlist.ts'
import resourceLikeModule from '../../modules/resource_like.ts'
import scrobbleModule from '../../modules/scrobble.ts'
import searchModule from '../../modules/search.ts'
import searchDefaultModule from '../../modules/search_default.ts'
import searchHotModule from '../../modules/search_hot.ts'
import searchHotDetailModule from '../../modules/search_hot_detail.ts'
import searchMatchModule from '../../modules/search_match.ts'
import searchMultimatchModule from '../../modules/search_multimatch.ts'
import searchSuggestModule from '../../modules/search_suggest.ts'
import sendAlbumModule from '../../modules/send_album.ts'
import sendPlaylistModule from '../../modules/send_playlist.ts'
import sendSongModule from '../../modules/send_song.ts'
import sendTextModule from '../../modules/send_text.ts'
import settingModule from '../../modules/setting.ts'
import shareResourceModule from '../../modules/share_resource.ts'
import sheetListModule from '../../modules/sheet_list.ts'
import sheetPreviewModule from '../../modules/sheet_preview.ts'
import signHappyInfoModule from '../../modules/sign_happy_info.ts'
import signinProgressModule from '../../modules/signin_progress.ts'
import simiArtistModule from '../../modules/simi_artist.ts'
import simiMvModule from '../../modules/simi_mv.ts'
import simiPlaylistModule from '../../modules/simi_playlist.ts'
import simiSongModule from '../../modules/simi_song.ts'
import simiUserModule from '../../modules/simi_user.ts'
import songChorusModule from '../../modules/song_chorus.ts'
import songDetailModule from '../../modules/song_detail.ts'
import songDownlistModule from '../../modules/song_downlist.ts'
import songDownloadUrlModule from '../../modules/song_download_url.ts'
import songDownloadUrlV1Module from '../../modules/song_download_url_v1.ts'
import songDynamicCoverModule from '../../modules/song_dynamic_cover.ts'
import songLikeCheckModule from '../../modules/song_like_check.ts'
import songLyricsMarkModule from '../../modules/song_lyrics_mark.ts'
import songLyricsMarkAddModule from '../../modules/song_lyrics_mark_add.ts'
import songLyricsMarkDelModule from '../../modules/song_lyrics_mark_del.ts'
import songLyricsMarkUserPageModule from '../../modules/song_lyrics_mark_user_page.ts'
import songMonthdownlistModule from '../../modules/song_monthdownlist.ts'
import songMusicDetailModule from '../../modules/song_music_detail.ts'
import songOrderUpdateModule from '../../modules/song_order_update.ts'
import songPurchasedModule from '../../modules/song_purchased.ts'
import songRedCountModule from '../../modules/song_red_count.ts'
import songSingledownlistModule from '../../modules/song_singledownlist.ts'
import songUrlModule from '../../modules/song_url.ts'
import songUrlV1Module from '../../modules/song_url_v1.ts'
import songWikiSummaryModule from '../../modules/song_wiki_summary.ts'
import starpickCommentsSummaryModule from '../../modules/starpick_comments_summary.ts'
import styleAlbumModule from '../../modules/style_album.ts'
import styleArtistModule from '../../modules/style_artist.ts'
import styleDetailModule from '../../modules/style_detail.ts'
import styleListModule from '../../modules/style_list.ts'
import stylePlaylistModule from '../../modules/style_playlist.ts'
import stylePreferenceModule from '../../modules/style_preference.ts'
import styleSongModule from '../../modules/style_song.ts'
import summaryAnnualModule from '../../modules/summary_annual.ts'
import topAlbumModule from '../../modules/top_album.ts'
import topArtistsModule from '../../modules/top_artists.ts'
import topListModule from '../../modules/top_list.ts'
import topMvModule from '../../modules/top_mv.ts'
import topPlaylistModule from '../../modules/top_playlist.ts'
import topPlaylistHighqualityModule from '../../modules/top_playlist_highquality.ts'
import topSongModule from '../../modules/top_song.ts'
import topicDetailModule from '../../modules/topic_detail.ts'
import topicDetailEventHotModule from '../../modules/topic_detail_event_hot.ts'
import topicSublistModule from '../../modules/topic_sublist.ts'
import toplistModule from '../../modules/toplist.ts'
import toplistArtistModule from '../../modules/toplist_artist.ts'
import toplistDetailModule from '../../modules/toplist_detail.ts'
import ugcAlbumGetModule from '../../modules/ugc_album_get.ts'
import ugcArtistGetModule from '../../modules/ugc_artist_get.ts'
import ugcArtistSearchModule from '../../modules/ugc_artist_search.ts'
import ugcDetailModule from '../../modules/ugc_detail.ts'
import ugcMvGetModule from '../../modules/ugc_mv_get.ts'
import ugcSongGetModule from '../../modules/ugc_song_get.ts'
import ugcUserDevoteModule from '../../modules/ugc_user_devote.ts'
import userAccountModule from '../../modules/user_account.ts'
import userAudioModule from '../../modules/user_audio.ts'
import userBindingModule from '../../modules/user_binding.ts'
import userCloudModule from '../../modules/user_cloud.ts'
import userCloudDelModule from '../../modules/user_cloud_del.ts'
import userCloudDetailModule from '../../modules/user_cloud_detail.ts'
import userCommentHistoryModule from '../../modules/user_comment_history.ts'
import userDetailModule from '../../modules/user_detail.ts'
import userDjModule from '../../modules/user_dj.ts'
import userEventModule from '../../modules/user_event.ts'
import userFollowMixedModule from '../../modules/user_follow_mixed.ts'
import userFollowedsModule from '../../modules/user_followeds.ts'
import userFollowsModule from '../../modules/user_follows.ts'
import userLevelModule from '../../modules/user_level.ts'
import userMedalModule from '../../modules/user_medal.ts'
import userMutualfollowGetModule from '../../modules/user_mutualfollow_get.ts'
import userPlaylistModule from '../../modules/user_playlist.ts'
import userPlaylistCollectModule from '../../modules/user_playlist_collect.ts'
import userPlaylistCreateModule from '../../modules/user_playlist_create.ts'
import userRecordModule from '../../modules/user_record.ts'
import userReplacephoneModule from '../../modules/user_replacephone.ts'
import userSocialStatusModule from '../../modules/user_social_status.ts'
import userSocialStatusEditModule from '../../modules/user_social_status_edit.ts'
import userSocialStatusRcmdModule from '../../modules/user_social_status_rcmd.ts'
import userSocialStatusSupportModule from '../../modules/user_social_status_support.ts'
import userSubcountModule from '../../modules/user_subcount.ts'
import userUpdateModule from '../../modules/user_update.ts'
import verifyGetQrModule from '../../modules/verify_getQr.ts'
import verifyQrcodestatusModule from '../../modules/verify_qrcodestatus.ts'
import videoCategoryListModule from '../../modules/video_category_list.ts'
import videoDetailModule from '../../modules/video_detail.ts'
import videoDetailInfoModule from '../../modules/video_detail_info.ts'
import videoGroupModule from '../../modules/video_group.ts'
import videoGroupListModule from '../../modules/video_group_list.ts'
import videoSubModule from '../../modules/video_sub.ts'
import videoTimelineAllModule from '../../modules/video_timeline_all.ts'
import videoTimelineRecommendModule from '../../modules/video_timeline_recommend.ts'
import videoUrlModule from '../../modules/video_url.ts'
import vipGrowthpointModule from '../../modules/vip_growthpoint.ts'
import vipGrowthpointDetailsModule from '../../modules/vip_growthpoint_details.ts'
import vipGrowthpointGetModule from '../../modules/vip_growthpoint_get.ts'
import vipInfoModule from '../../modules/vip_info.ts'
import vipInfoV2Module from '../../modules/vip_info_v2.ts'
import vipTasksModule from '../../modules/vip_tasks.ts'
import vipTimemachineModule from '../../modules/vip_timemachine.ts'
import voiceDeleteModule from '../../modules/voice_delete.ts'
import voiceDetailModule from '../../modules/voice_detail.ts'
import voiceLyricModule from '../../modules/voice_lyric.ts'
import voiceUploadModule from '../../modules/voice_upload.ts'
import voicelistDetailModule from '../../modules/voicelist_detail.ts'
import voicelistListModule from '../../modules/voicelist_list.ts'
import voicelistListSearchModule from '../../modules/voicelist_list_search.ts'
import voicelistSearchModule from '../../modules/voicelist_search.ts'
import voicelistTransModule from '../../modules/voicelist_trans.ts'
import yunbeiModule from '../../modules/yunbei.ts'
import yunbeiExpenseModule from '../../modules/yunbei_expense.ts'
import yunbeiInfoModule from '../../modules/yunbei_info.ts'
import yunbeiRcmdSongModule from '../../modules/yunbei_rcmd_song.ts'
import yunbeiRcmdSongHistoryModule from '../../modules/yunbei_rcmd_song_history.ts'
import yunbeiReceiptModule from '../../modules/yunbei_receipt.ts'
import yunbeiSignModule from '../../modules/yunbei_sign.ts'
import yunbeiTaskFinishModule from '../../modules/yunbei_task_finish.ts'
import yunbeiTasksModule from '../../modules/yunbei_tasks.ts'
import yunbeiTasksTodoModule from '../../modules/yunbei_tasks_todo.ts'
import yunbeiTodayModule from '../../modules/yunbei_today.ts'

export const sdkModuleRegistry = {
  activate_init_profile: activateInitProfileModule,
  aidj_content_rcmd: aidjContentRcmdModule,
  album: albumModule,
  album_detail: albumDetailModule,
  album_detail_dynamic: albumDetailDynamicModule,
  album_list: albumListModule,
  album_list_style: albumListStyleModule,
  album_new: albumNewModule,
  album_newest: albumNewestModule,
  album_privilege: albumPrivilegeModule,
  album_songsaleboard: albumSongsaleboardModule,
  album_sub: albumSubModule,
  album_sublist: albumSublistModule,
  artist_album: artistAlbumModule,
  artist_desc: artistDescModule,
  artist_detail: artistDetailModule,
  artist_detail_dynamic: artistDetailDynamicModule,
  artist_fans: artistFansModule,
  artist_follow_count: artistFollowCountModule,
  artist_list: artistListModule,
  artist_mv: artistMvModule,
  artist_new_mv: artistNewMvModule,
  artist_new_song: artistNewSongModule,
  artist_songs: artistSongsModule,
  artist_sub: artistSubModule,
  artist_sublist: artistSublistModule,
  artist_top_song: artistTopSongModule,
  artist_video: artistVideoModule,
  artists: artistsModule,
  audio_match: audioMatchModule,
  avatar_upload: avatarUploadModule,
  banner: bannerModule,
  batch: batchModule,
  broadcast_category_region_get: broadcastCategoryRegionGetModule,
  broadcast_channel_collect_list: broadcastChannelCollectListModule,
  broadcast_channel_currentinfo: broadcastChannelCurrentinfoModule,
  broadcast_channel_list: broadcastChannelListModule,
  broadcast_sub: broadcastSubModule,
  calendar: calendarModule,
  captcha_sent: captchaSentModule,
  captcha_verify: captchaVerifyModule,
  cellphone_existence_check: cellphoneExistenceCheckModule,
  check_music: checkMusicModule,
  cloud: cloudModule,
  cloud_import: cloudImportModule,
  cloud_match: cloudMatchModule,
  cloudsearch: cloudsearchModule,
  comment: commentModule,
  comment_album: commentAlbumModule,
  comment_dj: commentDjModule,
  comment_event: commentEventModule,
  comment_floor: commentFloorModule,
  comment_hot: commentHotModule,
  comment_hug_list: commentHugListModule,
  comment_like: commentLikeModule,
  comment_music: commentMusicModule,
  comment_mv: commentMvModule,
  comment_new: commentNewModule,
  comment_playlist: commentPlaylistModule,
  comment_video: commentVideoModule,
  countries_code_list: countriesCodeListModule,
  daily_signin: dailySigninModule,
  digitalAlbum_detail: digitalAlbumDetailModule,
  digitalAlbum_ordering: digitalAlbumOrderingModule,
  digitalAlbum_purchased: digitalAlbumPurchasedModule,
  digitalAlbum_sales: digitalAlbumSalesModule,
  dj_banner: djBannerModule,
  dj_category_excludehot: djCategoryExcludehotModule,
  dj_category_recommend: djCategoryRecommendModule,
  dj_catelist: djCatelistModule,
  dj_detail: djDetailModule,
  dj_difm_all_style_channel: djDifmAllStyleChannelModule,
  dj_difm_channel_subscribe: djDifmChannelSubscribeModule,
  dj_difm_channel_unsubscribe: djDifmChannelUnsubscribeModule,
  dj_difm_playing_tracks_list: djDifmPlayingTracksListModule,
  dj_difm_subscribe_channels_get: djDifmSubscribeChannelsGetModule,
  dj_hot: djHotModule,
  dj_paygift: djPaygiftModule,
  dj_personalize_recommend: djPersonalizeRecommendModule,
  dj_program: djProgramModule,
  dj_program_detail: djProgramDetailModule,
  dj_program_toplist: djProgramToplistModule,
  dj_program_toplist_hours: djProgramToplistHoursModule,
  dj_radio_hot: djRadioHotModule,
  dj_recommend: djRecommendModule,
  dj_recommend_type: djRecommendTypeModule,
  dj_sub: djSubModule,
  dj_sublist: djSublistModule,
  dj_subscriber: djSubscriberModule,
  dj_today_perfered: djTodayPerferedModule,
  dj_toplist: djToplistModule,
  dj_toplist_hours: djToplistHoursModule,
  dj_toplist_newcomer: djToplistNewcomerModule,
  dj_toplist_pay: djToplistPayModule,
  dj_toplist_popular: djToplistPopularModule,
  djRadio_top: djRadioTopModule,
  event: eventModule,
  event_del: eventDelModule,
  event_forward: eventForwardModule,
  fm_trash: fmTrashModule,
  follow: followModule,
  get_userids: getUseridsModule,
  history_recommend_songs: historyRecommendSongsModule,
  history_recommend_songs_detail: historyRecommendSongsDetailModule,
  homepage_block_page: homepageBlockPageModule,
  homepage_dragon_ball: homepageDragonBallModule,
  hot_topic: hotTopicModule,
  hug_comment: hugCommentModule,
  inner_version: innerVersionModule,
  like: likeModule,
  likelist: likelistModule,
  listen_data_realtime_report: listenDataRealtimeReportModule,
  listen_data_report: listenDataReportModule,
  listen_data_today_song: listenDataTodaySongModule,
  listen_data_total: listenDataTotalModule,
  listen_data_year_report: listenDataYearReportModule,
  listentogether_accept: listentogetherAcceptModule,
  listentogether_end: listentogetherEndModule,
  listentogether_heatbeat: listentogetherHeatbeatModule,
  listentogether_play_command: listentogetherPlayCommandModule,
  listentogether_room_check: listentogetherRoomCheckModule,
  listentogether_room_create: listentogetherRoomCreateModule,
  listentogether_status: listentogetherStatusModule,
  listentogether_sync_list_command: listentogetherSyncListCommandModule,
  listentogether_sync_playlist_get: listentogetherSyncPlaylistGetModule,
  login: loginModule,
  login_cellphone: loginCellphoneModule,
  login_qr_check: loginQrCheckModule,
  login_qr_create: loginQrCreateModule,
  login_qr_key: loginQrKeyModule,
  login_refresh: loginRefreshModule,
  login_status: loginStatusModule,
  logout: logoutModule,
  lyric: lyricModule,
  lyric_new: lyricNewModule,
  mlog_music_rcmd: mlogMusicRcmdModule,
  mlog_to_video: mlogToVideoModule,
  mlog_url: mlogUrlModule,
  msg_comments: msgCommentsModule,
  msg_forwards: msgForwardsModule,
  msg_notices: msgNoticesModule,
  msg_private: msgPrivateModule,
  msg_private_history: msgPrivateHistoryModule,
  msg_recentcontact: msgRecentcontactModule,
  music_first_listen_info: musicFirstListenInfoModule,
  musician_cloudbean: musicianCloudbeanModule,
  musician_cloudbean_obtain: musicianCloudbeanObtainModule,
  musician_data_overview: musicianDataOverviewModule,
  musician_play_trend: musicianPlayTrendModule,
  musician_sign: musicianSignModule,
  musician_tasks: musicianTasksModule,
  musician_tasks_new: musicianTasksNewModule,
  mv_all: mvAllModule,
  mv_detail: mvDetailModule,
  mv_detail_info: mvDetailInfoModule,
  mv_exclusive_rcmd: mvExclusiveRcmdModule,
  mv_first: mvFirstModule,
  mv_sub: mvSubModule,
  mv_sublist: mvSublistModule,
  mv_url: mvUrlModule,
  nickname_check: nicknameCheckModule,
  personal_fm: personalFmModule,
  personal_fm_mode: personalFmModeModule,
  personalized: personalizedModule,
  personalized_djprogram: personalizedDjprogramModule,
  personalized_mv: personalizedMvModule,
  personalized_newsong: personalizedNewsongModule,
  personalized_privatecontent: personalizedPrivatecontentModule,
  personalized_privatecontent_list: personalizedPrivatecontentListModule,
  pl_count: plCountModule,
  playlist_catlist: playlistCatlistModule,
  playlist_cover_update: playlistCoverUpdateModule,
  playlist_create: playlistCreateModule,
  playlist_delete: playlistDeleteModule,
  playlist_desc_update: playlistDescUpdateModule,
  playlist_detail: playlistDetailModule,
  playlist_detail_dynamic: playlistDetailDynamicModule,
  playlist_detail_rcmd_get: playlistDetailRcmdGetModule,
  playlist_highquality_tags: playlistHighqualityTagsModule,
  playlist_hot: playlistHotModule,
  playlist_import_name_task_create: playlistImportNameTaskCreateModule,
  playlist_import_task_status: playlistImportTaskStatusModule,
  playlist_mylike: playlistMylikeModule,
  playlist_name_update: playlistNameUpdateModule,
  playlist_order_update: playlistOrderUpdateModule,
  playlist_privacy: playlistPrivacyModule,
  playlist_subscribe: playlistSubscribeModule,
  playlist_subscribers: playlistSubscribersModule,
  playlist_tags_update: playlistTagsUpdateModule,
  playlist_track_add: playlistTrackAddModule,
  playlist_track_all: playlistTrackAllModule,
  playlist_track_delete: playlistTrackDeleteModule,
  playlist_tracks: playlistTracksModule,
  playlist_update: playlistUpdateModule,
  playlist_update_playcount: playlistUpdatePlaycountModule,
  playlist_video_recent: playlistVideoRecentModule,
  playmode_intelligence_list: playmodeIntelligenceListModule,
  program_recommend: programRecommendModule,
  rebind: rebindModule,
  recent_listen_list: recentListenListModule,
  recommend_resource: recommendResourceModule,
  recommend_songs: recommendSongsModule,
  recommend_songs_dislike: recommendSongsDislikeModule,
  record_recent_album: recordRecentAlbumModule,
  record_recent_dj: recordRecentDjModule,
  record_recent_playlist: recordRecentPlaylistModule,
  record_recent_song: recordRecentSongModule,
  record_recent_video: recordRecentVideoModule,
  record_recent_voice: recordRecentVoiceModule,
  register_anonimous: registerAnonimousModule,
  register_cellphone: registerCellphoneModule,
  related_allvideo: relatedAllvideoModule,
  related_playlist: relatedPlaylistModule,
  resource_like: resourceLikeModule,
  scrobble: scrobbleModule,
  search: searchModule,
  search_default: searchDefaultModule,
  search_hot: searchHotModule,
  search_hot_detail: searchHotDetailModule,
  search_match: searchMatchModule,
  search_multimatch: searchMultimatchModule,
  search_suggest: searchSuggestModule,
  send_album: sendAlbumModule,
  send_playlist: sendPlaylistModule,
  send_song: sendSongModule,
  send_text: sendTextModule,
  setting: settingModule,
  share_resource: shareResourceModule,
  sheet_list: sheetListModule,
  sheet_preview: sheetPreviewModule,
  sign_happy_info: signHappyInfoModule,
  signin_progress: signinProgressModule,
  simi_artist: simiArtistModule,
  simi_mv: simiMvModule,
  simi_playlist: simiPlaylistModule,
  simi_song: simiSongModule,
  simi_user: simiUserModule,
  song_chorus: songChorusModule,
  song_detail: songDetailModule,
  song_downlist: songDownlistModule,
  song_download_url: songDownloadUrlModule,
  song_download_url_v1: songDownloadUrlV1Module,
  song_dynamic_cover: songDynamicCoverModule,
  song_like_check: songLikeCheckModule,
  song_lyrics_mark: songLyricsMarkModule,
  song_lyrics_mark_add: songLyricsMarkAddModule,
  song_lyrics_mark_del: songLyricsMarkDelModule,
  song_lyrics_mark_user_page: songLyricsMarkUserPageModule,
  song_monthdownlist: songMonthdownlistModule,
  song_music_detail: songMusicDetailModule,
  song_order_update: songOrderUpdateModule,
  song_purchased: songPurchasedModule,
  song_red_count: songRedCountModule,
  song_singledownlist: songSingledownlistModule,
  song_url: songUrlModule,
  song_url_v1: songUrlV1Module,
  song_wiki_summary: songWikiSummaryModule,
  starpick_comments_summary: starpickCommentsSummaryModule,
  style_album: styleAlbumModule,
  style_artist: styleArtistModule,
  style_detail: styleDetailModule,
  style_list: styleListModule,
  style_playlist: stylePlaylistModule,
  style_preference: stylePreferenceModule,
  style_song: styleSongModule,
  summary_annual: summaryAnnualModule,
  top_album: topAlbumModule,
  top_artists: topArtistsModule,
  top_list: topListModule,
  top_mv: topMvModule,
  top_playlist: topPlaylistModule,
  top_playlist_highquality: topPlaylistHighqualityModule,
  top_song: topSongModule,
  topic_detail: topicDetailModule,
  topic_detail_event_hot: topicDetailEventHotModule,
  topic_sublist: topicSublistModule,
  toplist: toplistModule,
  toplist_artist: toplistArtistModule,
  toplist_detail: toplistDetailModule,
  ugc_album_get: ugcAlbumGetModule,
  ugc_artist_get: ugcArtistGetModule,
  ugc_artist_search: ugcArtistSearchModule,
  ugc_detail: ugcDetailModule,
  ugc_mv_get: ugcMvGetModule,
  ugc_song_get: ugcSongGetModule,
  ugc_user_devote: ugcUserDevoteModule,
  user_account: userAccountModule,
  user_audio: userAudioModule,
  user_binding: userBindingModule,
  user_cloud: userCloudModule,
  user_cloud_del: userCloudDelModule,
  user_cloud_detail: userCloudDetailModule,
  user_comment_history: userCommentHistoryModule,
  user_detail: userDetailModule,
  user_dj: userDjModule,
  user_event: userEventModule,
  user_follow_mixed: userFollowMixedModule,
  user_followeds: userFollowedsModule,
  user_follows: userFollowsModule,
  user_level: userLevelModule,
  user_medal: userMedalModule,
  user_mutualfollow_get: userMutualfollowGetModule,
  user_playlist: userPlaylistModule,
  user_playlist_collect: userPlaylistCollectModule,
  user_playlist_create: userPlaylistCreateModule,
  user_record: userRecordModule,
  user_replacephone: userReplacephoneModule,
  user_social_status: userSocialStatusModule,
  user_social_status_edit: userSocialStatusEditModule,
  user_social_status_rcmd: userSocialStatusRcmdModule,
  user_social_status_support: userSocialStatusSupportModule,
  user_subcount: userSubcountModule,
  user_update: userUpdateModule,
  verify_getQr: verifyGetQrModule,
  verify_qrcodestatus: verifyQrcodestatusModule,
  video_category_list: videoCategoryListModule,
  video_detail: videoDetailModule,
  video_detail_info: videoDetailInfoModule,
  video_group: videoGroupModule,
  video_group_list: videoGroupListModule,
  video_sub: videoSubModule,
  video_timeline_all: videoTimelineAllModule,
  video_timeline_recommend: videoTimelineRecommendModule,
  video_url: videoUrlModule,
  vip_growthpoint: vipGrowthpointModule,
  vip_growthpoint_details: vipGrowthpointDetailsModule,
  vip_growthpoint_get: vipGrowthpointGetModule,
  vip_info: vipInfoModule,
  vip_info_v2: vipInfoV2Module,
  vip_tasks: vipTasksModule,
  vip_timemachine: vipTimemachineModule,
  voice_delete: voiceDeleteModule,
  voice_detail: voiceDetailModule,
  voice_lyric: voiceLyricModule,
  voice_upload: voiceUploadModule,
  voicelist_detail: voicelistDetailModule,
  voicelist_list: voicelistListModule,
  voicelist_list_search: voicelistListSearchModule,
  voicelist_search: voicelistSearchModule,
  voicelist_trans: voicelistTransModule,
  yunbei: yunbeiModule,
  yunbei_expense: yunbeiExpenseModule,
  yunbei_info: yunbeiInfoModule,
  yunbei_rcmd_song: yunbeiRcmdSongModule,
  yunbei_rcmd_song_history: yunbeiRcmdSongHistoryModule,
  yunbei_receipt: yunbeiReceiptModule,
  yunbei_sign: yunbeiSignModule,
  yunbei_task_finish: yunbeiTaskFinishModule,
  yunbei_tasks: yunbeiTasksModule,
  yunbei_tasks_todo: yunbeiTasksTodoModule,
  yunbei_today: yunbeiTodayModule,
} as const satisfies SdkModuleRegistry
