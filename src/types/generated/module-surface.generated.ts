import type { ModuleInput as activateInitProfileInput } from '../../modules/activate_init_profile.ts';
import type { ModuleInput as aidjContentRcmdInput } from '../../modules/aidj_content_rcmd.ts';
import type { ModuleInput as albumInput } from '../../modules/album.ts';
import type { ModuleInput as albumDetailInput } from '../../modules/album_detail.ts';
import type { ModuleInput as albumDetailDynamicInput } from '../../modules/album_detail_dynamic.ts';
import type { ModuleInput as albumListInput } from '../../modules/album_list.ts';
import type { ModuleInput as albumListStyleInput } from '../../modules/album_list_style.ts';
import type { ModuleInput as albumNewInput } from '../../modules/album_new.ts';
import type { ModuleInput as albumNewestInput } from '../../modules/album_newest.ts';
import type { ModuleInput as albumPrivilegeInput } from '../../modules/album_privilege.ts';
import type { ModuleInput as albumSongsaleboardInput } from '../../modules/album_songsaleboard.ts';
import type { ModuleInput as albumSubInput } from '../../modules/album_sub.ts';
import type { ModuleInput as albumSublistInput } from '../../modules/album_sublist.ts';
import type { ModuleInput as artistAlbumInput } from '../../modules/artist_album.ts';
import type { ModuleInput as artistDescInput } from '../../modules/artist_desc.ts';
import type { ModuleInput as artistDetailInput } from '../../modules/artist_detail.ts';
import type { ModuleInput as artistDetailDynamicInput } from '../../modules/artist_detail_dynamic.ts';
import type { ModuleInput as artistFansInput } from '../../modules/artist_fans.ts';
import type { ModuleInput as artistFollowCountInput } from '../../modules/artist_follow_count.ts';
import type { ModuleInput as artistListInput } from '../../modules/artist_list.ts';
import type { ModuleInput as artistMvInput } from '../../modules/artist_mv.ts';
import type { ModuleInput as artistNewMvInput } from '../../modules/artist_new_mv.ts';
import type { ModuleInput as artistNewSongInput } from '../../modules/artist_new_song.ts';
import type { ModuleInput as artistSongsInput } from '../../modules/artist_songs.ts';
import type { ModuleInput as artistSubInput } from '../../modules/artist_sub.ts';
import type { ModuleInput as artistSublistInput } from '../../modules/artist_sublist.ts';
import type { ModuleInput as artistTopSongInput } from '../../modules/artist_top_song.ts';
import type { ModuleInput as artistVideoInput } from '../../modules/artist_video.ts';
import type { ModuleInput as artistsInput } from '../../modules/artists.ts';
import type { ModuleInput as audioMatchInput } from '../../modules/audio_match.ts';
import type { ModuleInput as avatarUploadInput } from '../../modules/avatar_upload.ts';
import type { ModuleInput as bannerInput } from '../../modules/banner.ts';
import type { ModuleInput as batchInput } from '../../modules/batch.ts';
import type { ModuleInput as broadcastCategoryRegionGetInput } from '../../modules/broadcast_category_region_get.ts';
import type { ModuleInput as broadcastChannelCollectListInput } from '../../modules/broadcast_channel_collect_list.ts';
import type { ModuleInput as broadcastChannelCurrentinfoInput } from '../../modules/broadcast_channel_currentinfo.ts';
import type { ModuleInput as broadcastChannelListInput } from '../../modules/broadcast_channel_list.ts';
import type { ModuleInput as broadcastSubInput } from '../../modules/broadcast_sub.ts';
import type { ModuleInput as calendarInput } from '../../modules/calendar.ts';
import type {
  ModuleBody as captchaSentBody,
  ModuleInput as captchaSentInput,
} from '../../modules/captcha_sent.ts';
import type { ModuleInput as captchaVerifyInput } from '../../modules/captcha_verify.ts';
import type { ModuleInput as cellphoneExistenceCheckInput } from '../../modules/cellphone_existence_check.ts';
import type { ModuleInput as checkMusicInput } from '../../modules/check_music.ts';
import type { ModuleInput as cloudInput } from '../../modules/cloud.ts';
import type { ModuleInput as cloudImportInput } from '../../modules/cloud_import.ts';
import type { ModuleInput as cloudMatchInput } from '../../modules/cloud_match.ts';
import type { ModuleInput as cloudsearchInput } from '../../modules/cloudsearch.ts';
import type { ModuleInput as commentInput } from '../../modules/comment.ts';
import type { ModuleInput as commentAlbumInput } from '../../modules/comment_album.ts';
import type { ModuleInput as commentDjInput } from '../../modules/comment_dj.ts';
import type { ModuleInput as commentEventInput } from '../../modules/comment_event.ts';
import type { ModuleInput as commentFloorInput } from '../../modules/comment_floor.ts';
import type { ModuleInput as commentHotInput } from '../../modules/comment_hot.ts';
import type { ModuleInput as commentHugListInput } from '../../modules/comment_hug_list.ts';
import type { ModuleInput as commentLikeInput } from '../../modules/comment_like.ts';
import type { ModuleInput as commentMusicInput } from '../../modules/comment_music.ts';
import type { ModuleInput as commentMvInput } from '../../modules/comment_mv.ts';
import type { ModuleInput as commentNewInput } from '../../modules/comment_new.ts';
import type { ModuleInput as commentPlaylistInput } from '../../modules/comment_playlist.ts';
import type { ModuleInput as commentVideoInput } from '../../modules/comment_video.ts';
import type { ModuleInput as countriesCodeListInput } from '../../modules/countries_code_list.ts';
import type { ModuleInput as dailySigninInput } from '../../modules/daily_signin.ts';
import type { ModuleInput as digitalAlbumDetailInput } from '../../modules/digitalAlbum_detail.ts';
import type { ModuleInput as digitalAlbumOrderingInput } from '../../modules/digitalAlbum_ordering.ts';
import type { ModuleInput as digitalAlbumPurchasedInput } from '../../modules/digitalAlbum_purchased.ts';
import type { ModuleInput as digitalAlbumSalesInput } from '../../modules/digitalAlbum_sales.ts';
import type { ModuleInput as djBannerInput } from '../../modules/dj_banner.ts';
import type { ModuleInput as djCategoryExcludehotInput } from '../../modules/dj_category_excludehot.ts';
import type { ModuleInput as djCategoryRecommendInput } from '../../modules/dj_category_recommend.ts';
import type { ModuleInput as djCatelistInput } from '../../modules/dj_catelist.ts';
import type { ModuleInput as djDetailInput } from '../../modules/dj_detail.ts';
import type { ModuleInput as djDifmAllStyleChannelInput } from '../../modules/dj_difm_all_style_channel.ts';
import type { ModuleInput as djDifmChannelSubscribeInput } from '../../modules/dj_difm_channel_subscribe.ts';
import type { ModuleInput as djDifmChannelUnsubscribeInput } from '../../modules/dj_difm_channel_unsubscribe.ts';
import type { ModuleInput as djDifmPlayingTracksListInput } from '../../modules/dj_difm_playing_tracks_list.ts';
import type { ModuleInput as djDifmSubscribeChannelsGetInput } from '../../modules/dj_difm_subscribe_channels_get.ts';
import type { ModuleInput as djHotInput } from '../../modules/dj_hot.ts';
import type { ModuleInput as djPaygiftInput } from '../../modules/dj_paygift.ts';
import type { ModuleInput as djPersonalizeRecommendInput } from '../../modules/dj_personalize_recommend.ts';
import type { ModuleInput as djProgramInput } from '../../modules/dj_program.ts';
import type { ModuleInput as djProgramDetailInput } from '../../modules/dj_program_detail.ts';
import type { ModuleInput as djProgramToplistInput } from '../../modules/dj_program_toplist.ts';
import type { ModuleInput as djProgramToplistHoursInput } from '../../modules/dj_program_toplist_hours.ts';
import type { ModuleInput as djRadioHotInput } from '../../modules/dj_radio_hot.ts';
import type { ModuleInput as djRecommendInput } from '../../modules/dj_recommend.ts';
import type { ModuleInput as djRecommendTypeInput } from '../../modules/dj_recommend_type.ts';
import type { ModuleInput as djSubInput } from '../../modules/dj_sub.ts';
import type { ModuleInput as djSublistInput } from '../../modules/dj_sublist.ts';
import type { ModuleInput as djSubscriberInput } from '../../modules/dj_subscriber.ts';
import type { ModuleInput as djTodayPerferedInput } from '../../modules/dj_today_perfered.ts';
import type { ModuleInput as djToplistInput } from '../../modules/dj_toplist.ts';
import type { ModuleInput as djToplistHoursInput } from '../../modules/dj_toplist_hours.ts';
import type { ModuleInput as djToplistNewcomerInput } from '../../modules/dj_toplist_newcomer.ts';
import type { ModuleInput as djToplistPayInput } from '../../modules/dj_toplist_pay.ts';
import type { ModuleInput as djToplistPopularInput } from '../../modules/dj_toplist_popular.ts';
import type { ModuleInput as djRadioTopInput } from '../../modules/djRadio_top.ts';
import type { ModuleInput as eventInput } from '../../modules/event.ts';
import type { ModuleInput as eventDelInput } from '../../modules/event_del.ts';
import type { ModuleInput as eventForwardInput } from '../../modules/event_forward.ts';
import type { ModuleInput as fmTrashInput } from '../../modules/fm_trash.ts';
import type { ModuleInput as followInput } from '../../modules/follow.ts';
import type { ModuleInput as getUseridsInput } from '../../modules/get_userids.ts';
import type { ModuleInput as historyRecommendSongsInput } from '../../modules/history_recommend_songs.ts';
import type { ModuleInput as historyRecommendSongsDetailInput } from '../../modules/history_recommend_songs_detail.ts';
import type { ModuleInput as homepageBlockPageInput } from '../../modules/homepage_block_page.ts';
import type { ModuleInput as homepageDragonBallInput } from '../../modules/homepage_dragon_ball.ts';
import type { ModuleInput as hotTopicInput } from '../../modules/hot_topic.ts';
import type { ModuleInput as hugCommentInput } from '../../modules/hug_comment.ts';
import type {
  ModuleBody as imageUploadTokenBody,
  ModuleInput as imageUploadTokenInput,
} from '../../modules/image_upload_token.ts';
import type { ModuleInput as innerVersionInput } from '../../modules/inner_version.ts';
import type { ModuleInput as likeInput } from '../../modules/like.ts';
import type { ModuleInput as likelistInput } from '../../modules/likelist.ts';
import type { ModuleInput as listenDataRealtimeReportInput } from '../../modules/listen_data_realtime_report.ts';
import type { ModuleInput as listenDataReportInput } from '../../modules/listen_data_report.ts';
import type { ModuleInput as listenDataTodaySongInput } from '../../modules/listen_data_today_song.ts';
import type { ModuleInput as listenDataTotalInput } from '../../modules/listen_data_total.ts';
import type { ModuleInput as listenDataYearReportInput } from '../../modules/listen_data_year_report.ts';
import type { ModuleInput as listentogetherAcceptInput } from '../../modules/listentogether_accept.ts';
import type { ModuleInput as listentogetherEndInput } from '../../modules/listentogether_end.ts';
import type { ModuleInput as listentogetherHeatbeatInput } from '../../modules/listentogether_heatbeat.ts';
import type { ModuleInput as listentogetherPlayCommandInput } from '../../modules/listentogether_play_command.ts';
import type { ModuleInput as listentogetherRoomCheckInput } from '../../modules/listentogether_room_check.ts';
import type { ModuleInput as listentogetherRoomCreateInput } from '../../modules/listentogether_room_create.ts';
import type { ModuleInput as listentogetherStatusInput } from '../../modules/listentogether_status.ts';
import type { ModuleInput as listentogetherSyncListCommandInput } from '../../modules/listentogether_sync_list_command.ts';
import type { ModuleInput as listentogetherSyncPlaylistGetInput } from '../../modules/listentogether_sync_playlist_get.ts';
import type { ModuleInput as loginInput } from '../../modules/login.ts';
import type {
  ModuleBody as loginCellphoneBody,
  ModuleInput as loginCellphoneInput,
} from '../../modules/login_cellphone.ts';
import type {
  ModuleBody as loginQrCheckBody,
  ModuleInput as loginQrCheckInput,
} from '../../modules/login_qr_check.ts';
import type {
  ModuleBody as loginQrCreateBody,
  ModuleInput as loginQrCreateInput,
} from '../../modules/login_qr_create.ts';
import type {
  ModuleBody as loginQrKeyBody,
  ModuleInput as loginQrKeyInput,
} from '../../modules/login_qr_key.ts';
import type {
  ModuleBody as loginRefreshBody,
  ModuleInput as loginRefreshInput,
} from '../../modules/login_refresh.ts';
import type {
  ModuleBody as loginStatusBody,
  ModuleInput as loginStatusInput,
} from '../../modules/login_status.ts';
import type {
  ModuleBody as logoutBody,
  ModuleInput as logoutInput,
} from '../../modules/logout.ts';
import type { ModuleInput as lyricInput } from '../../modules/lyric.ts';
import type { ModuleInput as lyricNewInput } from '../../modules/lyric_new.ts';
import type { ModuleInput as mlogMusicRcmdInput } from '../../modules/mlog_music_rcmd.ts';
import type { ModuleInput as mlogToVideoInput } from '../../modules/mlog_to_video.ts';
import type { ModuleInput as mlogUrlInput } from '../../modules/mlog_url.ts';
import type { ModuleInput as msgCommentsInput } from '../../modules/msg_comments.ts';
import type { ModuleInput as msgForwardsInput } from '../../modules/msg_forwards.ts';
import type { ModuleInput as msgNoticesInput } from '../../modules/msg_notices.ts';
import type { ModuleInput as msgPrivateInput } from '../../modules/msg_private.ts';
import type { ModuleInput as msgPrivateHistoryInput } from '../../modules/msg_private_history.ts';
import type { ModuleInput as msgRecentcontactInput } from '../../modules/msg_recentcontact.ts';
import type { ModuleInput as musicFirstListenInfoInput } from '../../modules/music_first_listen_info.ts';
import type { ModuleInput as musicianCloudbeanInput } from '../../modules/musician_cloudbean.ts';
import type { ModuleInput as musicianCloudbeanObtainInput } from '../../modules/musician_cloudbean_obtain.ts';
import type { ModuleInput as musicianDataOverviewInput } from '../../modules/musician_data_overview.ts';
import type { ModuleInput as musicianPlayTrendInput } from '../../modules/musician_play_trend.ts';
import type { ModuleInput as musicianSignInput } from '../../modules/musician_sign.ts';
import type { ModuleInput as musicianTasksInput } from '../../modules/musician_tasks.ts';
import type { ModuleInput as musicianTasksNewInput } from '../../modules/musician_tasks_new.ts';
import type { ModuleInput as mvAllInput } from '../../modules/mv_all.ts';
import type { ModuleInput as mvDetailInput } from '../../modules/mv_detail.ts';
import type { ModuleInput as mvDetailInfoInput } from '../../modules/mv_detail_info.ts';
import type { ModuleInput as mvExclusiveRcmdInput } from '../../modules/mv_exclusive_rcmd.ts';
import type { ModuleInput as mvFirstInput } from '../../modules/mv_first.ts';
import type { ModuleInput as mvSubInput } from '../../modules/mv_sub.ts';
import type { ModuleInput as mvSublistInput } from '../../modules/mv_sublist.ts';
import type { ModuleInput as mvUrlInput } from '../../modules/mv_url.ts';
import type { ModuleInput as nicknameCheckInput } from '../../modules/nickname_check.ts';
import type { ModuleInput as personalFmInput } from '../../modules/personal_fm.ts';
import type { ModuleInput as personalFmModeInput } from '../../modules/personal_fm_mode.ts';
import type { ModuleInput as personalizedInput } from '../../modules/personalized.ts';
import type { ModuleInput as personalizedDjprogramInput } from '../../modules/personalized_djprogram.ts';
import type { ModuleInput as personalizedMvInput } from '../../modules/personalized_mv.ts';
import type { ModuleInput as personalizedNewsongInput } from '../../modules/personalized_newsong.ts';
import type { ModuleInput as personalizedPrivatecontentInput } from '../../modules/personalized_privatecontent.ts';
import type { ModuleInput as personalizedPrivatecontentListInput } from '../../modules/personalized_privatecontent_list.ts';
import type { ModuleInput as plCountInput } from '../../modules/pl_count.ts';
import type { ModuleInput as playlistCatlistInput } from '../../modules/playlist_catlist.ts';
import type { ModuleInput as playlistCoverUpdateInput } from '../../modules/playlist_cover_update.ts';
import type { ModuleInput as playlistCreateInput } from '../../modules/playlist_create.ts';
import type { ModuleInput as playlistDeleteInput } from '../../modules/playlist_delete.ts';
import type { ModuleInput as playlistDescUpdateInput } from '../../modules/playlist_desc_update.ts';
import type { ModuleInput as playlistDetailInput } from '../../modules/playlist_detail.ts';
import type { ModuleInput as playlistDetailDynamicInput } from '../../modules/playlist_detail_dynamic.ts';
import type { ModuleInput as playlistDetailRcmdGetInput } from '../../modules/playlist_detail_rcmd_get.ts';
import type { ModuleInput as playlistHighqualityTagsInput } from '../../modules/playlist_highquality_tags.ts';
import type { ModuleInput as playlistHotInput } from '../../modules/playlist_hot.ts';
import type { ModuleInput as playlistImportNameTaskCreateInput } from '../../modules/playlist_import_name_task_create.ts';
import type { ModuleInput as playlistImportTaskStatusInput } from '../../modules/playlist_import_task_status.ts';
import type { ModuleInput as playlistMylikeInput } from '../../modules/playlist_mylike.ts';
import type { ModuleInput as playlistNameUpdateInput } from '../../modules/playlist_name_update.ts';
import type { ModuleInput as playlistOrderUpdateInput } from '../../modules/playlist_order_update.ts';
import type { ModuleInput as playlistPrivacyInput } from '../../modules/playlist_privacy.ts';
import type { ModuleInput as playlistSubscribeInput } from '../../modules/playlist_subscribe.ts';
import type { ModuleInput as playlistSubscribersInput } from '../../modules/playlist_subscribers.ts';
import type { ModuleInput as playlistTagsUpdateInput } from '../../modules/playlist_tags_update.ts';
import type { ModuleInput as playlistTrackAddInput } from '../../modules/playlist_track_add.ts';
import type { ModuleInput as playlistTrackAllInput } from '../../modules/playlist_track_all.ts';
import type { ModuleInput as playlistTrackDeleteInput } from '../../modules/playlist_track_delete.ts';
import type { ModuleInput as playlistTracksInput } from '../../modules/playlist_tracks.ts';
import type { ModuleInput as playlistUpdateInput } from '../../modules/playlist_update.ts';
import type { ModuleInput as playlistUpdatePlaycountInput } from '../../modules/playlist_update_playcount.ts';
import type { ModuleInput as playlistVideoRecentInput } from '../../modules/playlist_video_recent.ts';
import type { ModuleInput as playmodeIntelligenceListInput } from '../../modules/playmode_intelligence_list.ts';
import type { ModuleInput as programRecommendInput } from '../../modules/program_recommend.ts';
import type { ModuleInput as rebindInput } from '../../modules/rebind.ts';
import type { ModuleInput as recentListenListInput } from '../../modules/recent_listen_list.ts';
import type { ModuleInput as recommendResourceInput } from '../../modules/recommend_resource.ts';
import type { ModuleInput as recommendSongsInput } from '../../modules/recommend_songs.ts';
import type { ModuleInput as recommendSongsDislikeInput } from '../../modules/recommend_songs_dislike.ts';
import type { ModuleInput as recordRecentAlbumInput } from '../../modules/record_recent_album.ts';
import type { ModuleInput as recordRecentDjInput } from '../../modules/record_recent_dj.ts';
import type { ModuleInput as recordRecentPlaylistInput } from '../../modules/record_recent_playlist.ts';
import type { ModuleInput as recordRecentSongInput } from '../../modules/record_recent_song.ts';
import type { ModuleInput as recordRecentVideoInput } from '../../modules/record_recent_video.ts';
import type { ModuleInput as recordRecentVoiceInput } from '../../modules/record_recent_voice.ts';
import type { ModuleInput as registerAnonimousInput } from '../../modules/register_anonimous.ts';
import type { ModuleInput as registerCellphoneInput } from '../../modules/register_cellphone.ts';
import type { ModuleInput as relatedAllvideoInput } from '../../modules/related_allvideo.ts';
import type { ModuleInput as relatedPlaylistInput } from '../../modules/related_playlist.ts';
import type { ModuleInput as resourceLikeInput } from '../../modules/resource_like.ts';
import type { ModuleInput as scrobbleInput } from '../../modules/scrobble.ts';
import type { ModuleInput as searchInput } from '../../modules/search.ts';
import type { ModuleInput as searchDefaultInput } from '../../modules/search_default.ts';
import type { ModuleInput as searchHotInput } from '../../modules/search_hot.ts';
import type { ModuleInput as searchHotDetailInput } from '../../modules/search_hot_detail.ts';
import type { ModuleInput as searchMatchInput } from '../../modules/search_match.ts';
import type { ModuleInput as searchMultimatchInput } from '../../modules/search_multimatch.ts';
import type { ModuleInput as searchSuggestInput } from '../../modules/search_suggest.ts';
import type { ModuleInput as sendAlbumInput } from '../../modules/send_album.ts';
import type { ModuleInput as sendPlaylistInput } from '../../modules/send_playlist.ts';
import type { ModuleInput as sendSongInput } from '../../modules/send_song.ts';
import type { ModuleInput as sendTextInput } from '../../modules/send_text.ts';
import type { ModuleInput as settingInput } from '../../modules/setting.ts';
import type { ModuleInput as shareResourceInput } from '../../modules/share_resource.ts';
import type { ModuleInput as sheetListInput } from '../../modules/sheet_list.ts';
import type { ModuleInput as sheetPreviewInput } from '../../modules/sheet_preview.ts';
import type { ModuleInput as signHappyInfoInput } from '../../modules/sign_happy_info.ts';
import type { ModuleInput as signinProgressInput } from '../../modules/signin_progress.ts';
import type { ModuleInput as simiArtistInput } from '../../modules/simi_artist.ts';
import type { ModuleInput as simiMvInput } from '../../modules/simi_mv.ts';
import type { ModuleInput as simiPlaylistInput } from '../../modules/simi_playlist.ts';
import type { ModuleInput as simiSongInput } from '../../modules/simi_song.ts';
import type { ModuleInput as simiUserInput } from '../../modules/simi_user.ts';
import type { ModuleInput as songChorusInput } from '../../modules/song_chorus.ts';
import type { ModuleInput as songDetailInput } from '../../modules/song_detail.ts';
import type { ModuleInput as songDownlistInput } from '../../modules/song_downlist.ts';
import type { ModuleInput as songDownloadUrlInput } from '../../modules/song_download_url.ts';
import type { ModuleInput as songDownloadUrlV1Input } from '../../modules/song_download_url_v1.ts';
import type { ModuleInput as songDynamicCoverInput } from '../../modules/song_dynamic_cover.ts';
import type { ModuleInput as songLikeCheckInput } from '../../modules/song_like_check.ts';
import type { ModuleInput as songLyricsMarkInput } from '../../modules/song_lyrics_mark.ts';
import type { ModuleInput as songLyricsMarkAddInput } from '../../modules/song_lyrics_mark_add.ts';
import type { ModuleInput as songLyricsMarkDelInput } from '../../modules/song_lyrics_mark_del.ts';
import type { ModuleInput as songLyricsMarkUserPageInput } from '../../modules/song_lyrics_mark_user_page.ts';
import type { ModuleInput as songMonthdownlistInput } from '../../modules/song_monthdownlist.ts';
import type { ModuleInput as songMusicDetailInput } from '../../modules/song_music_detail.ts';
import type { ModuleInput as songOrderUpdateInput } from '../../modules/song_order_update.ts';
import type { ModuleInput as songPurchasedInput } from '../../modules/song_purchased.ts';
import type { ModuleInput as songRedCountInput } from '../../modules/song_red_count.ts';
import type { ModuleInput as songSingledownlistInput } from '../../modules/song_singledownlist.ts';
import type { ModuleInput as songUrlInput } from '../../modules/song_url.ts';
import type { ModuleInput as songUrlV1Input } from '../../modules/song_url_v1.ts';
import type { ModuleInput as songWikiSummaryInput } from '../../modules/song_wiki_summary.ts';
import type { ModuleInput as starpickCommentsSummaryInput } from '../../modules/starpick_comments_summary.ts';
import type { ModuleInput as styleAlbumInput } from '../../modules/style_album.ts';
import type { ModuleInput as styleArtistInput } from '../../modules/style_artist.ts';
import type { ModuleInput as styleDetailInput } from '../../modules/style_detail.ts';
import type { ModuleInput as styleListInput } from '../../modules/style_list.ts';
import type { ModuleInput as stylePlaylistInput } from '../../modules/style_playlist.ts';
import type { ModuleInput as stylePreferenceInput } from '../../modules/style_preference.ts';
import type { ModuleInput as styleSongInput } from '../../modules/style_song.ts';
import type { ModuleInput as summaryAnnualInput } from '../../modules/summary_annual.ts';
import type { ModuleInput as topAlbumInput } from '../../modules/top_album.ts';
import type { ModuleInput as topArtistsInput } from '../../modules/top_artists.ts';
import type { ModuleInput as topListInput } from '../../modules/top_list.ts';
import type { ModuleInput as topMvInput } from '../../modules/top_mv.ts';
import type { ModuleInput as topPlaylistInput } from '../../modules/top_playlist.ts';
import type { ModuleInput as topPlaylistHighqualityInput } from '../../modules/top_playlist_highquality.ts';
import type { ModuleInput as topSongInput } from '../../modules/top_song.ts';
import type { ModuleInput as topicDetailInput } from '../../modules/topic_detail.ts';
import type { ModuleInput as topicDetailEventHotInput } from '../../modules/topic_detail_event_hot.ts';
import type { ModuleInput as topicSublistInput } from '../../modules/topic_sublist.ts';
import type { ModuleInput as toplistInput } from '../../modules/toplist.ts';
import type { ModuleInput as toplistArtistInput } from '../../modules/toplist_artist.ts';
import type { ModuleInput as toplistDetailInput } from '../../modules/toplist_detail.ts';
import type { ModuleInput as ugcAlbumGetInput } from '../../modules/ugc_album_get.ts';
import type { ModuleInput as ugcArtistGetInput } from '../../modules/ugc_artist_get.ts';
import type { ModuleInput as ugcArtistSearchInput } from '../../modules/ugc_artist_search.ts';
import type { ModuleInput as ugcDetailInput } from '../../modules/ugc_detail.ts';
import type { ModuleInput as ugcMvGetInput } from '../../modules/ugc_mv_get.ts';
import type { ModuleInput as ugcSongGetInput } from '../../modules/ugc_song_get.ts';
import type { ModuleInput as ugcUserDevoteInput } from '../../modules/ugc_user_devote.ts';
import type {
  ModuleBody as userAccountBody,
  ModuleInput as userAccountInput,
} from '../../modules/user_account.ts';
import type { ModuleInput as userAudioInput } from '../../modules/user_audio.ts';
import type { ModuleInput as userBindingInput } from '../../modules/user_binding.ts';
import type { ModuleInput as userCloudInput } from '../../modules/user_cloud.ts';
import type { ModuleInput as userCloudDelInput } from '../../modules/user_cloud_del.ts';
import type { ModuleInput as userCloudDetailInput } from '../../modules/user_cloud_detail.ts';
import type { ModuleInput as userCommentHistoryInput } from '../../modules/user_comment_history.ts';
import type {
  ModuleBody as userDetailBody,
  ModuleInput as userDetailInput,
} from '../../modules/user_detail.ts';
import type { ModuleInput as userDjInput } from '../../modules/user_dj.ts';
import type { ModuleInput as userEventInput } from '../../modules/user_event.ts';
import type { ModuleInput as userFollowMixedInput } from '../../modules/user_follow_mixed.ts';
import type { ModuleInput as userFollowedsInput } from '../../modules/user_followeds.ts';
import type { ModuleInput as userFollowsInput } from '../../modules/user_follows.ts';
import type { ModuleInput as userLevelInput } from '../../modules/user_level.ts';
import type { ModuleInput as userMedalInput } from '../../modules/user_medal.ts';
import type { ModuleInput as userMutualfollowGetInput } from '../../modules/user_mutualfollow_get.ts';
import type { ModuleInput as userPlaylistInput } from '../../modules/user_playlist.ts';
import type { ModuleInput as userPlaylistCollectInput } from '../../modules/user_playlist_collect.ts';
import type { ModuleInput as userPlaylistCreateInput } from '../../modules/user_playlist_create.ts';
import type { ModuleInput as userRecordInput } from '../../modules/user_record.ts';
import type { ModuleInput as userReplacephoneInput } from '../../modules/user_replacephone.ts';
import type { ModuleInput as userSocialStatusInput } from '../../modules/user_social_status.ts';
import type { ModuleInput as userSocialStatusEditInput } from '../../modules/user_social_status_edit.ts';
import type { ModuleInput as userSocialStatusRcmdInput } from '../../modules/user_social_status_rcmd.ts';
import type { ModuleInput as userSocialStatusSupportInput } from '../../modules/user_social_status_support.ts';
import type { ModuleInput as userSubcountInput } from '../../modules/user_subcount.ts';
import type { ModuleInput as userUpdateInput } from '../../modules/user_update.ts';
import type {
  ModuleBody as verifyGetQrBody,
  ModuleInput as verifyGetQrInput,
} from '../../modules/verify_getQr.ts';
import type { ModuleInput as verifyQrcodestatusInput } from '../../modules/verify_qrcodestatus.ts';
import type { ModuleInput as videoCategoryListInput } from '../../modules/video_category_list.ts';
import type { ModuleInput as videoDetailInput } from '../../modules/video_detail.ts';
import type { ModuleInput as videoDetailInfoInput } from '../../modules/video_detail_info.ts';
import type { ModuleInput as videoGroupInput } from '../../modules/video_group.ts';
import type { ModuleInput as videoGroupListInput } from '../../modules/video_group_list.ts';
import type { ModuleInput as videoSubInput } from '../../modules/video_sub.ts';
import type { ModuleInput as videoTimelineAllInput } from '../../modules/video_timeline_all.ts';
import type { ModuleInput as videoTimelineRecommendInput } from '../../modules/video_timeline_recommend.ts';
import type { ModuleInput as videoUrlInput } from '../../modules/video_url.ts';
import type { ModuleInput as vipGrowthpointInput } from '../../modules/vip_growthpoint.ts';
import type { ModuleInput as vipGrowthpointDetailsInput } from '../../modules/vip_growthpoint_details.ts';
import type { ModuleInput as vipGrowthpointGetInput } from '../../modules/vip_growthpoint_get.ts';
import type { ModuleInput as vipInfoInput } from '../../modules/vip_info.ts';
import type { ModuleInput as vipInfoV2Input } from '../../modules/vip_info_v2.ts';
import type { ModuleInput as vipTasksInput } from '../../modules/vip_tasks.ts';
import type { ModuleInput as vipTimemachineInput } from '../../modules/vip_timemachine.ts';
import type { ModuleInput as voiceDeleteInput } from '../../modules/voice_delete.ts';
import type { ModuleInput as voiceDetailInput } from '../../modules/voice_detail.ts';
import type { ModuleInput as voiceLyricInput } from '../../modules/voice_lyric.ts';
import type { ModuleInput as voiceUploadInput } from '../../modules/voice_upload.ts';
import type { ModuleInput as voicelistDetailInput } from '../../modules/voicelist_detail.ts';
import type { ModuleInput as voicelistListInput } from '../../modules/voicelist_list.ts';
import type { ModuleInput as voicelistListSearchInput } from '../../modules/voicelist_list_search.ts';
import type { ModuleInput as voicelistSearchInput } from '../../modules/voicelist_search.ts';
import type { ModuleInput as voicelistTransInput } from '../../modules/voicelist_trans.ts';
import type { ModuleInput as yunbeiInput } from '../../modules/yunbei.ts';
import type { ModuleInput as yunbeiExpenseInput } from '../../modules/yunbei_expense.ts';
import type { ModuleInput as yunbeiInfoInput } from '../../modules/yunbei_info.ts';
import type { ModuleInput as yunbeiRcmdSongInput } from '../../modules/yunbei_rcmd_song.ts';
import type { ModuleInput as yunbeiRcmdSongHistoryInput } from '../../modules/yunbei_rcmd_song_history.ts';
import type { ModuleInput as yunbeiReceiptInput } from '../../modules/yunbei_receipt.ts';
import type { ModuleInput as yunbeiSignInput } from '../../modules/yunbei_sign.ts';
import type { ModuleInput as yunbeiTaskFinishInput } from '../../modules/yunbei_task_finish.ts';
import type { ModuleInput as yunbeiTasksInput } from '../../modules/yunbei_tasks.ts';
import type { ModuleInput as yunbeiTasksTodoInput } from '../../modules/yunbei_tasks_todo.ts';
import type { ModuleInput as yunbeiTodayInput } from '../../modules/yunbei_today.ts';
import type { ModuleResponse } from '../runtime.ts';

