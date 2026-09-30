import activateInitProfileModule, {
  decodeModuleInput as activateInitProfileInputDecoder,
} from '../../modules/activate_init_profile.ts';
import aidjContentRcmdModule, {
  decodeModuleInput as aidjContentRcmdInputDecoder,
} from '../../modules/aidj_content_rcmd.ts';
import albumModule, {
  decodeModuleInput as albumInputDecoder,
} from '../../modules/album.ts';
import albumDetailModule, {
  decodeModuleInput as albumDetailInputDecoder,
} from '../../modules/album_detail.ts';
import albumDetailDynamicModule, {
  decodeModuleInput as albumDetailDynamicInputDecoder,
} from '../../modules/album_detail_dynamic.ts';
import albumListModule, {
  decodeModuleInput as albumListInputDecoder,
} from '../../modules/album_list.ts';
import albumListStyleModule, {
  decodeModuleInput as albumListStyleInputDecoder,
} from '../../modules/album_list_style.ts';
import albumNewModule, {
  decodeModuleInput as albumNewInputDecoder,
} from '../../modules/album_new.ts';
import albumNewestModule, {
  decodeModuleInput as albumNewestInputDecoder,
} from '../../modules/album_newest.ts';
import albumPrivilegeModule, {
  decodeModuleInput as albumPrivilegeInputDecoder,
} from '../../modules/album_privilege.ts';
import albumSongsaleboardModule, {
  decodeModuleInput as albumSongsaleboardInputDecoder,
} from '../../modules/album_songsaleboard.ts';
import albumSubModule, {
  decodeModuleInput as albumSubInputDecoder,
} from '../../modules/album_sub.ts';
import albumSublistModule, {
  decodeModuleInput as albumSublistInputDecoder,
} from '../../modules/album_sublist.ts';
import artistAlbumModule, {
  decodeModuleInput as artistAlbumInputDecoder,
} from '../../modules/artist_album.ts';
import artistDescModule, {
  decodeModuleInput as artistDescInputDecoder,
} from '../../modules/artist_desc.ts';
import artistDetailModule, {
  decodeModuleInput as artistDetailInputDecoder,
} from '../../modules/artist_detail.ts';
import artistDetailDynamicModule, {
  decodeModuleInput as artistDetailDynamicInputDecoder,
} from '../../modules/artist_detail_dynamic.ts';
import artistFansModule, {
  decodeModuleInput as artistFansInputDecoder,
} from '../../modules/artist_fans.ts';
import artistFollowCountModule, {
  decodeModuleInput as artistFollowCountInputDecoder,
} from '../../modules/artist_follow_count.ts';
import artistListModule, {
  decodeModuleInput as artistListInputDecoder,
} from '../../modules/artist_list.ts';
import artistMvModule, {
  decodeModuleInput as artistMvInputDecoder,
} from '../../modules/artist_mv.ts';
import artistNewMvModule, {
  decodeModuleInput as artistNewMvInputDecoder,
} from '../../modules/artist_new_mv.ts';
import artistNewSongModule, {
  decodeModuleInput as artistNewSongInputDecoder,
} from '../../modules/artist_new_song.ts';
import artistSongsModule, {
  decodeModuleInput as artistSongsInputDecoder,
} from '../../modules/artist_songs.ts';
import artistSubModule, {
  decodeModuleInput as artistSubInputDecoder,
} from '../../modules/artist_sub.ts';
import artistSublistModule, {
  decodeModuleInput as artistSublistInputDecoder,
} from '../../modules/artist_sublist.ts';
import artistTopSongModule, {
  decodeModuleInput as artistTopSongInputDecoder,
} from '../../modules/artist_top_song.ts';
import artistVideoModule, {
  decodeModuleInput as artistVideoInputDecoder,
} from '../../modules/artist_video.ts';
import artistsModule, {
  decodeModuleInput as artistsInputDecoder,
} from '../../modules/artists.ts';
import audioMatchModule, {
  decodeModuleInput as audioMatchInputDecoder,
} from '../../modules/audio_match.ts';
import avatarUploadModule, {
  decodeModuleInput as avatarUploadInputDecoder,
} from '../../modules/avatar_upload.ts';
import bannerModule, {
  decodeModuleInput as bannerInputDecoder,
} from '../../modules/banner.ts';
import batchModule, {
  decodeModuleInput as batchInputDecoder,
} from '../../modules/batch.ts';
import broadcastCategoryRegionGetModule, {
  decodeModuleInput as broadcastCategoryRegionGetInputDecoder,
} from '../../modules/broadcast_category_region_get.ts';
import broadcastChannelCollectListModule, {
  decodeModuleInput as broadcastChannelCollectListInputDecoder,
} from '../../modules/broadcast_channel_collect_list.ts';
import broadcastChannelCurrentinfoModule, {
  decodeModuleInput as broadcastChannelCurrentinfoInputDecoder,
} from '../../modules/broadcast_channel_currentinfo.ts';
import broadcastChannelListModule, {
  decodeModuleInput as broadcastChannelListInputDecoder,
} from '../../modules/broadcast_channel_list.ts';
import broadcastSubModule, {
  decodeModuleInput as broadcastSubInputDecoder,
} from '../../modules/broadcast_sub.ts';
import calendarModule, {
  decodeModuleInput as calendarInputDecoder,
} from '../../modules/calendar.ts';
import captchaSentModule, {
  decodeModuleInput as captchaSentInputDecoder,
} from '../../modules/captcha_sent.ts';
import captchaVerifyModule, {
  decodeModuleInput as captchaVerifyInputDecoder,
} from '../../modules/captcha_verify.ts';
import cellphoneExistenceCheckModule, {
  decodeModuleInput as cellphoneExistenceCheckInputDecoder,
} from '../../modules/cellphone_existence_check.ts';
import checkMusicModule, {
  decodeModuleInput as checkMusicInputDecoder,
} from '../../modules/check_music.ts';
import cloudModule, {
  decodeModuleInput as cloudInputDecoder,
} from '../../modules/cloud.ts';
import cloudImportModule, {
  decodeModuleInput as cloudImportInputDecoder,
} from '../../modules/cloud_import.ts';
import cloudMatchModule, {
  decodeModuleInput as cloudMatchInputDecoder,
} from '../../modules/cloud_match.ts';
import cloudsearchModule, {
  decodeModuleInput as cloudsearchInputDecoder,
} from '../../modules/cloudsearch.ts';
import commentModule, {
  decodeModuleInput as commentInputDecoder,
} from '../../modules/comment.ts';
import commentAlbumModule, {
  decodeModuleInput as commentAlbumInputDecoder,
} from '../../modules/comment_album.ts';
import commentDjModule, {
  decodeModuleInput as commentDjInputDecoder,
} from '../../modules/comment_dj.ts';
import commentEventModule, {
  decodeModuleInput as commentEventInputDecoder,
} from '../../modules/comment_event.ts';
import commentFloorModule, {
  decodeModuleInput as commentFloorInputDecoder,
} from '../../modules/comment_floor.ts';
import commentHotModule, {
  decodeModuleInput as commentHotInputDecoder,
} from '../../modules/comment_hot.ts';
import commentHugListModule, {
  decodeModuleInput as commentHugListInputDecoder,
} from '../../modules/comment_hug_list.ts';
import commentLikeModule, {
  decodeModuleInput as commentLikeInputDecoder,
} from '../../modules/comment_like.ts';
import commentMusicModule, {
  decodeModuleInput as commentMusicInputDecoder,
} from '../../modules/comment_music.ts';
import commentMvModule, {
  decodeModuleInput as commentMvInputDecoder,
} from '../../modules/comment_mv.ts';
import commentNewModule, {
  decodeModuleInput as commentNewInputDecoder,
} from '../../modules/comment_new.ts';
import commentPlaylistModule, {
  decodeModuleInput as commentPlaylistInputDecoder,
} from '../../modules/comment_playlist.ts';
import commentVideoModule, {
  decodeModuleInput as commentVideoInputDecoder,
} from '../../modules/comment_video.ts';
import countriesCodeListModule, {
  decodeModuleInput as countriesCodeListInputDecoder,
} from '../../modules/countries_code_list.ts';
import dailySigninModule, {
  decodeModuleInput as dailySigninInputDecoder,
} from '../../modules/daily_signin.ts';
import digitalAlbumDetailModule, {
  decodeModuleInput as digitalAlbumDetailInputDecoder,
} from '../../modules/digitalAlbum_detail.ts';
import digitalAlbumOrderingModule, {
  decodeModuleInput as digitalAlbumOrderingInputDecoder,
} from '../../modules/digitalAlbum_ordering.ts';
import digitalAlbumPurchasedModule, {
  decodeModuleInput as digitalAlbumPurchasedInputDecoder,
} from '../../modules/digitalAlbum_purchased.ts';
import digitalAlbumSalesModule, {
  decodeModuleInput as digitalAlbumSalesInputDecoder,
} from '../../modules/digitalAlbum_sales.ts';
import djBannerModule, {
  decodeModuleInput as djBannerInputDecoder,
} from '../../modules/dj_banner.ts';
import djCategoryExcludehotModule, {
  decodeModuleInput as djCategoryExcludehotInputDecoder,
} from '../../modules/dj_category_excludehot.ts';
import djCategoryRecommendModule, {
  decodeModuleInput as djCategoryRecommendInputDecoder,
} from '../../modules/dj_category_recommend.ts';
import djCatelistModule, {
  decodeModuleInput as djCatelistInputDecoder,
} from '../../modules/dj_catelist.ts';
import djDetailModule, {
  decodeModuleInput as djDetailInputDecoder,
} from '../../modules/dj_detail.ts';
import djDifmAllStyleChannelModule, {
  decodeModuleInput as djDifmAllStyleChannelInputDecoder,
} from '../../modules/dj_difm_all_style_channel.ts';
import djDifmChannelSubscribeModule, {
  decodeModuleInput as djDifmChannelSubscribeInputDecoder,
} from '../../modules/dj_difm_channel_subscribe.ts';
import djDifmChannelUnsubscribeModule, {
  decodeModuleInput as djDifmChannelUnsubscribeInputDecoder,
} from '../../modules/dj_difm_channel_unsubscribe.ts';
import djDifmPlayingTracksListModule, {
  decodeModuleInput as djDifmPlayingTracksListInputDecoder,
} from '../../modules/dj_difm_playing_tracks_list.ts';
import djDifmSubscribeChannelsGetModule, {
  decodeModuleInput as djDifmSubscribeChannelsGetInputDecoder,
} from '../../modules/dj_difm_subscribe_channels_get.ts';
import djHotModule, {
  decodeModuleInput as djHotInputDecoder,
} from '../../modules/dj_hot.ts';
import djPaygiftModule, {
  decodeModuleInput as djPaygiftInputDecoder,
} from '../../modules/dj_paygift.ts';
import djPersonalizeRecommendModule, {
  decodeModuleInput as djPersonalizeRecommendInputDecoder,
} from '../../modules/dj_personalize_recommend.ts';
import djProgramModule, {
  decodeModuleInput as djProgramInputDecoder,
} from '../../modules/dj_program.ts';
import djProgramDetailModule, {
  decodeModuleInput as djProgramDetailInputDecoder,
} from '../../modules/dj_program_detail.ts';
import djProgramToplistModule, {
  decodeModuleInput as djProgramToplistInputDecoder,
} from '../../modules/dj_program_toplist.ts';
import djProgramToplistHoursModule, {
  decodeModuleInput as djProgramToplistHoursInputDecoder,
} from '../../modules/dj_program_toplist_hours.ts';
import djRadioHotModule, {
  decodeModuleInput as djRadioHotInputDecoder,
} from '../../modules/dj_radio_hot.ts';
import djRecommendModule, {
  decodeModuleInput as djRecommendInputDecoder,
} from '../../modules/dj_recommend.ts';
import djRecommendTypeModule, {
  decodeModuleInput as djRecommendTypeInputDecoder,
} from '../../modules/dj_recommend_type.ts';
import djSubModule, {
  decodeModuleInput as djSubInputDecoder,
} from '../../modules/dj_sub.ts';
import djSublistModule, {
  decodeModuleInput as djSublistInputDecoder,
} from '../../modules/dj_sublist.ts';
import djSubscriberModule, {
  decodeModuleInput as djSubscriberInputDecoder,
} from '../../modules/dj_subscriber.ts';
import djTodayPerferedModule, {
  decodeModuleInput as djTodayPerferedInputDecoder,
} from '../../modules/dj_today_perfered.ts';
import djToplistModule, {
  decodeModuleInput as djToplistInputDecoder,
} from '../../modules/dj_toplist.ts';
import djToplistHoursModule, {
  decodeModuleInput as djToplistHoursInputDecoder,
} from '../../modules/dj_toplist_hours.ts';
import djToplistNewcomerModule, {
  decodeModuleInput as djToplistNewcomerInputDecoder,
} from '../../modules/dj_toplist_newcomer.ts';
import djToplistPayModule, {
  decodeModuleInput as djToplistPayInputDecoder,
} from '../../modules/dj_toplist_pay.ts';
import djToplistPopularModule, {
  decodeModuleInput as djToplistPopularInputDecoder,
} from '../../modules/dj_toplist_popular.ts';
import djRadioTopModule, {
  decodeModuleInput as djRadioTopInputDecoder,
} from '../../modules/djRadio_top.ts';
import eventModule, {
  decodeModuleInput as eventInputDecoder,
} from '../../modules/event.ts';
import eventDelModule, {
  decodeModuleInput as eventDelInputDecoder,
} from '../../modules/event_del.ts';
import eventForwardModule, {
  decodeModuleInput as eventForwardInputDecoder,
} from '../../modules/event_forward.ts';
import fmTrashModule, {
  decodeModuleInput as fmTrashInputDecoder,
} from '../../modules/fm_trash.ts';
import followModule, {
  decodeModuleInput as followInputDecoder,
} from '../../modules/follow.ts';
import getUseridsModule, {
  decodeModuleInput as getUseridsInputDecoder,
} from '../../modules/get_userids.ts';
import historyRecommendSongsModule, {
  decodeModuleInput as historyRecommendSongsInputDecoder,
} from '../../modules/history_recommend_songs.ts';
import historyRecommendSongsDetailModule, {
  decodeModuleInput as historyRecommendSongsDetailInputDecoder,
} from '../../modules/history_recommend_songs_detail.ts';
import homepageBlockPageModule, {
  decodeModuleInput as homepageBlockPageInputDecoder,
} from '../../modules/homepage_block_page.ts';
import homepageDragonBallModule, {
  decodeModuleInput as homepageDragonBallInputDecoder,
} from '../../modules/homepage_dragon_ball.ts';
import hotTopicModule, {
  decodeModuleInput as hotTopicInputDecoder,
} from '../../modules/hot_topic.ts';
import hugCommentModule, {
  decodeModuleInput as hugCommentInputDecoder,
} from '../../modules/hug_comment.ts';
import innerVersionModule, {
  decodeModuleInput as innerVersionInputDecoder,
} from '../../modules/inner_version.ts';
import likeModule, {
  decodeModuleInput as likeInputDecoder,
} from '../../modules/like.ts';
import likelistModule, {
  decodeModuleInput as likelistInputDecoder,
} from '../../modules/likelist.ts';
import listenDataRealtimeReportModule, {
  decodeModuleInput as listenDataRealtimeReportInputDecoder,
} from '../../modules/listen_data_realtime_report.ts';
import listenDataReportModule, {
  decodeModuleInput as listenDataReportInputDecoder,
} from '../../modules/listen_data_report.ts';
import listenDataTodaySongModule, {
  decodeModuleInput as listenDataTodaySongInputDecoder,
} from '../../modules/listen_data_today_song.ts';
import listenDataTotalModule, {
  decodeModuleInput as listenDataTotalInputDecoder,
} from '../../modules/listen_data_total.ts';
import listenDataYearReportModule, {
  decodeModuleInput as listenDataYearReportInputDecoder,
} from '../../modules/listen_data_year_report.ts';
import listentogetherAcceptModule, {
  decodeModuleInput as listentogetherAcceptInputDecoder,
} from '../../modules/listentogether_accept.ts';
import listentogetherEndModule, {
  decodeModuleInput as listentogetherEndInputDecoder,
} from '../../modules/listentogether_end.ts';
import listentogetherHeatbeatModule, {
  decodeModuleInput as listentogetherHeatbeatInputDecoder,
} from '../../modules/listentogether_heatbeat.ts';
import listentogetherPlayCommandModule, {
  decodeModuleInput as listentogetherPlayCommandInputDecoder,
} from '../../modules/listentogether_play_command.ts';
import listentogetherRoomCheckModule, {
  decodeModuleInput as listentogetherRoomCheckInputDecoder,
} from '../../modules/listentogether_room_check.ts';
import listentogetherRoomCreateModule, {
  decodeModuleInput as listentogetherRoomCreateInputDecoder,
} from '../../modules/listentogether_room_create.ts';
import listentogetherStatusModule, {
  decodeModuleInput as listentogetherStatusInputDecoder,
} from '../../modules/listentogether_status.ts';
import listentogetherSyncListCommandModule, {
  decodeModuleInput as listentogetherSyncListCommandInputDecoder,
} from '../../modules/listentogether_sync_list_command.ts';
import listentogetherSyncPlaylistGetModule, {
  decodeModuleInput as listentogetherSyncPlaylistGetInputDecoder,
} from '../../modules/listentogether_sync_playlist_get.ts';
import loginModule, {
  decodeModuleInput as loginInputDecoder,
} from '../../modules/login.ts';
import loginCellphoneModule, {
  decodeModuleInput as loginCellphoneInputDecoder,
} from '../../modules/login_cellphone.ts';
import loginQrCheckModule, {
  decodeModuleInput as loginQrCheckInputDecoder,
} from '../../modules/login_qr_check.ts';
import loginQrCreateModule, {
  decodeModuleInput as loginQrCreateInputDecoder,
} from '../../modules/login_qr_create.ts';
import loginQrKeyModule, {
  decodeModuleInput as loginQrKeyInputDecoder,
} from '../../modules/login_qr_key.ts';
import loginRefreshModule, {
  decodeModuleInput as loginRefreshInputDecoder,
} from '../../modules/login_refresh.ts';
import loginStatusModule, {
  decodeModuleInput as loginStatusInputDecoder,
} from '../../modules/login_status.ts';
import logoutModule, {
  decodeModuleInput as logoutInputDecoder,
} from '../../modules/logout.ts';
import lyricModule, {
  decodeModuleInput as lyricInputDecoder,
} from '../../modules/lyric.ts';
import lyricNewModule, {
  decodeModuleInput as lyricNewInputDecoder,
} from '../../modules/lyric_new.ts';
import mlogMusicRcmdModule, {
  decodeModuleInput as mlogMusicRcmdInputDecoder,
} from '../../modules/mlog_music_rcmd.ts';
import mlogToVideoModule, {
  decodeModuleInput as mlogToVideoInputDecoder,
} from '../../modules/mlog_to_video.ts';
import mlogUrlModule, {
  decodeModuleInput as mlogUrlInputDecoder,
} from '../../modules/mlog_url.ts';
import msgCommentsModule, {
  decodeModuleInput as msgCommentsInputDecoder,
} from '../../modules/msg_comments.ts';
import msgForwardsModule, {
  decodeModuleInput as msgForwardsInputDecoder,
} from '../../modules/msg_forwards.ts';
import msgNoticesModule, {
  decodeModuleInput as msgNoticesInputDecoder,
} from '../../modules/msg_notices.ts';
import msgPrivateModule, {
  decodeModuleInput as msgPrivateInputDecoder,
} from '../../modules/msg_private.ts';
import msgPrivateHistoryModule, {
  decodeModuleInput as msgPrivateHistoryInputDecoder,
} from '../../modules/msg_private_history.ts';
import msgRecentcontactModule, {
  decodeModuleInput as msgRecentcontactInputDecoder,
} from '../../modules/msg_recentcontact.ts';
import musicFirstListenInfoModule, {
  decodeModuleInput as musicFirstListenInfoInputDecoder,
} from '../../modules/music_first_listen_info.ts';
import musicianCloudbeanModule, {
  decodeModuleInput as musicianCloudbeanInputDecoder,
} from '../../modules/musician_cloudbean.ts';
import musicianCloudbeanObtainModule, {
  decodeModuleInput as musicianCloudbeanObtainInputDecoder,
} from '../../modules/musician_cloudbean_obtain.ts';
import musicianDataOverviewModule, {
  decodeModuleInput as musicianDataOverviewInputDecoder,
} from '../../modules/musician_data_overview.ts';
import musicianPlayTrendModule, {
  decodeModuleInput as musicianPlayTrendInputDecoder,
} from '../../modules/musician_play_trend.ts';
import musicianSignModule, {
  decodeModuleInput as musicianSignInputDecoder,
} from '../../modules/musician_sign.ts';
import musicianTasksModule, {
  decodeModuleInput as musicianTasksInputDecoder,
} from '../../modules/musician_tasks.ts';
import musicianTasksNewModule, {
  decodeModuleInput as musicianTasksNewInputDecoder,
} from '../../modules/musician_tasks_new.ts';
import mvAllModule, {
  decodeModuleInput as mvAllInputDecoder,
} from '../../modules/mv_all.ts';
import mvDetailModule, {
  decodeModuleInput as mvDetailInputDecoder,
} from '../../modules/mv_detail.ts';
import mvDetailInfoModule, {
  decodeModuleInput as mvDetailInfoInputDecoder,
} from '../../modules/mv_detail_info.ts';
import mvExclusiveRcmdModule, {
  decodeModuleInput as mvExclusiveRcmdInputDecoder,
} from '../../modules/mv_exclusive_rcmd.ts';
import mvFirstModule, {
  decodeModuleInput as mvFirstInputDecoder,
} from '../../modules/mv_first.ts';
import mvSubModule, {
  decodeModuleInput as mvSubInputDecoder,
} from '../../modules/mv_sub.ts';
import mvSublistModule, {
  decodeModuleInput as mvSublistInputDecoder,
} from '../../modules/mv_sublist.ts';
import mvUrlModule, {
  decodeModuleInput as mvUrlInputDecoder,
} from '../../modules/mv_url.ts';
import nicknameCheckModule, {
  decodeModuleInput as nicknameCheckInputDecoder,
} from '../../modules/nickname_check.ts';
import personalFmModule, {
  decodeModuleInput as personalFmInputDecoder,
} from '../../modules/personal_fm.ts';
import personalFmModeModule, {
  decodeModuleInput as personalFmModeInputDecoder,
} from '../../modules/personal_fm_mode.ts';
import personalizedModule, {
  decodeModuleInput as personalizedInputDecoder,
} from '../../modules/personalized.ts';
import personalizedDjprogramModule, {
  decodeModuleInput as personalizedDjprogramInputDecoder,
} from '../../modules/personalized_djprogram.ts';
import personalizedMvModule, {
  decodeModuleInput as personalizedMvInputDecoder,
} from '../../modules/personalized_mv.ts';
import personalizedNewsongModule, {
  decodeModuleInput as personalizedNewsongInputDecoder,
} from '../../modules/personalized_newsong.ts';
import personalizedPrivatecontentModule, {
  decodeModuleInput as personalizedPrivatecontentInputDecoder,
} from '../../modules/personalized_privatecontent.ts';
import personalizedPrivatecontentListModule, {
  decodeModuleInput as personalizedPrivatecontentListInputDecoder,
} from '../../modules/personalized_privatecontent_list.ts';
import plCountModule, {
  decodeModuleInput as plCountInputDecoder,
} from '../../modules/pl_count.ts';
import playlistCatlistModule, {
  decodeModuleInput as playlistCatlistInputDecoder,
} from '../../modules/playlist_catlist.ts';
import playlistCoverUpdateModule, {
  decodeModuleInput as playlistCoverUpdateInputDecoder,
} from '../../modules/playlist_cover_update.ts';
import playlistCreateModule, {
  decodeModuleInput as playlistCreateInputDecoder,
} from '../../modules/playlist_create.ts';
import playlistDeleteModule, {
  decodeModuleInput as playlistDeleteInputDecoder,
} from '../../modules/playlist_delete.ts';
import playlistDescUpdateModule, {
  decodeModuleInput as playlistDescUpdateInputDecoder,
} from '../../modules/playlist_desc_update.ts';
import playlistDetailModule, {
  decodeModuleInput as playlistDetailInputDecoder,
} from '../../modules/playlist_detail.ts';
import playlistDetailDynamicModule, {
  decodeModuleInput as playlistDetailDynamicInputDecoder,
} from '../../modules/playlist_detail_dynamic.ts';
import playlistDetailRcmdGetModule, {
  decodeModuleInput as playlistDetailRcmdGetInputDecoder,
} from '../../modules/playlist_detail_rcmd_get.ts';
import playlistHighqualityTagsModule, {
  decodeModuleInput as playlistHighqualityTagsInputDecoder,
} from '../../modules/playlist_highquality_tags.ts';
import playlistHotModule, {
  decodeModuleInput as playlistHotInputDecoder,
} from '../../modules/playlist_hot.ts';
import playlistImportNameTaskCreateModule, {
  decodeModuleInput as playlistImportNameTaskCreateInputDecoder,
} from '../../modules/playlist_import_name_task_create.ts';
import playlistImportTaskStatusModule, {
  decodeModuleInput as playlistImportTaskStatusInputDecoder,
} from '../../modules/playlist_import_task_status.ts';
import playlistMylikeModule, {
  decodeModuleInput as playlistMylikeInputDecoder,
} from '../../modules/playlist_mylike.ts';
import playlistNameUpdateModule, {
  decodeModuleInput as playlistNameUpdateInputDecoder,
} from '../../modules/playlist_name_update.ts';
import playlistOrderUpdateModule, {
  decodeModuleInput as playlistOrderUpdateInputDecoder,
} from '../../modules/playlist_order_update.ts';
import playlistPrivacyModule, {
  decodeModuleInput as playlistPrivacyInputDecoder,
} from '../../modules/playlist_privacy.ts';
import playlistSubscribeModule, {
  decodeModuleInput as playlistSubscribeInputDecoder,
} from '../../modules/playlist_subscribe.ts';
import playlistSubscribersModule, {
  decodeModuleInput as playlistSubscribersInputDecoder,
} from '../../modules/playlist_subscribers.ts';
import playlistTagsUpdateModule, {
  decodeModuleInput as playlistTagsUpdateInputDecoder,
} from '../../modules/playlist_tags_update.ts';
import playlistTrackAddModule, {
  decodeModuleInput as playlistTrackAddInputDecoder,
} from '../../modules/playlist_track_add.ts';
import playlistTrackAllModule, {
  decodeModuleInput as playlistTrackAllInputDecoder,
} from '../../modules/playlist_track_all.ts';
import playlistTrackDeleteModule, {
  decodeModuleInput as playlistTrackDeleteInputDecoder,
} from '../../modules/playlist_track_delete.ts';
import playlistTracksModule, {
  decodeModuleInput as playlistTracksInputDecoder,
} from '../../modules/playlist_tracks.ts';
import playlistUpdateModule, {
  decodeModuleInput as playlistUpdateInputDecoder,
} from '../../modules/playlist_update.ts';
import playlistUpdatePlaycountModule, {
  decodeModuleInput as playlistUpdatePlaycountInputDecoder,
} from '../../modules/playlist_update_playcount.ts';
import playlistVideoRecentModule, {
  decodeModuleInput as playlistVideoRecentInputDecoder,
} from '../../modules/playlist_video_recent.ts';
import playmodeIntelligenceListModule, {
  decodeModuleInput as playmodeIntelligenceListInputDecoder,
} from '../../modules/playmode_intelligence_list.ts';
import programRecommendModule, {
  decodeModuleInput as programRecommendInputDecoder,
} from '../../modules/program_recommend.ts';
import rebindModule, {
  decodeModuleInput as rebindInputDecoder,
} from '../../modules/rebind.ts';
import recentListenListModule, {
  decodeModuleInput as recentListenListInputDecoder,
} from '../../modules/recent_listen_list.ts';
import recommendResourceModule, {
  decodeModuleInput as recommendResourceInputDecoder,
} from '../../modules/recommend_resource.ts';
import recommendSongsModule, {
  decodeModuleInput as recommendSongsInputDecoder,
} from '../../modules/recommend_songs.ts';
import recommendSongsDislikeModule, {
  decodeModuleInput as recommendSongsDislikeInputDecoder,
} from '../../modules/recommend_songs_dislike.ts';
import recordRecentAlbumModule, {
  decodeModuleInput as recordRecentAlbumInputDecoder,
} from '../../modules/record_recent_album.ts';
import recordRecentDjModule, {
  decodeModuleInput as recordRecentDjInputDecoder,
} from '../../modules/record_recent_dj.ts';
import recordRecentPlaylistModule, {
  decodeModuleInput as recordRecentPlaylistInputDecoder,
} from '../../modules/record_recent_playlist.ts';
import recordRecentSongModule, {
  decodeModuleInput as recordRecentSongInputDecoder,
} from '../../modules/record_recent_song.ts';
import recordRecentVideoModule, {
  decodeModuleInput as recordRecentVideoInputDecoder,
} from '../../modules/record_recent_video.ts';
import recordRecentVoiceModule, {
  decodeModuleInput as recordRecentVoiceInputDecoder,
} from '../../modules/record_recent_voice.ts';
import registerAnonimousModule, {
  decodeModuleInput as registerAnonimousInputDecoder,
} from '../../modules/register_anonimous.ts';
import registerCellphoneModule, {
  decodeModuleInput as registerCellphoneInputDecoder,
} from '../../modules/register_cellphone.ts';
import relatedAllvideoModule, {
  decodeModuleInput as relatedAllvideoInputDecoder,
} from '../../modules/related_allvideo.ts';
import relatedPlaylistModule, {
  decodeModuleInput as relatedPlaylistInputDecoder,
} from '../../modules/related_playlist.ts';
import resourceLikeModule, {
  decodeModuleInput as resourceLikeInputDecoder,
} from '../../modules/resource_like.ts';
import scrobbleModule, {
  decodeModuleInput as scrobbleInputDecoder,
} from '../../modules/scrobble.ts';
import searchModule, {
  decodeModuleInput as searchInputDecoder,
} from '../../modules/search.ts';
import searchDefaultModule, {
  decodeModuleInput as searchDefaultInputDecoder,
} from '../../modules/search_default.ts';
import searchHotModule, {
  decodeModuleInput as searchHotInputDecoder,
} from '../../modules/search_hot.ts';
import searchHotDetailModule, {
  decodeModuleInput as searchHotDetailInputDecoder,
} from '../../modules/search_hot_detail.ts';
import searchMatchModule, {
  decodeModuleInput as searchMatchInputDecoder,
} from '../../modules/search_match.ts';
import searchMultimatchModule, {
  decodeModuleInput as searchMultimatchInputDecoder,
} from '../../modules/search_multimatch.ts';
import searchSuggestModule, {
  decodeModuleInput as searchSuggestInputDecoder,
} from '../../modules/search_suggest.ts';
import sendAlbumModule, {
  decodeModuleInput as sendAlbumInputDecoder,
} from '../../modules/send_album.ts';
import sendPlaylistModule, {
  decodeModuleInput as sendPlaylistInputDecoder,
} from '../../modules/send_playlist.ts';
import sendSongModule, {
  decodeModuleInput as sendSongInputDecoder,
} from '../../modules/send_song.ts';
import sendTextModule, {
  decodeModuleInput as sendTextInputDecoder,
} from '../../modules/send_text.ts';
import settingModule, {
  decodeModuleInput as settingInputDecoder,
} from '../../modules/setting.ts';
import shareResourceModule, {
  decodeModuleInput as shareResourceInputDecoder,
} from '../../modules/share_resource.ts';
import sheetListModule, {
  decodeModuleInput as sheetListInputDecoder,
} from '../../modules/sheet_list.ts';
import sheetPreviewModule, {
  decodeModuleInput as sheetPreviewInputDecoder,
} from '../../modules/sheet_preview.ts';
import signHappyInfoModule, {
  decodeModuleInput as signHappyInfoInputDecoder,
} from '../../modules/sign_happy_info.ts';
import signinProgressModule, {
  decodeModuleInput as signinProgressInputDecoder,
} from '../../modules/signin_progress.ts';
import simiArtistModule, {
  decodeModuleInput as simiArtistInputDecoder,
} from '../../modules/simi_artist.ts';
import simiMvModule, {
  decodeModuleInput as simiMvInputDecoder,
} from '../../modules/simi_mv.ts';
import simiPlaylistModule, {
  decodeModuleInput as simiPlaylistInputDecoder,
} from '../../modules/simi_playlist.ts';
import simiSongModule, {
  decodeModuleInput as simiSongInputDecoder,
} from '../../modules/simi_song.ts';
import simiUserModule, {
  decodeModuleInput as simiUserInputDecoder,
} from '../../modules/simi_user.ts';
import songChorusModule, {
  decodeModuleInput as songChorusInputDecoder,
} from '../../modules/song_chorus.ts';
import songDetailModule, {
  decodeModuleInput as songDetailInputDecoder,
} from '../../modules/song_detail.ts';
import songDownlistModule, {
  decodeModuleInput as songDownlistInputDecoder,
} from '../../modules/song_downlist.ts';
import songDownloadUrlModule, {
  decodeModuleInput as songDownloadUrlInputDecoder,
} from '../../modules/song_download_url.ts';
import songDownloadUrlV1Module, {
  decodeModuleInput as songDownloadUrlV1InputDecoder,
} from '../../modules/song_download_url_v1.ts';
import songDynamicCoverModule, {
  decodeModuleInput as songDynamicCoverInputDecoder,
} from '../../modules/song_dynamic_cover.ts';
import songLikeCheckModule, {
  decodeModuleInput as songLikeCheckInputDecoder,
} from '../../modules/song_like_check.ts';
import songLyricsMarkModule, {
  decodeModuleInput as songLyricsMarkInputDecoder,
} from '../../modules/song_lyrics_mark.ts';
import songLyricsMarkAddModule, {
  decodeModuleInput as songLyricsMarkAddInputDecoder,
} from '../../modules/song_lyrics_mark_add.ts';
import songLyricsMarkDelModule, {
  decodeModuleInput as songLyricsMarkDelInputDecoder,
} from '../../modules/song_lyrics_mark_del.ts';
import songLyricsMarkUserPageModule, {
  decodeModuleInput as songLyricsMarkUserPageInputDecoder,
} from '../../modules/song_lyrics_mark_user_page.ts';
import songMonthdownlistModule, {
  decodeModuleInput as songMonthdownlistInputDecoder,
} from '../../modules/song_monthdownlist.ts';
import songMusicDetailModule, {
  decodeModuleInput as songMusicDetailInputDecoder,
} from '../../modules/song_music_detail.ts';
import songOrderUpdateModule, {
  decodeModuleInput as songOrderUpdateInputDecoder,
} from '../../modules/song_order_update.ts';
import songPurchasedModule, {
  decodeModuleInput as songPurchasedInputDecoder,
} from '../../modules/song_purchased.ts';
import songRedCountModule, {
  decodeModuleInput as songRedCountInputDecoder,
} from '../../modules/song_red_count.ts';
import songSingledownlistModule, {
  decodeModuleInput as songSingledownlistInputDecoder,
} from '../../modules/song_singledownlist.ts';
import songUrlModule, {
  decodeModuleInput as songUrlInputDecoder,
} from '../../modules/song_url.ts';
import songUrlV1Module, {
  decodeModuleInput as songUrlV1InputDecoder,
} from '../../modules/song_url_v1.ts';
import songWikiSummaryModule, {
  decodeModuleInput as songWikiSummaryInputDecoder,
} from '../../modules/song_wiki_summary.ts';
import starpickCommentsSummaryModule, {
  decodeModuleInput as starpickCommentsSummaryInputDecoder,
} from '../../modules/starpick_comments_summary.ts';
import styleAlbumModule, {
  decodeModuleInput as styleAlbumInputDecoder,
} from '../../modules/style_album.ts';
import styleArtistModule, {
  decodeModuleInput as styleArtistInputDecoder,
} from '../../modules/style_artist.ts';
import styleDetailModule, {
  decodeModuleInput as styleDetailInputDecoder,
} from '../../modules/style_detail.ts';
import styleListModule, {
  decodeModuleInput as styleListInputDecoder,
} from '../../modules/style_list.ts';
import stylePlaylistModule, {
  decodeModuleInput as stylePlaylistInputDecoder,
} from '../../modules/style_playlist.ts';
import stylePreferenceModule, {
  decodeModuleInput as stylePreferenceInputDecoder,
} from '../../modules/style_preference.ts';
import styleSongModule, {
  decodeModuleInput as styleSongInputDecoder,
} from '../../modules/style_song.ts';
import summaryAnnualModule, {
  decodeModuleInput as summaryAnnualInputDecoder,
} from '../../modules/summary_annual.ts';
import topAlbumModule, {
  decodeModuleInput as topAlbumInputDecoder,
} from '../../modules/top_album.ts';
import topArtistsModule, {
  decodeModuleInput as topArtistsInputDecoder,
} from '../../modules/top_artists.ts';
import topListModule, {
  decodeModuleInput as topListInputDecoder,
} from '../../modules/top_list.ts';
import topMvModule, {
  decodeModuleInput as topMvInputDecoder,
} from '../../modules/top_mv.ts';
import topPlaylistModule, {
  decodeModuleInput as topPlaylistInputDecoder,
} from '../../modules/top_playlist.ts';
import topPlaylistHighqualityModule, {
  decodeModuleInput as topPlaylistHighqualityInputDecoder,
} from '../../modules/top_playlist_highquality.ts';
import topSongModule, {
  decodeModuleInput as topSongInputDecoder,
} from '../../modules/top_song.ts';
import topicDetailModule, {
  decodeModuleInput as topicDetailInputDecoder,
} from '../../modules/topic_detail.ts';
import topicDetailEventHotModule, {
  decodeModuleInput as topicDetailEventHotInputDecoder,
} from '../../modules/topic_detail_event_hot.ts';
import topicSublistModule, {
  decodeModuleInput as topicSublistInputDecoder,
} from '../../modules/topic_sublist.ts';
import toplistModule, {
  decodeModuleInput as toplistInputDecoder,
} from '../../modules/toplist.ts';
import toplistArtistModule, {
  decodeModuleInput as toplistArtistInputDecoder,
} from '../../modules/toplist_artist.ts';
import toplistDetailModule, {
  decodeModuleInput as toplistDetailInputDecoder,
} from '../../modules/toplist_detail.ts';
import ugcAlbumGetModule, {
  decodeModuleInput as ugcAlbumGetInputDecoder,
} from '../../modules/ugc_album_get.ts';
import ugcArtistGetModule, {
  decodeModuleInput as ugcArtistGetInputDecoder,
} from '../../modules/ugc_artist_get.ts';
import ugcArtistSearchModule, {
  decodeModuleInput as ugcArtistSearchInputDecoder,
} from '../../modules/ugc_artist_search.ts';
import ugcDetailModule, {
  decodeModuleInput as ugcDetailInputDecoder,
} from '../../modules/ugc_detail.ts';
import ugcMvGetModule, {
  decodeModuleInput as ugcMvGetInputDecoder,
} from '../../modules/ugc_mv_get.ts';
import ugcSongGetModule, {
  decodeModuleInput as ugcSongGetInputDecoder,
} from '../../modules/ugc_song_get.ts';
import ugcUserDevoteModule, {
  decodeModuleInput as ugcUserDevoteInputDecoder,
} from '../../modules/ugc_user_devote.ts';
import userAccountModule, {
  decodeModuleInput as userAccountInputDecoder,
} from '../../modules/user_account.ts';
import userAudioModule, {
  decodeModuleInput as userAudioInputDecoder,
} from '../../modules/user_audio.ts';
import userBindingModule, {
  decodeModuleInput as userBindingInputDecoder,
} from '../../modules/user_binding.ts';
import userCloudModule, {
  decodeModuleInput as userCloudInputDecoder,
} from '../../modules/user_cloud.ts';
import userCloudDelModule, {
  decodeModuleInput as userCloudDelInputDecoder,
} from '../../modules/user_cloud_del.ts';
import userCloudDetailModule, {
  decodeModuleInput as userCloudDetailInputDecoder,
} from '../../modules/user_cloud_detail.ts';
import userCommentHistoryModule, {
  decodeModuleInput as userCommentHistoryInputDecoder,
} from '../../modules/user_comment_history.ts';
import userDetailModule, {
  decodeModuleInput as userDetailInputDecoder,
} from '../../modules/user_detail.ts';
import userDjModule, {
  decodeModuleInput as userDjInputDecoder,
} from '../../modules/user_dj.ts';
import userEventModule, {
  decodeModuleInput as userEventInputDecoder,
} from '../../modules/user_event.ts';
import userFollowMixedModule, {
  decodeModuleInput as userFollowMixedInputDecoder,
} from '../../modules/user_follow_mixed.ts';
import userFollowedsModule, {
  decodeModuleInput as userFollowedsInputDecoder,
} from '../../modules/user_followeds.ts';
import userFollowsModule, {
  decodeModuleInput as userFollowsInputDecoder,
} from '../../modules/user_follows.ts';
import userLevelModule, {
  decodeModuleInput as userLevelInputDecoder,
} from '../../modules/user_level.ts';
import userMedalModule, {
  decodeModuleInput as userMedalInputDecoder,
} from '../../modules/user_medal.ts';
import userMutualfollowGetModule, {
  decodeModuleInput as userMutualfollowGetInputDecoder,
} from '../../modules/user_mutualfollow_get.ts';
import userPlaylistModule, {
  decodeModuleInput as userPlaylistInputDecoder,
} from '../../modules/user_playlist.ts';
import userPlaylistCollectModule, {
  decodeModuleInput as userPlaylistCollectInputDecoder,
} from '../../modules/user_playlist_collect.ts';
import userPlaylistCreateModule, {
  decodeModuleInput as userPlaylistCreateInputDecoder,
} from '../../modules/user_playlist_create.ts';
import userRecordModule, {
  decodeModuleInput as userRecordInputDecoder,
} from '../../modules/user_record.ts';
import userReplacephoneModule, {
  decodeModuleInput as userReplacephoneInputDecoder,
} from '../../modules/user_replacephone.ts';
import userSocialStatusModule, {
  decodeModuleInput as userSocialStatusInputDecoder,
} from '../../modules/user_social_status.ts';
import userSocialStatusEditModule, {
  decodeModuleInput as userSocialStatusEditInputDecoder,
} from '../../modules/user_social_status_edit.ts';
import userSocialStatusRcmdModule, {
  decodeModuleInput as userSocialStatusRcmdInputDecoder,
} from '../../modules/user_social_status_rcmd.ts';
import userSocialStatusSupportModule, {
  decodeModuleInput as userSocialStatusSupportInputDecoder,
} from '../../modules/user_social_status_support.ts';
import userSubcountModule, {
  decodeModuleInput as userSubcountInputDecoder,
} from '../../modules/user_subcount.ts';
import userUpdateModule, {
  decodeModuleInput as userUpdateInputDecoder,
} from '../../modules/user_update.ts';
import verifyGetQrModule, {
  decodeModuleInput as verifyGetQrInputDecoder,
} from '../../modules/verify_getQr.ts';
import verifyQrcodestatusModule, {
  decodeModuleInput as verifyQrcodestatusInputDecoder,
} from '../../modules/verify_qrcodestatus.ts';
import videoCategoryListModule, {
  decodeModuleInput as videoCategoryListInputDecoder,
} from '../../modules/video_category_list.ts';
import videoDetailModule, {
  decodeModuleInput as videoDetailInputDecoder,
} from '../../modules/video_detail.ts';
import videoDetailInfoModule, {
  decodeModuleInput as videoDetailInfoInputDecoder,
} from '../../modules/video_detail_info.ts';
import videoGroupModule, {
  decodeModuleInput as videoGroupInputDecoder,
} from '../../modules/video_group.ts';
import videoGroupListModule, {
  decodeModuleInput as videoGroupListInputDecoder,
} from '../../modules/video_group_list.ts';
import videoSubModule, {
  decodeModuleInput as videoSubInputDecoder,
} from '../../modules/video_sub.ts';
import videoTimelineAllModule, {
  decodeModuleInput as videoTimelineAllInputDecoder,
} from '../../modules/video_timeline_all.ts';
import videoTimelineRecommendModule, {
  decodeModuleInput as videoTimelineRecommendInputDecoder,
} from '../../modules/video_timeline_recommend.ts';
import videoUrlModule, {
  decodeModuleInput as videoUrlInputDecoder,
} from '../../modules/video_url.ts';
import vipGrowthpointModule, {
  decodeModuleInput as vipGrowthpointInputDecoder,
} from '../../modules/vip_growthpoint.ts';
import vipGrowthpointDetailsModule, {
  decodeModuleInput as vipGrowthpointDetailsInputDecoder,
} from '../../modules/vip_growthpoint_details.ts';
import vipGrowthpointGetModule, {
  decodeModuleInput as vipGrowthpointGetInputDecoder,
} from '../../modules/vip_growthpoint_get.ts';
import vipInfoModule, {
  decodeModuleInput as vipInfoInputDecoder,
} from '../../modules/vip_info.ts';
import vipInfoV2Module, {
  decodeModuleInput as vipInfoV2InputDecoder,
} from '../../modules/vip_info_v2.ts';
import vipTasksModule, {
  decodeModuleInput as vipTasksInputDecoder,
} from '../../modules/vip_tasks.ts';
import vipTimemachineModule, {
  decodeModuleInput as vipTimemachineInputDecoder,
} from '../../modules/vip_timemachine.ts';
import voiceDeleteModule, {
  decodeModuleInput as voiceDeleteInputDecoder,
} from '../../modules/voice_delete.ts';
import voiceDetailModule, {
  decodeModuleInput as voiceDetailInputDecoder,
} from '../../modules/voice_detail.ts';
import voiceLyricModule, {
  decodeModuleInput as voiceLyricInputDecoder,
} from '../../modules/voice_lyric.ts';
import voiceUploadModule, {
  decodeModuleInput as voiceUploadInputDecoder,
} from '../../modules/voice_upload.ts';
import voicelistDetailModule, {
  decodeModuleInput as voicelistDetailInputDecoder,
} from '../../modules/voicelist_detail.ts';
import voicelistListModule, {
  decodeModuleInput as voicelistListInputDecoder,
} from '../../modules/voicelist_list.ts';
import voicelistListSearchModule, {
  decodeModuleInput as voicelistListSearchInputDecoder,
} from '../../modules/voicelist_list_search.ts';
import voicelistSearchModule, {
  decodeModuleInput as voicelistSearchInputDecoder,
} from '../../modules/voicelist_search.ts';
import voicelistTransModule, {
  decodeModuleInput as voicelistTransInputDecoder,
} from '../../modules/voicelist_trans.ts';
import yunbeiModule, {
  decodeModuleInput as yunbeiInputDecoder,
} from '../../modules/yunbei.ts';
import yunbeiExpenseModule, {
  decodeModuleInput as yunbeiExpenseInputDecoder,
} from '../../modules/yunbei_expense.ts';
import yunbeiInfoModule, {
  decodeModuleInput as yunbeiInfoInputDecoder,
} from '../../modules/yunbei_info.ts';
import yunbeiRcmdSongModule, {
  decodeModuleInput as yunbeiRcmdSongInputDecoder,
} from '../../modules/yunbei_rcmd_song.ts';
import yunbeiRcmdSongHistoryModule, {
  decodeModuleInput as yunbeiRcmdSongHistoryInputDecoder,
} from '../../modules/yunbei_rcmd_song_history.ts';
import yunbeiReceiptModule, {
  decodeModuleInput as yunbeiReceiptInputDecoder,
} from '../../modules/yunbei_receipt.ts';
import yunbeiSignModule, {
  decodeModuleInput as yunbeiSignInputDecoder,
} from '../../modules/yunbei_sign.ts';
import yunbeiTaskFinishModule, {
  decodeModuleInput as yunbeiTaskFinishInputDecoder,
} from '../../modules/yunbei_task_finish.ts';
import yunbeiTasksModule, {
  decodeModuleInput as yunbeiTasksInputDecoder,
} from '../../modules/yunbei_tasks.ts';
import yunbeiTasksTodoModule, {
  decodeModuleInput as yunbeiTasksTodoInputDecoder,
} from '../../modules/yunbei_tasks_todo.ts';
import yunbeiTodayModule, {
  decodeModuleInput as yunbeiTodayInputDecoder,
} from '../../modules/yunbei_today.ts';
import type { SdkModuleRegistry } from '../../types/index.ts';

