import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import {
  Artist,
  PlaylistUser,
  ProgramDj,
  SimpleAlbum,
} from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 电台详情里的主播记录：`PlaylistUser` 之外还有打赏相关字段，编号仍宽松。
const RadioDj = UpstreamObject({
  ...PlaylistUser.schema.fields,
  canReward: Loose(Schema.Boolean),
  rewardCount: Loose(Schema.Finite),
});

const RadioIcon = UpstreamObject({
  color: Loose(Schema.String),
  type: Loose(Schema.String),
  value: Loose(Schema.String),
});

const CommentData = UpstreamObject({
  commentId: Loose(Schema.Finite),
  content: Loose(Schema.String),
  programId: Loose(Schema.Finite),
  programName: Loose(Schema.String),
  userProfile: Loose(PlaylistUser),
});

const LegacyQuality = UpstreamObject({
  bitrate: Loose(Schema.Finite),
  dfsId: Loose(Schema.Finite),
  extension: Loose(Schema.String),
  id: Loose(Schema.Finite),
  playTime: Loose(Schema.Finite),
  size: Loose(Schema.Finite),
  sr: Loose(Schema.Finite),
  volumeDelta: Loose(Schema.Finite),
});

const LegacySong = UpstreamObject({
  album: Loose(SimpleAlbum),
  artists: Loose(Schema.Array(Artist)),
  bMusic: Loose(LegacyQuality),
  commentThreadId: Loose(Schema.String),
  copyFrom: Loose(Schema.String),
  copyright: Loose(Schema.Finite),
  copyrightId: Loose(Schema.Finite),
  dayPlays: Loose(Schema.Finite),
  disc: Loose(Schema.String),
  duration: Loose(Schema.Finite),
  fee: Loose(Schema.Finite),
  ftype: Loose(Schema.Finite),
  hMusic: Loose(LegacyQuality),
  hearTime: Loose(Schema.Finite),
  id: Loose(Schema.Finite),
  lMusic: Loose(LegacyQuality),
  mMusic: Loose(LegacyQuality),
  mark: Loose(Schema.Finite),
  mvid: Loose(Schema.Finite),
  name: Loose(Schema.String),
  no: Loose(Schema.Finite),
  playedNum: Loose(Schema.Finite),
  position: Loose(Schema.Finite),
  popularity: Loose(Schema.Finite),
  publishTime: Loose(Schema.Finite),
  ringtone: Loose(Schema.String),
  rtype: Loose(Schema.Finite),
  score: Loose(Schema.Finite),
  starred: Loose(Schema.Boolean),
  starredNum: Loose(Schema.Finite),
  status: Loose(Schema.Finite),
});

const Program = UpstreamObject({
  auditDisPlayStatus: Loose(Schema.Finite),
  auditStatus: Loose(Schema.Finite),
  bdAuditStatus: Loose(Schema.Finite),
  blurCoverUrl: Loose(Schema.String),
  buyed: Loose(Schema.Boolean),
  buyedNew: Loose(Schema.Boolean),
  canReward: Loose(Schema.Boolean),
  categoryId: Loose(Schema.Finite),
  channels: Loose(Schema.Array(Schema.String)),
  code: Loose(Schema.Finite),
  commentCount: Loose(Schema.Finite),
  commentThreadId: Loose(Schema.String),
  coverId: Loose(Schema.Finite),
  coverUrl: Loose(Schema.String),
  createEventId: Loose(Schema.Finite),
  createTime: Loose(Schema.Finite),
  description: Loose(Schema.String),
  dj: Loose(ProgramDj),
  duration: Loose(Schema.Finite),
  existLyric: Loose(Schema.Boolean),
  feeScope: Loose(Schema.Finite),
  id: Loose(Schema.Finite),
  isPublish: Loose(Schema.Boolean),
  likedCount: Loose(Schema.Finite),
  listenerCount: Loose(Schema.Finite),
  mainSong: Loose(LegacySong),
  mainTrackId: Loose(Schema.Finite),
  name: Loose(Schema.String),
  privacy: Loose(Schema.Boolean),
  programFeeType: Loose(Schema.Finite),
  pubStatus: Loose(Schema.Finite),
  recommended: Loose(Schema.Boolean),
  replaceVoiceId: Loose(Schema.Finite),
  reward: Loose(Schema.Boolean),
  scheduledPublishTime: Loose(Schema.Finite),
  score: Loose(Schema.Finite),
  secondCategoryId: Loose(Schema.Finite),
  serialNum: Loose(Schema.Finite),
  shareCount: Loose(Schema.Finite),
  smallLanguageAuditStatus: Loose(Schema.Finite),
  specialType: Loose(Schema.Finite),
  subscribedCount: Loose(Schema.Finite),
  trackCount: Loose(Schema.Finite),
});