export const generatedModuleIdentifiers = [
  'activate_init_profile',
  'aidj_content_rcmd',
  'album',
  'album_detail',
  'album_detail_dynamic',
  'album_list',
  'album_list_style',
  'album_new',
  'album_newest',
  'album_privilege',
  'album_songsaleboard',
  'album_sub',
  'album_sublist',
  'artist_album',
  'artist_desc',
  'artist_detail',
  'artist_detail_dynamic',
  'artist_fans',
  'artist_follow_count',
  'artist_list',
  'artist_mv',
  'artist_new_mv',
  'artist_new_song',
  'artist_songs',
  'artist_sub',
  'artist_sublist',
  'artist_top_song',
  'artist_video',
  'artists',
  'audio_match',
  'avatar_upload',
  'banner',
  'batch',
  'broadcast_category_region_get',
  'broadcast_channel_collect_list',
  'broadcast_channel_currentinfo',
  'broadcast_channel_list',
  'broadcast_sub',
  'calendar',
  'captcha_sent',
  'captcha_verify',
  'cellphone_existence_check',
  'check_music',
  'cloud',
  'cloud_import',
  'cloud_match',
  'cloudsearch',
  'comment',
  'comment_album',
  'comment_dj',
  'comment_event',
  'comment_floor',
  'comment_hot',
  'comment_hug_list',
  'comment_like',
  'comment_music',
  'comment_mv',
  'comment_new',
  'comment_playlist',
  'comment_video',
  'countries_code_list',
  'daily_signin',
  'digitalAlbum_detail',
  'digitalAlbum_ordering',
  'digitalAlbum_purchased',
  'digitalAlbum_sales',
  'dj_banner',
  'dj_category_excludehot',
  'dj_category_recommend',
  'dj_catelist',
  'dj_detail',
  'dj_difm_all_style_channel',
  'dj_difm_channel_subscribe',
  'dj_difm_channel_unsubscribe',
  'dj_difm_playing_tracks_list',
  'dj_difm_subscribe_channels_get',
  'dj_hot',
  'dj_paygift',
  'dj_personalize_recommend',
  'dj_program',
  'dj_program_detail',
  'dj_program_toplist',
  'dj_program_toplist_hours',
  'dj_radio_hot',
  'dj_recommend',
  'dj_recommend_type',
  'dj_sub',
  'dj_sublist',
  'dj_subscriber',
  'dj_today_perfered',
  'dj_toplist',
  'dj_toplist_hours',
  'dj_toplist_newcomer',
  'dj_toplist_pay',
  'dj_toplist_popular',
  'djRadio_top',
  'event',
  'event_del',
  'event_forward',
  'fm_trash',
  'follow',
  'get_userids',
  'history_recommend_songs',
  'history_recommend_songs_detail',
  'homepage_block_page',
  'homepage_dragon_ball',
  'hot_topic',
  'hug_comment',
  'image_upload_token',
  'inner_version',
  'like',
  'likelist',
  'listen_data_realtime_report',
  'listen_data_report',
  'listen_data_today_song',
  'listen_data_total',
  'listen_data_year_report',
  'listentogether_accept',
  'listentogether_end',
  'listentogether_heatbeat',
  'listentogether_play_command',
  'listentogether_room_check',
  'listentogether_room_create',
  'listentogether_status',
  'listentogether_sync_list_command',
  'listentogether_sync_playlist_get',
  'login',
  'login_cellphone',
  'login_qr_check',
  'login_qr_create',
  'login_qr_key',
  'login_refresh',
  'login_status',
  'logout',
  'lyric',
  'lyric_new',
  'mlog_music_rcmd',
  'mlog_to_video',
  'mlog_url',
  'msg_comments',
  'msg_forwards',
  'msg_notices',
  'msg_private',
  'msg_private_history',
  'msg_recentcontact',
  'music_first_listen_info',
  'musician_cloudbean',
  'musician_cloudbean_obtain',
  'musician_data_overview',
  'musician_play_trend',
  'musician_sign',
  'musician_tasks',
  'musician_tasks_new',
  'mv_all',
  'mv_detail',
  'mv_detail_info',
  'mv_exclusive_rcmd',
  'mv_first',
  'mv_sub',
  'mv_sublist',
  'mv_url',
  'nickname_check',
  'personal_fm',
  'personal_fm_mode',
  'personalized',
  'personalized_djprogram',
  'personalized_mv',
  'personalized_newsong',
  'personalized_privatecontent',
  'personalized_privatecontent_list',
  'pl_count',
  'playlist_catlist',
  'playlist_cover_update',
  'playlist_create',
  'playlist_delete',
  'playlist_desc_update',
  'playlist_detail',
  'playlist_detail_dynamic',
  'playlist_detail_rcmd_get',
  'playlist_highquality_tags',
  'playlist_hot',
  'playlist_import_name_task_create',
  'playlist_import_task_status',
  'playlist_mylike',
  'playlist_name_update',
  'playlist_order_update',
  'playlist_privacy',
  'playlist_subscribe',
  'playlist_subscribers',
  'playlist_tags_update',
  'playlist_track_add',
  'playlist_track_all',
  'playlist_track_delete',
  'playlist_tracks',
  'playlist_update',
  'playlist_update_playcount',
  'playlist_video_recent',
  'playmode_intelligence_list',
  'program_recommend',
  'rebind',
  'recent_listen_list',
  'recommend_resource',
  'recommend_songs',
  'recommend_songs_dislike',
  'record_recent_album',
  'record_recent_dj',
  'record_recent_playlist',
  'record_recent_song',
  'record_recent_video',
  'record_recent_voice',
  'register_anonimous',
  'register_cellphone',
  'related_allvideo',
  'related_playlist',
  'resource_like',
  'scrobble',
  'search',
  'search_default',
  'search_hot',
  'search_hot_detail',
  'search_match',
  'search_multimatch',
  'search_suggest',
  'send_album',
  'send_playlist',
  'send_song',
  'send_text',
  'setting',
  'share_resource',
  'sheet_list',
  'sheet_preview',
  'sign_happy_info',
  'signin_progress',
  'simi_artist',
  'simi_mv',
  'simi_playlist',
  'simi_song',
  'simi_user',
  'song_chorus',
  'song_detail',
  'song_downlist',
  'song_download_url',
  'song_download_url_v1',
  'song_dynamic_cover',
  'song_like_check',
  'song_lyrics_mark',
  'song_lyrics_mark_add',
  'song_lyrics_mark_del',
  'song_lyrics_mark_user_page',
  'song_monthdownlist',
  'song_music_detail',
  'song_order_update',
  'song_purchased',
  'song_red_count',
  'song_singledownlist',
  'song_url',
  'song_url_v1',
  'song_wiki_summary',
  'starpick_comments_summary',
  'style_album',
  'style_artist',
  'style_detail',
  'style_list',
  'style_playlist',
  'style_preference',
  'style_song',
  'summary_annual',
  'top_album',
  'top_artists',
  'top_list',
  'top_mv',
  'top_playlist',
  'top_playlist_highquality',
  'top_song',
  'topic_detail',
  'topic_detail_event_hot',
  'topic_sublist',
  'toplist',
  'toplist_artist',
  'toplist_detail',
  'ugc_album_get',
  'ugc_artist_get',
  'ugc_artist_search',
  'ugc_detail',
  'ugc_mv_get',
  'ugc_song_get',
  'ugc_user_devote',
  'user_account',
  'user_audio',
  'user_binding',
  'user_cloud',
  'user_cloud_del',
  'user_cloud_detail',
  'user_comment_history',
  'user_detail',
  'user_dj',
  'user_event',
  'user_follow_mixed',
  'user_followeds',
  'user_follows',
  'user_level',
  'user_medal',
  'user_mutualfollow_get',
  'user_playlist',
  'user_playlist_collect',
  'user_playlist_create',
  'user_record',
  'user_replacephone',
  'user_social_status',
  'user_social_status_edit',
  'user_social_status_rcmd',
  'user_social_status_support',
  'user_subcount',
  'user_update',
  'verify_getQr',
  'verify_qrcodestatus',
  'video_category_list',
  'video_detail',
  'video_detail_info',
  'video_group',
  'video_group_list',
  'video_sub',
  'video_timeline_all',
  'video_timeline_recommend',
  'video_url',
  'vip_growthpoint',
  'vip_growthpoint_details',
  'vip_growthpoint_get',
  'vip_info',
  'vip_info_v2',
  'vip_tasks',
  'vip_timemachine',
  'voice_delete',
  'voice_detail',
  'voice_lyric',
  'voice_upload',
  'voicelist_detail',
  'voicelist_list',
  'voicelist_list_search',
  'voicelist_search',
  'voicelist_trans',
  'yunbei',
  'yunbei_expense',
  'yunbei_info',
  'yunbei_rcmd_song',
  'yunbei_rcmd_song_history',
  'yunbei_receipt',
  'yunbei_sign',
  'yunbei_task_finish',
  'yunbei_tasks',
  'yunbei_tasks_todo',
  'yunbei_today',
] as const;

