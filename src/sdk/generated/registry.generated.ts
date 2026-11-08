import activateInitProfileModule, {
  decodeModuleInput as activateInitProfileInputDecoder,
  moduleActions as activateInitProfileActions,
} from '../../modules/activate_init_profile.ts';
import aidjContentRcmdModule, {
  decodeModuleInput as aidjContentRcmdInputDecoder,
  moduleActions as aidjContentRcmdActions,
} from '../../modules/aidj_content_rcmd.ts';
import albumModule, {
  decodeModuleInput as albumInputDecoder,
  moduleActions as albumActions,
} from '../../modules/album.ts';
import albumDetailModule, {
  decodeModuleInput as albumDetailInputDecoder,
  moduleActions as albumDetailActions,
} from '../../modules/album_detail.ts';
import albumDetailDynamicModule, {
  decodeModuleInput as albumDetailDynamicInputDecoder,
  moduleActions as albumDetailDynamicActions,
} from '../../modules/album_detail_dynamic.ts';
import albumListModule, {
  decodeModuleInput as albumListInputDecoder,
  moduleActions as albumListActions,
} from '../../modules/album_list.ts';
import albumListStyleModule, {
  decodeModuleInput as albumListStyleInputDecoder,
  moduleActions as albumListStyleActions,
} from '../../modules/album_list_style.ts';
import albumNewModule, {
  decodeModuleInput as albumNewInputDecoder,
  moduleActions as albumNewActions,
} from '../../modules/album_new.ts';
import albumNewestModule, {
  decodeModuleInput as albumNewestInputDecoder,
  moduleActions as albumNewestActions,
} from '../../modules/album_newest.ts';
import albumPrivilegeModule, {
  decodeModuleInput as albumPrivilegeInputDecoder,
  moduleActions as albumPrivilegeActions,
} from '../../modules/album_privilege.ts';
import albumSongsaleboardModule, {
  decodeModuleInput as albumSongsaleboardInputDecoder,
  moduleActions as albumSongsaleboardActions,
} from '../../modules/album_songsaleboard.ts';
import albumSubModule, {
  decodeModuleInput as albumSubInputDecoder,
  moduleActions as albumSubActions,
} from '../../modules/album_sub.ts';
import albumSublistModule, {
  decodeModuleInput as albumSublistInputDecoder,
  moduleActions as albumSublistActions,
} from '../../modules/album_sublist.ts';
import artistAlbumModule, {
  decodeModuleInput as artistAlbumInputDecoder,
  moduleActions as artistAlbumActions,
} from '../../modules/artist_album.ts';
import artistDescModule, {
  decodeModuleInput as artistDescInputDecoder,
  moduleActions as artistDescActions,
} from '../../modules/artist_desc.ts';
import artistDetailModule, {
  decodeModuleInput as artistDetailInputDecoder,
  moduleActions as artistDetailActions,
} from '../../modules/artist_detail.ts';
import artistDetailDynamicModule, {
  decodeModuleInput as artistDetailDynamicInputDecoder,
  moduleActions as artistDetailDynamicActions,
} from '../../modules/artist_detail_dynamic.ts';
import artistFansModule, {
  decodeModuleInput as artistFansInputDecoder,
  moduleActions as artistFansActions,
} from '../../modules/artist_fans.ts';
import artistFollowCountModule, {
  decodeModuleInput as artistFollowCountInputDecoder,
  moduleActions as artistFollowCountActions,
} from '../../modules/artist_follow_count.ts';
import artistListModule, {
  decodeModuleInput as artistListInputDecoder,
  moduleActions as artistListActions,
} from '../../modules/artist_list.ts';
import artistMvModule, {
  decodeModuleInput as artistMvInputDecoder,
  moduleActions as artistMvActions,
} from '../../modules/artist_mv.ts';
import artistNewMvModule, {
  decodeModuleInput as artistNewMvInputDecoder,
  moduleActions as artistNewMvActions,
} from '../../modules/artist_new_mv.ts';
import artistNewSongModule, {
  decodeModuleInput as artistNewSongInputDecoder,
  moduleActions as artistNewSongActions,
} from '../../modules/artist_new_song.ts';
import artistSongsModule, {
  decodeModuleInput as artistSongsInputDecoder,
  moduleActions as artistSongsActions,
} from '../../modules/artist_songs.ts';
import artistSubModule, {
  decodeModuleInput as artistSubInputDecoder,
  moduleActions as artistSubActions,
} from '../../modules/artist_sub.ts';
import artistSublistModule, {
  decodeModuleInput as artistSublistInputDecoder,
  moduleActions as artistSublistActions,
} from '../../modules/artist_sublist.ts';
import artistTopSongModule, {
  decodeModuleInput as artistTopSongInputDecoder,
  moduleActions as artistTopSongActions,
} from '../../modules/artist_top_song.ts';
import artistVideoModule, {
  decodeModuleInput as artistVideoInputDecoder,
  moduleActions as artistVideoActions,
} from '../../modules/artist_video.ts';
import artistsModule, {
  decodeModuleInput as artistsInputDecoder,
  moduleActions as artistsActions,
} from '../../modules/artists.ts';
import audioMatchModule, {
  decodeModuleInput as audioMatchInputDecoder,
} from '../../modules/audio_match.ts';
import avatarUploadModule, {
  decodeModuleInput as avatarUploadInputDecoder,
} from '../../modules/avatar_upload.ts';
import bannerModule, {
  decodeModuleInput as bannerInputDecoder,
  moduleActions as bannerActions,
} from '../../modules/banner.ts';
import batchModule, {
  decodeModuleInput as batchInputDecoder,
  moduleActions as batchActions,
} from '../../modules/batch.ts';
import broadcastCategoryRegionGetModule, {
  decodeModuleInput as broadcastCategoryRegionGetInputDecoder,
  moduleActions as broadcastCategoryRegionGetActions,
} from '../../modules/broadcast_category_region_get.ts';
import broadcastChannelCollectListModule, {
  decodeModuleInput as broadcastChannelCollectListInputDecoder,
  moduleActions as broadcastChannelCollectListActions,
} from '../../modules/broadcast_channel_collect_list.ts';
import broadcastChannelCurrentinfoModule, {
  decodeModuleInput as broadcastChannelCurrentinfoInputDecoder,
  moduleActions as broadcastChannelCurrentinfoActions,
} from '../../modules/broadcast_channel_currentinfo.ts';
import broadcastChannelListModule, {
  decodeModuleInput as broadcastChannelListInputDecoder,
  moduleActions as broadcastChannelListActions,
} from '../../modules/broadcast_channel_list.ts';
import broadcastSubModule, {
  decodeModuleInput as broadcastSubInputDecoder,
  moduleActions as broadcastSubActions,
} from '../../modules/broadcast_sub.ts';
import calendarModule, {
  decodeModuleInput as calendarInputDecoder,
  moduleActions as calendarActions,
} from '../../modules/calendar.ts';
import captchaSentModule, {
  decodeModuleInput as captchaSentInputDecoder,
  moduleActions as captchaSentActions,
} from '../../modules/captcha_sent.ts';
import captchaVerifyModule, {
  decodeModuleInput as captchaVerifyInputDecoder,
  moduleActions as captchaVerifyActions,
} from '../../modules/captcha_verify.ts';
import cellphoneExistenceCheckModule, {
  decodeModuleInput as cellphoneExistenceCheckInputDecoder,
  moduleActions as cellphoneExistenceCheckActions,
} from '../../modules/cellphone_existence_check.ts';
import checkMusicModule, {
  decodeModuleInput as checkMusicInputDecoder,
  moduleActions as checkMusicActions,
} from '../../modules/check_music.ts';
import cloudModule, {
  decodeModuleInput as cloudInputDecoder,
} from '../../modules/cloud.ts';
import cloudImportModule, {
  decodeModuleInput as cloudImportInputDecoder,
} from '../../modules/cloud_import.ts';
import cloudMatchModule, {
  decodeModuleInput as cloudMatchInputDecoder,
  moduleActions as cloudMatchActions,
} from '../../modules/cloud_match.ts';
import cloudsearchModule, {
  decodeModuleInput as cloudsearchInputDecoder,
  moduleActions as cloudsearchActions,
} from '../../modules/cloudsearch.ts';
import commentModule, {
  decodeModuleInput as commentInputDecoder,
  moduleActions as commentActions,
} from '../../modules/comment.ts';
import commentAlbumModule, {
  decodeModuleInput as commentAlbumInputDecoder,
  moduleActions as commentAlbumActions,
} from '../../modules/comment_album.ts';
import commentDjModule, {
  decodeModuleInput as commentDjInputDecoder,
  moduleActions as commentDjActions,
} from '../../modules/comment_dj.ts';
import commentEventModule, {
  decodeModuleInput as commentEventInputDecoder,
  moduleActions as commentEventActions,
} from '../../modules/comment_event.ts';
import commentFloorModule, {
  decodeModuleInput as commentFloorInputDecoder,
  moduleActions as commentFloorActions,
} from '../../modules/comment_floor.ts';
import commentHotModule, {
  decodeModuleInput as commentHotInputDecoder,
  moduleActions as commentHotActions,
} from '../../modules/comment_hot.ts';
import commentHugListModule, {
  decodeModuleInput as commentHugListInputDecoder,
  moduleActions as commentHugListActions,
} from '../../modules/comment_hug_list.ts';
import commentLikeModule, {
  decodeModuleInput as commentLikeInputDecoder,
  moduleActions as commentLikeActions,
} from '../../modules/comment_like.ts';
import commentMusicModule, {
  decodeModuleInput as commentMusicInputDecoder,
  moduleActions as commentMusicActions,
} from '../../modules/comment_music.ts';
import commentMvModule, {
  decodeModuleInput as commentMvInputDecoder,
  moduleActions as commentMvActions,
} from '../../modules/comment_mv.ts';
import commentNewModule, {
  decodeModuleInput as commentNewInputDecoder,
  moduleActions as commentNewActions,
} from '../../modules/comment_new.ts';
import commentPlaylistModule, {
  decodeModuleInput as commentPlaylistInputDecoder,
  moduleActions as commentPlaylistActions,
} from '../../modules/comment_playlist.ts';
import commentVideoModule, {
  decodeModuleInput as commentVideoInputDecoder,
  moduleActions as commentVideoActions,
} from '../../modules/comment_video.ts';
import countriesCodeListModule, {
  decodeModuleInput as countriesCodeListInputDecoder,
  moduleActions as countriesCodeListActions,
} from '../../modules/countries_code_list.ts';
import dailySigninModule, {
  decodeModuleInput as dailySigninInputDecoder,
  moduleActions as dailySigninActions,
} from '../../modules/daily_signin.ts';
import digitalAlbumDetailModule, {
  decodeModuleInput as digitalAlbumDetailInputDecoder,
  moduleActions as digitalAlbumDetailActions,
} from '../../modules/digitalAlbum_detail.ts';
import digitalAlbumOrderingModule, {
  decodeModuleInput as digitalAlbumOrderingInputDecoder,
  moduleActions as digitalAlbumOrderingActions,
} from '../../modules/digitalAlbum_ordering.ts';
import digitalAlbumPurchasedModule, {
  decodeModuleInput as digitalAlbumPurchasedInputDecoder,
  moduleActions as digitalAlbumPurchasedActions,
} from '../../modules/digitalAlbum_purchased.ts';
import digitalAlbumSalesModule, {
  decodeModuleInput as digitalAlbumSalesInputDecoder,
  moduleActions as digitalAlbumSalesActions,
} from '../../modules/digitalAlbum_sales.ts';
import djBannerModule, {
  decodeModuleInput as djBannerInputDecoder,
  moduleActions as djBannerActions,
} from '../../modules/dj_banner.ts';
import djCategoryExcludehotModule, {
  decodeModuleInput as djCategoryExcludehotInputDecoder,
  moduleActions as djCategoryExcludehotActions,
} from '../../modules/dj_category_excludehot.ts';
import djCategoryRecommendModule, {
  decodeModuleInput as djCategoryRecommendInputDecoder,
  moduleActions as djCategoryRecommendActions,
} from '../../modules/dj_category_recommend.ts';
import djCatelistModule, {
  decodeModuleInput as djCatelistInputDecoder,
  moduleActions as djCatelistActions,
} from '../../modules/dj_catelist.ts';
import djDetailModule, {
  decodeModuleInput as djDetailInputDecoder,
  moduleActions as djDetailActions,
} from '../../modules/dj_detail.ts';
import djDifmAllStyleChannelModule, {
  decodeModuleInput as djDifmAllStyleChannelInputDecoder,
  moduleActions as djDifmAllStyleChannelActions,
} from '../../modules/dj_difm_all_style_channel.ts';
import djDifmChannelSubscribeModule, {
  decodeModuleInput as djDifmChannelSubscribeInputDecoder,
  moduleActions as djDifmChannelSubscribeActions,
} from '../../modules/dj_difm_channel_subscribe.ts';
import djDifmChannelUnsubscribeModule, {
  decodeModuleInput as djDifmChannelUnsubscribeInputDecoder,
  moduleActions as djDifmChannelUnsubscribeActions,
} from '../../modules/dj_difm_channel_unsubscribe.ts';
import djDifmPlayingTracksListModule, {
  decodeModuleInput as djDifmPlayingTracksListInputDecoder,
  moduleActions as djDifmPlayingTracksListActions,
} from '../../modules/dj_difm_playing_tracks_list.ts';
import djDifmSubscribeChannelsGetModule, {
  decodeModuleInput as djDifmSubscribeChannelsGetInputDecoder,
  moduleActions as djDifmSubscribeChannelsGetActions,
} from '../../modules/dj_difm_subscribe_channels_get.ts';
import djHotModule, {
  decodeModuleInput as djHotInputDecoder,
  moduleActions as djHotActions,
} from '../../modules/dj_hot.ts';
import djPaygiftModule, {
  decodeModuleInput as djPaygiftInputDecoder,
  moduleActions as djPaygiftActions,
} from '../../modules/dj_paygift.ts';
import djPersonalizeRecommendModule, {
  decodeModuleInput as djPersonalizeRecommendInputDecoder,
  moduleActions as djPersonalizeRecommendActions,
} from '../../modules/dj_personalize_recommend.ts';
import djProgramModule, {
  decodeModuleInput as djProgramInputDecoder,
  moduleActions as djProgramActions,
} from '../../modules/dj_program.ts';
import djProgramDetailModule, {
  decodeModuleInput as djProgramDetailInputDecoder,
  moduleActions as djProgramDetailActions,
} from '../../modules/dj_program_detail.ts';
import djProgramToplistModule, {
  decodeModuleInput as djProgramToplistInputDecoder,
  moduleActions as djProgramToplistActions,
} from '../../modules/dj_program_toplist.ts';
import djProgramToplistHoursModule, {
  decodeModuleInput as djProgramToplistHoursInputDecoder,
  moduleActions as djProgramToplistHoursActions,
} from '../../modules/dj_program_toplist_hours.ts';
import djRadioHotModule, {
  decodeModuleInput as djRadioHotInputDecoder,
  moduleActions as djRadioHotActions,
} from '../../modules/dj_radio_hot.ts';
import djRecommendModule, {
  decodeModuleInput as djRecommendInputDecoder,
  moduleActions as djRecommendActions,
} from '../../modules/dj_recommend.ts';
import djRecommendTypeModule, {
  decodeModuleInput as djRecommendTypeInputDecoder,
  moduleActions as djRecommendTypeActions,
} from '../../modules/dj_recommend_type.ts';
import djSubModule, {
  decodeModuleInput as djSubInputDecoder,
  moduleActions as djSubActions,
} from '../../modules/dj_sub.ts';
import djSublistModule, {
  decodeModuleInput as djSublistInputDecoder,
  moduleActions as djSublistActions,
} from '../../modules/dj_sublist.ts';
import djSubscriberModule, {
  decodeModuleInput as djSubscriberInputDecoder,
  moduleActions as djSubscriberActions,
} from '../../modules/dj_subscriber.ts';
import djTodayPerferedModule, {
  decodeModuleInput as djTodayPerferedInputDecoder,
  moduleActions as djTodayPerferedActions,
} from '../../modules/dj_today_perfered.ts';
import djToplistModule, {
  decodeModuleInput as djToplistInputDecoder,
  moduleActions as djToplistActions,
} from '../../modules/dj_toplist.ts';
import djToplistHoursModule, {
  decodeModuleInput as djToplistHoursInputDecoder,
  moduleActions as djToplistHoursActions,
} from '../../modules/dj_toplist_hours.ts';
import djToplistNewcomerModule, {
  decodeModuleInput as djToplistNewcomerInputDecoder,
  moduleActions as djToplistNewcomerActions,
} from '../../modules/dj_toplist_newcomer.ts';
import djToplistPayModule, {
  decodeModuleInput as djToplistPayInputDecoder,
  moduleActions as djToplistPayActions,
} from '../../modules/dj_toplist_pay.ts';
import djToplistPopularModule, {
  decodeModuleInput as djToplistPopularInputDecoder,
  moduleActions as djToplistPopularActions,
} from '../../modules/dj_toplist_popular.ts';
import djRadioTopModule, {
  decodeModuleInput as djRadioTopInputDecoder,
  moduleActions as djRadioTopActions,
} from '../../modules/djRadio_top.ts';
import eventModule, {
  decodeModuleInput as eventInputDecoder,
  moduleActions as eventActions,
} from '../../modules/event.ts';
import eventDelModule, {
  decodeModuleInput as eventDelInputDecoder,
  moduleActions as eventDelActions,
} from '../../modules/event_del.ts';
import eventForwardModule, {
  decodeModuleInput as eventForwardInputDecoder,
  moduleActions as eventForwardActions,
} from '../../modules/event_forward.ts';
import fmTrashModule, {
  decodeModuleInput as fmTrashInputDecoder,
  moduleActions as fmTrashActions,
} from '../../modules/fm_trash.ts';
import followModule, {
  decodeModuleInput as followInputDecoder,
  moduleActions as followActions,
} from '../../modules/follow.ts';
import getUseridsModule, {
  decodeModuleInput as getUseridsInputDecoder,
  moduleActions as getUseridsActions,
} from '../../modules/get_userids.ts';
import historyRecommendSongsModule, {
  decodeModuleInput as historyRecommendSongsInputDecoder,
  moduleActions as historyRecommendSongsActions,
} from '../../modules/history_recommend_songs.ts';
import historyRecommendSongsDetailModule, {
  decodeModuleInput as historyRecommendSongsDetailInputDecoder,
  moduleActions as historyRecommendSongsDetailActions,
} from '../../modules/history_recommend_songs_detail.ts';
import homepageBlockPageModule, {
  decodeModuleInput as homepageBlockPageInputDecoder,
  moduleActions as homepageBlockPageActions,
} from '../../modules/homepage_block_page.ts';
import homepageDragonBallModule, {
  decodeModuleInput as homepageDragonBallInputDecoder,
  moduleActions as homepageDragonBallActions,
} from '../../modules/homepage_dragon_ball.ts';
import hotTopicModule, {
  decodeModuleInput as hotTopicInputDecoder,
  moduleActions as hotTopicActions,
} from '../../modules/hot_topic.ts';
import hugCommentModule, {
  decodeModuleInput as hugCommentInputDecoder,
  moduleActions as hugCommentActions,
} from '../../modules/hug_comment.ts';
import imageUploadTokenModule, {
  decodeModuleInput as imageUploadTokenInputDecoder,
} from '../../modules/image_upload_token.ts';
import innerVersionModule, {
  decodeModuleInput as innerVersionInputDecoder,
} from '../../modules/inner_version.ts';
import likeModule, {
  decodeModuleInput as likeInputDecoder,
  moduleActions as likeActions,
} from '../../modules/like.ts';
import likelistModule, {
  decodeModuleInput as likelistInputDecoder,
  moduleActions as likelistActions,
} from '../../modules/likelist.ts';
import listenDataRealtimeReportModule, {
  decodeModuleInput as listenDataRealtimeReportInputDecoder,
  moduleActions as listenDataRealtimeReportActions,
} from '../../modules/listen_data_realtime_report.ts';
import listenDataReportModule, {
  decodeModuleInput as listenDataReportInputDecoder,
  moduleActions as listenDataReportActions,
} from '../../modules/listen_data_report.ts';
import listenDataTodaySongModule, {
  decodeModuleInput as listenDataTodaySongInputDecoder,
  moduleActions as listenDataTodaySongActions,
} from '../../modules/listen_data_today_song.ts';
import listenDataTotalModule, {
  decodeModuleInput as listenDataTotalInputDecoder,
  moduleActions as listenDataTotalActions,
} from '../../modules/listen_data_total.ts';
import listenDataYearReportModule, {
  decodeModuleInput as listenDataYearReportInputDecoder,
  moduleActions as listenDataYearReportActions,
} from '../../modules/listen_data_year_report.ts';
import listentogetherAcceptModule, {
  decodeModuleInput as listentogetherAcceptInputDecoder,
  moduleActions as listentogetherAcceptActions,
} from '../../modules/listentogether_accept.ts';
import listentogetherEndModule, {
  decodeModuleInput as listentogetherEndInputDecoder,
  moduleActions as listentogetherEndActions,
} from '../../modules/listentogether_end.ts';
import listentogetherHeatbeatModule, {
  decodeModuleInput as listentogetherHeatbeatInputDecoder,
  moduleActions as listentogetherHeatbeatActions,
} from '../../modules/listentogether_heatbeat.ts';
import listentogetherPlayCommandModule, {
  decodeModuleInput as listentogetherPlayCommandInputDecoder,
  moduleActions as listentogetherPlayCommandActions,
} from '../../modules/listentogether_play_command.ts';
import listentogetherRoomCheckModule, {
  decodeModuleInput as listentogetherRoomCheckInputDecoder,
  moduleActions as listentogetherRoomCheckActions,
} from '../../modules/listentogether_room_check.ts';
import listentogetherRoomCreateModule, {
  decodeModuleInput as listentogetherRoomCreateInputDecoder,
  moduleActions as listentogetherRoomCreateActions,
} from '../../modules/listentogether_room_create.ts';
import listentogetherStatusModule, {
  decodeModuleInput as listentogetherStatusInputDecoder,
  moduleActions as listentogetherStatusActions,
} from '../../modules/listentogether_status.ts';
import listentogetherSyncListCommandModule, {
  decodeModuleInput as listentogetherSyncListCommandInputDecoder,
  moduleActions as listentogetherSyncListCommandActions,
} from '../../modules/listentogether_sync_list_command.ts';
import listentogetherSyncPlaylistGetModule, {
  decodeModuleInput as listentogetherSyncPlaylistGetInputDecoder,
  moduleActions as listentogetherSyncPlaylistGetActions,
} from '../../modules/listentogether_sync_playlist_get.ts';
import loginModule, {
  decodeModuleInput as loginInputDecoder,
  moduleActions as loginActions,
} from '../../modules/login.ts';
import loginCellphoneModule, {
  decodeModuleInput as loginCellphoneInputDecoder,
  moduleActions as loginCellphoneActions,
} from '../../modules/login_cellphone.ts';
import loginQrCheckModule, {
  decodeModuleInput as loginQrCheckInputDecoder,
  moduleActions as loginQrCheckActions,
} from '../../modules/login_qr_check.ts';
import loginQrCreateModule, {
  decodeModuleInput as loginQrCreateInputDecoder,
} from '../../modules/login_qr_create.ts';
import loginQrKeyModule, {
  decodeModuleInput as loginQrKeyInputDecoder,
  moduleActions as loginQrKeyActions,
} from '../../modules/login_qr_key.ts';
import loginRefreshModule, {
  decodeModuleInput as loginRefreshInputDecoder,
  moduleActions as loginRefreshActions,
} from '../../modules/login_refresh.ts';
import loginStatusModule, {
  decodeModuleInput as loginStatusInputDecoder,
  moduleActions as loginStatusActions,
} from '../../modules/login_status.ts';
import logoutModule, {
  decodeModuleInput as logoutInputDecoder,
  moduleActions as logoutActions,
} from '../../modules/logout.ts';
import lyricModule, {
  decodeModuleInput as lyricInputDecoder,
  moduleActions as lyricActions,
} from '../../modules/lyric.ts';
import lyricNewModule, {
  decodeModuleInput as lyricNewInputDecoder,
  moduleActions as lyricNewActions,
} from '../../modules/lyric_new.ts';
import mlogMusicRcmdModule, {
  decodeModuleInput as mlogMusicRcmdInputDecoder,
  moduleActions as mlogMusicRcmdActions,
} from '../../modules/mlog_music_rcmd.ts';
import mlogToVideoModule, {
  decodeModuleInput as mlogToVideoInputDecoder,
  moduleActions as mlogToVideoActions,
} from '../../modules/mlog_to_video.ts';
import mlogUrlModule, {
  decodeModuleInput as mlogUrlInputDecoder,
  moduleActions as mlogUrlActions,
} from '../../modules/mlog_url.ts';
import msgCommentsModule, {
  decodeModuleInput as msgCommentsInputDecoder,
  moduleActions as msgCommentsActions,
} from '../../modules/msg_comments.ts';
import msgForwardsModule, {
  decodeModuleInput as msgForwardsInputDecoder,
  moduleActions as msgForwardsActions,
} from '../../modules/msg_forwards.ts';
import msgNoticesModule, {
  decodeModuleInput as msgNoticesInputDecoder,
  moduleActions as msgNoticesActions,
} from '../../modules/msg_notices.ts';
import msgPrivateModule, {
  decodeModuleInput as msgPrivateInputDecoder,
  moduleActions as msgPrivateActions,
} from '../../modules/msg_private.ts';
import msgPrivateHistoryModule, {
  decodeModuleInput as msgPrivateHistoryInputDecoder,
  moduleActions as msgPrivateHistoryActions,
} from '../../modules/msg_private_history.ts';
import msgRecentcontactModule, {
  decodeModuleInput as msgRecentcontactInputDecoder,
  moduleActions as msgRecentcontactActions,
} from '../../modules/msg_recentcontact.ts';
import musicFirstListenInfoModule, {
  decodeModuleInput as musicFirstListenInfoInputDecoder,
  moduleActions as musicFirstListenInfoActions,
} from '../../modules/music_first_listen_info.ts';
import musicianCloudbeanModule, {
  decodeModuleInput as musicianCloudbeanInputDecoder,
  moduleActions as musicianCloudbeanActions,
} from '../../modules/musician_cloudbean.ts';
import musicianCloudbeanObtainModule, {
  decodeModuleInput as musicianCloudbeanObtainInputDecoder,
  moduleActions as musicianCloudbeanObtainActions,
} from '../../modules/musician_cloudbean_obtain.ts';
import musicianDataOverviewModule, {
  decodeModuleInput as musicianDataOverviewInputDecoder,
  moduleActions as musicianDataOverviewActions,
} from '../../modules/musician_data_overview.ts';
import musicianPlayTrendModule, {
  decodeModuleInput as musicianPlayTrendInputDecoder,
  moduleActions as musicianPlayTrendActions,
} from '../../modules/musician_play_trend.ts';
import musicianSignModule, {
  decodeModuleInput as musicianSignInputDecoder,
  moduleActions as musicianSignActions,
} from '../../modules/musician_sign.ts';
import musicianTasksModule, {
  decodeModuleInput as musicianTasksInputDecoder,
  moduleActions as musicianTasksActions,
} from '../../modules/musician_tasks.ts';
import musicianTasksNewModule, {
  decodeModuleInput as musicianTasksNewInputDecoder,
  moduleActions as musicianTasksNewActions,
} from '../../modules/musician_tasks_new.ts';
import mvAllModule, {
  decodeModuleInput as mvAllInputDecoder,
  moduleActions as mvAllActions,
} from '../../modules/mv_all.ts';
import mvDetailModule, {
  decodeModuleInput as mvDetailInputDecoder,
  moduleActions as mvDetailActions,
} from '../../modules/mv_detail.ts';
import mvDetailInfoModule, {
  decodeModuleInput as mvDetailInfoInputDecoder,
  moduleActions as mvDetailInfoActions,
} from '../../modules/mv_detail_info.ts';
import mvExclusiveRcmdModule, {
  decodeModuleInput as mvExclusiveRcmdInputDecoder,
  moduleActions as mvExclusiveRcmdActions,
} from '../../modules/mv_exclusive_rcmd.ts';
import mvFirstModule, {
  decodeModuleInput as mvFirstInputDecoder,
  moduleActions as mvFirstActions,
} from '../../modules/mv_first.ts';
import mvSubModule, {
  decodeModuleInput as mvSubInputDecoder,
  moduleActions as mvSubActions,
} from '../../modules/mv_sub.ts';
import mvSublistModule, {
  decodeModuleInput as mvSublistInputDecoder,
  moduleActions as mvSublistActions,
} from '../../modules/mv_sublist.ts';
import mvUrlModule, {
  decodeModuleInput as mvUrlInputDecoder,
  moduleActions as mvUrlActions,
} from '../../modules/mv_url.ts';
import nicknameCheckModule, {
  decodeModuleInput as nicknameCheckInputDecoder,
  moduleActions as nicknameCheckActions,
} from '../../modules/nickname_check.ts';
import personalFmModule, {
  decodeModuleInput as personalFmInputDecoder,
  moduleActions as personalFmActions,
} from '../../modules/personal_fm.ts';
import personalFmModeModule, {
  decodeModuleInput as personalFmModeInputDecoder,
  moduleActions as personalFmModeActions,
} from '../../modules/personal_fm_mode.ts';
import personalizedModule, {
  decodeModuleInput as personalizedInputDecoder,
  moduleActions as personalizedActions,
} from '../../modules/personalized.ts';
import personalizedDjprogramModule, {
  decodeModuleInput as personalizedDjprogramInputDecoder,
  moduleActions as personalizedDjprogramActions,
} from '../../modules/personalized_djprogram.ts';
import personalizedMvModule, {
  decodeModuleInput as personalizedMvInputDecoder,
  moduleActions as personalizedMvActions,
} from '../../modules/personalized_mv.ts';
import personalizedNewsongModule, {
  decodeModuleInput as personalizedNewsongInputDecoder,
  moduleActions as personalizedNewsongActions,
} from '../../modules/personalized_newsong.ts';
import personalizedPrivatecontentModule, {
  decodeModuleInput as personalizedPrivatecontentInputDecoder,
  moduleActions as personalizedPrivatecontentActions,
} from '../../modules/personalized_privatecontent.ts';
import personalizedPrivatecontentListModule, {
  decodeModuleInput as personalizedPrivatecontentListInputDecoder,
  moduleActions as personalizedPrivatecontentListActions,
} from '../../modules/personalized_privatecontent_list.ts';
import plCountModule, {
  decodeModuleInput as plCountInputDecoder,
  moduleActions as plCountActions,
} from '../../modules/pl_count.ts';
import playlistCatlistModule, {
  decodeModuleInput as playlistCatlistInputDecoder,
  moduleActions as playlistCatlistActions,
} from '../../modules/playlist_catlist.ts';
import playlistCoverUpdateModule, {
  decodeModuleInput as playlistCoverUpdateInputDecoder,
} from '../../modules/playlist_cover_update.ts';
import playlistCreateModule, {
  decodeModuleInput as playlistCreateInputDecoder,
  moduleActions as playlistCreateActions,
} from '../../modules/playlist_create.ts';
import playlistDeleteModule, {
  decodeModuleInput as playlistDeleteInputDecoder,
  moduleActions as playlistDeleteActions,
} from '../../modules/playlist_delete.ts';
import playlistDescUpdateModule, {
  decodeModuleInput as playlistDescUpdateInputDecoder,
  moduleActions as playlistDescUpdateActions,
} from '../../modules/playlist_desc_update.ts';
import playlistDetailModule, {
  decodeModuleInput as playlistDetailInputDecoder,
  moduleActions as playlistDetailActions,
} from '../../modules/playlist_detail.ts';
import playlistDetailDynamicModule, {
  decodeModuleInput as playlistDetailDynamicInputDecoder,
  moduleActions as playlistDetailDynamicActions,
} from '../../modules/playlist_detail_dynamic.ts';
import playlistDetailRcmdGetModule, {
  decodeModuleInput as playlistDetailRcmdGetInputDecoder,
  moduleActions as playlistDetailRcmdGetActions,
} from '../../modules/playlist_detail_rcmd_get.ts';
import playlistHighqualityTagsModule, {
  decodeModuleInput as playlistHighqualityTagsInputDecoder,
  moduleActions as playlistHighqualityTagsActions,
} from '../../modules/playlist_highquality_tags.ts';
import playlistHotModule, {
  decodeModuleInput as playlistHotInputDecoder,
  moduleActions as playlistHotActions,
} from '../../modules/playlist_hot.ts';
import playlistImportNameTaskCreateModule, {
  decodeModuleInput as playlistImportNameTaskCreateInputDecoder,
  moduleActions as playlistImportNameTaskCreateActions,
} from '../../modules/playlist_import_name_task_create.ts';
import playlistImportTaskStatusModule, {
  decodeModuleInput as playlistImportTaskStatusInputDecoder,
  moduleActions as playlistImportTaskStatusActions,
} from '../../modules/playlist_import_task_status.ts';
import playlistMylikeModule, {
  decodeModuleInput as playlistMylikeInputDecoder,
  moduleActions as playlistMylikeActions,
} from '../../modules/playlist_mylike.ts';
import playlistNameUpdateModule, {
  decodeModuleInput as playlistNameUpdateInputDecoder,
  moduleActions as playlistNameUpdateActions,
} from '../../modules/playlist_name_update.ts';
import playlistOrderUpdateModule, {
  decodeModuleInput as playlistOrderUpdateInputDecoder,
  moduleActions as playlistOrderUpdateActions,
} from '../../modules/playlist_order_update.ts';
import playlistPrivacyModule, {
  decodeModuleInput as playlistPrivacyInputDecoder,
  moduleActions as playlistPrivacyActions,
} from '../../modules/playlist_privacy.ts';
import playlistSubscribeModule, {
  decodeModuleInput as playlistSubscribeInputDecoder,
  moduleActions as playlistSubscribeActions,
} from '../../modules/playlist_subscribe.ts';
import playlistSubscribersModule, {
  decodeModuleInput as playlistSubscribersInputDecoder,
  moduleActions as playlistSubscribersActions,
} from '../../modules/playlist_subscribers.ts';
import playlistTagsUpdateModule, {
  decodeModuleInput as playlistTagsUpdateInputDecoder,
  moduleActions as playlistTagsUpdateActions,
} from '../../modules/playlist_tags_update.ts';
import playlistTrackAddModule, {
  decodeModuleInput as playlistTrackAddInputDecoder,
  moduleActions as playlistTrackAddActions,
} from '../../modules/playlist_track_add.ts';
import playlistTrackAllModule, {
  decodeModuleInput as playlistTrackAllInputDecoder,
} from '../../modules/playlist_track_all.ts';
import playlistTrackDeleteModule, {
  decodeModuleInput as playlistTrackDeleteInputDecoder,
  moduleActions as playlistTrackDeleteActions,
} from '../../modules/playlist_track_delete.ts';
import playlistTracksModule, {
  decodeModuleInput as playlistTracksInputDecoder,
} from '../../modules/playlist_tracks.ts';
import playlistUpdateModule, {
  decodeModuleInput as playlistUpdateInputDecoder,
  moduleActions as playlistUpdateActions,
} from '../../modules/playlist_update.ts';
import playlistUpdatePlaycountModule, {
  decodeModuleInput as playlistUpdatePlaycountInputDecoder,
  moduleActions as playlistUpdatePlaycountActions,
} from '../../modules/playlist_update_playcount.ts';
import playlistVideoRecentModule, {
  decodeModuleInput as playlistVideoRecentInputDecoder,
  moduleActions as playlistVideoRecentActions,
} from '../../modules/playlist_video_recent.ts';
import playmodeIntelligenceListModule, {
  decodeModuleInput as playmodeIntelligenceListInputDecoder,
  moduleActions as playmodeIntelligenceListActions,
} from '../../modules/playmode_intelligence_list.ts';
import programRecommendModule, {
  decodeModuleInput as programRecommendInputDecoder,
  moduleActions as programRecommendActions,
} from '../../modules/program_recommend.ts';
import rebindModule, {
  decodeModuleInput as rebindInputDecoder,
  moduleActions as rebindActions,
} from '../../modules/rebind.ts';
import recentListenListModule, {
  decodeModuleInput as recentListenListInputDecoder,
  moduleActions as recentListenListActions,
} from '../../modules/recent_listen_list.ts';
import recommendResourceModule, {
  decodeModuleInput as recommendResourceInputDecoder,
  moduleActions as recommendResourceActions,
} from '../../modules/recommend_resource.ts';
import recommendSongsModule, {
  decodeModuleInput as recommendSongsInputDecoder,
  moduleActions as recommendSongsActions,
} from '../../modules/recommend_songs.ts';
import recommendSongsDislikeModule, {
  decodeModuleInput as recommendSongsDislikeInputDecoder,
  moduleActions as recommendSongsDislikeActions,
} from '../../modules/recommend_songs_dislike.ts';
import recordRecentAlbumModule, {
  decodeModuleInput as recordRecentAlbumInputDecoder,
  moduleActions as recordRecentAlbumActions,
} from '../../modules/record_recent_album.ts';
import recordRecentDjModule, {
  decodeModuleInput as recordRecentDjInputDecoder,
  moduleActions as recordRecentDjActions,
} from '../../modules/record_recent_dj.ts';
import recordRecentPlaylistModule, {
  decodeModuleInput as recordRecentPlaylistInputDecoder,
  moduleActions as recordRecentPlaylistActions,
} from '../../modules/record_recent_playlist.ts';
import recordRecentSongModule, {
  decodeModuleInput as recordRecentSongInputDecoder,
  moduleActions as recordRecentSongActions,
} from '../../modules/record_recent_song.ts';
import recordRecentVideoModule, {
  decodeModuleInput as recordRecentVideoInputDecoder,
  moduleActions as recordRecentVideoActions,
} from '../../modules/record_recent_video.ts';
import recordRecentVoiceModule, {
  decodeModuleInput as recordRecentVoiceInputDecoder,
  moduleActions as recordRecentVoiceActions,
} from '../../modules/record_recent_voice.ts';
import registerAnonimousModule, {
  decodeModuleInput as registerAnonimousInputDecoder,
  moduleActions as registerAnonimousActions,
} from '../../modules/register_anonimous.ts';
import registerCellphoneModule, {
  decodeModuleInput as registerCellphoneInputDecoder,
  moduleActions as registerCellphoneActions,
} from '../../modules/register_cellphone.ts';
import relatedAllvideoModule, {
  decodeModuleInput as relatedAllvideoInputDecoder,
  moduleActions as relatedAllvideoActions,
} from '../../modules/related_allvideo.ts';
import relatedPlaylistModule, {
  decodeModuleInput as relatedPlaylistInputDecoder,
} from '../../modules/related_playlist.ts';
import resourceLikeModule, {
  decodeModuleInput as resourceLikeInputDecoder,
  moduleActions as resourceLikeActions,
} from '../../modules/resource_like.ts';
import scrobbleModule, {
  decodeModuleInput as scrobbleInputDecoder,
} from '../../modules/scrobble.ts';
import searchModule, {
  decodeModuleInput as searchInputDecoder,
  moduleActions as searchActions,
} from '../../modules/search.ts';
import searchDefaultModule, {
  decodeModuleInput as searchDefaultInputDecoder,
  moduleActions as searchDefaultActions,
} from '../../modules/search_default.ts';
import searchHotModule, {
  decodeModuleInput as searchHotInputDecoder,
  moduleActions as searchHotActions,
} from '../../modules/search_hot.ts';
import searchHotDetailModule, {
  decodeModuleInput as searchHotDetailInputDecoder,
  moduleActions as searchHotDetailActions,
} from '../../modules/search_hot_detail.ts';
import searchMatchModule, {
  decodeModuleInput as searchMatchInputDecoder,
  moduleActions as searchMatchActions,
} from '../../modules/search_match.ts';
import searchMultimatchModule, {
  decodeModuleInput as searchMultimatchInputDecoder,
  moduleActions as searchMultimatchActions,
} from '../../modules/search_multimatch.ts';
import searchSuggestModule, {
  decodeModuleInput as searchSuggestInputDecoder,
  moduleActions as searchSuggestActions,
} from '../../modules/search_suggest.ts';
import sendAlbumModule, {
  decodeModuleInput as sendAlbumInputDecoder,
  moduleActions as sendAlbumActions,
} from '../../modules/send_album.ts';
import sendPlaylistModule, {
  decodeModuleInput as sendPlaylistInputDecoder,
  moduleActions as sendPlaylistActions,
} from '../../modules/send_playlist.ts';
import sendSongModule, {
  decodeModuleInput as sendSongInputDecoder,
  moduleActions as sendSongActions,
} from '../../modules/send_song.ts';
import sendTextModule, {
  decodeModuleInput as sendTextInputDecoder,
  moduleActions as sendTextActions,
} from '../../modules/send_text.ts';
import settingModule, {
  decodeModuleInput as settingInputDecoder,
  moduleActions as settingActions,
} from '../../modules/setting.ts';
import shareResourceModule, {
  decodeModuleInput as shareResourceInputDecoder,
  moduleActions as shareResourceActions,
} from '../../modules/share_resource.ts';
import sheetListModule, {
  decodeModuleInput as sheetListInputDecoder,
  moduleActions as sheetListActions,
} from '../../modules/sheet_list.ts';
import sheetPreviewModule, {
  decodeModuleInput as sheetPreviewInputDecoder,
  moduleActions as sheetPreviewActions,
} from '../../modules/sheet_preview.ts';
import signHappyInfoModule, {
  decodeModuleInput as signHappyInfoInputDecoder,
  moduleActions as signHappyInfoActions,
} from '../../modules/sign_happy_info.ts';
import signinProgressModule, {
  decodeModuleInput as signinProgressInputDecoder,
  moduleActions as signinProgressActions,
} from '../../modules/signin_progress.ts';
import simiArtistModule, {
  decodeModuleInput as simiArtistInputDecoder,
  moduleActions as simiArtistActions,
} from '../../modules/simi_artist.ts';
import simiMvModule, {
  decodeModuleInput as simiMvInputDecoder,
  moduleActions as simiMvActions,
} from '../../modules/simi_mv.ts';
import simiPlaylistModule, {
  decodeModuleInput as simiPlaylistInputDecoder,
  moduleActions as simiPlaylistActions,
} from '../../modules/simi_playlist.ts';
import simiSongModule, {
  decodeModuleInput as simiSongInputDecoder,
  moduleActions as simiSongActions,
} from '../../modules/simi_song.ts';
import simiUserModule, {
  decodeModuleInput as simiUserInputDecoder,
  moduleActions as simiUserActions,
} from '../../modules/simi_user.ts';
import songChorusModule, {
  decodeModuleInput as songChorusInputDecoder,
  moduleActions as songChorusActions,
} from '../../modules/song_chorus.ts';
import songDetailModule, {
  decodeModuleInput as songDetailInputDecoder,
  moduleActions as songDetailActions,
} from '../../modules/song_detail.ts';
import songDownlistModule, {
  decodeModuleInput as songDownlistInputDecoder,
  moduleActions as songDownlistActions,
} from '../../modules/song_downlist.ts';
import songDownloadUrlModule, {
  decodeModuleInput as songDownloadUrlInputDecoder,
  moduleActions as songDownloadUrlActions,
} from '../../modules/song_download_url.ts';
import songDownloadUrlV1Module, {
  decodeModuleInput as songDownloadUrlV1InputDecoder,
  moduleActions as songDownloadUrlV1Actions,
} from '../../modules/song_download_url_v1.ts';
import songDynamicCoverModule, {
  decodeModuleInput as songDynamicCoverInputDecoder,
  moduleActions as songDynamicCoverActions,
} from '../../modules/song_dynamic_cover.ts';
import songLikeCheckModule, {
  decodeModuleInput as songLikeCheckInputDecoder,
  moduleActions as songLikeCheckActions,
} from '../../modules/song_like_check.ts';
import songLyricsMarkModule, {
  decodeModuleInput as songLyricsMarkInputDecoder,
  moduleActions as songLyricsMarkActions,
} from '../../modules/song_lyrics_mark.ts';
import songLyricsMarkAddModule, {
  decodeModuleInput as songLyricsMarkAddInputDecoder,
  moduleActions as songLyricsMarkAddActions,
} from '../../modules/song_lyrics_mark_add.ts';
import songLyricsMarkDelModule, {
  decodeModuleInput as songLyricsMarkDelInputDecoder,
  moduleActions as songLyricsMarkDelActions,
} from '../../modules/song_lyrics_mark_del.ts';
import songLyricsMarkUserPageModule, {
  decodeModuleInput as songLyricsMarkUserPageInputDecoder,
  moduleActions as songLyricsMarkUserPageActions,
} from '../../modules/song_lyrics_mark_user_page.ts';
import songMonthdownlistModule, {
  decodeModuleInput as songMonthdownlistInputDecoder,
  moduleActions as songMonthdownlistActions,
} from '../../modules/song_monthdownlist.ts';
import songMusicDetailModule, {
  decodeModuleInput as songMusicDetailInputDecoder,
  moduleActions as songMusicDetailActions,
} from '../../modules/song_music_detail.ts';
import songOrderUpdateModule, {
  decodeModuleInput as songOrderUpdateInputDecoder,
  moduleActions as songOrderUpdateActions,
} from '../../modules/song_order_update.ts';
import songPurchasedModule, {
  decodeModuleInput as songPurchasedInputDecoder,
  moduleActions as songPurchasedActions,
} from '../../modules/song_purchased.ts';
import songRedCountModule, {
  decodeModuleInput as songRedCountInputDecoder,
  moduleActions as songRedCountActions,
} from '../../modules/song_red_count.ts';
import songSingledownlistModule, {
  decodeModuleInput as songSingledownlistInputDecoder,
  moduleActions as songSingledownlistActions,
} from '../../modules/song_singledownlist.ts';
import songUrlModule, {
  decodeModuleInput as songUrlInputDecoder,
  moduleActions as songUrlActions,
} from '../../modules/song_url.ts';
import songUrlV1Module, {
  decodeModuleInput as songUrlV1InputDecoder,
  moduleActions as songUrlV1Actions,
} from '../../modules/song_url_v1.ts';
import songWikiSummaryModule, {
  decodeModuleInput as songWikiSummaryInputDecoder,
  moduleActions as songWikiSummaryActions,
} from '../../modules/song_wiki_summary.ts';
import starpickCommentsSummaryModule, {
  decodeModuleInput as starpickCommentsSummaryInputDecoder,
  moduleActions as starpickCommentsSummaryActions,
} from '../../modules/starpick_comments_summary.ts';
import styleAlbumModule, {
  decodeModuleInput as styleAlbumInputDecoder,
  moduleActions as styleAlbumActions,
} from '../../modules/style_album.ts';
import styleArtistModule, {
  decodeModuleInput as styleArtistInputDecoder,
  moduleActions as styleArtistActions,
} from '../../modules/style_artist.ts';
import styleDetailModule, {
  decodeModuleInput as styleDetailInputDecoder,
  moduleActions as styleDetailActions,
} from '../../modules/style_detail.ts';
import styleListModule, {
  decodeModuleInput as styleListInputDecoder,
  moduleActions as styleListActions,
} from '../../modules/style_list.ts';
import stylePlaylistModule, {
  decodeModuleInput as stylePlaylistInputDecoder,
  moduleActions as stylePlaylistActions,
} from '../../modules/style_playlist.ts';
import stylePreferenceModule, {
  decodeModuleInput as stylePreferenceInputDecoder,
  moduleActions as stylePreferenceActions,
} from '../../modules/style_preference.ts';
import styleSongModule, {
  decodeModuleInput as styleSongInputDecoder,
  moduleActions as styleSongActions,
} from '../../modules/style_song.ts';
import summaryAnnualModule, {
  decodeModuleInput as summaryAnnualInputDecoder,
  moduleActions as summaryAnnualActions,
} from '../../modules/summary_annual.ts';
import topAlbumModule, {
  decodeModuleInput as topAlbumInputDecoder,
  moduleActions as topAlbumActions,
} from '../../modules/top_album.ts';
import topArtistsModule, {
  decodeModuleInput as topArtistsInputDecoder,
  moduleActions as topArtistsActions,
} from '../../modules/top_artists.ts';
import topListModule, {
  decodeModuleInput as topListInputDecoder,
  moduleActions as topListActions,
} from '../../modules/top_list.ts';
import topMvModule, {
  decodeModuleInput as topMvInputDecoder,
  moduleActions as topMvActions,
} from '../../modules/top_mv.ts';
import topPlaylistModule, {
  decodeModuleInput as topPlaylistInputDecoder,
  moduleActions as topPlaylistActions,
} from '../../modules/top_playlist.ts';
import topPlaylistHighqualityModule, {
  decodeModuleInput as topPlaylistHighqualityInputDecoder,
  moduleActions as topPlaylistHighqualityActions,
} from '../../modules/top_playlist_highquality.ts';
import topSongModule, {
  decodeModuleInput as topSongInputDecoder,
  moduleActions as topSongActions,
} from '../../modules/top_song.ts';
import topicDetailModule, {
  decodeModuleInput as topicDetailInputDecoder,
  moduleActions as topicDetailActions,
} from '../../modules/topic_detail.ts';
import topicDetailEventHotModule, {
  decodeModuleInput as topicDetailEventHotInputDecoder,
  moduleActions as topicDetailEventHotActions,
} from '../../modules/topic_detail_event_hot.ts';
import topicSublistModule, {
  decodeModuleInput as topicSublistInputDecoder,
  moduleActions as topicSublistActions,
} from '../../modules/topic_sublist.ts';
import toplistModule, {
  decodeModuleInput as toplistInputDecoder,
  moduleActions as toplistActions,
} from '../../modules/toplist.ts';
import toplistArtistModule, {
  decodeModuleInput as toplistArtistInputDecoder,
  moduleActions as toplistArtistActions,
} from '../../modules/toplist_artist.ts';
import toplistDetailModule, {
  decodeModuleInput as toplistDetailInputDecoder,
  moduleActions as toplistDetailActions,
} from '../../modules/toplist_detail.ts';
import ugcAlbumGetModule, {
  decodeModuleInput as ugcAlbumGetInputDecoder,
  moduleActions as ugcAlbumGetActions,
} from '../../modules/ugc_album_get.ts';
import ugcArtistGetModule, {
  decodeModuleInput as ugcArtistGetInputDecoder,
  moduleActions as ugcArtistGetActions,
} from '../../modules/ugc_artist_get.ts';
import ugcArtistSearchModule, {
  decodeModuleInput as ugcArtistSearchInputDecoder,
  moduleActions as ugcArtistSearchActions,
} from '../../modules/ugc_artist_search.ts';
import ugcDetailModule, {
  decodeModuleInput as ugcDetailInputDecoder,
  moduleActions as ugcDetailActions,
} from '../../modules/ugc_detail.ts';
import ugcMvGetModule, {
  decodeModuleInput as ugcMvGetInputDecoder,
  moduleActions as ugcMvGetActions,
} from '../../modules/ugc_mv_get.ts';
import ugcSongGetModule, {
  decodeModuleInput as ugcSongGetInputDecoder,
  moduleActions as ugcSongGetActions,
} from '../../modules/ugc_song_get.ts';
import ugcUserDevoteModule, {
  decodeModuleInput as ugcUserDevoteInputDecoder,
  moduleActions as ugcUserDevoteActions,
} from '../../modules/ugc_user_devote.ts';
import userAccountModule, {
  decodeModuleInput as userAccountInputDecoder,
  moduleActions as userAccountActions,
} from '../../modules/user_account.ts';
import userAudioModule, {
  decodeModuleInput as userAudioInputDecoder,
  moduleActions as userAudioActions,
} from '../../modules/user_audio.ts';
import userBindingModule, {
  decodeModuleInput as userBindingInputDecoder,
  moduleActions as userBindingActions,
} from '../../modules/user_binding.ts';
import userCloudModule, {
  decodeModuleInput as userCloudInputDecoder,
  moduleActions as userCloudActions,
} from '../../modules/user_cloud.ts';
import userCloudDelModule, {
  decodeModuleInput as userCloudDelInputDecoder,
  moduleActions as userCloudDelActions,
} from '../../modules/user_cloud_del.ts';
import userCloudDetailModule, {
  decodeModuleInput as userCloudDetailInputDecoder,
  moduleActions as userCloudDetailActions,
} from '../../modules/user_cloud_detail.ts';
import userCommentHistoryModule, {
  decodeModuleInput as userCommentHistoryInputDecoder,
  moduleActions as userCommentHistoryActions,
} from '../../modules/user_comment_history.ts';
import userDetailModule, {
  decodeModuleInput as userDetailInputDecoder,
  moduleActions as userDetailActions,
} from '../../modules/user_detail.ts';
import userDjModule, {
  decodeModuleInput as userDjInputDecoder,
  moduleActions as userDjActions,
} from '../../modules/user_dj.ts';
import userEventModule, {
  decodeModuleInput as userEventInputDecoder,
  moduleActions as userEventActions,
} from '../../modules/user_event.ts';
import userFollowMixedModule, {
  decodeModuleInput as userFollowMixedInputDecoder,
  moduleActions as userFollowMixedActions,
} from '../../modules/user_follow_mixed.ts';
import userFollowedsModule, {
  decodeModuleInput as userFollowedsInputDecoder,
  moduleActions as userFollowedsActions,
} from '../../modules/user_followeds.ts';
import userFollowsModule, {
  decodeModuleInput as userFollowsInputDecoder,
  moduleActions as userFollowsActions,
} from '../../modules/user_follows.ts';
import userLevelModule, {
  decodeModuleInput as userLevelInputDecoder,
  moduleActions as userLevelActions,
} from '../../modules/user_level.ts';
import userMedalModule, {
  decodeModuleInput as userMedalInputDecoder,
  moduleActions as userMedalActions,
} from '../../modules/user_medal.ts';
import userMutualfollowGetModule, {
  decodeModuleInput as userMutualfollowGetInputDecoder,
  moduleActions as userMutualfollowGetActions,
} from '../../modules/user_mutualfollow_get.ts';
import userPlaylistModule, {
  decodeModuleInput as userPlaylistInputDecoder,
  moduleActions as userPlaylistActions,
} from '../../modules/user_playlist.ts';
import userPlaylistCollectModule, {
  decodeModuleInput as userPlaylistCollectInputDecoder,
  moduleActions as userPlaylistCollectActions,
} from '../../modules/user_playlist_collect.ts';
import userPlaylistCreateModule, {
  decodeModuleInput as userPlaylistCreateInputDecoder,
  moduleActions as userPlaylistCreateActions,
} from '../../modules/user_playlist_create.ts';
import userRecordModule, {
  decodeModuleInput as userRecordInputDecoder,
  moduleActions as userRecordActions,
} from '../../modules/user_record.ts';
import userReplacephoneModule, {
  decodeModuleInput as userReplacephoneInputDecoder,
  moduleActions as userReplacephoneActions,
} from '../../modules/user_replacephone.ts';
import userSocialStatusModule, {
  decodeModuleInput as userSocialStatusInputDecoder,
  moduleActions as userSocialStatusActions,
} from '../../modules/user_social_status.ts';
import userSocialStatusEditModule, {
  decodeModuleInput as userSocialStatusEditInputDecoder,
  moduleActions as userSocialStatusEditActions,
} from '../../modules/user_social_status_edit.ts';
import userSocialStatusRcmdModule, {
  decodeModuleInput as userSocialStatusRcmdInputDecoder,
  moduleActions as userSocialStatusRcmdActions,
} from '../../modules/user_social_status_rcmd.ts';
import userSocialStatusSupportModule, {
  decodeModuleInput as userSocialStatusSupportInputDecoder,
  moduleActions as userSocialStatusSupportActions,
} from '../../modules/user_social_status_support.ts';
import userSubcountModule, {
  decodeModuleInput as userSubcountInputDecoder,
  moduleActions as userSubcountActions,
} from '../../modules/user_subcount.ts';
import userUpdateModule, {
  decodeModuleInput as userUpdateInputDecoder,
  moduleActions as userUpdateActions,
} from '../../modules/user_update.ts';
import verifyGetQrModule, {
  decodeModuleInput as verifyGetQrInputDecoder,
  moduleActions as verifyGetQrActions,
} from '../../modules/verify_getQr.ts';
import verifyQrcodestatusModule, {
  decodeModuleInput as verifyQrcodestatusInputDecoder,
  moduleActions as verifyQrcodestatusActions,
} from '../../modules/verify_qrcodestatus.ts';
import videoCategoryListModule, {
  decodeModuleInput as videoCategoryListInputDecoder,
  moduleActions as videoCategoryListActions,
} from '../../modules/video_category_list.ts';
import videoDetailModule, {
  decodeModuleInput as videoDetailInputDecoder,
  moduleActions as videoDetailActions,
} from '../../modules/video_detail.ts';
import videoDetailInfoModule, {
  decodeModuleInput as videoDetailInfoInputDecoder,
  moduleActions as videoDetailInfoActions,
} from '../../modules/video_detail_info.ts';
import videoGroupModule, {
  decodeModuleInput as videoGroupInputDecoder,
  moduleActions as videoGroupActions,
} from '../../modules/video_group.ts';
import videoGroupListModule, {
  decodeModuleInput as videoGroupListInputDecoder,
  moduleActions as videoGroupListActions,
} from '../../modules/video_group_list.ts';
import videoSubModule, {
  decodeModuleInput as videoSubInputDecoder,
  moduleActions as videoSubActions,
} from '../../modules/video_sub.ts';
import videoTimelineAllModule, {
  decodeModuleInput as videoTimelineAllInputDecoder,
  moduleActions as videoTimelineAllActions,
} from '../../modules/video_timeline_all.ts';
import videoTimelineRecommendModule, {
  decodeModuleInput as videoTimelineRecommendInputDecoder,
  moduleActions as videoTimelineRecommendActions,
} from '../../modules/video_timeline_recommend.ts';
import videoUrlModule, {
  decodeModuleInput as videoUrlInputDecoder,
  moduleActions as videoUrlActions,
} from '../../modules/video_url.ts';
import vipGrowthpointModule, {
  decodeModuleInput as vipGrowthpointInputDecoder,
  moduleActions as vipGrowthpointActions,
} from '../../modules/vip_growthpoint.ts';
import vipGrowthpointDetailsModule, {
  decodeModuleInput as vipGrowthpointDetailsInputDecoder,
  moduleActions as vipGrowthpointDetailsActions,
} from '../../modules/vip_growthpoint_details.ts';
import vipGrowthpointGetModule, {
  decodeModuleInput as vipGrowthpointGetInputDecoder,
  moduleActions as vipGrowthpointGetActions,
} from '../../modules/vip_growthpoint_get.ts';
import vipInfoModule, {
  decodeModuleInput as vipInfoInputDecoder,
  moduleActions as vipInfoActions,
} from '../../modules/vip_info.ts';
import vipInfoV2Module, {
  decodeModuleInput as vipInfoV2InputDecoder,
  moduleActions as vipInfoV2Actions,
} from '../../modules/vip_info_v2.ts';
import vipTasksModule, {
  decodeModuleInput as vipTasksInputDecoder,
  moduleActions as vipTasksActions,
} from '../../modules/vip_tasks.ts';
import vipTimemachineModule, {
  decodeModuleInput as vipTimemachineInputDecoder,
  moduleActions as vipTimemachineActions,
} from '../../modules/vip_timemachine.ts';
import voiceDeleteModule, {
  decodeModuleInput as voiceDeleteInputDecoder,
  moduleActions as voiceDeleteActions,
} from '../../modules/voice_delete.ts';
import voiceDetailModule, {
  decodeModuleInput as voiceDetailInputDecoder,
  moduleActions as voiceDetailActions,
} from '../../modules/voice_detail.ts';
import voiceLyricModule, {
  decodeModuleInput as voiceLyricInputDecoder,
  moduleActions as voiceLyricActions,
} from '../../modules/voice_lyric.ts';
import voiceUploadModule, {
  decodeModuleInput as voiceUploadInputDecoder,
} from '../../modules/voice_upload.ts';
import voicelistDetailModule, {
  decodeModuleInput as voicelistDetailInputDecoder,
  moduleActions as voicelistDetailActions,
} from '../../modules/voicelist_detail.ts';
import voicelistListModule, {
  decodeModuleInput as voicelistListInputDecoder,
  moduleActions as voicelistListActions,
} from '../../modules/voicelist_list.ts';
import voicelistListSearchModule, {
  decodeModuleInput as voicelistListSearchInputDecoder,
  moduleActions as voicelistListSearchActions,
} from '../../modules/voicelist_list_search.ts';
import voicelistSearchModule, {
  decodeModuleInput as voicelistSearchInputDecoder,
  moduleActions as voicelistSearchActions,
} from '../../modules/voicelist_search.ts';
import voicelistTransModule, {
  decodeModuleInput as voicelistTransInputDecoder,
  moduleActions as voicelistTransActions,
} from '../../modules/voicelist_trans.ts';
import yunbeiModule, {
  decodeModuleInput as yunbeiInputDecoder,
  moduleActions as yunbeiActions,
} from '../../modules/yunbei.ts';
import yunbeiExpenseModule, {
  decodeModuleInput as yunbeiExpenseInputDecoder,
  moduleActions as yunbeiExpenseActions,
} from '../../modules/yunbei_expense.ts';
import yunbeiInfoModule, {
  decodeModuleInput as yunbeiInfoInputDecoder,
  moduleActions as yunbeiInfoActions,
} from '../../modules/yunbei_info.ts';
import yunbeiRcmdSongModule, {
  decodeModuleInput as yunbeiRcmdSongInputDecoder,
  moduleActions as yunbeiRcmdSongActions,
} from '../../modules/yunbei_rcmd_song.ts';
import yunbeiRcmdSongHistoryModule, {
  decodeModuleInput as yunbeiRcmdSongHistoryInputDecoder,
  moduleActions as yunbeiRcmdSongHistoryActions,
} from '../../modules/yunbei_rcmd_song_history.ts';
import yunbeiReceiptModule, {
  decodeModuleInput as yunbeiReceiptInputDecoder,
  moduleActions as yunbeiReceiptActions,
} from '../../modules/yunbei_receipt.ts';
import yunbeiSignModule, {
  decodeModuleInput as yunbeiSignInputDecoder,
  moduleActions as yunbeiSignActions,
} from '../../modules/yunbei_sign.ts';
import yunbeiTaskFinishModule, {
  decodeModuleInput as yunbeiTaskFinishInputDecoder,
  moduleActions as yunbeiTaskFinishActions,
} from '../../modules/yunbei_task_finish.ts';
import yunbeiTasksModule, {
  decodeModuleInput as yunbeiTasksInputDecoder,
  moduleActions as yunbeiTasksActions,
} from '../../modules/yunbei_tasks.ts';
import yunbeiTasksTodoModule, {
  decodeModuleInput as yunbeiTasksTodoInputDecoder,
  moduleActions as yunbeiTasksTodoActions,
} from '../../modules/yunbei_tasks_todo.ts';
import yunbeiTodayModule, {
  decodeModuleInput as yunbeiTodayInputDecoder,
  moduleActions as yunbeiTodayActions,
} from '../../modules/yunbei_today.ts';
import type { SdkModuleRegistry } from '../../types/index.ts';