const FeeModuleDetailItem = UpstreamObject({
  content: Loose(Schema.String),
  id: Loose(Schema.Finite),
  type: Loose(Schema.Finite),
});

const FeeModuleDetail = UpstreamObject({
  detail: Loose(Schema.Array(FeeModuleDetailItem)),
  title: Loose(Schema.String),
  type: Loose(Schema.Finite),
});

const FeeModule = UpstreamObject({
  data: Loose(Schema.Union([FeeModuleDetail, Schema.Array(Program)])),
  type: Loose(Schema.Finite),
});

const FeeInfo = UpstreamObject({
  buyed: Loose(Schema.Boolean),
  finished: Loose(Schema.Boolean),
  modules: Loose(Schema.Array(FeeModule)),
  originalPrice: Loose(Schema.Finite),
  price: Loose(Schema.Finite),
  purchaseCount: Loose(Schema.Finite),
  slogan: Loose(Schema.String),
  undershelf: Loose(Schema.Boolean),
  videos: Loose(UpstreamObject({})),
});

const RadioDetail = UpstreamObject({
  id: Schema.Finite,
  category: Loose(Schema.String),
  categoryId: Loose(Schema.Finite),
  commentCount: Loose(Schema.Finite),
  commentDatas: Loose(Schema.Array(CommentData)),
  createTime: Loose(Schema.Finite),
  desc: Loose(Schema.String),
  detailRcmdTabOrpheus: Loose(Schema.String),
  disableShare: Loose(Schema.Boolean),
  dj: Loose(RadioDj),
  dynamic: Loose(Schema.Boolean),
  feeInfo: Loose(FeeInfo),
  feeScope: Loose(Schema.Finite),
  icon: Loose(RadioIcon),
  lastProgramCreateTime: Loose(Schema.Finite),
  lastProgramId: Loose(Schema.Finite),
  likedCount: Loose(Schema.Finite),
  name: Loose(Schema.String),
  original: Loose(Schema.Boolean),
  picId: Loose(Schema.Finite),
  picUrl: Loose(Schema.String),
  playCount: Loose(Schema.Finite),
  privacy: Loose(Schema.Boolean),
  programCount: Loose(Schema.Finite),
  radioFeeType: Loose(Schema.Finite),
  rcmdText: Loose(Schema.String),
  secondCategory: Loose(Schema.String),
  secondCategoryId: Loose(Schema.Finite),
  shareCount: Loose(Schema.Finite),
  subCount: Loose(Schema.Finite),
  subed: Loose(Schema.Boolean),
});

// 通到电台详情的路径 `data` 和电台自己的编号 `data.id` 收紧；主播、评论、付费电台的 `feeInfo` 和其余展示字段宽松；`feeInfo.discountPrice` 只见过 null，未声明，`feeInfo.videos` 只见过空对象，声明为空对象。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: RadioDetail,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djDetail: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.rid,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/djradio/v2/get`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('dj_detail', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 电台详情
 */
export default djDetail;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