export type GeneratedModuleIdentifier =
  (typeof generatedModuleIdentifiers)[number];

export const generatedModuleRoutes = {
  activate_init_profile: '/activate/init/profile',
  aidj_content_rcmd: '/aidj/content/rcmd',
  album: '/album',
  album_detail: '/album/detail',
  album_detail_dynamic: '/album/detail/dynamic',
  album_list: '/album/list',
  album_list_style: '/album/list/style',
  album_new: '/album/new',
  album_newest: '/album/newest',
  album_privilege: '/album/privilege',
  album_songsaleboard: '/album/songsaleboard',
  album_sub: '/album/sub',
  album_sublist: '/album/sublist',
  artist_album: '/artist/album',
  artist_desc: '/artist/desc',
  artist_detail: '/artist/detail',
  artist_detail_dynamic: '/artist/detail/dynamic',
  artist_fans: '/artist/fans',
  artist_follow_count: '/artist/follow/count',
  artist_list: '/artist/list',
  artist_mv: '/artist/mv',
  artist_new_mv: '/artist/new/mv',
  artist_new_song: '/artist/new/song',
  artist_songs: '/artist/songs',
  artist_sub: '/artist/sub',
  artist_sublist: '/artist/sublist',
  artist_top_song: '/artist/top/song',
  artist_video: '/artist/video',
  artists: '/artists',
  audio_match: '/audio/match',
  avatar_upload: '/avatar/upload',
  banner: '/banner',
  batch: '/batch',
  broadcast_category_region_get: '/broadcast/category/region/get',
  broadcast_channel_collect_list: '/broadcast/channel/collect/list',
  broadcast_channel_currentinfo: '/broadcast/channel/currentinfo',
  broadcast_channel_list: '/broadcast/channel/list',
  broadcast_sub: '/broadcast/sub',
  calendar: '/calendar',
  captcha_sent: '/captcha/sent',
  captcha_verify: '/captcha/verify',
  cellphone_existence_check: '/cellphone/existence/check',
  check_music: '/check/music',
  cloud: '/cloud',
  cloud_import: '/cloud/import',
  cloud_match: '/cloud/match',
  cloudsearch: '/cloudsearch',
  comment: '/comment',
  comment_album: '/comment/album',
  comment_dj: '/comment/dj',
  comment_event: '/comment/event',
  comment_floor: '/comment/floor',
  comment_hot: '/comment/hot',
  comment_hug_list: '/comment/hug/list',
  comment_like: '/comment/like',
  comment_music: '/comment/music',
  comment_mv: '/comment/mv',
  comment_new: '/comment/new',
  comment_playlist: '/comment/playlist',
  comment_video: '/comment/video',
  countries_code_list: '/countries/code/list',
  daily_signin: '/daily_signin',
  digitalAlbum_detail: '/digitalAlbum/detail',
  digitalAlbum_ordering: '/digitalAlbum/ordering',
  digitalAlbum_purchased: '/digitalAlbum/purchased',
  digitalAlbum_sales: '/digitalAlbum/sales',
  dj_banner: '/dj/banner',
  dj_category_excludehot: '/dj/category/excludehot',
  dj_category_recommend: '/dj/category/recommend',
  dj_catelist: '/dj/catelist',
  dj_detail: '/dj/detail',
  dj_difm_all_style_channel: '/dj/difm/all/style/channel',
  dj_difm_channel_subscribe: '/dj/difm/channel/subscribe',
  dj_difm_channel_unsubscribe: '/dj/difm/channel/unsubscribe',
  dj_difm_playing_tracks_list: '/dj/difm/playing/tracks/list',
  dj_difm_subscribe_channels_get: '/dj/difm/subscribe/channels/get',
  dj_hot: '/dj/hot',
  dj_paygift: '/dj/paygift',
  dj_personalize_recommend: '/dj/personalize/recommend',
  dj_program: '/dj/program',
  dj_program_detail: '/dj/program/detail',
  dj_program_toplist: '/dj/program/toplist',
  dj_program_toplist_hours: '/dj/program/toplist/hours',
  dj_radio_hot: '/dj/radio/hot',
  dj_recommend: '/dj/recommend',
  dj_recommend_type: '/dj/recommend/type',
  dj_sub: '/dj/sub',
  dj_sublist: '/dj/sublist',
  dj_subscriber: '/dj/subscriber',
  dj_today_perfered: '/dj/today/perfered',
  dj_toplist: '/dj/toplist',
  dj_toplist_hours: '/dj/toplist/hours',
  dj_toplist_newcomer: '/dj/toplist/newcomer',
  dj_toplist_pay: '/dj/toplist/pay',
  dj_toplist_popular: '/dj/toplist/popular',
  djRadio_top: '/djRadio/top',
  event: '/event',
  event_del: '/event/del',
  event_forward: '/event/forward',
  fm_trash: '/fm_trash',
  follow: '/follow',
  get_userids: '/get/userids',
  history_recommend_songs: '/history/recommend/songs',
  history_recommend_songs_detail: '/history/recommend/songs/detail',
  homepage_block_page: '/homepage/block/page',
  homepage_dragon_ball: '/homepage/dragon/ball',
  hot_topic: '/hot/topic',
  hug_comment: '/hug/comment',
  image_upload_token: '/image/upload/token',
  inner_version: '/inner/version',
  like: '/like',
  likelist: '/likelist',
  listen_data_realtime_report: '/listen/data/realtime/report',
  listen_data_report: '/listen/data/report',
  listen_data_today_song: '/listen/data/today/song',
  listen_data_total: '/listen/data/total',
  listen_data_year_report: '/listen/data/year/report',
  listentogether_accept: '/listentogether/accept',
  listentogether_end: '/listentogether/end',
  listentogether_heatbeat: '/listentogether/heatbeat',
  listentogether_play_command: '/listentogether/play/command',
  listentogether_room_check: '/listentogether/room/check',
  listentogether_room_create: '/listentogether/room/create',
  listentogether_status: '/listentogether/status',
  listentogether_sync_list_command: '/listentogether/sync/list/command',
  listentogether_sync_playlist_get: '/listentogether/sync/playlist/get',
  login: '/login',
  login_cellphone: '/login/cellphone',
  login_qr_check: '/login/qr/check',
  login_qr_create: '/login/qr/create',
  login_qr_key: '/login/qr/key',
  login_refresh: '/login/refresh',
  login_status: '/login/status',
  logout: '/logout',
  lyric: '/lyric',
  lyric_new: '/lyric/new',
  mlog_music_rcmd: '/mlog/music/rcmd',
  mlog_to_video: '/mlog/to/video',
  mlog_url: '/mlog/url',
  msg_comments: '/msg/comments',
  msg_forwards: '/msg/forwards',
  msg_notices: '/msg/notices',
  msg_private: '/msg/private',
  msg_private_history: '/msg/private/history',
  msg_recentcontact: '/msg/recentcontact',
  music_first_listen_info: '/music/first/listen/info',
  musician_cloudbean: '/musician/cloudbean',
  musician_cloudbean_obtain: '/musician/cloudbean/obtain',
  musician_data_overview: '/musician/data/overview',
  musician_play_trend: '/musician/play/trend',
  musician_sign: '/musician/sign',
  musician_tasks: '/musician/tasks',
  musician_tasks_new: '/musician/tasks/new',
  mv_all: '/mv/all',
  mv_detail: '/mv/detail',
  mv_detail_info: '/mv/detail/info',
  mv_exclusive_rcmd: '/mv/exclusive/rcmd',
  mv_first: '/mv/first',
  mv_sub: '/mv/sub',
  mv_sublist: '/mv/sublist',
  mv_url: '/mv/url',
  nickname_check: '/nickname/check',
  personal_fm: '/personal_fm',
  personal_fm_mode: '/personal/fm/mode',
  personalized: '/personalized',
  personalized_djprogram: '/personalized/djprogram',
  personalized_mv: '/personalized/mv',
  personalized_newsong: '/personalized/newsong',
  personalized_privatecontent: '/personalized/privatecontent',
  personalized_privatecontent_list: '/personalized/privatecontent/list',
  pl_count: '/pl/count',
  playlist_catlist: '/playlist/catlist',
  playlist_cover_update: '/playlist/cover/update',
  playlist_create: '/playlist/create',
  playlist_delete: '/playlist/delete',
  playlist_desc_update: '/playlist/desc/update',
  playlist_detail: '/playlist/detail',
  playlist_detail_dynamic: '/playlist/detail/dynamic',
  playlist_detail_rcmd_get: '/playlist/detail/rcmd/get',
  playlist_highquality_tags: '/playlist/highquality/tags',
  playlist_hot: '/playlist/hot',
  playlist_import_name_task_create: '/playlist/import/name/task/create',
  playlist_import_task_status: '/playlist/import/task/status',
  playlist_mylike: '/playlist/mylike',
  playlist_name_update: '/playlist/name/update',
  playlist_order_update: '/playlist/order/update',
  playlist_privacy: '/playlist/privacy',
  playlist_subscribe: '/playlist/subscribe',
  playlist_subscribers: '/playlist/subscribers',
  playlist_tags_update: '/playlist/tags/update',
  playlist_track_add: '/playlist/track/add',
  playlist_track_all: '/playlist/track/all',
  playlist_track_delete: '/playlist/track/delete',
  playlist_tracks: '/playlist/tracks',
  playlist_update: '/playlist/update',
  playlist_update_playcount: '/playlist/update/playcount',
  playlist_video_recent: '/playlist/video/recent',
  playmode_intelligence_list: '/playmode/intelligence/list',
  program_recommend: '/program/recommend',
  rebind: '/rebind',
  recent_listen_list: '/recent/listen/list',
  recommend_resource: '/recommend/resource',
  recommend_songs: '/recommend/songs',
  recommend_songs_dislike: '/recommend/songs/dislike',
  record_recent_album: '/record/recent/album',
  record_recent_dj: '/record/recent/dj',
  record_recent_playlist: '/record/recent/playlist',
  record_recent_song: '/record/recent/song',
  record_recent_video: '/record/recent/video',
  record_recent_voice: '/record/recent/voice',
  register_anonimous: '/register/anonimous',
  register_cellphone: '/register/cellphone',
  related_allvideo: '/related/allvideo',
  related_playlist: '/related/playlist',
  resource_like: '/resource/like',
  scrobble: '/scrobble',
  search: '/search',
  search_default: '/search/default',
  search_hot: '/search/hot',
  search_hot_detail: '/search/hot/detail',
  search_match: '/search/match',
  search_multimatch: '/search/multimatch',
  search_suggest: '/search/suggest',
  send_album: '/send/album',
  send_playlist: '/send/playlist',
  send_song: '/send/song',
  send_text: '/send/text',
  setting: '/setting',
  share_resource: '/share/resource',
  sheet_list: '/sheet/list',
  sheet_preview: '/sheet/preview',
  sign_happy_info: '/sign/happy/info',
  signin_progress: '/signin/progress',
  simi_artist: '/simi/artist',
  simi_mv: '/simi/mv',
  simi_playlist: '/simi/playlist',
  simi_song: '/simi/song',
  simi_user: '/simi/user',
  song_chorus: '/song/chorus',
  song_detail: '/song/detail',
  song_downlist: '/song/downlist',
  song_download_url: '/song/download/url',
  song_download_url_v1: '/song/download/url/v1',
  song_dynamic_cover: '/song/dynamic/cover',
  song_like_check: '/song/like/check',
  song_lyrics_mark: '/song/lyrics/mark',
  song_lyrics_mark_add: '/song/lyrics/mark/add',
  song_lyrics_mark_del: '/song/lyrics/mark/del',
  song_lyrics_mark_user_page: '/song/lyrics/mark/user/page',
  song_monthdownlist: '/song/monthdownlist',
  song_music_detail: '/song/music/detail',
  song_order_update: '/song/order/update',
  song_purchased: '/song/purchased',
  song_red_count: '/song/red/count',
  song_singledownlist: '/song/singledownlist',
  song_url: '/song/url',
  song_url_v1: '/song/url/v1',
  song_wiki_summary: '/song/wiki/summary',
  starpick_comments_summary: '/starpick/comments/summary',
  style_album: '/style/album',
  style_artist: '/style/artist',
  style_detail: '/style/detail',
  style_list: '/style/list',
  style_playlist: '/style/playlist',
  style_preference: '/style/preference',
  style_song: '/style/song',
  summary_annual: '/summary/annual',
  top_album: '/top/album',
  top_artists: '/top/artists',
  top_list: '/top/list',
  top_mv: '/top/mv',
  top_playlist: '/top/playlist',
  top_playlist_highquality: '/top/playlist/highquality',
  top_song: '/top/song',
  topic_detail: '/topic/detail',
  topic_detail_event_hot: '/topic/detail/event/hot',
  topic_sublist: '/topic/sublist',
  toplist: '/toplist',
  toplist_artist: '/toplist/artist',
  toplist_detail: '/toplist/detail',
  ugc_album_get: '/ugc/album/get',
  ugc_artist_get: '/ugc/artist/get',
  ugc_artist_search: '/ugc/artist/search',
  ugc_detail: '/ugc/detail',
  ugc_mv_get: '/ugc/mv/get',
  ugc_song_get: '/ugc/song/get',
  ugc_user_devote: '/ugc/user/devote',
  user_account: '/user/account',
  user_audio: '/user/audio',
  user_binding: '/user/binding',
  user_cloud: '/user/cloud',
  user_cloud_del: '/user/cloud/del',
  user_cloud_detail: '/user/cloud/detail',
  user_comment_history: '/user/comment/history',
  user_detail: '/user/detail',
  user_dj: '/user/dj',
  user_event: '/user/event',
  user_follow_mixed: '/user/follow/mixed',
  user_followeds: '/user/followeds',
  user_follows: '/user/follows',
  user_level: '/user/level',
  user_medal: '/user/medal',
  user_mutualfollow_get: '/user/mutualfollow/get',
  user_playlist: '/user/playlist',
  user_playlist_collect: '/user/playlist/collect',
  user_playlist_create: '/user/playlist/create',
  user_record: '/user/record',
  user_replacephone: '/user/replacephone',
  user_social_status: '/user/social/status',
  user_social_status_edit: '/user/social/status/edit',
  user_social_status_rcmd: '/user/social/status/rcmd',
  user_social_status_support: '/user/social/status/support',
  user_subcount: '/user/subcount',
  user_update: '/user/update',
  verify_getQr: '/verify/getQr',
  verify_qrcodestatus: '/verify/qrcodestatus',
  video_category_list: '/video/category/list',
  video_detail: '/video/detail',
  video_detail_info: '/video/detail/info',
  video_group: '/video/group',
  video_group_list: '/video/group/list',
  video_sub: '/video/sub',
  video_timeline_all: '/video/timeline/all',
  video_timeline_recommend: '/video/timeline/recommend',
  video_url: '/video/url',
  vip_growthpoint: '/vip/growthpoint',
  vip_growthpoint_details: '/vip/growthpoint/details',
  vip_growthpoint_get: '/vip/growthpoint/get',
  vip_info: '/vip/info',
  vip_info_v2: '/vip/info/v2',
  vip_tasks: '/vip/tasks',
  vip_timemachine: '/vip/timemachine',
  voice_delete: '/voice/delete',
  voice_detail: '/voice/detail',
  voice_lyric: '/voice/lyric',
  voice_upload: '/voice/upload',
  voicelist_detail: '/voicelist/detail',
  voicelist_list: '/voicelist/list',
  voicelist_list_search: '/voicelist/list/search',
  voicelist_search: '/voicelist/search',
  voicelist_trans: '/voicelist/trans',
  yunbei: '/yunbei',
  yunbei_expense: '/yunbei/expense',
  yunbei_info: '/yunbei/info',
  yunbei_rcmd_song: '/yunbei/rcmd/song',
  yunbei_rcmd_song_history: '/yunbei/rcmd/song/history',
  yunbei_receipt: '/yunbei/receipt',
  yunbei_sign: '/yunbei/sign',
  yunbei_task_finish: '/yunbei/task/finish',
  yunbei_tasks: '/yunbei/tasks',
  yunbei_tasks_todo: '/yunbei/tasks/todo',
  yunbei_today: '/yunbei/today',
} as const satisfies Readonly<Record<GeneratedModuleIdentifier, string>>;