export const sdkModuleRegistry = {
  activate_init_profile: {
    identifier: 'activate_init_profile',
    route: '/activate/init/profile',
    execute: activateInitProfileModule,
    decodeInput: activateInitProfileInputDecoder,
  },
  aidj_content_rcmd: {
    identifier: 'aidj_content_rcmd',
    route: '/aidj/content/rcmd',
    execute: aidjContentRcmdModule,
    decodeInput: aidjContentRcmdInputDecoder,
  },
  album: {
    identifier: 'album',
    route: '/album',
    execute: albumModule,
    decodeInput: albumInputDecoder,
  },
  album_detail: {
    identifier: 'album_detail',
    route: '/album/detail',
    execute: albumDetailModule,
    decodeInput: albumDetailInputDecoder,
  },
  album_detail_dynamic: {
    identifier: 'album_detail_dynamic',
    route: '/album/detail/dynamic',
    execute: albumDetailDynamicModule,
    decodeInput: albumDetailDynamicInputDecoder,
  },
  album_list: {
    identifier: 'album_list',
    route: '/album/list',
    execute: albumListModule,
    decodeInput: albumListInputDecoder,
  },
  album_list_style: {
    identifier: 'album_list_style',
    route: '/album/list/style',
    execute: albumListStyleModule,
    decodeInput: albumListStyleInputDecoder,
  },
  album_new: {
    identifier: 'album_new',
    route: '/album/new',
    execute: albumNewModule,
    decodeInput: albumNewInputDecoder,
  },
  album_newest: {
    identifier: 'album_newest',
    route: '/album/newest',
    execute: albumNewestModule,
    decodeInput: albumNewestInputDecoder,
  },
  album_privilege: {
    identifier: 'album_privilege',
    route: '/album/privilege',
    execute: albumPrivilegeModule,
    decodeInput: albumPrivilegeInputDecoder,
  },
  album_songsaleboard: {
    identifier: 'album_songsaleboard',
    route: '/album/songsaleboard',
    execute: albumSongsaleboardModule,
    decodeInput: albumSongsaleboardInputDecoder,
  },
  album_sub: {
    identifier: 'album_sub',
    route: '/album/sub',
    execute: albumSubModule,
    decodeInput: albumSubInputDecoder,
  },
  album_sublist: {
    identifier: 'album_sublist',
    route: '/album/sublist',
    execute: albumSublistModule,
    decodeInput: albumSublistInputDecoder,
  },
  artist_album: {
    identifier: 'artist_album',
    route: '/artist/album',
    execute: artistAlbumModule,
    decodeInput: artistAlbumInputDecoder,
  },
  artist_desc: {
    identifier: 'artist_desc',
    route: '/artist/desc',
    execute: artistDescModule,
    decodeInput: artistDescInputDecoder,
  },
  artist_detail: {
    identifier: 'artist_detail',
    route: '/artist/detail',
    execute: artistDetailModule,
    decodeInput: artistDetailInputDecoder,
  },
  artist_detail_dynamic: {
    identifier: 'artist_detail_dynamic',
    route: '/artist/detail/dynamic',
    execute: artistDetailDynamicModule,
    decodeInput: artistDetailDynamicInputDecoder,
  },
  artist_fans: {
    identifier: 'artist_fans',
    route: '/artist/fans',
    execute: artistFansModule,
    decodeInput: artistFansInputDecoder,
  },
  artist_follow_count: {
    identifier: 'artist_follow_count',
    route: '/artist/follow/count',
    execute: artistFollowCountModule,
    decodeInput: artistFollowCountInputDecoder,
  },
  artist_list: {
    identifier: 'artist_list',
    route: '/artist/list',
    execute: artistListModule,
    decodeInput: artistListInputDecoder,
  },
  artist_mv: {
    identifier: 'artist_mv',
    route: '/artist/mv',
    execute: artistMvModule,
    decodeInput: artistMvInputDecoder,
  },
  artist_new_mv: {
    identifier: 'artist_new_mv',
    route: '/artist/new/mv',
    execute: artistNewMvModule,
    decodeInput: artistNewMvInputDecoder,
  },
  artist_new_song: {
    identifier: 'artist_new_song',
    route: '/artist/new/song',
    execute: artistNewSongModule,
    decodeInput: artistNewSongInputDecoder,
  },
  artist_songs: {
    identifier: 'artist_songs',
    route: '/artist/songs',
    execute: artistSongsModule,
    decodeInput: artistSongsInputDecoder,
  },
  artist_sub: {
    identifier: 'artist_sub',
    route: '/artist/sub',
    execute: artistSubModule,
    decodeInput: artistSubInputDecoder,
  },
  artist_sublist: {
    identifier: 'artist_sublist',
    route: '/artist/sublist',
    execute: artistSublistModule,
    decodeInput: artistSublistInputDecoder,
  },
  artist_top_song: {
    identifier: 'artist_top_song',
    route: '/artist/top/song',
    execute: artistTopSongModule,
    decodeInput: artistTopSongInputDecoder,
  },
  artist_video: {
    identifier: 'artist_video',
    route: '/artist/video',
    execute: artistVideoModule,
    decodeInput: artistVideoInputDecoder,
  },
  artists: {
    identifier: 'artists',
    route: '/artists',
    execute: artistsModule,
    decodeInput: artistsInputDecoder,
  },
  audio_match: {
    identifier: 'audio_match',
    route: '/audio/match',
    execute: audioMatchModule,
    decodeInput: audioMatchInputDecoder,
  },
  avatar_upload: {
    identifier: 'avatar_upload',
    route: '/avatar/upload',
    execute: avatarUploadModule,
    decodeInput: avatarUploadInputDecoder,
  },
  banner: {
    identifier: 'banner',
    route: '/banner',
    execute: bannerModule,
    decodeInput: bannerInputDecoder,
  },
  batch: {
    identifier: 'batch',
    route: '/batch',
    execute: batchModule,
    decodeInput: batchInputDecoder,
  },
  broadcast_category_region_get: {
    identifier: 'broadcast_category_region_get',
    route: '/broadcast/category/region/get',
    execute: broadcastCategoryRegionGetModule,
    decodeInput: broadcastCategoryRegionGetInputDecoder,
  },
  broadcast_channel_collect_list: {
    identifier: 'broadcast_channel_collect_list',
    route: '/broadcast/channel/collect/list',
    execute: broadcastChannelCollectListModule,
    decodeInput: broadcastChannelCollectListInputDecoder,
  },
  broadcast_channel_currentinfo: {
    identifier: 'broadcast_channel_currentinfo',
    route: '/broadcast/channel/currentinfo',
    execute: broadcastChannelCurrentinfoModule,
    decodeInput: broadcastChannelCurrentinfoInputDecoder,
  },
  broadcast_channel_list: {
    identifier: 'broadcast_channel_list',
    route: '/broadcast/channel/list',
    execute: broadcastChannelListModule,
    decodeInput: broadcastChannelListInputDecoder,
  },
  broadcast_sub: {
    identifier: 'broadcast_sub',
    route: '/broadcast/sub',
    execute: broadcastSubModule,
    decodeInput: broadcastSubInputDecoder,
  },
  calendar: {
    identifier: 'calendar',
    route: '/calendar',
    execute: calendarModule,
    decodeInput: calendarInputDecoder,
  },
  captcha_sent: {
    identifier: 'captcha_sent',
    route: '/captcha/sent',
    execute: captchaSentModule,
    decodeInput: captchaSentInputDecoder,
  },
  captcha_verify: {
    identifier: 'captcha_verify',
    route: '/captcha/verify',
    execute: captchaVerifyModule,
    decodeInput: captchaVerifyInputDecoder,
  },
  cellphone_existence_check: {
    identifier: 'cellphone_existence_check',
    route: '/cellphone/existence/check',
    execute: cellphoneExistenceCheckModule,
    decodeInput: cellphoneExistenceCheckInputDecoder,
  },
  check_music: {
    identifier: 'check_music',
    route: '/check/music',
    execute: checkMusicModule,
    decodeInput: checkMusicInputDecoder,
  },
  cloud: {
    identifier: 'cloud',
    route: '/cloud',
    execute: cloudModule,
    decodeInput: cloudInputDecoder,
  },
  cloud_import: {
    identifier: 'cloud_import',
    route: '/cloud/import',
    execute: cloudImportModule,
    decodeInput: cloudImportInputDecoder,
  },
  cloud_match: {
    identifier: 'cloud_match',
    route: '/cloud/match',
    execute: cloudMatchModule,
    decodeInput: cloudMatchInputDecoder,
  },
  cloudsearch: {
    identifier: 'cloudsearch',
    route: '/cloudsearch',
    execute: cloudsearchModule,
    decodeInput: cloudsearchInputDecoder,
  },
  comment: {
    identifier: 'comment',
    route: '/comment',
    execute: commentModule,
    decodeInput: commentInputDecoder,
  },
  comment_album: {
    identifier: 'comment_album',
    route: '/comment/album',
    execute: commentAlbumModule,
    decodeInput: commentAlbumInputDecoder,
  },
  comment_dj: {
    identifier: 'comment_dj',
    route: '/comment/dj',
    execute: commentDjModule,
    decodeInput: commentDjInputDecoder,
  },
  comment_event: {
    identifier: 'comment_event',
    route: '/comment/event',
    execute: commentEventModule,
    decodeInput: commentEventInputDecoder,
  },
  comment_floor: {
    identifier: 'comment_floor',
    route: '/comment/floor',
    execute: commentFloorModule,
    decodeInput: commentFloorInputDecoder,
  },
  comment_hot: {
    identifier: 'comment_hot',
    route: '/comment/hot',
    execute: commentHotModule,
    decodeInput: commentHotInputDecoder,
  },
  comment_hug_list: {
    identifier: 'comment_hug_list',
    route: '/comment/hug/list',
    execute: commentHugListModule,
    decodeInput: commentHugListInputDecoder,
  },
  comment_like: {
    identifier: 'comment_like',
    route: '/comment/like',
    execute: commentLikeModule,
    decodeInput: commentLikeInputDecoder,
  },
  comment_music: {
    identifier: 'comment_music',
    route: '/comment/music',
    execute: commentMusicModule,
    decodeInput: commentMusicInputDecoder,
  },
  comment_mv: {
    identifier: 'comment_mv',
    route: '/comment/mv',
    execute: commentMvModule,
    decodeInput: commentMvInputDecoder,
  },
  comment_new: {
    identifier: 'comment_new',
    route: '/comment/new',
    execute: commentNewModule,
    decodeInput: commentNewInputDecoder,
  },
  comment_playlist: {
    identifier: 'comment_playlist',
    route: '/comment/playlist',
    execute: commentPlaylistModule,
    decodeInput: commentPlaylistInputDecoder,
  },
  comment_video: {
    identifier: 'comment_video',
    route: '/comment/video',
    execute: commentVideoModule,
    decodeInput: commentVideoInputDecoder,
  },
  countries_code_list: {
    identifier: 'countries_code_list',
    route: '/countries/code/list',
    execute: countriesCodeListModule,
    decodeInput: countriesCodeListInputDecoder,
  },
  daily_signin: {
    identifier: 'daily_signin',
    route: '/daily_signin',
    execute: dailySigninModule,
    decodeInput: dailySigninInputDecoder,
  },
  digitalAlbum_detail: {
    identifier: 'digitalAlbum_detail',
    route: '/digitalAlbum/detail',
    execute: digitalAlbumDetailModule,
    decodeInput: digitalAlbumDetailInputDecoder,
  },
  digitalAlbum_ordering: {
    identifier: 'digitalAlbum_ordering',
    route: '/digitalAlbum/ordering',
    execute: digitalAlbumOrderingModule,
    decodeInput: digitalAlbumOrderingInputDecoder,
  },
  digitalAlbum_purchased: {
    identifier: 'digitalAlbum_purchased',
    route: '/digitalAlbum/purchased',
    execute: digitalAlbumPurchasedModule,
    decodeInput: digitalAlbumPurchasedInputDecoder,
  },
  digitalAlbum_sales: {
    identifier: 'digitalAlbum_sales',
    route: '/digitalAlbum/sales',
    execute: digitalAlbumSalesModule,
    decodeInput: digitalAlbumSalesInputDecoder,
  },
  dj_banner: {
    identifier: 'dj_banner',
    route: '/dj/banner',
    execute: djBannerModule,
    decodeInput: djBannerInputDecoder,
  },
  dj_category_excludehot: {
    identifier: 'dj_category_excludehot',
    route: '/dj/category/excludehot',
    execute: djCategoryExcludehotModule,
    decodeInput: djCategoryExcludehotInputDecoder,
  },
  dj_category_recommend: {
    identifier: 'dj_category_recommend',
    route: '/dj/category/recommend',
    execute: djCategoryRecommendModule,
    decodeInput: djCategoryRecommendInputDecoder,
  },
  dj_catelist: {
    identifier: 'dj_catelist',
    route: '/dj/catelist',
    execute: djCatelistModule,
    decodeInput: djCatelistInputDecoder,
  },
  dj_detail: {
    identifier: 'dj_detail',
    route: '/dj/detail',
    execute: djDetailModule,
    decodeInput: djDetailInputDecoder,
  },
  dj_difm_all_style_channel: {
    identifier: 'dj_difm_all_style_channel',
    route: '/dj/difm/all/style/channel',
    execute: djDifmAllStyleChannelModule,
    decodeInput: djDifmAllStyleChannelInputDecoder,
  },
  dj_difm_channel_subscribe: {
    identifier: 'dj_difm_channel_subscribe',
    route: '/dj/difm/channel/subscribe',
    execute: djDifmChannelSubscribeModule,
    decodeInput: djDifmChannelSubscribeInputDecoder,
  },
  dj_difm_channel_unsubscribe: {
    identifier: 'dj_difm_channel_unsubscribe',
    route: '/dj/difm/channel/unsubscribe',
    execute: djDifmChannelUnsubscribeModule,
    decodeInput: djDifmChannelUnsubscribeInputDecoder,
  },
  dj_difm_playing_tracks_list: {
    identifier: 'dj_difm_playing_tracks_list',
    route: '/dj/difm/playing/tracks/list',
    execute: djDifmPlayingTracksListModule,
    decodeInput: djDifmPlayingTracksListInputDecoder,
  },
  dj_difm_subscribe_channels_get: {
    identifier: 'dj_difm_subscribe_channels_get',
    route: '/dj/difm/subscribe/channels/get',
    execute: djDifmSubscribeChannelsGetModule,
    decodeInput: djDifmSubscribeChannelsGetInputDecoder,
  },
  dj_hot: {
    identifier: 'dj_hot',
    route: '/dj/hot',
    execute: djHotModule,
    decodeInput: djHotInputDecoder,
  },
  dj_paygift: {
    identifier: 'dj_paygift',
    route: '/dj/paygift',
    execute: djPaygiftModule,
    decodeInput: djPaygiftInputDecoder,
  },
  dj_personalize_recommend: {
    identifier: 'dj_personalize_recommend',
    route: '/dj/personalize/recommend',
    execute: djPersonalizeRecommendModule,
    decodeInput: djPersonalizeRecommendInputDecoder,
  },
  dj_program: {
    identifier: 'dj_program',
    route: '/dj/program',
    execute: djProgramModule,
    decodeInput: djProgramInputDecoder,
  },
  dj_program_detail: {
    identifier: 'dj_program_detail',
    route: '/dj/program/detail',
    execute: djProgramDetailModule,
    decodeInput: djProgramDetailInputDecoder,
  },
  dj_program_toplist: {
    identifier: 'dj_program_toplist',
    route: '/dj/program/toplist',
    execute: djProgramToplistModule,
    decodeInput: djProgramToplistInputDecoder,
  },
  dj_program_toplist_hours: {
    identifier: 'dj_program_toplist_hours',
    route: '/dj/program/toplist/hours',
    execute: djProgramToplistHoursModule,
    decodeInput: djProgramToplistHoursInputDecoder,
  },
  dj_radio_hot: {
    identifier: 'dj_radio_hot',
    route: '/dj/radio/hot',
    execute: djRadioHotModule,
    decodeInput: djRadioHotInputDecoder,
  },
  dj_recommend: {
    identifier: 'dj_recommend',
    route: '/dj/recommend',
    execute: djRecommendModule,
    decodeInput: djRecommendInputDecoder,
  },
  dj_recommend_type: {
    identifier: 'dj_recommend_type',
    route: '/dj/recommend/type',
    execute: djRecommendTypeModule,
    decodeInput: djRecommendTypeInputDecoder,
  },
  dj_sub: {
    identifier: 'dj_sub',
    route: '/dj/sub',
    execute: djSubModule,
    decodeInput: djSubInputDecoder,
  },
  dj_sublist: {
    identifier: 'dj_sublist',
    route: '/dj/sublist',
    execute: djSublistModule,
    decodeInput: djSublistInputDecoder,
  },
  dj_subscriber: {
    identifier: 'dj_subscriber',
    route: '/dj/subscriber',
    execute: djSubscriberModule,
    decodeInput: djSubscriberInputDecoder,
  },
  dj_today_perfered: {
    identifier: 'dj_today_perfered',
    route: '/dj/today/perfered',
    execute: djTodayPerferedModule,
    decodeInput: djTodayPerferedInputDecoder,
  },
  dj_toplist: {
    identifier: 'dj_toplist',
    route: '/dj/toplist',
    execute: djToplistModule,
    decodeInput: djToplistInputDecoder,
  },
  dj_toplist_hours: {
    identifier: 'dj_toplist_hours',
    route: '/dj/toplist/hours',
    execute: djToplistHoursModule,
    decodeInput: djToplistHoursInputDecoder,
  },
  dj_toplist_newcomer: {
    identifier: 'dj_toplist_newcomer',
    route: '/dj/toplist/newcomer',
    execute: djToplistNewcomerModule,
    decodeInput: djToplistNewcomerInputDecoder,
  },
  dj_toplist_pay: {
    identifier: 'dj_toplist_pay',
    route: '/dj/toplist/pay',
    execute: djToplistPayModule,
    decodeInput: djToplistPayInputDecoder,
  },
  dj_toplist_popular: {
    identifier: 'dj_toplist_popular',
    route: '/dj/toplist/popular',
    execute: djToplistPopularModule,
    decodeInput: djToplistPopularInputDecoder,
  },
  djRadio_top: {
    identifier: 'djRadio_top',
    route: '/djRadio/top',
    execute: djRadioTopModule,
    decodeInput: djRadioTopInputDecoder,
  },
  event: {
    identifier: 'event',
    route: '/event',
    execute: eventModule,
    decodeInput: eventInputDecoder,
  },
  event_del: {
    identifier: 'event_del',
    route: '/event/del',
    execute: eventDelModule,
    decodeInput: eventDelInputDecoder,
  },
  event_forward: {
    identifier: 'event_forward',
    route: '/event/forward',
    execute: eventForwardModule,
    decodeInput: eventForwardInputDecoder,
  },
  fm_trash: {
    identifier: 'fm_trash',
    route: '/fm_trash',
    execute: fmTrashModule,
    decodeInput: fmTrashInputDecoder,
  },
  follow: {
    identifier: 'follow',
    route: '/follow',
    execute: followModule,
    decodeInput: followInputDecoder,
  },
  get_userids: {
    identifier: 'get_userids',
    route: '/get/userids',
    execute: getUseridsModule,
    decodeInput: getUseridsInputDecoder,
  },
  history_recommend_songs: {
    identifier: 'history_recommend_songs',
    route: '/history/recommend/songs',
    execute: historyRecommendSongsModule,
    decodeInput: historyRecommendSongsInputDecoder,
  },
  history_recommend_songs_detail: {
    identifier: 'history_recommend_songs_detail',
    route: '/history/recommend/songs/detail',
    execute: historyRecommendSongsDetailModule,
    decodeInput: historyRecommendSongsDetailInputDecoder,
  },
  homepage_block_page: {
    identifier: 'homepage_block_page',
    route: '/homepage/block/page',
    execute: homepageBlockPageModule,
    decodeInput: homepageBlockPageInputDecoder,
  },
  homepage_dragon_ball: {
    identifier: 'homepage_dragon_ball',
    route: '/homepage/dragon/ball',
    execute: homepageDragonBallModule,
    decodeInput: homepageDragonBallInputDecoder,
  },
  hot_topic: {
    identifier: 'hot_topic',
    route: '/hot/topic',
    execute: hotTopicModule,
    decodeInput: hotTopicInputDecoder,
  },
  hug_comment: {
    identifier: 'hug_comment',
    route: '/hug/comment',
    execute: hugCommentModule,
    decodeInput: hugCommentInputDecoder,
  },
  inner_version: {
    identifier: 'inner_version',
    route: '/inner/version',
    execute: innerVersionModule,
    decodeInput: innerVersionInputDecoder,
  },
  like: {
    identifier: 'like',
    route: '/like',
    execute: likeModule,
    decodeInput: likeInputDecoder,
  },
  likelist: {
    identifier: 'likelist',
    route: '/likelist',
    execute: likelistModule,
    decodeInput: likelistInputDecoder,
  },
  listen_data_realtime_report: {
    identifier: 'listen_data_realtime_report',
    route: '/listen/data/realtime/report',
    execute: listenDataRealtimeReportModule,
    decodeInput: listenDataRealtimeReportInputDecoder,
  },
  listen_data_report: {
    identifier: 'listen_data_report',
    route: '/listen/data/report',
    execute: listenDataReportModule,
    decodeInput: listenDataReportInputDecoder,
  },
  listen_data_today_song: {
    identifier: 'listen_data_today_song',
    route: '/listen/data/today/song',
    execute: listenDataTodaySongModule,
    decodeInput: listenDataTodaySongInputDecoder,
  },
  listen_data_total: {
    identifier: 'listen_data_total',
    route: '/listen/data/total',
    execute: listenDataTotalModule,
    decodeInput: listenDataTotalInputDecoder,
  },
  listen_data_year_report: {
    identifier: 'listen_data_year_report',
    route: '/listen/data/year/report',
    execute: listenDataYearReportModule,
    decodeInput: listenDataYearReportInputDecoder,
  },
  listentogether_accept: {
    identifier: 'listentogether_accept',
    route: '/listentogether/accept',
    execute: listentogetherAcceptModule,
    decodeInput: listentogetherAcceptInputDecoder,
  },
  listentogether_end: {
    identifier: 'listentogether_end',
    route: '/listentogether/end',
    execute: listentogetherEndModule,
    decodeInput: listentogetherEndInputDecoder,
  },
  listentogether_heatbeat: {
    identifier: 'listentogether_heatbeat',
    route: '/listentogether/heatbeat',
    execute: listentogetherHeatbeatModule,
    decodeInput: listentogetherHeatbeatInputDecoder,
  },
  listentogether_play_command: {
    identifier: 'listentogether_play_command',
    route: '/listentogether/play/command',
    execute: listentogetherPlayCommandModule,
    decodeInput: listentogetherPlayCommandInputDecoder,
  },
  listentogether_room_check: {
    identifier: 'listentogether_room_check',
    route: '/listentogether/room/check',
    execute: listentogetherRoomCheckModule,
    decodeInput: listentogetherRoomCheckInputDecoder,
  },
  listentogether_room_create: {
    identifier: 'listentogether_room_create',
    route: '/listentogether/room/create',
    execute: listentogetherRoomCreateModule,
    decodeInput: listentogetherRoomCreateInputDecoder,
  },
  listentogether_status: {
    identifier: 'listentogether_status',
    route: '/listentogether/status',
    execute: listentogetherStatusModule,
    decodeInput: listentogetherStatusInputDecoder,
  },
  listentogether_sync_list_command: {
    identifier: 'listentogether_sync_list_command',
    route: '/listentogether/sync/list/command',
    execute: listentogetherSyncListCommandModule,
    decodeInput: listentogetherSyncListCommandInputDecoder,
  },
  listentogether_sync_playlist_get: {
    identifier: 'listentogether_sync_playlist_get',
    route: '/listentogether/sync/playlist/get',
    execute: listentogetherSyncPlaylistGetModule,
    decodeInput: listentogetherSyncPlaylistGetInputDecoder,
  },
  login: {
    identifier: 'login',
    route: '/login',
    execute: loginModule,
    decodeInput: loginInputDecoder,
  },
  login_cellphone: {
    identifier: 'login_cellphone',
    route: '/login/cellphone',
    execute: loginCellphoneModule,
    decodeInput: loginCellphoneInputDecoder,
  },
  login_qr_check: {
    identifier: 'login_qr_check',
    route: '/login/qr/check',
    execute: loginQrCheckModule,
    decodeInput: loginQrCheckInputDecoder,
  },
  login_qr_create: {
    identifier: 'login_qr_create',
    route: '/login/qr/create',
    execute: loginQrCreateModule,
    decodeInput: loginQrCreateInputDecoder,
  },
  login_qr_key: {
    identifier: 'login_qr_key',
    route: '/login/qr/key',
    execute: loginQrKeyModule,
    decodeInput: loginQrKeyInputDecoder,
  },
  login_refresh: {
    identifier: 'login_refresh',
    route: '/login/refresh',
    execute: loginRefreshModule,
    decodeInput: loginRefreshInputDecoder,
  },
  login_status: {
    identifier: 'login_status',
    route: '/login/status',
    execute: loginStatusModule,
    decodeInput: loginStatusInputDecoder,
  },
  logout: {
    identifier: 'logout',
    route: '/logout',
    execute: logoutModule,
    decodeInput: logoutInputDecoder,
  },
  lyric: {
    identifier: 'lyric',
    route: '/lyric',
    execute: lyricModule,
    decodeInput: lyricInputDecoder,
  },
  lyric_new: {
    identifier: 'lyric_new',
    route: '/lyric/new',
    execute: lyricNewModule,
    decodeInput: lyricNewInputDecoder,
  },
  mlog_music_rcmd: {
    identifier: 'mlog_music_rcmd',
    route: '/mlog/music/rcmd',
    execute: mlogMusicRcmdModule,
    decodeInput: mlogMusicRcmdInputDecoder,
  },
  mlog_to_video: {
    identifier: 'mlog_to_video',
    route: '/mlog/to/video',
    execute: mlogToVideoModule,
    decodeInput: mlogToVideoInputDecoder,
  },
  mlog_url: {
    identifier: 'mlog_url',
    route: '/mlog/url',
    execute: mlogUrlModule,
    decodeInput: mlogUrlInputDecoder,
  },
  msg_comments: {
    identifier: 'msg_comments',
    route: '/msg/comments',
    execute: msgCommentsModule,
    decodeInput: msgCommentsInputDecoder,
  },
  msg_forwards: {
    identifier: 'msg_forwards',
    route: '/msg/forwards',
    execute: msgForwardsModule,
    decodeInput: msgForwardsInputDecoder,
  },
  msg_notices: {
    identifier: 'msg_notices',
    route: '/msg/notices',
    execute: msgNoticesModule,
    decodeInput: msgNoticesInputDecoder,
  },
  msg_private: {
    identifier: 'msg_private',
    route: '/msg/private',
    execute: msgPrivateModule,
    decodeInput: msgPrivateInputDecoder,
  },
  msg_private_history: {
    identifier: 'msg_private_history',
    route: '/msg/private/history',
    execute: msgPrivateHistoryModule,
    decodeInput: msgPrivateHistoryInputDecoder,
  },
  msg_recentcontact: {
    identifier: 'msg_recentcontact',
    route: '/msg/recentcontact',
    execute: msgRecentcontactModule,
    decodeInput: msgRecentcontactInputDecoder,
  },
  music_first_listen_info: {
    identifier: 'music_first_listen_info',
    route: '/music/first/listen/info',
    execute: musicFirstListenInfoModule,
    decodeInput: musicFirstListenInfoInputDecoder,
  },
  musician_cloudbean: {
    identifier: 'musician_cloudbean',
    route: '/musician/cloudbean',
    execute: musicianCloudbeanModule,
    decodeInput: musicianCloudbeanInputDecoder,
  },
  musician_cloudbean_obtain: {
    identifier: 'musician_cloudbean_obtain',
    route: '/musician/cloudbean/obtain',
    execute: musicianCloudbeanObtainModule,
    decodeInput: musicianCloudbeanObtainInputDecoder,
  },
  musician_data_overview: {
    identifier: 'musician_data_overview',
    route: '/musician/data/overview',
    execute: musicianDataOverviewModule,
    decodeInput: musicianDataOverviewInputDecoder,
  },
  musician_play_trend: {
    identifier: 'musician_play_trend',
    route: '/musician/play/trend',
    execute: musicianPlayTrendModule,
    decodeInput: musicianPlayTrendInputDecoder,
  },
  musician_sign: {
    identifier: 'musician_sign',
    route: '/musician/sign',
    execute: musicianSignModule,
    decodeInput: musicianSignInputDecoder,
  },
  musician_tasks: {
    identifier: 'musician_tasks',
    route: '/musician/tasks',
    execute: musicianTasksModule,
    decodeInput: musicianTasksInputDecoder,
  },
  musician_tasks_new: {
    identifier: 'musician_tasks_new',
    route: '/musician/tasks/new',
    execute: musicianTasksNewModule,
    decodeInput: musicianTasksNewInputDecoder,
  },
  mv_all: {
    identifier: 'mv_all',
    route: '/mv/all',
    execute: mvAllModule,
    decodeInput: mvAllInputDecoder,
  },
  mv_detail: {
    identifier: 'mv_detail',
    route: '/mv/detail',
    execute: mvDetailModule,
    decodeInput: mvDetailInputDecoder,
  },
  mv_detail_info: {
    identifier: 'mv_detail_info',
    route: '/mv/detail/info',
    execute: mvDetailInfoModule,
    decodeInput: mvDetailInfoInputDecoder,
  },
  mv_exclusive_rcmd: {
    identifier: 'mv_exclusive_rcmd',
    route: '/mv/exclusive/rcmd',
    execute: mvExclusiveRcmdModule,
    decodeInput: mvExclusiveRcmdInputDecoder,
  },
  mv_first: {
    identifier: 'mv_first',
    route: '/mv/first',
    execute: mvFirstModule,
    decodeInput: mvFirstInputDecoder,
  },
  mv_sub: {
    identifier: 'mv_sub',
    route: '/mv/sub',
    execute: mvSubModule,
    decodeInput: mvSubInputDecoder,
  },
  mv_sublist: {
    identifier: 'mv_sublist',
    route: '/mv/sublist',
    execute: mvSublistModule,
    decodeInput: mvSublistInputDecoder,
  },
  mv_url: {
    identifier: 'mv_url',
    route: '/mv/url',
    execute: mvUrlModule,
    decodeInput: mvUrlInputDecoder,
  },
  nickname_check: {
    identifier: 'nickname_check',
    route: '/nickname/check',
    execute: nicknameCheckModule,
    decodeInput: nicknameCheckInputDecoder,
  },
  personal_fm: {
    identifier: 'personal_fm',
    route: '/personal_fm',
    execute: personalFmModule,
    decodeInput: personalFmInputDecoder,
  },
  personal_fm_mode: {
    identifier: 'personal_fm_mode',
    route: '/personal/fm/mode',
    execute: personalFmModeModule,
    decodeInput: personalFmModeInputDecoder,
  },
  personalized: {
    identifier: 'personalized',
    route: '/personalized',
    execute: personalizedModule,
    decodeInput: personalizedInputDecoder,
  },
  personalized_djprogram: {
    identifier: 'personalized_djprogram',
    route: '/personalized/djprogram',
    execute: personalizedDjprogramModule,
    decodeInput: personalizedDjprogramInputDecoder,
  },
  personalized_mv: {
    identifier: 'personalized_mv',
    route: '/personalized/mv',
    execute: personalizedMvModule,
    decodeInput: personalizedMvInputDecoder,
  },
  personalized_newsong: {
    identifier: 'personalized_newsong',
    route: '/personalized/newsong',
    execute: personalizedNewsongModule,
    decodeInput: personalizedNewsongInputDecoder,
  },
  personalized_privatecontent: {
    identifier: 'personalized_privatecontent',
    route: '/personalized/privatecontent',
    execute: personalizedPrivatecontentModule,
    decodeInput: personalizedPrivatecontentInputDecoder,
  },
  personalized_privatecontent_list: {
    identifier: 'personalized_privatecontent_list',
    route: '/personalized/privatecontent/list',
    execute: personalizedPrivatecontentListModule,
    decodeInput: personalizedPrivatecontentListInputDecoder,
  },
  pl_count: {
    identifier: 'pl_count',
    route: '/pl/count',
    execute: plCountModule,
    decodeInput: plCountInputDecoder,
  },
  playlist_catlist: {
    identifier: 'playlist_catlist',
    route: '/playlist/catlist',
    execute: playlistCatlistModule,
    decodeInput: playlistCatlistInputDecoder,
  },
  playlist_cover_update: {
    identifier: 'playlist_cover_update',
    route: '/playlist/cover/update',
    execute: playlistCoverUpdateModule,
    decodeInput: playlistCoverUpdateInputDecoder,
  },
  playlist_create: {
    identifier: 'playlist_create',
    route: '/playlist/create',
    execute: playlistCreateModule,
    decodeInput: playlistCreateInputDecoder,
  },
  playlist_delete: {
    identifier: 'playlist_delete',
    route: '/playlist/delete',
    execute: playlistDeleteModule,
    decodeInput: playlistDeleteInputDecoder,
  },
  playlist_desc_update: {
    identifier: 'playlist_desc_update',
    route: '/playlist/desc/update',
    execute: playlistDescUpdateModule,
    decodeInput: playlistDescUpdateInputDecoder,
  },
  playlist_detail: {
    identifier: 'playlist_detail',
    route: '/playlist/detail',
    execute: playlistDetailModule,
    decodeInput: playlistDetailInputDecoder,
  },
  playlist_detail_dynamic: {
    identifier: 'playlist_detail_dynamic',
    route: '/playlist/detail/dynamic',
    execute: playlistDetailDynamicModule,
    decodeInput: playlistDetailDynamicInputDecoder,
  },
  playlist_detail_rcmd_get: {
    identifier: 'playlist_detail_rcmd_get',
    route: '/playlist/detail/rcmd/get',
    execute: playlistDetailRcmdGetModule,
    decodeInput: playlistDetailRcmdGetInputDecoder,
  },
  playlist_highquality_tags: {
    identifier: 'playlist_highquality_tags',
    route: '/playlist/highquality/tags',
    execute: playlistHighqualityTagsModule,
    decodeInput: playlistHighqualityTagsInputDecoder,
  },
  playlist_hot: {
    identifier: 'playlist_hot',
    route: '/playlist/hot',
    execute: playlistHotModule,
    decodeInput: playlistHotInputDecoder,
  },
  playlist_import_name_task_create: {
    identifier: 'playlist_import_name_task_create',
    route: '/playlist/import/name/task/create',
    execute: playlistImportNameTaskCreateModule,
    decodeInput: playlistImportNameTaskCreateInputDecoder,
  },
  playlist_import_task_status: {
    identifier: 'playlist_import_task_status',
    route: '/playlist/import/task/status',
    execute: playlistImportTaskStatusModule,
    decodeInput: playlistImportTaskStatusInputDecoder,
  },
  playlist_mylike: {
    identifier: 'playlist_mylike',
    route: '/playlist/mylike',
    execute: playlistMylikeModule,
    decodeInput: playlistMylikeInputDecoder,
  },
  playlist_name_update: {
    identifier: 'playlist_name_update',
    route: '/playlist/name/update',
    execute: playlistNameUpdateModule,
    decodeInput: playlistNameUpdateInputDecoder,
  },
  playlist_order_update: {
    identifier: 'playlist_order_update',
    route: '/playlist/order/update',
    execute: playlistOrderUpdateModule,
    decodeInput: playlistOrderUpdateInputDecoder,
  },
  playlist_privacy: {
    identifier: 'playlist_privacy',
    route: '/playlist/privacy',
    execute: playlistPrivacyModule,
    decodeInput: playlistPrivacyInputDecoder,
  },
  playlist_subscribe: {
    identifier: 'playlist_subscribe',
    route: '/playlist/subscribe',
    execute: playlistSubscribeModule,
    decodeInput: playlistSubscribeInputDecoder,
  },
  playlist_subscribers: {
    identifier: 'playlist_subscribers',
    route: '/playlist/subscribers',
    execute: playlistSubscribersModule,
    decodeInput: playlistSubscribersInputDecoder,
  },
  playlist_tags_update: {
    identifier: 'playlist_tags_update',
    route: '/playlist/tags/update',
    execute: playlistTagsUpdateModule,
    decodeInput: playlistTagsUpdateInputDecoder,
  },
  playlist_track_add: {
    identifier: 'playlist_track_add',
    route: '/playlist/track/add',
    execute: playlistTrackAddModule,
    decodeInput: playlistTrackAddInputDecoder,
  },
  playlist_track_all: {
    identifier: 'playlist_track_all',
    route: '/playlist/track/all',
    execute: playlistTrackAllModule,
    decodeInput: playlistTrackAllInputDecoder,
  },
  playlist_track_delete: {
    identifier: 'playlist_track_delete',
    route: '/playlist/track/delete',
    execute: playlistTrackDeleteModule,
    decodeInput: playlistTrackDeleteInputDecoder,
  },
  playlist_tracks: {
    identifier: 'playlist_tracks',
    route: '/playlist/tracks',
    execute: playlistTracksModule,
    decodeInput: playlistTracksInputDecoder,
  },
  playlist_update: {
    identifier: 'playlist_update',
    route: '/playlist/update',
    execute: playlistUpdateModule,
    decodeInput: playlistUpdateInputDecoder,
  },
  playlist_update_playcount: {
    identifier: 'playlist_update_playcount',
    route: '/playlist/update/playcount',
    execute: playlistUpdatePlaycountModule,
    decodeInput: playlistUpdatePlaycountInputDecoder,
  },
  playlist_video_recent: {
    identifier: 'playlist_video_recent',
    route: '/playlist/video/recent',
    execute: playlistVideoRecentModule,
    decodeInput: playlistVideoRecentInputDecoder,
  },
  playmode_intelligence_list: {
    identifier: 'playmode_intelligence_list',
    route: '/playmode/intelligence/list',
    execute: playmodeIntelligenceListModule,
    decodeInput: playmodeIntelligenceListInputDecoder,
  },
  program_recommend: {
    identifier: 'program_recommend',
    route: '/program/recommend',
    execute: programRecommendModule,
    decodeInput: programRecommendInputDecoder,
  },
  rebind: {
    identifier: 'rebind',
    route: '/rebind',
    execute: rebindModule,
    decodeInput: rebindInputDecoder,
  },
  recent_listen_list: {
    identifier: 'recent_listen_list',
    route: '/recent/listen/list',
    execute: recentListenListModule,
    decodeInput: recentListenListInputDecoder,
  },
  recommend_resource: {
    identifier: 'recommend_resource',
    route: '/recommend/resource',
    execute: recommendResourceModule,
    decodeInput: recommendResourceInputDecoder,
  },
  recommend_songs: {
    identifier: 'recommend_songs',
    route: '/recommend/songs',
    execute: recommendSongsModule,
    decodeInput: recommendSongsInputDecoder,
  },
  recommend_songs_dislike: {
    identifier: 'recommend_songs_dislike',
    route: '/recommend/songs/dislike',
    execute: recommendSongsDislikeModule,
    decodeInput: recommendSongsDislikeInputDecoder,
  },
  record_recent_album: {
    identifier: 'record_recent_album',
    route: '/record/recent/album',
    execute: recordRecentAlbumModule,
    decodeInput: recordRecentAlbumInputDecoder,
  },
  record_recent_dj: {
    identifier: 'record_recent_dj',
    route: '/record/recent/dj',
    execute: recordRecentDjModule,
    decodeInput: recordRecentDjInputDecoder,
  },
  record_recent_playlist: {
    identifier: 'record_recent_playlist',
    route: '/record/recent/playlist',
    execute: recordRecentPlaylistModule,
    decodeInput: recordRecentPlaylistInputDecoder,
  },
  record_recent_song: {
    identifier: 'record_recent_song',
    route: '/record/recent/song',
    execute: recordRecentSongModule,
    decodeInput: recordRecentSongInputDecoder,
  },
  record_recent_video: {
    identifier: 'record_recent_video',
    route: '/record/recent/video',
    execute: recordRecentVideoModule,
    decodeInput: recordRecentVideoInputDecoder,
  },
  record_recent_voice: {
    identifier: 'record_recent_voice',
    route: '/record/recent/voice',
    execute: recordRecentVoiceModule,
    decodeInput: recordRecentVoiceInputDecoder,
  },
  register_anonimous: {
    identifier: 'register_anonimous',
    route: '/register/anonimous',
    execute: registerAnonimousModule,
    decodeInput: registerAnonimousInputDecoder,
  },
  register_cellphone: {
    identifier: 'register_cellphone',
    route: '/register/cellphone',
    execute: registerCellphoneModule,
    decodeInput: registerCellphoneInputDecoder,
  },
  related_allvideo: {
    identifier: 'related_allvideo',
    route: '/related/allvideo',
    execute: relatedAllvideoModule,
    decodeInput: relatedAllvideoInputDecoder,
  },
  related_playlist: {
    identifier: 'related_playlist',
    route: '/related/playlist',
    execute: relatedPlaylistModule,
    decodeInput: relatedPlaylistInputDecoder,
  },
  resource_like: {
    identifier: 'resource_like',
    route: '/resource/like',
    execute: resourceLikeModule,
    decodeInput: resourceLikeInputDecoder,
  },
  scrobble: {
    identifier: 'scrobble',
    route: '/scrobble',
    execute: scrobbleModule,
    decodeInput: scrobbleInputDecoder,
  },
  search: {
    identifier: 'search',
    route: '/search',
    execute: searchModule,
    decodeInput: searchInputDecoder,
  },
  search_default: {
    identifier: 'search_default',
    route: '/search/default',
    execute: searchDefaultModule,
    decodeInput: searchDefaultInputDecoder,
  },
  search_hot: {
    identifier: 'search_hot',
    route: '/search/hot',
    execute: searchHotModule,
    decodeInput: searchHotInputDecoder,
  },
  search_hot_detail: {
    identifier: 'search_hot_detail',
    route: '/search/hot/detail',
    execute: searchHotDetailModule,
    decodeInput: searchHotDetailInputDecoder,
  },
  search_match: {
    identifier: 'search_match',
    route: '/search/match',
    execute: searchMatchModule,
    decodeInput: searchMatchInputDecoder,
  },
  search_multimatch: {
    identifier: 'search_multimatch',
    route: '/search/multimatch',
    execute: searchMultimatchModule,
    decodeInput: searchMultimatchInputDecoder,
  },
  search_suggest: {
    identifier: 'search_suggest',
    route: '/search/suggest',
    execute: searchSuggestModule,
    decodeInput: searchSuggestInputDecoder,
  },
  send_album: {
    identifier: 'send_album',
    route: '/send/album',
    execute: sendAlbumModule,
    decodeInput: sendAlbumInputDecoder,
  },
  send_playlist: {
    identifier: 'send_playlist',
    route: '/send/playlist',
    execute: sendPlaylistModule,
    decodeInput: sendPlaylistInputDecoder,
  },
  send_song: {
    identifier: 'send_song',
    route: '/send/song',
    execute: sendSongModule,
    decodeInput: sendSongInputDecoder,
  },
  send_text: {
    identifier: 'send_text',
    route: '/send/text',
    execute: sendTextModule,
    decodeInput: sendTextInputDecoder,
  },
  setting: {
    identifier: 'setting',
    route: '/setting',
    execute: settingModule,
    decodeInput: settingInputDecoder,
  },
  share_resource: {
    identifier: 'share_resource',
    route: '/share/resource',
    execute: shareResourceModule,
    decodeInput: shareResourceInputDecoder,
  },
  sheet_list: {
    identifier: 'sheet_list',
    route: '/sheet/list',
    execute: sheetListModule,
    decodeInput: sheetListInputDecoder,
  },
  sheet_preview: {
    identifier: 'sheet_preview',
    route: '/sheet/preview',
    execute: sheetPreviewModule,
    decodeInput: sheetPreviewInputDecoder,
  },
  sign_happy_info: {
    identifier: 'sign_happy_info',
    route: '/sign/happy/info',
    execute: signHappyInfoModule,
    decodeInput: signHappyInfoInputDecoder,
  },
  signin_progress: {
    identifier: 'signin_progress',
    route: '/signin/progress',
    execute: signinProgressModule,
    decodeInput: signinProgressInputDecoder,
  },
  simi_artist: {
    identifier: 'simi_artist',
    route: '/simi/artist',
    execute: simiArtistModule,
    decodeInput: simiArtistInputDecoder,
  },
  simi_mv: {
    identifier: 'simi_mv',
    route: '/simi/mv',
    execute: simiMvModule,
    decodeInput: simiMvInputDecoder,
  },
  simi_playlist: {
    identifier: 'simi_playlist',
    route: '/simi/playlist',
    execute: simiPlaylistModule,
    decodeInput: simiPlaylistInputDecoder,
  },
  simi_song: {
    identifier: 'simi_song',
    route: '/simi/song',
    execute: simiSongModule,
    decodeInput: simiSongInputDecoder,
  },
  simi_user: {
    identifier: 'simi_user',
    route: '/simi/user',
    execute: simiUserModule,
    decodeInput: simiUserInputDecoder,
  },
  song_chorus: {
    identifier: 'song_chorus',
    route: '/song/chorus',
    execute: songChorusModule,
    decodeInput: songChorusInputDecoder,
  },
  song_detail: {
    identifier: 'song_detail',
    route: '/song/detail',
    execute: songDetailModule,
    decodeInput: songDetailInputDecoder,
  },
  song_downlist: {
    identifier: 'song_downlist',
    route: '/song/downlist',
    execute: songDownlistModule,
    decodeInput: songDownlistInputDecoder,
  },
  song_download_url: {
    identifier: 'song_download_url',
    route: '/song/download/url',
    execute: songDownloadUrlModule,
    decodeInput: songDownloadUrlInputDecoder,
  },
  song_download_url_v1: {
    identifier: 'song_download_url_v1',
    route: '/song/download/url/v1',
    execute: songDownloadUrlV1Module,
    decodeInput: songDownloadUrlV1InputDecoder,
  },
  song_dynamic_cover: {
    identifier: 'song_dynamic_cover',
    route: '/song/dynamic/cover',
    execute: songDynamicCoverModule,
    decodeInput: songDynamicCoverInputDecoder,
  },
  song_like_check: {
    identifier: 'song_like_check',
    route: '/song/like/check',
    execute: songLikeCheckModule,
    decodeInput: songLikeCheckInputDecoder,
  },
  song_lyrics_mark: {
    identifier: 'song_lyrics_mark',
    route: '/song/lyrics/mark',
    execute: songLyricsMarkModule,
    decodeInput: songLyricsMarkInputDecoder,
  },
  song_lyrics_mark_add: {
    identifier: 'song_lyrics_mark_add',
    route: '/song/lyrics/mark/add',
    execute: songLyricsMarkAddModule,
    decodeInput: songLyricsMarkAddInputDecoder,
  },
  song_lyrics_mark_del: {
    identifier: 'song_lyrics_mark_del',
    route: '/song/lyrics/mark/del',
    execute: songLyricsMarkDelModule,
    decodeInput: songLyricsMarkDelInputDecoder,
  },
  song_lyrics_mark_user_page: {
    identifier: 'song_lyrics_mark_user_page',
    route: '/song/lyrics/mark/user/page',
    execute: songLyricsMarkUserPageModule,
    decodeInput: songLyricsMarkUserPageInputDecoder,
  },
  song_monthdownlist: {
    identifier: 'song_monthdownlist',
    route: '/song/monthdownlist',
    execute: songMonthdownlistModule,
    decodeInput: songMonthdownlistInputDecoder,
  },
  song_music_detail: {
    identifier: 'song_music_detail',
    route: '/song/music/detail',
    execute: songMusicDetailModule,
    decodeInput: songMusicDetailInputDecoder,
  },
  song_order_update: {
    identifier: 'song_order_update',
    route: '/song/order/update',
    execute: songOrderUpdateModule,
    decodeInput: songOrderUpdateInputDecoder,
  },
  song_purchased: {
    identifier: 'song_purchased',
    route: '/song/purchased',
    execute: songPurchasedModule,
    decodeInput: songPurchasedInputDecoder,
  },
  song_red_count: {
    identifier: 'song_red_count',
    route: '/song/red/count',
    execute: songRedCountModule,
    decodeInput: songRedCountInputDecoder,
  },
  song_singledownlist: {
    identifier: 'song_singledownlist',
    route: '/song/singledownlist',
    execute: songSingledownlistModule,
    decodeInput: songSingledownlistInputDecoder,
  },
  song_url: {
    identifier: 'song_url',
    route: '/song/url',
    execute: songUrlModule,
    decodeInput: songUrlInputDecoder,
  },
  song_url_v1: {
    identifier: 'song_url_v1',
    route: '/song/url/v1',
    execute: songUrlV1Module,
    decodeInput: songUrlV1InputDecoder,
  },
  song_wiki_summary: {
    identifier: 'song_wiki_summary',
    route: '/song/wiki/summary',
    execute: songWikiSummaryModule,
    decodeInput: songWikiSummaryInputDecoder,
  },
  starpick_comments_summary: {
    identifier: 'starpick_comments_summary',
    route: '/starpick/comments/summary',
    execute: starpickCommentsSummaryModule,
    decodeInput: starpickCommentsSummaryInputDecoder,
  },
  style_album: {
    identifier: 'style_album',
    route: '/style/album',
    execute: styleAlbumModule,
    decodeInput: styleAlbumInputDecoder,
  },
  style_artist: {
    identifier: 'style_artist',
    route: '/style/artist',
    execute: styleArtistModule,
    decodeInput: styleArtistInputDecoder,
  },
  style_detail: {
    identifier: 'style_detail',
    route: '/style/detail',
    execute: styleDetailModule,
    decodeInput: styleDetailInputDecoder,
  },
  style_list: {
    identifier: 'style_list',
    route: '/style/list',
    execute: styleListModule,
    decodeInput: styleListInputDecoder,
  },
  style_playlist: {
    identifier: 'style_playlist',
    route: '/style/playlist',
    execute: stylePlaylistModule,
    decodeInput: stylePlaylistInputDecoder,
  },
  style_preference: {
    identifier: 'style_preference',
    route: '/style/preference',
    execute: stylePreferenceModule,
    decodeInput: stylePreferenceInputDecoder,
  },
  style_song: {
    identifier: 'style_song',
    route: '/style/song',
    execute: styleSongModule,
    decodeInput: styleSongInputDecoder,
  },
  summary_annual: {
    identifier: 'summary_annual',
    route: '/summary/annual',
    execute: summaryAnnualModule,
    decodeInput: summaryAnnualInputDecoder,
  },
  top_album: {
    identifier: 'top_album',
    route: '/top/album',
    execute: topAlbumModule,
    decodeInput: topAlbumInputDecoder,
  },
  top_artists: {
    identifier: 'top_artists',
    route: '/top/artists',
    execute: topArtistsModule,
    decodeInput: topArtistsInputDecoder,
  },
  top_list: {
    identifier: 'top_list',
    route: '/top/list',
    execute: topListModule,
    decodeInput: topListInputDecoder,
  },
  top_mv: {
    identifier: 'top_mv',
    route: '/top/mv',
    execute: topMvModule,
    decodeInput: topMvInputDecoder,
  },
  top_playlist: {
    identifier: 'top_playlist',
    route: '/top/playlist',
    execute: topPlaylistModule,
    decodeInput: topPlaylistInputDecoder,
  },
  top_playlist_highquality: {
    identifier: 'top_playlist_highquality',
    route: '/top/playlist/highquality',
    execute: topPlaylistHighqualityModule,
    decodeInput: topPlaylistHighqualityInputDecoder,
  },
  top_song: {
    identifier: 'top_song',
    route: '/top/song',
    execute: topSongModule,
    decodeInput: topSongInputDecoder,
  },
  topic_detail: {
    identifier: 'topic_detail',
    route: '/topic/detail',
    execute: topicDetailModule,
    decodeInput: topicDetailInputDecoder,
  },
  topic_detail_event_hot: {
    identifier: 'topic_detail_event_hot',
    route: '/topic/detail/event/hot',
    execute: topicDetailEventHotModule,
    decodeInput: topicDetailEventHotInputDecoder,
  },
  topic_sublist: {
    identifier: 'topic_sublist',
    route: '/topic/sublist',
    execute: topicSublistModule,
    decodeInput: topicSublistInputDecoder,
  },
  toplist: {
    identifier: 'toplist',
    route: '/toplist',
    execute: toplistModule,
    decodeInput: toplistInputDecoder,
  },
  toplist_artist: {
    identifier: 'toplist_artist',
    route: '/toplist/artist',
    execute: toplistArtistModule,
    decodeInput: toplistArtistInputDecoder,
  },
  toplist_detail: {
    identifier: 'toplist_detail',
    route: '/toplist/detail',
    execute: toplistDetailModule,
    decodeInput: toplistDetailInputDecoder,
  },
  ugc_album_get: {
    identifier: 'ugc_album_get',
    route: '/ugc/album/get',
    execute: ugcAlbumGetModule,
    decodeInput: ugcAlbumGetInputDecoder,
  },
  ugc_artist_get: {
    identifier: 'ugc_artist_get',
    route: '/ugc/artist/get',
    execute: ugcArtistGetModule,
    decodeInput: ugcArtistGetInputDecoder,
  },
  ugc_artist_search: {
    identifier: 'ugc_artist_search',
    route: '/ugc/artist/search',
    execute: ugcArtistSearchModule,
    decodeInput: ugcArtistSearchInputDecoder,
  },
  ugc_detail: {
    identifier: 'ugc_detail',
    route: '/ugc/detail',
    execute: ugcDetailModule,
    decodeInput: ugcDetailInputDecoder,
  },
  ugc_mv_get: {
    identifier: 'ugc_mv_get',
    route: '/ugc/mv/get',
    execute: ugcMvGetModule,
    decodeInput: ugcMvGetInputDecoder,
  },
  ugc_song_get: {
    identifier: 'ugc_song_get',
    route: '/ugc/song/get',
    execute: ugcSongGetModule,
    decodeInput: ugcSongGetInputDecoder,
  },
  ugc_user_devote: {
    identifier: 'ugc_user_devote',
    route: '/ugc/user/devote',
    execute: ugcUserDevoteModule,
    decodeInput: ugcUserDevoteInputDecoder,
  },
  user_account: {
    identifier: 'user_account',
    route: '/user/account',
    execute: userAccountModule,
    decodeInput: userAccountInputDecoder,
  },
  user_audio: {
    identifier: 'user_audio',
    route: '/user/audio',
    execute: userAudioModule,
    decodeInput: userAudioInputDecoder,
  },
  user_binding: {
    identifier: 'user_binding',
    route: '/user/binding',
    execute: userBindingModule,
    decodeInput: userBindingInputDecoder,
  },
  user_cloud: {
    identifier: 'user_cloud',
    route: '/user/cloud',
    execute: userCloudModule,
    decodeInput: userCloudInputDecoder,
  },
  user_cloud_del: {
    identifier: 'user_cloud_del',
    route: '/user/cloud/del',
    execute: userCloudDelModule,
    decodeInput: userCloudDelInputDecoder,
  },
  user_cloud_detail: {
    identifier: 'user_cloud_detail',
    route: '/user/cloud/detail',
    execute: userCloudDetailModule,
    decodeInput: userCloudDetailInputDecoder,
  },
  user_comment_history: {
    identifier: 'user_comment_history',
    route: '/user/comment/history',
    execute: userCommentHistoryModule,
    decodeInput: userCommentHistoryInputDecoder,
  },
  user_detail: {
    identifier: 'user_detail',
    route: '/user/detail',
    execute: userDetailModule,
    decodeInput: userDetailInputDecoder,
  },
  user_dj: {
    identifier: 'user_dj',
    route: '/user/dj',
    execute: userDjModule,
    decodeInput: userDjInputDecoder,
  },
  user_event: {
    identifier: 'user_event',
    route: '/user/event',
    execute: userEventModule,
    decodeInput: userEventInputDecoder,
  },
  user_follow_mixed: {
    identifier: 'user_follow_mixed',
    route: '/user/follow/mixed',
    execute: userFollowMixedModule,
    decodeInput: userFollowMixedInputDecoder,
  },
  user_followeds: {
    identifier: 'user_followeds',
    route: '/user/followeds',
    execute: userFollowedsModule,
    decodeInput: userFollowedsInputDecoder,
  },
  user_follows: {
    identifier: 'user_follows',
    route: '/user/follows',
    execute: userFollowsModule,
    decodeInput: userFollowsInputDecoder,
  },
  user_level: {
    identifier: 'user_level',
    route: '/user/level',
    execute: userLevelModule,
    decodeInput: userLevelInputDecoder,
  },
  user_medal: {
    identifier: 'user_medal',
    route: '/user/medal',
    execute: userMedalModule,
    decodeInput: userMedalInputDecoder,
  },
  user_mutualfollow_get: {
    identifier: 'user_mutualfollow_get',
    route: '/user/mutualfollow/get',
    execute: userMutualfollowGetModule,
    decodeInput: userMutualfollowGetInputDecoder,
  },
  user_playlist: {
    identifier: 'user_playlist',
    route: '/user/playlist',
    execute: userPlaylistModule,
    decodeInput: userPlaylistInputDecoder,
  },
  user_playlist_collect: {
    identifier: 'user_playlist_collect',
    route: '/user/playlist/collect',
    execute: userPlaylistCollectModule,
    decodeInput: userPlaylistCollectInputDecoder,
  },
  user_playlist_create: {
    identifier: 'user_playlist_create',
    route: '/user/playlist/create',
    execute: userPlaylistCreateModule,
    decodeInput: userPlaylistCreateInputDecoder,
  },
  user_record: {
    identifier: 'user_record',
    route: '/user/record',
    execute: userRecordModule,
    decodeInput: userRecordInputDecoder,
  },
  user_replacephone: {
    identifier: 'user_replacephone',
    route: '/user/replacephone',
    execute: userReplacephoneModule,
    decodeInput: userReplacephoneInputDecoder,
  },
  user_social_status: {
    identifier: 'user_social_status',
    route: '/user/social/status',
    execute: userSocialStatusModule,
    decodeInput: userSocialStatusInputDecoder,
  },
  user_social_status_edit: {
    identifier: 'user_social_status_edit',
    route: '/user/social/status/edit',
    execute: userSocialStatusEditModule,
    decodeInput: userSocialStatusEditInputDecoder,
  },
  user_social_status_rcmd: {
    identifier: 'user_social_status_rcmd',
    route: '/user/social/status/rcmd',
    execute: userSocialStatusRcmdModule,
    decodeInput: userSocialStatusRcmdInputDecoder,
  },
  user_social_status_support: {
    identifier: 'user_social_status_support',
    route: '/user/social/status/support',
    execute: userSocialStatusSupportModule,
    decodeInput: userSocialStatusSupportInputDecoder,
  },
  user_subcount: {
    identifier: 'user_subcount',
    route: '/user/subcount',
    execute: userSubcountModule,
    decodeInput: userSubcountInputDecoder,
  },
  user_update: {
    identifier: 'user_update',
    route: '/user/update',
    execute: userUpdateModule,
    decodeInput: userUpdateInputDecoder,
  },
  verify_getQr: {
    identifier: 'verify_getQr',
    route: '/verify/getQr',
    execute: verifyGetQrModule,
    decodeInput: verifyGetQrInputDecoder,
  },
  verify_qrcodestatus: {
    identifier: 'verify_qrcodestatus',
    route: '/verify/qrcodestatus',
    execute: verifyQrcodestatusModule,
    decodeInput: verifyQrcodestatusInputDecoder,
  },
  video_category_list: {
    identifier: 'video_category_list',
    route: '/video/category/list',
    execute: videoCategoryListModule,
    decodeInput: videoCategoryListInputDecoder,
  },
  video_detail: {
    identifier: 'video_detail',
    route: '/video/detail',
    execute: videoDetailModule,
    decodeInput: videoDetailInputDecoder,
  },
  video_detail_info: {
    identifier: 'video_detail_info',
    route: '/video/detail/info',
    execute: videoDetailInfoModule,
    decodeInput: videoDetailInfoInputDecoder,
  },
  video_group: {
    identifier: 'video_group',
    route: '/video/group',
    execute: videoGroupModule,
    decodeInput: videoGroupInputDecoder,
  },
  video_group_list: {
    identifier: 'video_group_list',
    route: '/video/group/list',
    execute: videoGroupListModule,
    decodeInput: videoGroupListInputDecoder,
  },
  video_sub: {
    identifier: 'video_sub',
    route: '/video/sub',
    execute: videoSubModule,
    decodeInput: videoSubInputDecoder,
  },
  video_timeline_all: {
    identifier: 'video_timeline_all',
    route: '/video/timeline/all',
    execute: videoTimelineAllModule,
    decodeInput: videoTimelineAllInputDecoder,
  },
  video_timeline_recommend: {
    identifier: 'video_timeline_recommend',
    route: '/video/timeline/recommend',
    execute: videoTimelineRecommendModule,
    decodeInput: videoTimelineRecommendInputDecoder,
  },
  video_url: {
    identifier: 'video_url',
    route: '/video/url',
    execute: videoUrlModule,
    decodeInput: videoUrlInputDecoder,
  },
  vip_growthpoint: {
    identifier: 'vip_growthpoint',
    route: '/vip/growthpoint',
    execute: vipGrowthpointModule,
    decodeInput: vipGrowthpointInputDecoder,
  },
  vip_growthpoint_details: {
    identifier: 'vip_growthpoint_details',
    route: '/vip/growthpoint/details',
    execute: vipGrowthpointDetailsModule,
    decodeInput: vipGrowthpointDetailsInputDecoder,
  },
  vip_growthpoint_get: {
    identifier: 'vip_growthpoint_get',
    route: '/vip/growthpoint/get',
    execute: vipGrowthpointGetModule,
    decodeInput: vipGrowthpointGetInputDecoder,
  },
  vip_info: {
    identifier: 'vip_info',
    route: '/vip/info',
    execute: vipInfoModule,
    decodeInput: vipInfoInputDecoder,
  },
  vip_info_v2: {
    identifier: 'vip_info_v2',
    route: '/vip/info/v2',
    execute: vipInfoV2Module,
    decodeInput: vipInfoV2InputDecoder,
  },
  vip_tasks: {
    identifier: 'vip_tasks',
    route: '/vip/tasks',
    execute: vipTasksModule,
    decodeInput: vipTasksInputDecoder,
  },
  vip_timemachine: {
    identifier: 'vip_timemachine',
    route: '/vip/timemachine',
    execute: vipTimemachineModule,
    decodeInput: vipTimemachineInputDecoder,
  },
  voice_delete: {
    identifier: 'voice_delete',
    route: '/voice/delete',
    execute: voiceDeleteModule,
    decodeInput: voiceDeleteInputDecoder,
  },
  voice_detail: {
    identifier: 'voice_detail',
    route: '/voice/detail',
    execute: voiceDetailModule,
    decodeInput: voiceDetailInputDecoder,
  },
  voice_lyric: {
    identifier: 'voice_lyric',
    route: '/voice/lyric',
    execute: voiceLyricModule,
    decodeInput: voiceLyricInputDecoder,
  },
  voice_upload: {
    identifier: 'voice_upload',
    route: '/voice/upload',
    execute: voiceUploadModule,
    decodeInput: voiceUploadInputDecoder,
  },
  voicelist_detail: {
    identifier: 'voicelist_detail',
    route: '/voicelist/detail',
    execute: voicelistDetailModule,
    decodeInput: voicelistDetailInputDecoder,
  },
  voicelist_list: {
    identifier: 'voicelist_list',
    route: '/voicelist/list',
    execute: voicelistListModule,
    decodeInput: voicelistListInputDecoder,
  },
  voicelist_list_search: {
    identifier: 'voicelist_list_search',
    route: '/voicelist/list/search',
    execute: voicelistListSearchModule,
    decodeInput: voicelistListSearchInputDecoder,
  },
  voicelist_search: {
    identifier: 'voicelist_search',
    route: '/voicelist/search',
    execute: voicelistSearchModule,
    decodeInput: voicelistSearchInputDecoder,
  },
  voicelist_trans: {
    identifier: 'voicelist_trans',
    route: '/voicelist/trans',
    execute: voicelistTransModule,
    decodeInput: voicelistTransInputDecoder,
  },
  yunbei: {
    identifier: 'yunbei',
    route: '/yunbei',
    execute: yunbeiModule,
    decodeInput: yunbeiInputDecoder,
  },
  yunbei_expense: {
    identifier: 'yunbei_expense',
    route: '/yunbei/expense',
    execute: yunbeiExpenseModule,
    decodeInput: yunbeiExpenseInputDecoder,
  },
  yunbei_info: {
    identifier: 'yunbei_info',
    route: '/yunbei/info',
    execute: yunbeiInfoModule,
    decodeInput: yunbeiInfoInputDecoder,
  },
  yunbei_rcmd_song: {
    identifier: 'yunbei_rcmd_song',
    route: '/yunbei/rcmd/song',
    execute: yunbeiRcmdSongModule,
    decodeInput: yunbeiRcmdSongInputDecoder,
  },
  yunbei_rcmd_song_history: {
    identifier: 'yunbei_rcmd_song_history',
    route: '/yunbei/rcmd/song/history',
    execute: yunbeiRcmdSongHistoryModule,
    decodeInput: yunbeiRcmdSongHistoryInputDecoder,
  },
  yunbei_receipt: {
    identifier: 'yunbei_receipt',
    route: '/yunbei/receipt',
    execute: yunbeiReceiptModule,
    decodeInput: yunbeiReceiptInputDecoder,
  },
  yunbei_sign: {
    identifier: 'yunbei_sign',
    route: '/yunbei/sign',
    execute: yunbeiSignModule,
    decodeInput: yunbeiSignInputDecoder,
  },
  yunbei_task_finish: {
    identifier: 'yunbei_task_finish',
    route: '/yunbei/task/finish',
    execute: yunbeiTaskFinishModule,
    decodeInput: yunbeiTaskFinishInputDecoder,
  },
  yunbei_tasks: {
    identifier: 'yunbei_tasks',
    route: '/yunbei/tasks',
    execute: yunbeiTasksModule,
    decodeInput: yunbeiTasksInputDecoder,
  },
  yunbei_tasks_todo: {
    identifier: 'yunbei_tasks_todo',
    route: '/yunbei/tasks/todo',
    execute: yunbeiTasksTodoModule,
    decodeInput: yunbeiTasksTodoInputDecoder,
  },
  yunbei_today: {
    identifier: 'yunbei_today',
    route: '/yunbei/today',
    execute: yunbeiTodayModule,
    decodeInput: yunbeiTodayInputDecoder,
  },
} as const satisfies SdkModuleRegistry;