export const sdkModuleRegistry: SdkModuleRegistry = {
  activate_init_profile: {
    identifier: 'activate_init_profile',
    route: '/activate/init/profile',
    execute: activateInitProfileModule,
    decodeInput: activateInitProfileInputDecoder,
    actions: activateInitProfileActions,
  },
  aidj_content_rcmd: {
    identifier: 'aidj_content_rcmd',
    route: '/aidj/content/rcmd',
    execute: aidjContentRcmdModule,
    decodeInput: aidjContentRcmdInputDecoder,
    actions: aidjContentRcmdActions,
  },
  album: {
    identifier: 'album',
    route: '/album',
    execute: albumModule,
    decodeInput: albumInputDecoder,
    actions: albumActions,
  },
  album_detail: {
    identifier: 'album_detail',
    route: '/album/detail',
    execute: albumDetailModule,
    decodeInput: albumDetailInputDecoder,
    actions: albumDetailActions,
  },
  album_detail_dynamic: {
    identifier: 'album_detail_dynamic',
    route: '/album/detail/dynamic',
    execute: albumDetailDynamicModule,
    decodeInput: albumDetailDynamicInputDecoder,
    actions: albumDetailDynamicActions,
  },
  album_list: {
    identifier: 'album_list',
    route: '/album/list',
    execute: albumListModule,
    decodeInput: albumListInputDecoder,
    actions: albumListActions,
  },
  album_list_style: {
    identifier: 'album_list_style',
    route: '/album/list/style',
    execute: albumListStyleModule,
    decodeInput: albumListStyleInputDecoder,
    actions: albumListStyleActions,
  },
  album_new: {
    identifier: 'album_new',
    route: '/album/new',
    execute: albumNewModule,
    decodeInput: albumNewInputDecoder,
    actions: albumNewActions,
  },
  album_newest: {
    identifier: 'album_newest',
    route: '/album/newest',
    execute: albumNewestModule,
    decodeInput: albumNewestInputDecoder,
    actions: albumNewestActions,
  },
  album_privilege: {
    identifier: 'album_privilege',
    route: '/album/privilege',
    execute: albumPrivilegeModule,
    decodeInput: albumPrivilegeInputDecoder,
    actions: albumPrivilegeActions,
  },
  album_songsaleboard: {
    identifier: 'album_songsaleboard',
    route: '/album/songsaleboard',
    execute: albumSongsaleboardModule,
    decodeInput: albumSongsaleboardInputDecoder,
    actions: albumSongsaleboardActions,
  },
  album_sub: {
    identifier: 'album_sub',
    route: '/album/sub',
    execute: albumSubModule,
    decodeInput: albumSubInputDecoder,
    actions: albumSubActions,
  },
  album_sublist: {
    identifier: 'album_sublist',
    route: '/album/sublist',
    execute: albumSublistModule,
    decodeInput: albumSublistInputDecoder,
    actions: albumSublistActions,
  },
  artist_album: {
    identifier: 'artist_album',
    route: '/artist/album',
    execute: artistAlbumModule,
    decodeInput: artistAlbumInputDecoder,
    actions: artistAlbumActions,
  },
  artist_desc: {
    identifier: 'artist_desc',
    route: '/artist/desc',
    execute: artistDescModule,
    decodeInput: artistDescInputDecoder,
    actions: artistDescActions,
  },
  artist_detail: {
    identifier: 'artist_detail',
    route: '/artist/detail',
    execute: artistDetailModule,
    decodeInput: artistDetailInputDecoder,
    actions: artistDetailActions,
  },
  artist_detail_dynamic: {
    identifier: 'artist_detail_dynamic',
    route: '/artist/detail/dynamic',
    execute: artistDetailDynamicModule,
    decodeInput: artistDetailDynamicInputDecoder,
    actions: artistDetailDynamicActions,
  },
  artist_fans: {
    identifier: 'artist_fans',
    route: '/artist/fans',
    execute: artistFansModule,
    decodeInput: artistFansInputDecoder,
    actions: artistFansActions,
  },
  artist_follow_count: {
    identifier: 'artist_follow_count',
    route: '/artist/follow/count',
    execute: artistFollowCountModule,
    decodeInput: artistFollowCountInputDecoder,
    actions: artistFollowCountActions,
  },
  artist_list: {
    identifier: 'artist_list',
    route: '/artist/list',
    execute: artistListModule,
    decodeInput: artistListInputDecoder,
    actions: artistListActions,
  },
  artist_mv: {
    identifier: 'artist_mv',
    route: '/artist/mv',
    execute: artistMvModule,
    decodeInput: artistMvInputDecoder,
    actions: artistMvActions,
  },
  artist_new_mv: {
    identifier: 'artist_new_mv',
    route: '/artist/new/mv',
    execute: artistNewMvModule,
    decodeInput: artistNewMvInputDecoder,
    actions: artistNewMvActions,
  },
  artist_new_song: {
    identifier: 'artist_new_song',
    route: '/artist/new/song',
    execute: artistNewSongModule,
    decodeInput: artistNewSongInputDecoder,
    actions: artistNewSongActions,
  },
  artist_songs: {
    identifier: 'artist_songs',
    route: '/artist/songs',
    execute: artistSongsModule,
    decodeInput: artistSongsInputDecoder,
    actions: artistSongsActions,
  },
  artist_sub: {
    identifier: 'artist_sub',
    route: '/artist/sub',
    execute: artistSubModule,
    decodeInput: artistSubInputDecoder,
    actions: artistSubActions,
  },
  artist_sublist: {
    identifier: 'artist_sublist',
    route: '/artist/sublist',
    execute: artistSublistModule,
    decodeInput: artistSublistInputDecoder,
    actions: artistSublistActions,
  },
  artist_top_song: {
    identifier: 'artist_top_song',
    route: '/artist/top/song',
    execute: artistTopSongModule,
    decodeInput: artistTopSongInputDecoder,
    actions: artistTopSongActions,
  },
  artist_video: {
    identifier: 'artist_video',
    route: '/artist/video',
    execute: artistVideoModule,
    decodeInput: artistVideoInputDecoder,
    actions: artistVideoActions,
  },
  artists: {
    identifier: 'artists',
    route: '/artists',
    execute: artistsModule,
    decodeInput: artistsInputDecoder,
    actions: artistsActions,
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
    actions: bannerActions,
  },
  batch: {
    identifier: 'batch',
    route: '/batch',
    execute: batchModule,
    decodeInput: batchInputDecoder,
    actions: batchActions,
  },
  broadcast_category_region_get: {
    identifier: 'broadcast_category_region_get',
    route: '/broadcast/category/region/get',
    execute: broadcastCategoryRegionGetModule,
    decodeInput: broadcastCategoryRegionGetInputDecoder,
    actions: broadcastCategoryRegionGetActions,
  },
  broadcast_channel_collect_list: {
    identifier: 'broadcast_channel_collect_list',
    route: '/broadcast/channel/collect/list',
    execute: broadcastChannelCollectListModule,
    decodeInput: broadcastChannelCollectListInputDecoder,
    actions: broadcastChannelCollectListActions,
  },
  broadcast_channel_currentinfo: {
    identifier: 'broadcast_channel_currentinfo',
    route: '/broadcast/channel/currentinfo',
    execute: broadcastChannelCurrentinfoModule,
    decodeInput: broadcastChannelCurrentinfoInputDecoder,
    actions: broadcastChannelCurrentinfoActions,
  },
  broadcast_channel_list: {
    identifier: 'broadcast_channel_list',
    route: '/broadcast/channel/list',
    execute: broadcastChannelListModule,
    decodeInput: broadcastChannelListInputDecoder,
    actions: broadcastChannelListActions,
  },
  broadcast_sub: {
    identifier: 'broadcast_sub',
    route: '/broadcast/sub',
    execute: broadcastSubModule,
    decodeInput: broadcastSubInputDecoder,
    actions: broadcastSubActions,
  },
  calendar: {
    identifier: 'calendar',
    route: '/calendar',
    execute: calendarModule,
    decodeInput: calendarInputDecoder,
    actions: calendarActions,
  },
  captcha_sent: {
    identifier: 'captcha_sent',
    route: '/captcha/sent',
    execute: captchaSentModule,
    decodeInput: captchaSentInputDecoder,
    actions: captchaSentActions,
  },
  captcha_verify: {
    identifier: 'captcha_verify',
    route: '/captcha/verify',
    execute: captchaVerifyModule,
    decodeInput: captchaVerifyInputDecoder,
    actions: captchaVerifyActions,
  },
  cellphone_existence_check: {
    identifier: 'cellphone_existence_check',
    route: '/cellphone/existence/check',
    execute: cellphoneExistenceCheckModule,
    decodeInput: cellphoneExistenceCheckInputDecoder,
    actions: cellphoneExistenceCheckActions,
  },
  check_music: {
    identifier: 'check_music',
    route: '/check/music',
    execute: checkMusicModule,
    decodeInput: checkMusicInputDecoder,
    actions: checkMusicActions,
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
    actions: cloudMatchActions,
  },
  cloudsearch: {
    identifier: 'cloudsearch',
    route: '/cloudsearch',
    execute: cloudsearchModule,
    decodeInput: cloudsearchInputDecoder,
    actions: cloudsearchActions,
  },
  comment: {
    identifier: 'comment',
    route: '/comment',
    execute: commentModule,
    decodeInput: commentInputDecoder,
    actions: commentActions,
  },
  comment_album: {
    identifier: 'comment_album',
    route: '/comment/album',
    execute: commentAlbumModule,
    decodeInput: commentAlbumInputDecoder,
    actions: commentAlbumActions,
  },
  comment_dj: {
    identifier: 'comment_dj',
    route: '/comment/dj',
    execute: commentDjModule,
    decodeInput: commentDjInputDecoder,
    actions: commentDjActions,
  },
  comment_event: {
    identifier: 'comment_event',
    route: '/comment/event',
    execute: commentEventModule,
    decodeInput: commentEventInputDecoder,
    actions: commentEventActions,
  },
  comment_floor: {
    identifier: 'comment_floor',
    route: '/comment/floor',
    execute: commentFloorModule,
    decodeInput: commentFloorInputDecoder,
    actions: commentFloorActions,
  },
  comment_hot: {
    identifier: 'comment_hot',
    route: '/comment/hot',
    execute: commentHotModule,
    decodeInput: commentHotInputDecoder,
    actions: commentHotActions,
  },
  comment_hug_list: {
    identifier: 'comment_hug_list',
    route: '/comment/hug/list',
    execute: commentHugListModule,
    decodeInput: commentHugListInputDecoder,
    actions: commentHugListActions,
  },
  comment_like: {
    identifier: 'comment_like',
    route: '/comment/like',
    execute: commentLikeModule,
    decodeInput: commentLikeInputDecoder,
    actions: commentLikeActions,
  },
  comment_music: {
    identifier: 'comment_music',
    route: '/comment/music',
    execute: commentMusicModule,
    decodeInput: commentMusicInputDecoder,
    actions: commentMusicActions,
  },
  comment_mv: {
    identifier: 'comment_mv',
    route: '/comment/mv',
    execute: commentMvModule,
    decodeInput: commentMvInputDecoder,
    actions: commentMvActions,
  },
  comment_new: {
    identifier: 'comment_new',
    route: '/comment/new',
    execute: commentNewModule,
    decodeInput: commentNewInputDecoder,
    actions: commentNewActions,
  },
  comment_playlist: {
    identifier: 'comment_playlist',
    route: '/comment/playlist',
    execute: commentPlaylistModule,
    decodeInput: commentPlaylistInputDecoder,
    actions: commentPlaylistActions,
  },
  comment_video: {
    identifier: 'comment_video',
    route: '/comment/video',
    execute: commentVideoModule,
    decodeInput: commentVideoInputDecoder,
    actions: commentVideoActions,
  },
  countries_code_list: {
    identifier: 'countries_code_list',
    route: '/countries/code/list',
    execute: countriesCodeListModule,
    decodeInput: countriesCodeListInputDecoder,
    actions: countriesCodeListActions,
  },
  daily_signin: {
    identifier: 'daily_signin',
    route: '/daily_signin',
    execute: dailySigninModule,
    decodeInput: dailySigninInputDecoder,
    actions: dailySigninActions,
  },
  digitalAlbum_detail: {
    identifier: 'digitalAlbum_detail',
    route: '/digitalAlbum/detail',
    execute: digitalAlbumDetailModule,
    decodeInput: digitalAlbumDetailInputDecoder,
    actions: digitalAlbumDetailActions,
  },
  digitalAlbum_ordering: {
    identifier: 'digitalAlbum_ordering',
    route: '/digitalAlbum/ordering',
    execute: digitalAlbumOrderingModule,
    decodeInput: digitalAlbumOrderingInputDecoder,
    actions: digitalAlbumOrderingActions,
  },
  digitalAlbum_purchased: {
    identifier: 'digitalAlbum_purchased',
    route: '/digitalAlbum/purchased',
    execute: digitalAlbumPurchasedModule,
    decodeInput: digitalAlbumPurchasedInputDecoder,
    actions: digitalAlbumPurchasedActions,
  },
  digitalAlbum_sales: {
    identifier: 'digitalAlbum_sales',
    route: '/digitalAlbum/sales',
    execute: digitalAlbumSalesModule,
    decodeInput: digitalAlbumSalesInputDecoder,
    actions: digitalAlbumSalesActions,
  },
  dj_banner: {
    identifier: 'dj_banner',
    route: '/dj/banner',
    execute: djBannerModule,
    decodeInput: djBannerInputDecoder,
    actions: djBannerActions,
  },
  dj_category_excludehot: {
    identifier: 'dj_category_excludehot',
    route: '/dj/category/excludehot',
    execute: djCategoryExcludehotModule,
    decodeInput: djCategoryExcludehotInputDecoder,
    actions: djCategoryExcludehotActions,
  },
  dj_category_recommend: {
    identifier: 'dj_category_recommend',
    route: '/dj/category/recommend',
    execute: djCategoryRecommendModule,
    decodeInput: djCategoryRecommendInputDecoder,
    actions: djCategoryRecommendActions,
  },
  dj_catelist: {
    identifier: 'dj_catelist',
    route: '/dj/catelist',
    execute: djCatelistModule,
    decodeInput: djCatelistInputDecoder,
    actions: djCatelistActions,
  },
  dj_detail: {
    identifier: 'dj_detail',
    route: '/dj/detail',
    execute: djDetailModule,
    decodeInput: djDetailInputDecoder,
    actions: djDetailActions,
  },
  dj_difm_all_style_channel: {
    identifier: 'dj_difm_all_style_channel',
    route: '/dj/difm/all/style/channel',
    execute: djDifmAllStyleChannelModule,
    decodeInput: djDifmAllStyleChannelInputDecoder,
    actions: djDifmAllStyleChannelActions,
  },
  dj_difm_channel_subscribe: {
    identifier: 'dj_difm_channel_subscribe',
    route: '/dj/difm/channel/subscribe',
    execute: djDifmChannelSubscribeModule,
    decodeInput: djDifmChannelSubscribeInputDecoder,
    actions: djDifmChannelSubscribeActions,
  },
  dj_difm_channel_unsubscribe: {
    identifier: 'dj_difm_channel_unsubscribe',
    route: '/dj/difm/channel/unsubscribe',
    execute: djDifmChannelUnsubscribeModule,
    decodeInput: djDifmChannelUnsubscribeInputDecoder,
    actions: djDifmChannelUnsubscribeActions,
  },
  dj_difm_playing_tracks_list: {
    identifier: 'dj_difm_playing_tracks_list',
    route: '/dj/difm/playing/tracks/list',
    execute: djDifmPlayingTracksListModule,
    decodeInput: djDifmPlayingTracksListInputDecoder,
    actions: djDifmPlayingTracksListActions,
  },
  dj_difm_subscribe_channels_get: {
    identifier: 'dj_difm_subscribe_channels_get',
    route: '/dj/difm/subscribe/channels/get',
    execute: djDifmSubscribeChannelsGetModule,
    decodeInput: djDifmSubscribeChannelsGetInputDecoder,
    actions: djDifmSubscribeChannelsGetActions,
  },
  dj_hot: {
    identifier: 'dj_hot',
    route: '/dj/hot',
    execute: djHotModule,
    decodeInput: djHotInputDecoder,
    actions: djHotActions,
  },
  dj_paygift: {
    identifier: 'dj_paygift',
    route: '/dj/paygift',
    execute: djPaygiftModule,
    decodeInput: djPaygiftInputDecoder,
    actions: djPaygiftActions,
  },
  dj_personalize_recommend: {
    identifier: 'dj_personalize_recommend',
    route: '/dj/personalize/recommend',
    execute: djPersonalizeRecommendModule,
    decodeInput: djPersonalizeRecommendInputDecoder,
    actions: djPersonalizeRecommendActions,
  },
  dj_program: {
    identifier: 'dj_program',
    route: '/dj/program',
    execute: djProgramModule,
    decodeInput: djProgramInputDecoder,
    actions: djProgramActions,
  },
  dj_program_detail: {
    identifier: 'dj_program_detail',
    route: '/dj/program/detail',
    execute: djProgramDetailModule,
    decodeInput: djProgramDetailInputDecoder,
    actions: djProgramDetailActions,
  },
  dj_program_toplist: {
    identifier: 'dj_program_toplist',
    route: '/dj/program/toplist',
    execute: djProgramToplistModule,
    decodeInput: djProgramToplistInputDecoder,
    actions: djProgramToplistActions,
  },
  dj_program_toplist_hours: {
    identifier: 'dj_program_toplist_hours',
    route: '/dj/program/toplist/hours',
    execute: djProgramToplistHoursModule,
    decodeInput: djProgramToplistHoursInputDecoder,
    actions: djProgramToplistHoursActions,
  },
  dj_radio_hot: {
    identifier: 'dj_radio_hot',
    route: '/dj/radio/hot',
    execute: djRadioHotModule,
    decodeInput: djRadioHotInputDecoder,
    actions: djRadioHotActions,
  },
  dj_recommend: {
    identifier: 'dj_recommend',
    route: '/dj/recommend',
    execute: djRecommendModule,
    decodeInput: djRecommendInputDecoder,
    actions: djRecommendActions,
  },
  dj_recommend_type: {
    identifier: 'dj_recommend_type',
    route: '/dj/recommend/type',
    execute: djRecommendTypeModule,
    decodeInput: djRecommendTypeInputDecoder,
    actions: djRecommendTypeActions,
  },
  dj_sub: {
    identifier: 'dj_sub',
    route: '/dj/sub',
    execute: djSubModule,
    decodeInput: djSubInputDecoder,
    actions: djSubActions,
  },
  dj_sublist: {
    identifier: 'dj_sublist',
    route: '/dj/sublist',
    execute: djSublistModule,
    decodeInput: djSublistInputDecoder,
    actions: djSublistActions,
  },
  dj_subscriber: {
    identifier: 'dj_subscriber',
    route: '/dj/subscriber',
    execute: djSubscriberModule,
    decodeInput: djSubscriberInputDecoder,
    actions: djSubscriberActions,
  },
  dj_today_perfered: {
    identifier: 'dj_today_perfered',
    route: '/dj/today/perfered',
    execute: djTodayPerferedModule,
    decodeInput: djTodayPerferedInputDecoder,
    actions: djTodayPerferedActions,
  },
  dj_toplist: {
    identifier: 'dj_toplist',
    route: '/dj/toplist',
    execute: djToplistModule,
    decodeInput: djToplistInputDecoder,
    actions: djToplistActions,
  },
  dj_toplist_hours: {
    identifier: 'dj_toplist_hours',
    route: '/dj/toplist/hours',
    execute: djToplistHoursModule,
    decodeInput: djToplistHoursInputDecoder,
    actions: djToplistHoursActions,
  },
  dj_toplist_newcomer: {
    identifier: 'dj_toplist_newcomer',
    route: '/dj/toplist/newcomer',
    execute: djToplistNewcomerModule,
    decodeInput: djToplistNewcomerInputDecoder,
    actions: djToplistNewcomerActions,
  },
  dj_toplist_pay: {
    identifier: 'dj_toplist_pay',
    route: '/dj/toplist/pay',
    execute: djToplistPayModule,
    decodeInput: djToplistPayInputDecoder,
    actions: djToplistPayActions,
  },
  dj_toplist_popular: {
    identifier: 'dj_toplist_popular',
    route: '/dj/toplist/popular',
    execute: djToplistPopularModule,
    decodeInput: djToplistPopularInputDecoder,
    actions: djToplistPopularActions,
  },
  djRadio_top: {
    identifier: 'djRadio_top',
    route: '/djRadio/top',
    execute: djRadioTopModule,
    decodeInput: djRadioTopInputDecoder,
    actions: djRadioTopActions,
  },
  event: {
    identifier: 'event',
    route: '/event',
    execute: eventModule,
    decodeInput: eventInputDecoder,
    actions: eventActions,
  },
  event_del: {
    identifier: 'event_del',
    route: '/event/del',
    execute: eventDelModule,
    decodeInput: eventDelInputDecoder,
    actions: eventDelActions,
  },
  event_forward: {
    identifier: 'event_forward',
    route: '/event/forward',
    execute: eventForwardModule,
    decodeInput: eventForwardInputDecoder,
    actions: eventForwardActions,
  },
  fm_trash: {
    identifier: 'fm_trash',
    route: '/fm_trash',
    execute: fmTrashModule,
    decodeInput: fmTrashInputDecoder,
    actions: fmTrashActions,
  },
  follow: {
    identifier: 'follow',
    route: '/follow',
    execute: followModule,
    decodeInput: followInputDecoder,
    actions: followActions,
  },
  get_userids: {
    identifier: 'get_userids',
    route: '/get/userids',
    execute: getUseridsModule,
    decodeInput: getUseridsInputDecoder,
    actions: getUseridsActions,
  },
  history_recommend_songs: {
    identifier: 'history_recommend_songs',
    route: '/history/recommend/songs',
    execute: historyRecommendSongsModule,
    decodeInput: historyRecommendSongsInputDecoder,
    actions: historyRecommendSongsActions,
  },
  history_recommend_songs_detail: {
    identifier: 'history_recommend_songs_detail',
    route: '/history/recommend/songs/detail',
    execute: historyRecommendSongsDetailModule,
    decodeInput: historyRecommendSongsDetailInputDecoder,
    actions: historyRecommendSongsDetailActions,
  },
  homepage_block_page: {
    identifier: 'homepage_block_page',
    route: '/homepage/block/page',
    execute: homepageBlockPageModule,
    decodeInput: homepageBlockPageInputDecoder,
    actions: homepageBlockPageActions,
  },
  homepage_dragon_ball: {
    identifier: 'homepage_dragon_ball',
    route: '/homepage/dragon/ball',
    execute: homepageDragonBallModule,
    decodeInput: homepageDragonBallInputDecoder,
    actions: homepageDragonBallActions,
  },
  hot_topic: {
    identifier: 'hot_topic',
    route: '/hot/topic',
    execute: hotTopicModule,
    decodeInput: hotTopicInputDecoder,
    actions: hotTopicActions,
  },
  hug_comment: {
    identifier: 'hug_comment',
    route: '/hug/comment',
    execute: hugCommentModule,
    decodeInput: hugCommentInputDecoder,
    actions: hugCommentActions,
  },
  image_upload_token: {
    identifier: 'image_upload_token',
    route: '/image/upload/token',
    execute: imageUploadTokenModule,
    decodeInput: imageUploadTokenInputDecoder,
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
    actions: likeActions,
  },
  likelist: {
    identifier: 'likelist',
    route: '/likelist',
    execute: likelistModule,
    decodeInput: likelistInputDecoder,
    actions: likelistActions,
  },
  listen_data_realtime_report: {
    identifier: 'listen_data_realtime_report',
    route: '/listen/data/realtime/report',
    execute: listenDataRealtimeReportModule,
    decodeInput: listenDataRealtimeReportInputDecoder,
    actions: listenDataRealtimeReportActions,
  },
  listen_data_report: {
    identifier: 'listen_data_report',
    route: '/listen/data/report',
    execute: listenDataReportModule,
    decodeInput: listenDataReportInputDecoder,
    actions: listenDataReportActions,
  },
  listen_data_today_song: {
    identifier: 'listen_data_today_song',
    route: '/listen/data/today/song',
    execute: listenDataTodaySongModule,
    decodeInput: listenDataTodaySongInputDecoder,
    actions: listenDataTodaySongActions,
  },
  listen_data_total: {
    identifier: 'listen_data_total',
    route: '/listen/data/total',
    execute: listenDataTotalModule,
    decodeInput: listenDataTotalInputDecoder,
    actions: listenDataTotalActions,
  },
  listen_data_year_report: {
    identifier: 'listen_data_year_report',
    route: '/listen/data/year/report',
    execute: listenDataYearReportModule,
    decodeInput: listenDataYearReportInputDecoder,
    actions: listenDataYearReportActions,
  },
  listentogether_accept: {
    identifier: 'listentogether_accept',
    route: '/listentogether/accept',
    execute: listentogetherAcceptModule,
    decodeInput: listentogetherAcceptInputDecoder,
    actions: listentogetherAcceptActions,
  },
  listentogether_end: {
    identifier: 'listentogether_end',
    route: '/listentogether/end',
    execute: listentogetherEndModule,
    decodeInput: listentogetherEndInputDecoder,
    actions: listentogetherEndActions,
  },
  listentogether_heatbeat: {
    identifier: 'listentogether_heatbeat',
    route: '/listentogether/heatbeat',
    execute: listentogetherHeatbeatModule,
    decodeInput: listentogetherHeatbeatInputDecoder,
    actions: listentogetherHeatbeatActions,
  },
  listentogether_play_command: {
    identifier: 'listentogether_play_command',
    route: '/listentogether/play/command',
    execute: listentogetherPlayCommandModule,
    decodeInput: listentogetherPlayCommandInputDecoder,
    actions: listentogetherPlayCommandActions,
  },
  listentogether_room_check: {
    identifier: 'listentogether_room_check',
    route: '/listentogether/room/check',
    execute: listentogetherRoomCheckModule,
    decodeInput: listentogetherRoomCheckInputDecoder,
    actions: listentogetherRoomCheckActions,
  },
  listentogether_room_create: {
    identifier: 'listentogether_room_create',
    route: '/listentogether/room/create',
    execute: listentogetherRoomCreateModule,
    decodeInput: listentogetherRoomCreateInputDecoder,
    actions: listentogetherRoomCreateActions,
  },
  listentogether_status: {
    identifier: 'listentogether_status',
    route: '/listentogether/status',
    execute: listentogetherStatusModule,
    decodeInput: listentogetherStatusInputDecoder,
    actions: listentogetherStatusActions,
  },
  listentogether_sync_list_command: {
    identifier: 'listentogether_sync_list_command',
    route: '/listentogether/sync/list/command',
    execute: listentogetherSyncListCommandModule,
    decodeInput: listentogetherSyncListCommandInputDecoder,
    actions: listentogetherSyncListCommandActions,
  },
  listentogether_sync_playlist_get: {
    identifier: 'listentogether_sync_playlist_get',
    route: '/listentogether/sync/playlist/get',
    execute: listentogetherSyncPlaylistGetModule,
    decodeInput: listentogetherSyncPlaylistGetInputDecoder,
    actions: listentogetherSyncPlaylistGetActions,
  },
  login: {
    identifier: 'login',
    route: '/login',
    execute: loginModule,
    decodeInput: loginInputDecoder,
    actions: loginActions,
  },
  login_cellphone: {
    identifier: 'login_cellphone',
    route: '/login/cellphone',
    execute: loginCellphoneModule,
    decodeInput: loginCellphoneInputDecoder,
    actions: loginCellphoneActions,
  },
  login_qr_check: {
    identifier: 'login_qr_check',
    route: '/login/qr/check',
    execute: loginQrCheckModule,
    decodeInput: loginQrCheckInputDecoder,
    actions: loginQrCheckActions,
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
    actions: loginQrKeyActions,
  },
  login_refresh: {
    identifier: 'login_refresh',
    route: '/login/refresh',
    execute: loginRefreshModule,
    decodeInput: loginRefreshInputDecoder,
    actions: loginRefreshActions,
  },
  login_status: {
    identifier: 'login_status',
    route: '/login/status',
    execute: loginStatusModule,
    decodeInput: loginStatusInputDecoder,
    actions: loginStatusActions,
  },
  logout: {
    identifier: 'logout',
    route: '/logout',
    execute: logoutModule,
    decodeInput: logoutInputDecoder,
    actions: logoutActions,
  },
  lyric: {
    identifier: 'lyric',
    route: '/lyric',
    execute: lyricModule,
    decodeInput: lyricInputDecoder,
    actions: lyricActions,
  },
  lyric_new: {
    identifier: 'lyric_new',
    route: '/lyric/new',
    execute: lyricNewModule,
    decodeInput: lyricNewInputDecoder,
    actions: lyricNewActions,
  },
  mlog_music_rcmd: {
    identifier: 'mlog_music_rcmd',
    route: '/mlog/music/rcmd',
    execute: mlogMusicRcmdModule,
    decodeInput: mlogMusicRcmdInputDecoder,
    actions: mlogMusicRcmdActions,
  },
  mlog_to_video: {
    identifier: 'mlog_to_video',
    route: '/mlog/to/video',
    execute: mlogToVideoModule,
    decodeInput: mlogToVideoInputDecoder,
    actions: mlogToVideoActions,
  },
  mlog_url: {
    identifier: 'mlog_url',
    route: '/mlog/url',
    execute: mlogUrlModule,
    decodeInput: mlogUrlInputDecoder,
    actions: mlogUrlActions,
  },
  msg_comments: {
    identifier: 'msg_comments',
    route: '/msg/comments',
    execute: msgCommentsModule,
    decodeInput: msgCommentsInputDecoder,
    actions: msgCommentsActions,
  },
  msg_forwards: {
    identifier: 'msg_forwards',
    route: '/msg/forwards',
    execute: msgForwardsModule,
    decodeInput: msgForwardsInputDecoder,
    actions: msgForwardsActions,
  },
  msg_notices: {
    identifier: 'msg_notices',
    route: '/msg/notices',
    execute: msgNoticesModule,
    decodeInput: msgNoticesInputDecoder,
    actions: msgNoticesActions,
  },
  msg_private: {
    identifier: 'msg_private',
    route: '/msg/private',
    execute: msgPrivateModule,
    decodeInput: msgPrivateInputDecoder,
    actions: msgPrivateActions,
  },
  msg_private_history: {
    identifier: 'msg_private_history',
    route: '/msg/private/history',
    execute: msgPrivateHistoryModule,
    decodeInput: msgPrivateHistoryInputDecoder,
    actions: msgPrivateHistoryActions,
  },
  msg_recentcontact: {
    identifier: 'msg_recentcontact',
    route: '/msg/recentcontact',
    execute: msgRecentcontactModule,
    decodeInput: msgRecentcontactInputDecoder,
    actions: msgRecentcontactActions,
  },
  music_first_listen_info: {
    identifier: 'music_first_listen_info',
    route: '/music/first/listen/info',
    execute: musicFirstListenInfoModule,
    decodeInput: musicFirstListenInfoInputDecoder,
    actions: musicFirstListenInfoActions,
  },
  musician_cloudbean: {
    identifier: 'musician_cloudbean',
    route: '/musician/cloudbean',
    execute: musicianCloudbeanModule,
    decodeInput: musicianCloudbeanInputDecoder,
    actions: musicianCloudbeanActions,
  },
  musician_cloudbean_obtain: {
    identifier: 'musician_cloudbean_obtain',
    route: '/musician/cloudbean/obtain',
    execute: musicianCloudbeanObtainModule,
    decodeInput: musicianCloudbeanObtainInputDecoder,
    actions: musicianCloudbeanObtainActions,
  },
  musician_data_overview: {
    identifier: 'musician_data_overview',
    route: '/musician/data/overview',
    execute: musicianDataOverviewModule,
    decodeInput: musicianDataOverviewInputDecoder,
    actions: musicianDataOverviewActions,
  },
  musician_play_trend: {
    identifier: 'musician_play_trend',
    route: '/musician/play/trend',
    execute: musicianPlayTrendModule,
    decodeInput: musicianPlayTrendInputDecoder,
    actions: musicianPlayTrendActions,
  },
  musician_sign: {
    identifier: 'musician_sign',
    route: '/musician/sign',
    execute: musicianSignModule,
    decodeInput: musicianSignInputDecoder,
    actions: musicianSignActions,
  },
  musician_tasks: {
    identifier: 'musician_tasks',
    route: '/musician/tasks',
    execute: musicianTasksModule,
    decodeInput: musicianTasksInputDecoder,
    actions: musicianTasksActions,
  },
  musician_tasks_new: {
    identifier: 'musician_tasks_new',
    route: '/musician/tasks/new',
    execute: musicianTasksNewModule,
    decodeInput: musicianTasksNewInputDecoder,
    actions: musicianTasksNewActions,
  },
  mv_all: {
    identifier: 'mv_all',
    route: '/mv/all',
    execute: mvAllModule,
    decodeInput: mvAllInputDecoder,
    actions: mvAllActions,
  },
  mv_detail: {
    identifier: 'mv_detail',
    route: '/mv/detail',
    execute: mvDetailModule,
    decodeInput: mvDetailInputDecoder,
    actions: mvDetailActions,
  },
  mv_detail_info: {
    identifier: 'mv_detail_info',
    route: '/mv/detail/info',
    execute: mvDetailInfoModule,
    decodeInput: mvDetailInfoInputDecoder,
    actions: mvDetailInfoActions,
  },
  mv_exclusive_rcmd: {
    identifier: 'mv_exclusive_rcmd',
    route: '/mv/exclusive/rcmd',
    execute: mvExclusiveRcmdModule,
    decodeInput: mvExclusiveRcmdInputDecoder,
    actions: mvExclusiveRcmdActions,
  },
  mv_first: {
    identifier: 'mv_first',
    route: '/mv/first',
    execute: mvFirstModule,
    decodeInput: mvFirstInputDecoder,
    actions: mvFirstActions,
  },
  mv_sub: {
    identifier: 'mv_sub',
    route: '/mv/sub',
    execute: mvSubModule,
    decodeInput: mvSubInputDecoder,
    actions: mvSubActions,
  },
  mv_sublist: {
    identifier: 'mv_sublist',
    route: '/mv/sublist',
    execute: mvSublistModule,
    decodeInput: mvSublistInputDecoder,
    actions: mvSublistActions,
  },
  mv_url: {
    identifier: 'mv_url',
    route: '/mv/url',
    execute: mvUrlModule,
    decodeInput: mvUrlInputDecoder,
    actions: mvUrlActions,
  },
  nickname_check: {
    identifier: 'nickname_check',
    route: '/nickname/check',
    execute: nicknameCheckModule,
    decodeInput: nicknameCheckInputDecoder,
    actions: nicknameCheckActions,
  },
  personal_fm: {
    identifier: 'personal_fm',
    route: '/personal_fm',
    execute: personalFmModule,
    decodeInput: personalFmInputDecoder,
    actions: personalFmActions,
  },
  personal_fm_mode: {
    identifier: 'personal_fm_mode',
    route: '/personal/fm/mode',
    execute: personalFmModeModule,
    decodeInput: personalFmModeInputDecoder,
    actions: personalFmModeActions,
  },
  personalized: {
    identifier: 'personalized',
    route: '/personalized',
    execute: personalizedModule,
    decodeInput: personalizedInputDecoder,
    actions: personalizedActions,
  },
  personalized_djprogram: {
    identifier: 'personalized_djprogram',
    route: '/personalized/djprogram',
    execute: personalizedDjprogramModule,
    decodeInput: personalizedDjprogramInputDecoder,
    actions: personalizedDjprogramActions,
  },
  personalized_mv: {
    identifier: 'personalized_mv',
    route: '/personalized/mv',
    execute: personalizedMvModule,
    decodeInput: personalizedMvInputDecoder,
    actions: personalizedMvActions,
  },
  personalized_newsong: {
    identifier: 'personalized_newsong',
    route: '/personalized/newsong',
    execute: personalizedNewsongModule,
    decodeInput: personalizedNewsongInputDecoder,
    actions: personalizedNewsongActions,
  },
  personalized_privatecontent: {
    identifier: 'personalized_privatecontent',
    route: '/personalized/privatecontent',
    execute: personalizedPrivatecontentModule,
    decodeInput: personalizedPrivatecontentInputDecoder,
    actions: personalizedPrivatecontentActions,
  },
  personalized_privatecontent_list: {
    identifier: 'personalized_privatecontent_list',
    route: '/personalized/privatecontent/list',
    execute: personalizedPrivatecontentListModule,
    decodeInput: personalizedPrivatecontentListInputDecoder,
    actions: personalizedPrivatecontentListActions,
  },
  pl_count: {
    identifier: 'pl_count',
    route: '/pl/count',
    execute: plCountModule,
    decodeInput: plCountInputDecoder,
    actions: plCountActions,
  },
  playlist_catlist: {
    identifier: 'playlist_catlist',
    route: '/playlist/catlist',
    execute: playlistCatlistModule,
    decodeInput: playlistCatlistInputDecoder,
    actions: playlistCatlistActions,
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
    actions: playlistCreateActions,
  },
  playlist_delete: {
    identifier: 'playlist_delete',
    route: '/playlist/delete',
    execute: playlistDeleteModule,
    decodeInput: playlistDeleteInputDecoder,
    actions: playlistDeleteActions,
  },
  playlist_desc_update: {
    identifier: 'playlist_desc_update',
    route: '/playlist/desc/update',
    execute: playlistDescUpdateModule,
    decodeInput: playlistDescUpdateInputDecoder,
    actions: playlistDescUpdateActions,
  },
  playlist_detail: {
    identifier: 'playlist_detail',
    route: '/playlist/detail',
    execute: playlistDetailModule,
    decodeInput: playlistDetailInputDecoder,
    actions: playlistDetailActions,
  },
  playlist_detail_dynamic: {
    identifier: 'playlist_detail_dynamic',
    route: '/playlist/detail/dynamic',
    execute: playlistDetailDynamicModule,
    decodeInput: playlistDetailDynamicInputDecoder,
    actions: playlistDetailDynamicActions,
  },
  playlist_detail_rcmd_get: {
    identifier: 'playlist_detail_rcmd_get',
    route: '/playlist/detail/rcmd/get',
    execute: playlistDetailRcmdGetModule,
    decodeInput: playlistDetailRcmdGetInputDecoder,
    actions: playlistDetailRcmdGetActions,
  },
  playlist_highquality_tags: {
    identifier: 'playlist_highquality_tags',
    route: '/playlist/highquality/tags',
    execute: playlistHighqualityTagsModule,
    decodeInput: playlistHighqualityTagsInputDecoder,
    actions: playlistHighqualityTagsActions,
  },
  playlist_hot: {
    identifier: 'playlist_hot',
    route: '/playlist/hot',
    execute: playlistHotModule,
    decodeInput: playlistHotInputDecoder,
    actions: playlistHotActions,
  },
  playlist_import_name_task_create: {
    identifier: 'playlist_import_name_task_create',
    route: '/playlist/import/name/task/create',
    execute: playlistImportNameTaskCreateModule,
    decodeInput: playlistImportNameTaskCreateInputDecoder,
    actions: playlistImportNameTaskCreateActions,
  },
  playlist_import_task_status: {
    identifier: 'playlist_import_task_status',
    route: '/playlist/import/task/status',
    execute: playlistImportTaskStatusModule,
    decodeInput: playlistImportTaskStatusInputDecoder,
    actions: playlistImportTaskStatusActions,
  },
  playlist_mylike: {
    identifier: 'playlist_mylike',
    route: '/playlist/mylike',
    execute: playlistMylikeModule,
    decodeInput: playlistMylikeInputDecoder,
    actions: playlistMylikeActions,
  },
  playlist_name_update: {
    identifier: 'playlist_name_update',
    route: '/playlist/name/update',
    execute: playlistNameUpdateModule,
    decodeInput: playlistNameUpdateInputDecoder,
    actions: playlistNameUpdateActions,
  },
  playlist_order_update: {
    identifier: 'playlist_order_update',
    route: '/playlist/order/update',
    execute: playlistOrderUpdateModule,
    decodeInput: playlistOrderUpdateInputDecoder,
    actions: playlistOrderUpdateActions,
  },
  playlist_privacy: {
    identifier: 'playlist_privacy',
    route: '/playlist/privacy',
    execute: playlistPrivacyModule,
    decodeInput: playlistPrivacyInputDecoder,
    actions: playlistPrivacyActions,
  },
  playlist_subscribe: {
    identifier: 'playlist_subscribe',
    route: '/playlist/subscribe',
    execute: playlistSubscribeModule,
    decodeInput: playlistSubscribeInputDecoder,
    actions: playlistSubscribeActions,
  },
  playlist_subscribers: {
    identifier: 'playlist_subscribers',
    route: '/playlist/subscribers',
    execute: playlistSubscribersModule,
    decodeInput: playlistSubscribersInputDecoder,
    actions: playlistSubscribersActions,
  },
  playlist_tags_update: {
    identifier: 'playlist_tags_update',
    route: '/playlist/tags/update',
    execute: playlistTagsUpdateModule,
    decodeInput: playlistTagsUpdateInputDecoder,
    actions: playlistTagsUpdateActions,
  },
  playlist_track_add: {
    identifier: 'playlist_track_add',
    route: '/playlist/track/add',
    execute: playlistTrackAddModule,
    decodeInput: playlistTrackAddInputDecoder,
    actions: playlistTrackAddActions,
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
    actions: playlistTrackDeleteActions,
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
    actions: playlistUpdateActions,
  },
  playlist_update_playcount: {
    identifier: 'playlist_update_playcount',
    route: '/playlist/update/playcount',
    execute: playlistUpdatePlaycountModule,
    decodeInput: playlistUpdatePlaycountInputDecoder,
    actions: playlistUpdatePlaycountActions,
  },
  playlist_video_recent: {
    identifier: 'playlist_video_recent',
    route: '/playlist/video/recent',
    execute: playlistVideoRecentModule,
    decodeInput: playlistVideoRecentInputDecoder,
    actions: playlistVideoRecentActions,
  },
  playmode_intelligence_list: {
    identifier: 'playmode_intelligence_list',
    route: '/playmode/intelligence/list',
    execute: playmodeIntelligenceListModule,
    decodeInput: playmodeIntelligenceListInputDecoder,
    actions: playmodeIntelligenceListActions,
  },
  program_recommend: {
    identifier: 'program_recommend',
    route: '/program/recommend',
    execute: programRecommendModule,
    decodeInput: programRecommendInputDecoder,
    actions: programRecommendActions,
  },
  rebind: {
    identifier: 'rebind',
    route: '/rebind',
    execute: rebindModule,
    decodeInput: rebindInputDecoder,
    actions: rebindActions,
  },
  recent_listen_list: {
    identifier: 'recent_listen_list',
    route: '/recent/listen/list',
    execute: recentListenListModule,
    decodeInput: recentListenListInputDecoder,
    actions: recentListenListActions,
  },
  recommend_resource: {
    identifier: 'recommend_resource',
    route: '/recommend/resource',
    execute: recommendResourceModule,
    decodeInput: recommendResourceInputDecoder,
    actions: recommendResourceActions,
  },
  recommend_songs: {
    identifier: 'recommend_songs',
    route: '/recommend/songs',
    execute: recommendSongsModule,
    decodeInput: recommendSongsInputDecoder,
    actions: recommendSongsActions,
  },
  recommend_songs_dislike: {
    identifier: 'recommend_songs_dislike',
    route: '/recommend/songs/dislike',
    execute: recommendSongsDislikeModule,
    decodeInput: recommendSongsDislikeInputDecoder,
    actions: recommendSongsDislikeActions,
  },
  record_recent_album: {
    identifier: 'record_recent_album',
    route: '/record/recent/album',
    execute: recordRecentAlbumModule,
    decodeInput: recordRecentAlbumInputDecoder,
    actions: recordRecentAlbumActions,
  },
  record_recent_dj: {
    identifier: 'record_recent_dj',
    route: '/record/recent/dj',
    execute: recordRecentDjModule,
    decodeInput: recordRecentDjInputDecoder,
    actions: recordRecentDjActions,
  },
  record_recent_playlist: {
    identifier: 'record_recent_playlist',
    route: '/record/recent/playlist',
    execute: recordRecentPlaylistModule,
    decodeInput: recordRecentPlaylistInputDecoder,
    actions: recordRecentPlaylistActions,
  },
  record_recent_song: {
    identifier: 'record_recent_song',
    route: '/record/recent/song',
    execute: recordRecentSongModule,
    decodeInput: recordRecentSongInputDecoder,
    actions: recordRecentSongActions,
  },
  record_recent_video: {
    identifier: 'record_recent_video',
    route: '/record/recent/video',
    execute: recordRecentVideoModule,
    decodeInput: recordRecentVideoInputDecoder,
    actions: recordRecentVideoActions,
  },
  record_recent_voice: {
    identifier: 'record_recent_voice',
    route: '/record/recent/voice',
    execute: recordRecentVoiceModule,
    decodeInput: recordRecentVoiceInputDecoder,
    actions: recordRecentVoiceActions,
  },
  register_anonimous: {
    identifier: 'register_anonimous',
    route: '/register/anonimous',
    execute: registerAnonimousModule,
    decodeInput: registerAnonimousInputDecoder,
    actions: registerAnonimousActions,
  },
  register_cellphone: {
    identifier: 'register_cellphone',
    route: '/register/cellphone',
    execute: registerCellphoneModule,
    decodeInput: registerCellphoneInputDecoder,
    actions: registerCellphoneActions,
  },
  related_allvideo: {
    identifier: 'related_allvideo',
    route: '/related/allvideo',
    execute: relatedAllvideoModule,
    decodeInput: relatedAllvideoInputDecoder,
    actions: relatedAllvideoActions,
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
    actions: resourceLikeActions,
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
    actions: searchActions,
  },
  search_default: {
    identifier: 'search_default',
    route: '/search/default',
    execute: searchDefaultModule,
    decodeInput: searchDefaultInputDecoder,
    actions: searchDefaultActions,
  },
  search_hot: {
    identifier: 'search_hot',
    route: '/search/hot',
    execute: searchHotModule,
    decodeInput: searchHotInputDecoder,
    actions: searchHotActions,
  },
  search_hot_detail: {
    identifier: 'search_hot_detail',
    route: '/search/hot/detail',
    execute: searchHotDetailModule,
    decodeInput: searchHotDetailInputDecoder,
    actions: searchHotDetailActions,
  },
  search_match: {
    identifier: 'search_match',
    route: '/search/match',
    execute: searchMatchModule,
    decodeInput: searchMatchInputDecoder,
    actions: searchMatchActions,
  },
  search_multimatch: {
    identifier: 'search_multimatch',
    route: '/search/multimatch',
    execute: searchMultimatchModule,
    decodeInput: searchMultimatchInputDecoder,
    actions: searchMultimatchActions,
  },
  search_suggest: {
    identifier: 'search_suggest',
    route: '/search/suggest',
    execute: searchSuggestModule,
    decodeInput: searchSuggestInputDecoder,
    actions: searchSuggestActions,
  },
  send_album: {
    identifier: 'send_album',
    route: '/send/album',
    execute: sendAlbumModule,
    decodeInput: sendAlbumInputDecoder,
    actions: sendAlbumActions,
  },
  send_playlist: {
    identifier: 'send_playlist',
    route: '/send/playlist',
    execute: sendPlaylistModule,
    decodeInput: sendPlaylistInputDecoder,
    actions: sendPlaylistActions,
  },
  send_song: {
    identifier: 'send_song',
    route: '/send/song',
    execute: sendSongModule,
    decodeInput: sendSongInputDecoder,
    actions: sendSongActions,
  },
  send_text: {
    identifier: 'send_text',
    route: '/send/text',
    execute: sendTextModule,
    decodeInput: sendTextInputDecoder,
    actions: sendTextActions,
  },
  setting: {
    identifier: 'setting',
    route: '/setting',
    execute: settingModule,
    decodeInput: settingInputDecoder,
    actions: settingActions,
  },
  share_resource: {
    identifier: 'share_resource',
    route: '/share/resource',
    execute: shareResourceModule,
    decodeInput: shareResourceInputDecoder,
    actions: shareResourceActions,
  },
  sheet_list: {
    identifier: 'sheet_list',
    route: '/sheet/list',
    execute: sheetListModule,
    decodeInput: sheetListInputDecoder,
    actions: sheetListActions,
  },
  sheet_preview: {
    identifier: 'sheet_preview',
    route: '/sheet/preview',
    execute: sheetPreviewModule,
    decodeInput: sheetPreviewInputDecoder,
    actions: sheetPreviewActions,
  },
  sign_happy_info: {
    identifier: 'sign_happy_info',
    route: '/sign/happy/info',
    execute: signHappyInfoModule,
    decodeInput: signHappyInfoInputDecoder,
    actions: signHappyInfoActions,
  },
  signin_progress: {
    identifier: 'signin_progress',
    route: '/signin/progress',
    execute: signinProgressModule,
    decodeInput: signinProgressInputDecoder,
    actions: signinProgressActions,
  },
  simi_artist: {
    identifier: 'simi_artist',
    route: '/simi/artist',
    execute: simiArtistModule,
    decodeInput: simiArtistInputDecoder,
    actions: simiArtistActions,
  },
  simi_mv: {
    identifier: 'simi_mv',
    route: '/simi/mv',
    execute: simiMvModule,
    decodeInput: simiMvInputDecoder,
    actions: simiMvActions,
  },
  simi_playlist: {
    identifier: 'simi_playlist',
    route: '/simi/playlist',
    execute: simiPlaylistModule,
    decodeInput: simiPlaylistInputDecoder,
    actions: simiPlaylistActions,
  },
  simi_song: {
    identifier: 'simi_song',
    route: '/simi/song',
    execute: simiSongModule,
    decodeInput: simiSongInputDecoder,
    actions: simiSongActions,
  },
  simi_user: {
    identifier: 'simi_user',
    route: '/simi/user',
    execute: simiUserModule,
    decodeInput: simiUserInputDecoder,
    actions: simiUserActions,
  },
  song_chorus: {
    identifier: 'song_chorus',
    route: '/song/chorus',
    execute: songChorusModule,
    decodeInput: songChorusInputDecoder,
    actions: songChorusActions,
  },
  song_detail: {
    identifier: 'song_detail',
    route: '/song/detail',
    execute: songDetailModule,
    decodeInput: songDetailInputDecoder,
    actions: songDetailActions,
  },
  song_downlist: {
    identifier: 'song_downlist',
    route: '/song/downlist',
    execute: songDownlistModule,
    decodeInput: songDownlistInputDecoder,
    actions: songDownlistActions,
  },
  song_download_url: {
    identifier: 'song_download_url',
    route: '/song/download/url',
    execute: songDownloadUrlModule,
    decodeInput: songDownloadUrlInputDecoder,
    actions: songDownloadUrlActions,
  },
  song_download_url_v1: {
    identifier: 'song_download_url_v1',
    route: '/song/download/url/v1',
    execute: songDownloadUrlV1Module,
    decodeInput: songDownloadUrlV1InputDecoder,
    actions: songDownloadUrlV1Actions,
  },
  song_dynamic_cover: {
    identifier: 'song_dynamic_cover',
    route: '/song/dynamic/cover',
    execute: songDynamicCoverModule,
    decodeInput: songDynamicCoverInputDecoder,
    actions: songDynamicCoverActions,
  },
  song_like_check: {
    identifier: 'song_like_check',
    route: '/song/like/check',
    execute: songLikeCheckModule,
    decodeInput: songLikeCheckInputDecoder,
    actions: songLikeCheckActions,
  },
  song_lyrics_mark: {
    identifier: 'song_lyrics_mark',
    route: '/song/lyrics/mark',
    execute: songLyricsMarkModule,
    decodeInput: songLyricsMarkInputDecoder,
    actions: songLyricsMarkActions,
  },
  song_lyrics_mark_add: {
    identifier: 'song_lyrics_mark_add',
    route: '/song/lyrics/mark/add',
    execute: songLyricsMarkAddModule,
    decodeInput: songLyricsMarkAddInputDecoder,
    actions: songLyricsMarkAddActions,
  },
  song_lyrics_mark_del: {
    identifier: 'song_lyrics_mark_del',
    route: '/song/lyrics/mark/del',
    execute: songLyricsMarkDelModule,
    decodeInput: songLyricsMarkDelInputDecoder,
    actions: songLyricsMarkDelActions,
  },
  song_lyrics_mark_user_page: {
    identifier: 'song_lyrics_mark_user_page',
    route: '/song/lyrics/mark/user/page',
    execute: songLyricsMarkUserPageModule,
    decodeInput: songLyricsMarkUserPageInputDecoder,
    actions: songLyricsMarkUserPageActions,
  },
  song_monthdownlist: {
    identifier: 'song_monthdownlist',
    route: '/song/monthdownlist',
    execute: songMonthdownlistModule,
    decodeInput: songMonthdownlistInputDecoder,
    actions: songMonthdownlistActions,
  },
  song_music_detail: {
    identifier: 'song_music_detail',
    route: '/song/music/detail',
    execute: songMusicDetailModule,
    decodeInput: songMusicDetailInputDecoder,
    actions: songMusicDetailActions,
  },
  song_order_update: {
    identifier: 'song_order_update',
    route: '/song/order/update',
    execute: songOrderUpdateModule,
    decodeInput: songOrderUpdateInputDecoder,
    actions: songOrderUpdateActions,
  },
  song_purchased: {
    identifier: 'song_purchased',
    route: '/song/purchased',
    execute: songPurchasedModule,
    decodeInput: songPurchasedInputDecoder,
    actions: songPurchasedActions,
  },
  song_red_count: {
    identifier: 'song_red_count',
    route: '/song/red/count',
    execute: songRedCountModule,
    decodeInput: songRedCountInputDecoder,
    actions: songRedCountActions,
  },
  song_singledownlist: {
    identifier: 'song_singledownlist',
    route: '/song/singledownlist',
    execute: songSingledownlistModule,
    decodeInput: songSingledownlistInputDecoder,
    actions: songSingledownlistActions,
  },
  song_url: {
    identifier: 'song_url',
    route: '/song/url',
    execute: songUrlModule,
    decodeInput: songUrlInputDecoder,
    actions: songUrlActions,
  },
  song_url_v1: {
    identifier: 'song_url_v1',
    route: '/song/url/v1',
    execute: songUrlV1Module,
    decodeInput: songUrlV1InputDecoder,
    actions: songUrlV1Actions,
  },
  song_wiki_summary: {
    identifier: 'song_wiki_summary',
    route: '/song/wiki/summary',
    execute: songWikiSummaryModule,
    decodeInput: songWikiSummaryInputDecoder,
    actions: songWikiSummaryActions,
  },
  starpick_comments_summary: {
    identifier: 'starpick_comments_summary',
    route: '/starpick/comments/summary',
    execute: starpickCommentsSummaryModule,
    decodeInput: starpickCommentsSummaryInputDecoder,
    actions: starpickCommentsSummaryActions,
  },
  style_album: {
    identifier: 'style_album',
    route: '/style/album',
    execute: styleAlbumModule,
    decodeInput: styleAlbumInputDecoder,
    actions: styleAlbumActions,
  },
  style_artist: {
    identifier: 'style_artist',
    route: '/style/artist',
    execute: styleArtistModule,
    decodeInput: styleArtistInputDecoder,
    actions: styleArtistActions,
  },
  style_detail: {
    identifier: 'style_detail',
    route: '/style/detail',
    execute: styleDetailModule,
    decodeInput: styleDetailInputDecoder,
    actions: styleDetailActions,
  },
  style_list: {
    identifier: 'style_list',
    route: '/style/list',
    execute: styleListModule,
    decodeInput: styleListInputDecoder,
    actions: styleListActions,
  },
  style_playlist: {
    identifier: 'style_playlist',
    route: '/style/playlist',
    execute: stylePlaylistModule,
    decodeInput: stylePlaylistInputDecoder,
    actions: stylePlaylistActions,
  },
  style_preference: {
    identifier: 'style_preference',
    route: '/style/preference',
    execute: stylePreferenceModule,
    decodeInput: stylePreferenceInputDecoder,
    actions: stylePreferenceActions,
  },
  style_song: {
    identifier: 'style_song',
    route: '/style/song',
    execute: styleSongModule,
    decodeInput: styleSongInputDecoder,
    actions: styleSongActions,
  },
  summary_annual: {
    identifier: 'summary_annual',
    route: '/summary/annual',
    execute: summaryAnnualModule,
    decodeInput: summaryAnnualInputDecoder,
    actions: summaryAnnualActions,
  },
  top_album: {
    identifier: 'top_album',
    route: '/top/album',
    execute: topAlbumModule,
    decodeInput: topAlbumInputDecoder,
    actions: topAlbumActions,
  },
  top_artists: {
    identifier: 'top_artists',
    route: '/top/artists',
    execute: topArtistsModule,
    decodeInput: topArtistsInputDecoder,
    actions: topArtistsActions,
  },
  top_list: {
    identifier: 'top_list',
    route: '/top/list',
    execute: topListModule,
    decodeInput: topListInputDecoder,
    actions: topListActions,
  },
  top_mv: {
    identifier: 'top_mv',
    route: '/top/mv',
    execute: topMvModule,
    decodeInput: topMvInputDecoder,
    actions: topMvActions,
  },
  top_playlist: {
    identifier: 'top_playlist',
    route: '/top/playlist',
    execute: topPlaylistModule,
    decodeInput: topPlaylistInputDecoder,
    actions: topPlaylistActions,
  },
  top_playlist_highquality: {
    identifier: 'top_playlist_highquality',
    route: '/top/playlist/highquality',
    execute: topPlaylistHighqualityModule,
    decodeInput: topPlaylistHighqualityInputDecoder,
    actions: topPlaylistHighqualityActions,
  },
  top_song: {
    identifier: 'top_song',
    route: '/top/song',
    execute: topSongModule,
    decodeInput: topSongInputDecoder,
    actions: topSongActions,
  },
  topic_detail: {
    identifier: 'topic_detail',
    route: '/topic/detail',
    execute: topicDetailModule,
    decodeInput: topicDetailInputDecoder,
    actions: topicDetailActions,
  },
  topic_detail_event_hot: {
    identifier: 'topic_detail_event_hot',
    route: '/topic/detail/event/hot',
    execute: topicDetailEventHotModule,
    decodeInput: topicDetailEventHotInputDecoder,
    actions: topicDetailEventHotActions,
  },
  topic_sublist: {
    identifier: 'topic_sublist',
    route: '/topic/sublist',
    execute: topicSublistModule,
    decodeInput: topicSublistInputDecoder,
    actions: topicSublistActions,
  },
  toplist: {
    identifier: 'toplist',
    route: '/toplist',
    execute: toplistModule,
    decodeInput: toplistInputDecoder,
    actions: toplistActions,
  },
  toplist_artist: {
    identifier: 'toplist_artist',
    route: '/toplist/artist',
    execute: toplistArtistModule,
    decodeInput: toplistArtistInputDecoder,
    actions: toplistArtistActions,
  },
  toplist_detail: {
    identifier: 'toplist_detail',
    route: '/toplist/detail',
    execute: toplistDetailModule,
    decodeInput: toplistDetailInputDecoder,
    actions: toplistDetailActions,
  },
  ugc_album_get: {
    identifier: 'ugc_album_get',
    route: '/ugc/album/get',
    execute: ugcAlbumGetModule,
    decodeInput: ugcAlbumGetInputDecoder,
    actions: ugcAlbumGetActions,
  },
  ugc_artist_get: {
    identifier: 'ugc_artist_get',
    route: '/ugc/artist/get',
    execute: ugcArtistGetModule,
    decodeInput: ugcArtistGetInputDecoder,
    actions: ugcArtistGetActions,
  },
  ugc_artist_search: {
    identifier: 'ugc_artist_search',
    route: '/ugc/artist/search',
    execute: ugcArtistSearchModule,
    decodeInput: ugcArtistSearchInputDecoder,
    actions: ugcArtistSearchActions,
  },
  ugc_detail: {
    identifier: 'ugc_detail',
    route: '/ugc/detail',
    execute: ugcDetailModule,
    decodeInput: ugcDetailInputDecoder,
    actions: ugcDetailActions,
  },
  ugc_mv_get: {
    identifier: 'ugc_mv_get',
    route: '/ugc/mv/get',
    execute: ugcMvGetModule,
    decodeInput: ugcMvGetInputDecoder,
    actions: ugcMvGetActions,
  },
  ugc_song_get: {
    identifier: 'ugc_song_get',
    route: '/ugc/song/get',
    execute: ugcSongGetModule,
    decodeInput: ugcSongGetInputDecoder,
    actions: ugcSongGetActions,
  },
  ugc_user_devote: {
    identifier: 'ugc_user_devote',
    route: '/ugc/user/devote',
    execute: ugcUserDevoteModule,
    decodeInput: ugcUserDevoteInputDecoder,
    actions: ugcUserDevoteActions,
  },
  user_account: {
    identifier: 'user_account',
    route: '/user/account',
    execute: userAccountModule,
    decodeInput: userAccountInputDecoder,
    actions: userAccountActions,
  },
  user_audio: {
    identifier: 'user_audio',
    route: '/user/audio',
    execute: userAudioModule,
    decodeInput: userAudioInputDecoder,
    actions: userAudioActions,
  },
  user_binding: {
    identifier: 'user_binding',
    route: '/user/binding',
    execute: userBindingModule,
    decodeInput: userBindingInputDecoder,
    actions: userBindingActions,
  },
  user_cloud: {
    identifier: 'user_cloud',
    route: '/user/cloud',
    execute: userCloudModule,
    decodeInput: userCloudInputDecoder,
    actions: userCloudActions,
  },
  user_cloud_del: {
    identifier: 'user_cloud_del',
    route: '/user/cloud/del',
    execute: userCloudDelModule,
    decodeInput: userCloudDelInputDecoder,
    actions: userCloudDelActions,
  },
  user_cloud_detail: {
    identifier: 'user_cloud_detail',
    route: '/user/cloud/detail',
    execute: userCloudDetailModule,
    decodeInput: userCloudDetailInputDecoder,
    actions: userCloudDetailActions,
  },
  user_comment_history: {
    identifier: 'user_comment_history',
    route: '/user/comment/history',
    execute: userCommentHistoryModule,
    decodeInput: userCommentHistoryInputDecoder,
    actions: userCommentHistoryActions,
  },
  user_detail: {
    identifier: 'user_detail',
    route: '/user/detail',
    execute: userDetailModule,
    decodeInput: userDetailInputDecoder,
    actions: userDetailActions,
  },
  user_dj: {
    identifier: 'user_dj',
    route: '/user/dj',
    execute: userDjModule,
    decodeInput: userDjInputDecoder,
    actions: userDjActions,
  },
  user_event: {
    identifier: 'user_event',
    route: '/user/event',
    execute: userEventModule,
    decodeInput: userEventInputDecoder,
    actions: userEventActions,
  },
  user_follow_mixed: {
    identifier: 'user_follow_mixed',
    route: '/user/follow/mixed',
    execute: userFollowMixedModule,
    decodeInput: userFollowMixedInputDecoder,
    actions: userFollowMixedActions,
  },
  user_followeds: {
    identifier: 'user_followeds',
    route: '/user/followeds',
    execute: userFollowedsModule,
    decodeInput: userFollowedsInputDecoder,
    actions: userFollowedsActions,
  },
  user_follows: {
    identifier: 'user_follows',
    route: '/user/follows',
    execute: userFollowsModule,
    decodeInput: userFollowsInputDecoder,
    actions: userFollowsActions,
  },
  user_level: {
    identifier: 'user_level',
    route: '/user/level',
    execute: userLevelModule,
    decodeInput: userLevelInputDecoder,
    actions: userLevelActions,
  },
  user_medal: {
    identifier: 'user_medal',
    route: '/user/medal',
    execute: userMedalModule,
    decodeInput: userMedalInputDecoder,
    actions: userMedalActions,
  },
  user_mutualfollow_get: {
    identifier: 'user_mutualfollow_get',
    route: '/user/mutualfollow/get',
    execute: userMutualfollowGetModule,
    decodeInput: userMutualfollowGetInputDecoder,
    actions: userMutualfollowGetActions,
  },
  user_playlist: {
    identifier: 'user_playlist',
    route: '/user/playlist',
    execute: userPlaylistModule,
    decodeInput: userPlaylistInputDecoder,
    actions: userPlaylistActions,
  },
  user_playlist_collect: {
    identifier: 'user_playlist_collect',
    route: '/user/playlist/collect',
    execute: userPlaylistCollectModule,
    decodeInput: userPlaylistCollectInputDecoder,
    actions: userPlaylistCollectActions,
  },
  user_playlist_create: {
    identifier: 'user_playlist_create',
    route: '/user/playlist/create',
    execute: userPlaylistCreateModule,
    decodeInput: userPlaylistCreateInputDecoder,
    actions: userPlaylistCreateActions,
  },
  user_record: {
    identifier: 'user_record',
    route: '/user/record',
    execute: userRecordModule,
    decodeInput: userRecordInputDecoder,
    actions: userRecordActions,
  },
  user_replacephone: {
    identifier: 'user_replacephone',
    route: '/user/replacephone',
    execute: userReplacephoneModule,
    decodeInput: userReplacephoneInputDecoder,
    actions: userReplacephoneActions,
  },
  user_social_status: {
    identifier: 'user_social_status',
    route: '/user/social/status',
    execute: userSocialStatusModule,
    decodeInput: userSocialStatusInputDecoder,
    actions: userSocialStatusActions,
  },
  user_social_status_edit: {
    identifier: 'user_social_status_edit',
    route: '/user/social/status/edit',
    execute: userSocialStatusEditModule,
    decodeInput: userSocialStatusEditInputDecoder,
    actions: userSocialStatusEditActions,
  },
  user_social_status_rcmd: {
    identifier: 'user_social_status_rcmd',
    route: '/user/social/status/rcmd',
    execute: userSocialStatusRcmdModule,
    decodeInput: userSocialStatusRcmdInputDecoder,
    actions: userSocialStatusRcmdActions,
  },
  user_social_status_support: {
    identifier: 'user_social_status_support',
    route: '/user/social/status/support',
    execute: userSocialStatusSupportModule,
    decodeInput: userSocialStatusSupportInputDecoder,
    actions: userSocialStatusSupportActions,
  },
  user_subcount: {
    identifier: 'user_subcount',
    route: '/user/subcount',
    execute: userSubcountModule,
    decodeInput: userSubcountInputDecoder,
    actions: userSubcountActions,
  },
  user_update: {
    identifier: 'user_update',
    route: '/user/update',
    execute: userUpdateModule,
    decodeInput: userUpdateInputDecoder,
    actions: userUpdateActions,
  },
  verify_getQr: {
    identifier: 'verify_getQr',
    route: '/verify/getQr',
    execute: verifyGetQrModule,
    decodeInput: verifyGetQrInputDecoder,
    actions: verifyGetQrActions,
  },
  verify_qrcodestatus: {
    identifier: 'verify_qrcodestatus',
    route: '/verify/qrcodestatus',
    execute: verifyQrcodestatusModule,
    decodeInput: verifyQrcodestatusInputDecoder,
    actions: verifyQrcodestatusActions,
  },
  video_category_list: {
    identifier: 'video_category_list',
    route: '/video/category/list',
    execute: videoCategoryListModule,
    decodeInput: videoCategoryListInputDecoder,
    actions: videoCategoryListActions,
  },
  video_detail: {
    identifier: 'video_detail',
    route: '/video/detail',
    execute: videoDetailModule,
    decodeInput: videoDetailInputDecoder,
    actions: videoDetailActions,
  },
  video_detail_info: {
    identifier: 'video_detail_info',
    route: '/video/detail/info',
    execute: videoDetailInfoModule,
    decodeInput: videoDetailInfoInputDecoder,
    actions: videoDetailInfoActions,
  },
  video_group: {
    identifier: 'video_group',
    route: '/video/group',
    execute: videoGroupModule,
    decodeInput: videoGroupInputDecoder,
    actions: videoGroupActions,
  },
  video_group_list: {
    identifier: 'video_group_list',
    route: '/video/group/list',
    execute: videoGroupListModule,
    decodeInput: videoGroupListInputDecoder,
    actions: videoGroupListActions,
  },
  video_sub: {
    identifier: 'video_sub',
    route: '/video/sub',
    execute: videoSubModule,
    decodeInput: videoSubInputDecoder,
    actions: videoSubActions,
  },
  video_timeline_all: {
    identifier: 'video_timeline_all',
    route: '/video/timeline/all',
    execute: videoTimelineAllModule,
    decodeInput: videoTimelineAllInputDecoder,
    actions: videoTimelineAllActions,
  },
  video_timeline_recommend: {
    identifier: 'video_timeline_recommend',
    route: '/video/timeline/recommend',
    execute: videoTimelineRecommendModule,
    decodeInput: videoTimelineRecommendInputDecoder,
    actions: videoTimelineRecommendActions,
  },
  video_url: {
    identifier: 'video_url',
    route: '/video/url',
    execute: videoUrlModule,
    decodeInput: videoUrlInputDecoder,
    actions: videoUrlActions,
  },
  vip_growthpoint: {
    identifier: 'vip_growthpoint',
    route: '/vip/growthpoint',
    execute: vipGrowthpointModule,
    decodeInput: vipGrowthpointInputDecoder,
    actions: vipGrowthpointActions,
  },
  vip_growthpoint_details: {
    identifier: 'vip_growthpoint_details',
    route: '/vip/growthpoint/details',
    execute: vipGrowthpointDetailsModule,
    decodeInput: vipGrowthpointDetailsInputDecoder,
    actions: vipGrowthpointDetailsActions,
  },
  vip_growthpoint_get: {
    identifier: 'vip_growthpoint_get',
    route: '/vip/growthpoint/get',
    execute: vipGrowthpointGetModule,
    decodeInput: vipGrowthpointGetInputDecoder,
    actions: vipGrowthpointGetActions,
  },
  vip_info: {
    identifier: 'vip_info',
    route: '/vip/info',
    execute: vipInfoModule,
    decodeInput: vipInfoInputDecoder,
    actions: vipInfoActions,
  },
  vip_info_v2: {
    identifier: 'vip_info_v2',
    route: '/vip/info/v2',
    execute: vipInfoV2Module,
    decodeInput: vipInfoV2InputDecoder,
    actions: vipInfoV2Actions,
  },
  vip_tasks: {
    identifier: 'vip_tasks',
    route: '/vip/tasks',
    execute: vipTasksModule,
    decodeInput: vipTasksInputDecoder,
    actions: vipTasksActions,
  },
  vip_timemachine: {
    identifier: 'vip_timemachine',
    route: '/vip/timemachine',
    execute: vipTimemachineModule,
    decodeInput: vipTimemachineInputDecoder,
    actions: vipTimemachineActions,
  },
  voice_delete: {
    identifier: 'voice_delete',
    route: '/voice/delete',
    execute: voiceDeleteModule,
    decodeInput: voiceDeleteInputDecoder,
    actions: voiceDeleteActions,
  },
  voice_detail: {
    identifier: 'voice_detail',
    route: '/voice/detail',
    execute: voiceDetailModule,
    decodeInput: voiceDetailInputDecoder,
    actions: voiceDetailActions,
  },
  voice_lyric: {
    identifier: 'voice_lyric',
    route: '/voice/lyric',
    execute: voiceLyricModule,
    decodeInput: voiceLyricInputDecoder,
    actions: voiceLyricActions,
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
    actions: voicelistDetailActions,
  },
  voicelist_list: {
    identifier: 'voicelist_list',
    route: '/voicelist/list',
    execute: voicelistListModule,
    decodeInput: voicelistListInputDecoder,
    actions: voicelistListActions,
  },
  voicelist_list_search: {
    identifier: 'voicelist_list_search',
    route: '/voicelist/list/search',
    execute: voicelistListSearchModule,
    decodeInput: voicelistListSearchInputDecoder,
    actions: voicelistListSearchActions,
  },
  voicelist_search: {
    identifier: 'voicelist_search',
    route: '/voicelist/search',
    execute: voicelistSearchModule,
    decodeInput: voicelistSearchInputDecoder,
    actions: voicelistSearchActions,
  },
  voicelist_trans: {
    identifier: 'voicelist_trans',
    route: '/voicelist/trans',
    execute: voicelistTransModule,
    decodeInput: voicelistTransInputDecoder,
    actions: voicelistTransActions,
  },
  yunbei: {
    identifier: 'yunbei',
    route: '/yunbei',
    execute: yunbeiModule,
    decodeInput: yunbeiInputDecoder,
    actions: yunbeiActions,
  },
  yunbei_expense: {
    identifier: 'yunbei_expense',
    route: '/yunbei/expense',
    execute: yunbeiExpenseModule,
    decodeInput: yunbeiExpenseInputDecoder,
    actions: yunbeiExpenseActions,
  },
  yunbei_info: {
    identifier: 'yunbei_info',
    route: '/yunbei/info',
    execute: yunbeiInfoModule,
    decodeInput: yunbeiInfoInputDecoder,
    actions: yunbeiInfoActions,
  },
  yunbei_rcmd_song: {
    identifier: 'yunbei_rcmd_song',
    route: '/yunbei/rcmd/song',
    execute: yunbeiRcmdSongModule,
    decodeInput: yunbeiRcmdSongInputDecoder,
    actions: yunbeiRcmdSongActions,
  },
  yunbei_rcmd_song_history: {
    identifier: 'yunbei_rcmd_song_history',
    route: '/yunbei/rcmd/song/history',
    execute: yunbeiRcmdSongHistoryModule,
    decodeInput: yunbeiRcmdSongHistoryInputDecoder,
    actions: yunbeiRcmdSongHistoryActions,
  },
  yunbei_receipt: {
    identifier: 'yunbei_receipt',
    route: '/yunbei/receipt',
    execute: yunbeiReceiptModule,
    decodeInput: yunbeiReceiptInputDecoder,
    actions: yunbeiReceiptActions,
  },
  yunbei_sign: {
    identifier: 'yunbei_sign',
    route: '/yunbei/sign',
    execute: yunbeiSignModule,
    decodeInput: yunbeiSignInputDecoder,
    actions: yunbeiSignActions,
  },
  yunbei_task_finish: {
    identifier: 'yunbei_task_finish',
    route: '/yunbei/task/finish',
    execute: yunbeiTaskFinishModule,
    decodeInput: yunbeiTaskFinishInputDecoder,
    actions: yunbeiTaskFinishActions,
  },
  yunbei_tasks: {
    identifier: 'yunbei_tasks',
    route: '/yunbei/tasks',
    execute: yunbeiTasksModule,
    decodeInput: yunbeiTasksInputDecoder,
    actions: yunbeiTasksActions,
  },
  yunbei_tasks_todo: {
    identifier: 'yunbei_tasks_todo',
    route: '/yunbei/tasks/todo',
    execute: yunbeiTasksTodoModule,
    decodeInput: yunbeiTasksTodoInputDecoder,
    actions: yunbeiTasksTodoActions,
  },
  yunbei_today: {
    identifier: 'yunbei_today',
    route: '/yunbei/today',
    execute: yunbeiTodayModule,
    decodeInput: yunbeiTodayInputDecoder,
    actions: yunbeiTodayActions,
  },
};