export interface GeneratedModuleContractMap {
  activate_init_profile: {
    input: activateInitProfileInput;
    query: activateInitProfileInput;
    response: ModuleResponse;
  };
  aidj_content_rcmd: {
    input: aidjContentRcmdInput;
    query: aidjContentRcmdInput;
    response: ModuleResponse;
  };
  album: { input: albumInput; query: albumInput; response: ModuleResponse };
  album_detail: {
    input: albumDetailInput;
    query: albumDetailInput;
    response: ModuleResponse;
  };
  album_detail_dynamic: {
    input: albumDetailDynamicInput;
    query: albumDetailDynamicInput;
    response: ModuleResponse;
  };
  album_list: {
    input: albumListInput;
    query: albumListInput;
    response: ModuleResponse;
  };
  album_list_style: {
    input: albumListStyleInput;
    query: albumListStyleInput;
    response: ModuleResponse;
  };
  album_new: {
    input: albumNewInput;
    query: albumNewInput;
    response: ModuleResponse;
  };
  album_newest: {
    input: albumNewestInput;
    query: albumNewestInput;
    response: ModuleResponse;
  };
  album_privilege: {
    input: albumPrivilegeInput;
    query: albumPrivilegeInput;
    response: ModuleResponse;
  };
  album_songsaleboard: {
    input: albumSongsaleboardInput;
    query: albumSongsaleboardInput;
    response: ModuleResponse;
  };
  album_sub: {
    input: albumSubInput;
    query: albumSubInput;
    response: ModuleResponse;
  };
  album_sublist: {
    input: albumSublistInput;
    query: albumSublistInput;
    response: ModuleResponse;
  };
  artist_album: {
    input: artistAlbumInput;
    query: artistAlbumInput;
    response: ModuleResponse;
  };
  artist_desc: {
    input: artistDescInput;
    query: artistDescInput;
    response: ModuleResponse;
  };
  artist_detail: {
    input: artistDetailInput;
    query: artistDetailInput;
    response: ModuleResponse;
  };
  artist_detail_dynamic: {
    input: artistDetailDynamicInput;
    query: artistDetailDynamicInput;
    response: ModuleResponse;
  };
  artist_fans: {
    input: artistFansInput;
    query: artistFansInput;
    response: ModuleResponse;
  };
  artist_follow_count: {
    input: artistFollowCountInput;
    query: artistFollowCountInput;
    response: ModuleResponse;
  };
  artist_list: {
    input: artistListInput;
    query: artistListInput;
    response: ModuleResponse;
  };
  artist_mv: {
    input: artistMvInput;
    query: artistMvInput;
    response: ModuleResponse;
  };
  artist_new_mv: {
    input: artistNewMvInput;
    query: artistNewMvInput;
    response: ModuleResponse;
  };
  artist_new_song: {
    input: artistNewSongInput;
    query: artistNewSongInput;
    response: ModuleResponse;
  };
  artist_songs: {
    input: artistSongsInput;
    query: artistSongsInput;
    response: ModuleResponse;
  };
  artist_sub: {
    input: artistSubInput;
    query: artistSubInput;
    response: ModuleResponse;
  };
  artist_sublist: {
    input: artistSublistInput;
    query: artistSublistInput;
    response: ModuleResponse;
  };
  artist_top_song: {
    input: artistTopSongInput;
    query: artistTopSongInput;
    response: ModuleResponse;
  };
  artist_video: {
    input: artistVideoInput;
    query: artistVideoInput;
    response: ModuleResponse;
  };
  artists: {
    input: artistsInput;
    query: artistsInput;
    response: ModuleResponse;
  };
  audio_match: {
    input: audioMatchInput;
    query: audioMatchInput;
    response: ModuleResponse;
  };
  avatar_upload: {
    input: avatarUploadInput;
    query: avatarUploadInput;
    response: ModuleResponse;
  };
  banner: { input: bannerInput; query: bannerInput; response: ModuleResponse };
  batch: { input: batchInput; query: batchInput; response: ModuleResponse };
  broadcast_category_region_get: {
    input: broadcastCategoryRegionGetInput;
    query: broadcastCategoryRegionGetInput;
    response: ModuleResponse;
  };
  broadcast_channel_collect_list: {
    input: broadcastChannelCollectListInput;
    query: broadcastChannelCollectListInput;
    response: ModuleResponse;
  };
  broadcast_channel_currentinfo: {
    input: broadcastChannelCurrentinfoInput;
    query: broadcastChannelCurrentinfoInput;
    response: ModuleResponse;
  };
  broadcast_channel_list: {
    input: broadcastChannelListInput;
    query: broadcastChannelListInput;
    response: ModuleResponse;
  };
  broadcast_sub: {
    input: broadcastSubInput;
    query: broadcastSubInput;
    response: ModuleResponse;
  };
  calendar: {
    input: calendarInput;
    query: calendarInput;
    response: ModuleResponse;
  };
  captcha_sent: {
    input: captchaSentInput;
    query: captchaSentInput;
    response: ModuleResponse<captchaSentBody>;
  };
  captcha_verify: {
    input: captchaVerifyInput;
    query: captchaVerifyInput;
    response: ModuleResponse;
  };
  cellphone_existence_check: {
    input: cellphoneExistenceCheckInput;
    query: cellphoneExistenceCheckInput;
    response: ModuleResponse;
  };
  check_music: {
    input: checkMusicInput;
    query: checkMusicInput;
    response: ModuleResponse;
  };
  cloud: { input: cloudInput; query: cloudInput; response: ModuleResponse };
  cloud_import: {
    input: cloudImportInput;
    query: cloudImportInput;
    response: ModuleResponse;
  };
  cloud_match: {
    input: cloudMatchInput;
    query: cloudMatchInput;
    response: ModuleResponse;
  };
  cloudsearch: {
    input: cloudsearchInput;
    query: cloudsearchInput;
    response: ModuleResponse;
  };
  comment: {
    input: commentInput;
    query: commentInput;
    response: ModuleResponse;
  };
  comment_album: {
    input: commentAlbumInput;
    query: commentAlbumInput;
    response: ModuleResponse;
  };
  comment_dj: {
    input: commentDjInput;
    query: commentDjInput;
    response: ModuleResponse;
  };
  comment_event: {
    input: commentEventInput;
    query: commentEventInput;
    response: ModuleResponse;
  };
  comment_floor: {
    input: commentFloorInput;
    query: commentFloorInput;
    response: ModuleResponse;
  };
  comment_hot: {
    input: commentHotInput;
    query: commentHotInput;
    response: ModuleResponse;
  };
  comment_hug_list: {
    input: commentHugListInput;
    query: commentHugListInput;
    response: ModuleResponse;
  };
  comment_like: {
    input: commentLikeInput;
    query: commentLikeInput;
    response: ModuleResponse;
  };
  comment_music: {
    input: commentMusicInput;
    query: commentMusicInput;
    response: ModuleResponse;
  };
  comment_mv: {
    input: commentMvInput;
    query: commentMvInput;
    response: ModuleResponse;
  };
  comment_new: {
    input: commentNewInput;
    query: commentNewInput;
    response: ModuleResponse;
  };
  comment_playlist: {
    input: commentPlaylistInput;
    query: commentPlaylistInput;
    response: ModuleResponse;
  };
  comment_video: {
    input: commentVideoInput;
    query: commentVideoInput;
    response: ModuleResponse;
  };
  countries_code_list: {
    input: countriesCodeListInput;
    query: countriesCodeListInput;
    response: ModuleResponse;
  };
  daily_signin: {
    input: dailySigninInput;
    query: dailySigninInput;
    response: ModuleResponse;
  };
  digitalAlbum_detail: {
    input: digitalAlbumDetailInput;
    query: digitalAlbumDetailInput;
    response: ModuleResponse;
  };
  digitalAlbum_ordering: {
    input: digitalAlbumOrderingInput;
    query: digitalAlbumOrderingInput;
    response: ModuleResponse;
  };
  digitalAlbum_purchased: {
    input: digitalAlbumPurchasedInput;
    query: digitalAlbumPurchasedInput;
    response: ModuleResponse;
  };
  digitalAlbum_sales: {
    input: digitalAlbumSalesInput;
    query: digitalAlbumSalesInput;
    response: ModuleResponse;
  };
  dj_banner: {
    input: djBannerInput;
    query: djBannerInput;
    response: ModuleResponse;
  };
  dj_category_excludehot: {
    input: djCategoryExcludehotInput;
    query: djCategoryExcludehotInput;
    response: ModuleResponse;
  };
  dj_category_recommend: {
    input: djCategoryRecommendInput;
    query: djCategoryRecommendInput;
    response: ModuleResponse;
  };
  dj_catelist: {
    input: djCatelistInput;
    query: djCatelistInput;
    response: ModuleResponse;
  };
  dj_detail: {
    input: djDetailInput;
    query: djDetailInput;
    response: ModuleResponse;
  };
  dj_difm_all_style_channel: {
    input: djDifmAllStyleChannelInput;
    query: djDifmAllStyleChannelInput;
    response: ModuleResponse;
  };
  dj_difm_channel_subscribe: {
    input: djDifmChannelSubscribeInput;
    query: djDifmChannelSubscribeInput;
    response: ModuleResponse;
  };
  dj_difm_channel_unsubscribe: {
    input: djDifmChannelUnsubscribeInput;
    query: djDifmChannelUnsubscribeInput;
    response: ModuleResponse;
  };
  dj_difm_playing_tracks_list: {
    input: djDifmPlayingTracksListInput;
    query: djDifmPlayingTracksListInput;
    response: ModuleResponse;
  };
  dj_difm_subscribe_channels_get: {
    input: djDifmSubscribeChannelsGetInput;
    query: djDifmSubscribeChannelsGetInput;
    response: ModuleResponse;
  };
  dj_hot: { input: djHotInput; query: djHotInput; response: ModuleResponse };
  dj_paygift: {
    input: djPaygiftInput;
    query: djPaygiftInput;
    response: ModuleResponse;
  };
  dj_personalize_recommend: {
    input: djPersonalizeRecommendInput;
    query: djPersonalizeRecommendInput;
    response: ModuleResponse;
  };
  dj_program: {
    input: djProgramInput;
    query: djProgramInput;
    response: ModuleResponse;
  };
  dj_program_detail: {
    input: djProgramDetailInput;
    query: djProgramDetailInput;
    response: ModuleResponse;
  };
  dj_program_toplist: {
    input: djProgramToplistInput;
    query: djProgramToplistInput;
    response: ModuleResponse;
  };
  dj_program_toplist_hours: {
    input: djProgramToplistHoursInput;
    query: djProgramToplistHoursInput;
    response: ModuleResponse;
  };
  dj_radio_hot: {
    input: djRadioHotInput;
    query: djRadioHotInput;
    response: ModuleResponse;
  };
  dj_recommend: {
    input: djRecommendInput;
    query: djRecommendInput;
    response: ModuleResponse;
  };
  dj_recommend_type: {
    input: djRecommendTypeInput;
    query: djRecommendTypeInput;
    response: ModuleResponse;
  };
  dj_sub: { input: djSubInput; query: djSubInput; response: ModuleResponse };
  dj_sublist: {
    input: djSublistInput;
    query: djSublistInput;
    response: ModuleResponse;
  };
  dj_subscriber: {
    input: djSubscriberInput;
    query: djSubscriberInput;
    response: ModuleResponse;
  };
  dj_today_perfered: {
    input: djTodayPerferedInput;
    query: djTodayPerferedInput;
    response: ModuleResponse;
  };
  dj_toplist: {
    input: djToplistInput;
    query: djToplistInput;
    response: ModuleResponse;
  };
  dj_toplist_hours: {
    input: djToplistHoursInput;
    query: djToplistHoursInput;
    response: ModuleResponse;
  };
  dj_toplist_newcomer: {
    input: djToplistNewcomerInput;
    query: djToplistNewcomerInput;
    response: ModuleResponse;
  };
  dj_toplist_pay: {
    input: djToplistPayInput;
    query: djToplistPayInput;
    response: ModuleResponse;
  };
  dj_toplist_popular: {
    input: djToplistPopularInput;
    query: djToplistPopularInput;
    response: ModuleResponse;
  };
  djRadio_top: {
    input: djRadioTopInput;
    query: djRadioTopInput;
    response: ModuleResponse;
  };
  event: { input: eventInput; query: eventInput; response: ModuleResponse };
  event_del: {
    input: eventDelInput;
    query: eventDelInput;
    response: ModuleResponse;
  };
  event_forward: {
    input: eventForwardInput;
    query: eventForwardInput;
    response: ModuleResponse;
  };
  fm_trash: {
    input: fmTrashInput;
    query: fmTrashInput;
    response: ModuleResponse;
  };
  follow: { input: followInput; query: followInput; response: ModuleResponse };
  get_userids: {
    input: getUseridsInput;
    query: getUseridsInput;
    response: ModuleResponse;
  };
  history_recommend_songs: {
    input: historyRecommendSongsInput;
    query: historyRecommendSongsInput;
    response: ModuleResponse;
  };
  history_recommend_songs_detail: {
    input: historyRecommendSongsDetailInput;
    query: historyRecommendSongsDetailInput;
    response: ModuleResponse;
  };
  homepage_block_page: {
    input: homepageBlockPageInput;
    query: homepageBlockPageInput;
    response: ModuleResponse;
  };
  homepage_dragon_ball: {
    input: homepageDragonBallInput;
    query: homepageDragonBallInput;
    response: ModuleResponse;
  };
  hot_topic: {
    input: hotTopicInput;
    query: hotTopicInput;
    response: ModuleResponse;
  };
  hug_comment: {
    input: hugCommentInput;
    query: hugCommentInput;
    response: ModuleResponse;
  };
  image_upload_token: {
    input: imageUploadTokenInput;
    query: imageUploadTokenInput;
    response: ModuleResponse<imageUploadTokenBody>;
  };
  inner_version: {
    input: innerVersionInput;
    query: innerVersionInput;
    response: ModuleResponse;
  };
  like: { input: likeInput; query: likeInput; response: ModuleResponse };
  likelist: {
    input: likelistInput;
    query: likelistInput;
    response: ModuleResponse;
  };
  listen_data_realtime_report: {
    input: listenDataRealtimeReportInput;
    query: listenDataRealtimeReportInput;
    response: ModuleResponse;
  };
  listen_data_report: {
    input: listenDataReportInput;
    query: listenDataReportInput;
    response: ModuleResponse;
  };
  listen_data_today_song: {
    input: listenDataTodaySongInput;
    query: listenDataTodaySongInput;
    response: ModuleResponse;
  };
  listen_data_total: {
    input: listenDataTotalInput;
    query: listenDataTotalInput;
    response: ModuleResponse;
  };
  listen_data_year_report: {
    input: listenDataYearReportInput;
    query: listenDataYearReportInput;
    response: ModuleResponse;
  };
  listentogether_accept: {
    input: listentogetherAcceptInput;
    query: listentogetherAcceptInput;
    response: ModuleResponse;
  };
  listentogether_end: {
    input: listentogetherEndInput;
    query: listentogetherEndInput;
    response: ModuleResponse;
  };
  listentogether_heatbeat: {
    input: listentogetherHeatbeatInput;
    query: listentogetherHeatbeatInput;
    response: ModuleResponse;
  };
  listentogether_play_command: {
    input: listentogetherPlayCommandInput;
    query: listentogetherPlayCommandInput;
    response: ModuleResponse;
  };
  listentogether_room_check: {
    input: listentogetherRoomCheckInput;
    query: listentogetherRoomCheckInput;
    response: ModuleResponse;
  };
  listentogether_room_create: {
    input: listentogetherRoomCreateInput;
    query: listentogetherRoomCreateInput;
    response: ModuleResponse;
  };
  listentogether_status: {
    input: listentogetherStatusInput;
    query: listentogetherStatusInput;
    response: ModuleResponse;
  };
  listentogether_sync_list_command: {
    input: listentogetherSyncListCommandInput;
    query: listentogetherSyncListCommandInput;
    response: ModuleResponse;
  };
  listentogether_sync_playlist_get: {
    input: listentogetherSyncPlaylistGetInput;
    query: listentogetherSyncPlaylistGetInput;
    response: ModuleResponse;
  };
  login: { input: loginInput; query: loginInput; response: ModuleResponse };
  login_cellphone: {
    input: loginCellphoneInput;
    query: loginCellphoneInput;
    response: ModuleResponse<loginCellphoneBody>;
  };
  login_qr_check: {
    input: loginQrCheckInput;
    query: loginQrCheckInput;
    response: ModuleResponse<loginQrCheckBody>;
  };
  login_qr_create: {
    input: loginQrCreateInput;
    query: loginQrCreateInput;
    response: ModuleResponse<loginQrCreateBody>;
  };
  login_qr_key: {
    input: loginQrKeyInput;
    query: loginQrKeyInput;
    response: ModuleResponse<loginQrKeyBody>;
  };
  login_refresh: {
    input: loginRefreshInput;
    query: loginRefreshInput;
    response: ModuleResponse<loginRefreshBody>;
  };
  login_status: {
    input: loginStatusInput;
    query: loginStatusInput;
    response: ModuleResponse<loginStatusBody>;
  };
  logout: {
    input: logoutInput;
    query: logoutInput;
    response: ModuleResponse<logoutBody>;
  };
  lyric: { input: lyricInput; query: lyricInput; response: ModuleResponse };
  lyric_new: {
    input: lyricNewInput;
    query: lyricNewInput;
    response: ModuleResponse;
  };
  mlog_music_rcmd: {
    input: mlogMusicRcmdInput;
    query: mlogMusicRcmdInput;
    response: ModuleResponse;
  };
  mlog_to_video: {
    input: mlogToVideoInput;
    query: mlogToVideoInput;
    response: ModuleResponse;
  };
  mlog_url: {
    input: mlogUrlInput;
    query: mlogUrlInput;
    response: ModuleResponse;
  };
  msg_comments: {
    input: msgCommentsInput;
    query: msgCommentsInput;
    response: ModuleResponse;
  };
  msg_forwards: {
    input: msgForwardsInput;
    query: msgForwardsInput;
    response: ModuleResponse;
  };
  msg_notices: {
    input: msgNoticesInput;
    query: msgNoticesInput;
    response: ModuleResponse;
  };
  msg_private: {
    input: msgPrivateInput;
    query: msgPrivateInput;
    response: ModuleResponse;
  };
  msg_private_history: {
    input: msgPrivateHistoryInput;
    query: msgPrivateHistoryInput;
    response: ModuleResponse;
  };
  msg_recentcontact: {
    input: msgRecentcontactInput;
    query: msgRecentcontactInput;
    response: ModuleResponse;
  };
  music_first_listen_info: {
    input: musicFirstListenInfoInput;
    query: musicFirstListenInfoInput;
    response: ModuleResponse;
  };
  musician_cloudbean: {
    input: musicianCloudbeanInput;
    query: musicianCloudbeanInput;
    response: ModuleResponse;
  };
  musician_cloudbean_obtain: {
    input: musicianCloudbeanObtainInput;
    query: musicianCloudbeanObtainInput;
    response: ModuleResponse;
  };
  musician_data_overview: {
    input: musicianDataOverviewInput;
    query: musicianDataOverviewInput;
    response: ModuleResponse;
  };
  musician_play_trend: {
    input: musicianPlayTrendInput;
    query: musicianPlayTrendInput;
    response: ModuleResponse;
  };
  musician_sign: {
    input: musicianSignInput;
    query: musicianSignInput;
    response: ModuleResponse;
  };
  musician_tasks: {
    input: musicianTasksInput;
    query: musicianTasksInput;
    response: ModuleResponse;
  };
  musician_tasks_new: {
    input: musicianTasksNewInput;
    query: musicianTasksNewInput;
    response: ModuleResponse;
  };
  mv_all: { input: mvAllInput; query: mvAllInput; response: ModuleResponse };
  mv_detail: {
    input: mvDetailInput;
    query: mvDetailInput;
    response: ModuleResponse;
  };
  mv_detail_info: {
    input: mvDetailInfoInput;
    query: mvDetailInfoInput;
    response: ModuleResponse;
  };
  mv_exclusive_rcmd: {
    input: mvExclusiveRcmdInput;
    query: mvExclusiveRcmdInput;
    response: ModuleResponse;
  };
  mv_first: {
    input: mvFirstInput;
    query: mvFirstInput;
    response: ModuleResponse;
  };
  mv_sub: { input: mvSubInput; query: mvSubInput; response: ModuleResponse };
  mv_sublist: {
    input: mvSublistInput;
    query: mvSublistInput;
    response: ModuleResponse;
  };
  mv_url: { input: mvUrlInput; query: mvUrlInput; response: ModuleResponse };
  nickname_check: {
    input: nicknameCheckInput;
    query: nicknameCheckInput;
    response: ModuleResponse;
  };
  personal_fm: {
    input: personalFmInput;
    query: personalFmInput;
    response: ModuleResponse;
  };
  personal_fm_mode: {
    input: personalFmModeInput;
    query: personalFmModeInput;
    response: ModuleResponse;
  };
  personalized: {
    input: personalizedInput;
    query: personalizedInput;
    response: ModuleResponse;
  };
  personalized_djprogram: {
    input: personalizedDjprogramInput;
    query: personalizedDjprogramInput;
    response: ModuleResponse;
  };
  personalized_mv: {
    input: personalizedMvInput;
    query: personalizedMvInput;
    response: ModuleResponse;
  };
  personalized_newsong: {
    input: personalizedNewsongInput;
    query: personalizedNewsongInput;
    response: ModuleResponse;
  };
  personalized_privatecontent: {
    input: personalizedPrivatecontentInput;
    query: personalizedPrivatecontentInput;
    response: ModuleResponse;
  };
  personalized_privatecontent_list: {
    input: personalizedPrivatecontentListInput;
    query: personalizedPrivatecontentListInput;
    response: ModuleResponse;
  };
  pl_count: {
    input: plCountInput;
    query: plCountInput;
    response: ModuleResponse;
  };
  playlist_catlist: {
    input: playlistCatlistInput;
    query: playlistCatlistInput;
    response: ModuleResponse;
  };
  playlist_cover_update: {
    input: playlistCoverUpdateInput;
    query: playlistCoverUpdateInput;
    response: ModuleResponse;
  };
  playlist_create: {
    input: playlistCreateInput;
    query: playlistCreateInput;
    response: ModuleResponse;
  };
  playlist_delete: {
    input: playlistDeleteInput;
    query: playlistDeleteInput;
    response: ModuleResponse;
  };
  playlist_desc_update: {
    input: playlistDescUpdateInput;
    query: playlistDescUpdateInput;
    response: ModuleResponse;
  };
  playlist_detail: {
    input: playlistDetailInput;
    query: playlistDetailInput;
    response: ModuleResponse;
  };
  playlist_detail_dynamic: {
    input: playlistDetailDynamicInput;
    query: playlistDetailDynamicInput;
    response: ModuleResponse;
  };
  playlist_detail_rcmd_get: {
    input: playlistDetailRcmdGetInput;
    query: playlistDetailRcmdGetInput;
    response: ModuleResponse;
  };
  playlist_highquality_tags: {
    input: playlistHighqualityTagsInput;
    query: playlistHighqualityTagsInput;
    response: ModuleResponse;
  };
  playlist_hot: {
    input: playlistHotInput;
    query: playlistHotInput;
    response: ModuleResponse;
  };
  playlist_import_name_task_create: {
    input: playlistImportNameTaskCreateInput;
    query: playlistImportNameTaskCreateInput;
    response: ModuleResponse;
  };
  playlist_import_task_status: {
    input: playlistImportTaskStatusInput;
    query: playlistImportTaskStatusInput;
    response: ModuleResponse;
  };
  playlist_mylike: {
    input: playlistMylikeInput;
    query: playlistMylikeInput;
    response: ModuleResponse;
  };
  playlist_name_update: {
    input: playlistNameUpdateInput;
    query: playlistNameUpdateInput;
    response: ModuleResponse;
  };
  playlist_order_update: {
    input: playlistOrderUpdateInput;
    query: playlistOrderUpdateInput;
    response: ModuleResponse;
  };
  playlist_privacy: {
    input: playlistPrivacyInput;
    query: playlistPrivacyInput;
    response: ModuleResponse;
  };
  playlist_subscribe: {
    input: playlistSubscribeInput;
    query: playlistSubscribeInput;
    response: ModuleResponse;
  };
  playlist_subscribers: {
    input: playlistSubscribersInput;
    query: playlistSubscribersInput;
    response: ModuleResponse;
  };
  playlist_tags_update: {
    input: playlistTagsUpdateInput;
    query: playlistTagsUpdateInput;
    response: ModuleResponse;
  };
  playlist_track_add: {
    input: playlistTrackAddInput;
    query: playlistTrackAddInput;
    response: ModuleResponse;
  };
  playlist_track_all: {
    input: playlistTrackAllInput;
    query: playlistTrackAllInput;
    response: ModuleResponse;
  };
  playlist_track_delete: {
    input: playlistTrackDeleteInput;
    query: playlistTrackDeleteInput;
    response: ModuleResponse;
  };
  playlist_tracks: {
    input: playlistTracksInput;
    query: playlistTracksInput;
    response: ModuleResponse;
  };
  playlist_update: {
    input: playlistUpdateInput;
    query: playlistUpdateInput;
    response: ModuleResponse;
  };
  playlist_update_playcount: {
    input: playlistUpdatePlaycountInput;
    query: playlistUpdatePlaycountInput;
    response: ModuleResponse;
  };
  playlist_video_recent: {
    input: playlistVideoRecentInput;
    query: playlistVideoRecentInput;
    response: ModuleResponse;
  };
  playmode_intelligence_list: {
    input: playmodeIntelligenceListInput;
    query: playmodeIntelligenceListInput;
    response: ModuleResponse;
  };
  program_recommend: {
    input: programRecommendInput;
    query: programRecommendInput;
    response: ModuleResponse;
  };
  rebind: { input: rebindInput; query: rebindInput; response: ModuleResponse };
  recent_listen_list: {
    input: recentListenListInput;
    query: recentListenListInput;
    response: ModuleResponse;
  };
  recommend_resource: {
    input: recommendResourceInput;
    query: recommendResourceInput;
    response: ModuleResponse;
  };
  recommend_songs: {
    input: recommendSongsInput;
    query: recommendSongsInput;
    response: ModuleResponse;
  };
  recommend_songs_dislike: {
    input: recommendSongsDislikeInput;
    query: recommendSongsDislikeInput;
    response: ModuleResponse;
  };
  record_recent_album: {
    input: recordRecentAlbumInput;
    query: recordRecentAlbumInput;
    response: ModuleResponse;
  };
  record_recent_dj: {
    input: recordRecentDjInput;
    query: recordRecentDjInput;
    response: ModuleResponse;
  };
  record_recent_playlist: {
    input: recordRecentPlaylistInput;
    query: recordRecentPlaylistInput;
    response: ModuleResponse;
  };
  record_recent_song: {
    input: recordRecentSongInput;
    query: recordRecentSongInput;
    response: ModuleResponse;
  };
  record_recent_video: {
    input: recordRecentVideoInput;
    query: recordRecentVideoInput;
    response: ModuleResponse;
  };
  record_recent_voice: {
    input: recordRecentVoiceInput;
    query: recordRecentVoiceInput;
    response: ModuleResponse;
  };
  register_anonimous: {
    input: registerAnonimousInput;
    query: registerAnonimousInput;
    response: ModuleResponse;
  };
  register_cellphone: {
    input: registerCellphoneInput;
    query: registerCellphoneInput;
    response: ModuleResponse;
  };
  related_allvideo: {
    input: relatedAllvideoInput;
    query: relatedAllvideoInput;
    response: ModuleResponse;
  };
  related_playlist: {
    input: relatedPlaylistInput;
    query: relatedPlaylistInput;
    response: ModuleResponse;
  };
  resource_like: {
    input: resourceLikeInput;
    query: resourceLikeInput;
    response: ModuleResponse;
  };
  scrobble: {
    input: scrobbleInput;
    query: scrobbleInput;
    response: ModuleResponse;
  };
  search: { input: searchInput; query: searchInput; response: ModuleResponse };
  search_default: {
    input: searchDefaultInput;
    query: searchDefaultInput;
    response: ModuleResponse;
  };
  search_hot: {
    input: searchHotInput;
    query: searchHotInput;
    response: ModuleResponse;
  };
  search_hot_detail: {
    input: searchHotDetailInput;
    query: searchHotDetailInput;
    response: ModuleResponse;
  };
  search_match: {
    input: searchMatchInput;
    query: searchMatchInput;
    response: ModuleResponse;
  };
  search_multimatch: {
    input: searchMultimatchInput;
    query: searchMultimatchInput;
    response: ModuleResponse;
  };
  search_suggest: {
    input: searchSuggestInput;
    query: searchSuggestInput;
    response: ModuleResponse;
  };
  send_album: {
    input: sendAlbumInput;
    query: sendAlbumInput;
    response: ModuleResponse;
  };
  send_playlist: {
    input: sendPlaylistInput;
    query: sendPlaylistInput;
    response: ModuleResponse;
  };
  send_song: {
    input: sendSongInput;
    query: sendSongInput;
    response: ModuleResponse;
  };
  send_text: {
    input: sendTextInput;
    query: sendTextInput;
    response: ModuleResponse;
  };
  setting: {
    input: settingInput;
    query: settingInput;
    response: ModuleResponse;
  };
  share_resource: {
    input: shareResourceInput;
    query: shareResourceInput;
    response: ModuleResponse;
  };
  sheet_list: {
    input: sheetListInput;
    query: sheetListInput;
    response: ModuleResponse;
  };
  sheet_preview: {
    input: sheetPreviewInput;
    query: sheetPreviewInput;
    response: ModuleResponse;
  };
  sign_happy_info: {
    input: signHappyInfoInput;
    query: signHappyInfoInput;
    response: ModuleResponse;
  };
  signin_progress: {
    input: signinProgressInput;
    query: signinProgressInput;
    response: ModuleResponse;
  };
  simi_artist: {
    input: simiArtistInput;
    query: simiArtistInput;
    response: ModuleResponse;
  };
  simi_mv: { input: simiMvInput; query: simiMvInput; response: ModuleResponse };
  simi_playlist: {
    input: simiPlaylistInput;
    query: simiPlaylistInput;
    response: ModuleResponse;
  };
  simi_song: {
    input: simiSongInput;
    query: simiSongInput;
    response: ModuleResponse;
  };
  simi_user: {
    input: simiUserInput;
    query: simiUserInput;
    response: ModuleResponse;
  };
  song_chorus: {
    input: songChorusInput;
    query: songChorusInput;
    response: ModuleResponse;
  };
  song_detail: {
    input: songDetailInput;
    query: songDetailInput;
    response: ModuleResponse;
  };
  song_downlist: {
    input: songDownlistInput;
    query: songDownlistInput;
    response: ModuleResponse;
  };
  song_download_url: {
    input: songDownloadUrlInput;
    query: songDownloadUrlInput;
    response: ModuleResponse;
  };
  song_download_url_v1: {
    input: songDownloadUrlV1Input;
    query: songDownloadUrlV1Input;
    response: ModuleResponse;
  };
  song_dynamic_cover: {
    input: songDynamicCoverInput;
    query: songDynamicCoverInput;
    response: ModuleResponse;
  };
  song_like_check: {
    input: songLikeCheckInput;
    query: songLikeCheckInput;
    response: ModuleResponse;
  };
  song_lyrics_mark: {
    input: songLyricsMarkInput;
    query: songLyricsMarkInput;
    response: ModuleResponse;
  };
  song_lyrics_mark_add: {
    input: songLyricsMarkAddInput;
    query: songLyricsMarkAddInput;
    response: ModuleResponse;
  };
  song_lyrics_mark_del: {
    input: songLyricsMarkDelInput;
    query: songLyricsMarkDelInput;
    response: ModuleResponse;
  };
  song_lyrics_mark_user_page: {
    input: songLyricsMarkUserPageInput;
    query: songLyricsMarkUserPageInput;
    response: ModuleResponse;
  };
  song_monthdownlist: {
    input: songMonthdownlistInput;
    query: songMonthdownlistInput;
    response: ModuleResponse;
  };
  song_music_detail: {
    input: songMusicDetailInput;
    query: songMusicDetailInput;
    response: ModuleResponse;
  };
  song_order_update: {
    input: songOrderUpdateInput;
    query: songOrderUpdateInput;
    response: ModuleResponse;
  };
  song_purchased: {
    input: songPurchasedInput;
    query: songPurchasedInput;
    response: ModuleResponse;
  };
  song_red_count: {
    input: songRedCountInput;
    query: songRedCountInput;
    response: ModuleResponse;
  };
  song_singledownlist: {
    input: songSingledownlistInput;
    query: songSingledownlistInput;
    response: ModuleResponse;
  };
  song_url: {
    input: songUrlInput;
    query: songUrlInput;
    response: ModuleResponse;
  };
  song_url_v1: {
    input: songUrlV1Input;
    query: songUrlV1Input;
    response: ModuleResponse;
  };
  song_wiki_summary: {
    input: songWikiSummaryInput;
    query: songWikiSummaryInput;
    response: ModuleResponse;
  };
  starpick_comments_summary: {
    input: starpickCommentsSummaryInput;
    query: starpickCommentsSummaryInput;
    response: ModuleResponse;
  };
  style_album: {
    input: styleAlbumInput;
    query: styleAlbumInput;
    response: ModuleResponse;
  };
  style_artist: {
    input: styleArtistInput;
    query: styleArtistInput;
    response: ModuleResponse;
  };
  style_detail: {
    input: styleDetailInput;
    query: styleDetailInput;
    response: ModuleResponse;
  };
  style_list: {
    input: styleListInput;
    query: styleListInput;
    response: ModuleResponse;
  };
  style_playlist: {
    input: stylePlaylistInput;
    query: stylePlaylistInput;
    response: ModuleResponse;
  };
  style_preference: {
    input: stylePreferenceInput;
    query: stylePreferenceInput;
    response: ModuleResponse;
  };
  style_song: {
    input: styleSongInput;
    query: styleSongInput;
    response: ModuleResponse;
  };
  summary_annual: {
    input: summaryAnnualInput;
    query: summaryAnnualInput;
    response: ModuleResponse;
  };
  top_album: {
    input: topAlbumInput;
    query: topAlbumInput;
    response: ModuleResponse;
  };
  top_artists: {
    input: topArtistsInput;
    query: topArtistsInput;
    response: ModuleResponse;
  };
  top_list: {
    input: topListInput;
    query: topListInput;
    response: ModuleResponse;
  };
  top_mv: { input: topMvInput; query: topMvInput; response: ModuleResponse };
  top_playlist: {
    input: topPlaylistInput;
    query: topPlaylistInput;
    response: ModuleResponse;
  };
  top_playlist_highquality: {
    input: topPlaylistHighqualityInput;
    query: topPlaylistHighqualityInput;
    response: ModuleResponse;
  };
  top_song: {
    input: topSongInput;
    query: topSongInput;
    response: ModuleResponse;
  };
  topic_detail: {
    input: topicDetailInput;
    query: topicDetailInput;
    response: ModuleResponse;
  };
  topic_detail_event_hot: {
    input: topicDetailEventHotInput;
    query: topicDetailEventHotInput;
    response: ModuleResponse;
  };
  topic_sublist: {
    input: topicSublistInput;
    query: topicSublistInput;
    response: ModuleResponse;
  };
  toplist: {
    input: toplistInput;
    query: toplistInput;
    response: ModuleResponse;
  };
  toplist_artist: {
    input: toplistArtistInput;
    query: toplistArtistInput;
    response: ModuleResponse;
  };
  toplist_detail: {
    input: toplistDetailInput;
    query: toplistDetailInput;
    response: ModuleResponse;
  };
  ugc_album_get: {
    input: ugcAlbumGetInput;
    query: ugcAlbumGetInput;
    response: ModuleResponse;
  };
  ugc_artist_get: {
    input: ugcArtistGetInput;
    query: ugcArtistGetInput;
    response: ModuleResponse;
  };
  ugc_artist_search: {
    input: ugcArtistSearchInput;
    query: ugcArtistSearchInput;
    response: ModuleResponse;
  };
  ugc_detail: {
    input: ugcDetailInput;
    query: ugcDetailInput;
    response: ModuleResponse;
  };
  ugc_mv_get: {
    input: ugcMvGetInput;
    query: ugcMvGetInput;
    response: ModuleResponse;
  };
  ugc_song_get: {
    input: ugcSongGetInput;
    query: ugcSongGetInput;
    response: ModuleResponse;
  };
  ugc_user_devote: {
    input: ugcUserDevoteInput;
    query: ugcUserDevoteInput;
    response: ModuleResponse;
  };
  user_account: {
    input: userAccountInput;
    query: userAccountInput;
    response: ModuleResponse<userAccountBody>;
  };
  user_audio: {
    input: userAudioInput;
    query: userAudioInput;
    response: ModuleResponse;
  };
  user_binding: {
    input: userBindingInput;
    query: userBindingInput;
    response: ModuleResponse;
  };
  user_cloud: {
    input: userCloudInput;
    query: userCloudInput;
    response: ModuleResponse;
  };
  user_cloud_del: {
    input: userCloudDelInput;
    query: userCloudDelInput;
    response: ModuleResponse;
  };
  user_cloud_detail: {
    input: userCloudDetailInput;
    query: userCloudDetailInput;
    response: ModuleResponse;
  };
  user_comment_history: {
    input: userCommentHistoryInput;
    query: userCommentHistoryInput;
    response: ModuleResponse;
  };
  user_detail: {
    input: userDetailInput;
    query: userDetailInput;
    response: ModuleResponse<userDetailBody>;
  };
  user_dj: { input: userDjInput; query: userDjInput; response: ModuleResponse };
  user_event: {
    input: userEventInput;
    query: userEventInput;
    response: ModuleResponse;
  };
  user_follow_mixed: {
    input: userFollowMixedInput;
    query: userFollowMixedInput;
    response: ModuleResponse;
  };
  user_followeds: {
    input: userFollowedsInput;
    query: userFollowedsInput;
    response: ModuleResponse;
  };
  user_follows: {
    input: userFollowsInput;
    query: userFollowsInput;
    response: ModuleResponse;
  };
  user_level: {
    input: userLevelInput;
    query: userLevelInput;
    response: ModuleResponse;
  };
  user_medal: {
    input: userMedalInput;
    query: userMedalInput;
    response: ModuleResponse;
  };
  user_mutualfollow_get: {
    input: userMutualfollowGetInput;
    query: userMutualfollowGetInput;
    response: ModuleResponse;
  };
  user_playlist: {
    input: userPlaylistInput;
    query: userPlaylistInput;
    response: ModuleResponse;
  };
  user_playlist_collect: {
    input: userPlaylistCollectInput;
    query: userPlaylistCollectInput;
    response: ModuleResponse;
  };
  user_playlist_create: {
    input: userPlaylistCreateInput;
    query: userPlaylistCreateInput;
    response: ModuleResponse;
  };
  user_record: {
    input: userRecordInput;
    query: userRecordInput;
    response: ModuleResponse;
  };
  user_replacephone: {
    input: userReplacephoneInput;
    query: userReplacephoneInput;
    response: ModuleResponse;
  };
  user_social_status: {
    input: userSocialStatusInput;
    query: userSocialStatusInput;
    response: ModuleResponse;
  };
  user_social_status_edit: {
    input: userSocialStatusEditInput;
    query: userSocialStatusEditInput;
    response: ModuleResponse;
  };
  user_social_status_rcmd: {
    input: userSocialStatusRcmdInput;
    query: userSocialStatusRcmdInput;
    response: ModuleResponse;
  };
  user_social_status_support: {
    input: userSocialStatusSupportInput;
    query: userSocialStatusSupportInput;
    response: ModuleResponse;
  };
  user_subcount: {
    input: userSubcountInput;
    query: userSubcountInput;
    response: ModuleResponse;
  };
  user_update: {
    input: userUpdateInput;
    query: userUpdateInput;
    response: ModuleResponse;
  };
  verify_getQr: {
    input: verifyGetQrInput;
    query: verifyGetQrInput;
    response: ModuleResponse<verifyGetQrBody>;
  };
  verify_qrcodestatus: {
    input: verifyQrcodestatusInput;
    query: verifyQrcodestatusInput;
    response: ModuleResponse;
  };
  video_category_list: {
    input: videoCategoryListInput;
    query: videoCategoryListInput;
    response: ModuleResponse;
  };
  video_detail: {
    input: videoDetailInput;
    query: videoDetailInput;
    response: ModuleResponse;
  };
  video_detail_info: {
    input: videoDetailInfoInput;
    query: videoDetailInfoInput;
    response: ModuleResponse;
  };
  video_group: {
    input: videoGroupInput;
    query: videoGroupInput;
    response: ModuleResponse;
  };
  video_group_list: {
    input: videoGroupListInput;
    query: videoGroupListInput;
    response: ModuleResponse;
  };
  video_sub: {
    input: videoSubInput;
    query: videoSubInput;
    response: ModuleResponse;
  };
  video_timeline_all: {
    input: videoTimelineAllInput;
    query: videoTimelineAllInput;
    response: ModuleResponse;
  };
  video_timeline_recommend: {
    input: videoTimelineRecommendInput;
    query: videoTimelineRecommendInput;
    response: ModuleResponse;
  };
  video_url: {
    input: videoUrlInput;
    query: videoUrlInput;
    response: ModuleResponse;
  };
  vip_growthpoint: {
    input: vipGrowthpointInput;
    query: vipGrowthpointInput;
    response: ModuleResponse;
  };
  vip_growthpoint_details: {
    input: vipGrowthpointDetailsInput;
    query: vipGrowthpointDetailsInput;
    response: ModuleResponse;
  };
  vip_growthpoint_get: {
    input: vipGrowthpointGetInput;
    query: vipGrowthpointGetInput;
    response: ModuleResponse;
  };
  vip_info: {
    input: vipInfoInput;
    query: vipInfoInput;
    response: ModuleResponse;
  };
  vip_info_v2: {
    input: vipInfoV2Input;
    query: vipInfoV2Input;
    response: ModuleResponse;
  };
  vip_tasks: {
    input: vipTasksInput;
    query: vipTasksInput;
    response: ModuleResponse;
  };
  vip_timemachine: {
    input: vipTimemachineInput;
    query: vipTimemachineInput;
    response: ModuleResponse;
  };
  voice_delete: {
    input: voiceDeleteInput;
    query: voiceDeleteInput;
    response: ModuleResponse;
  };
  voice_detail: {
    input: voiceDetailInput;
    query: voiceDetailInput;
    response: ModuleResponse;
  };
  voice_lyric: {
    input: voiceLyricInput;
    query: voiceLyricInput;
    response: ModuleResponse;
  };
  voice_upload: {
    input: voiceUploadInput;
    query: voiceUploadInput;
    response: ModuleResponse;
  };
  voicelist_detail: {
    input: voicelistDetailInput;
    query: voicelistDetailInput;
    response: ModuleResponse;
  };
  voicelist_list: {
    input: voicelistListInput;
    query: voicelistListInput;
    response: ModuleResponse;
  };
  voicelist_list_search: {
    input: voicelistListSearchInput;
    query: voicelistListSearchInput;
    response: ModuleResponse;
  };
  voicelist_search: {
    input: voicelistSearchInput;
    query: voicelistSearchInput;
    response: ModuleResponse;
  };
  voicelist_trans: {
    input: voicelistTransInput;
    query: voicelistTransInput;
    response: ModuleResponse;
  };
  yunbei: { input: yunbeiInput; query: yunbeiInput; response: ModuleResponse };
  yunbei_expense: {
    input: yunbeiExpenseInput;
    query: yunbeiExpenseInput;
    response: ModuleResponse;
  };
  yunbei_info: {
    input: yunbeiInfoInput;
    query: yunbeiInfoInput;
    response: ModuleResponse;
  };
  yunbei_rcmd_song: {
    input: yunbeiRcmdSongInput;
    query: yunbeiRcmdSongInput;
    response: ModuleResponse;
  };
  yunbei_rcmd_song_history: {
    input: yunbeiRcmdSongHistoryInput;
    query: yunbeiRcmdSongHistoryInput;
    response: ModuleResponse;
  };
  yunbei_receipt: {
    input: yunbeiReceiptInput;
    query: yunbeiReceiptInput;
    response: ModuleResponse;
  };
  yunbei_sign: {
    input: yunbeiSignInput;
    query: yunbeiSignInput;
    response: ModuleResponse;
  };
  yunbei_task_finish: {
    input: yunbeiTaskFinishInput;
    query: yunbeiTaskFinishInput;
    response: ModuleResponse;
  };
  yunbei_tasks: {
    input: yunbeiTasksInput;
    query: yunbeiTasksInput;
    response: ModuleResponse;
  };
  yunbei_tasks_todo: {
    input: yunbeiTasksTodoInput;
    query: yunbeiTasksTodoInput;
    response: ModuleResponse;
  };
  yunbei_today: {
    input: yunbeiTodayInput;
    query: yunbeiTodayInput;
    response: ModuleResponse;
  };
}
