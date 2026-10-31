import { Effect, Schema } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const AnnualPlaylistItem = UpstreamObject({
  artistId: Loose(Schema.String),
  artistName: Loose(Schema.String),
  chorusSegmentEndPosition: Loose(Schema.Finite),
  chorusSegmentStartPosition: Loose(Schema.Finite),
  index: Loose(Schema.Finite),
  picUrl: Loose(Schema.String),
  picid: Loose(Schema.String),
  playCount: Loose(Schema.Finite),
  songId: Loose(Schema.Finite),
  songName: Loose(Schema.String),
});

const PlayProgress = UpstreamObject({
  chorusEnd: Loose(Schema.Finite),
  chorusStart: Loose(Schema.Finite),
  songId: Loose(Schema.Finite),
});

const SongArtistSummary = UpstreamObject({
  artistName: Loose(Schema.String),
  playCount: Loose(Schema.Finite),
  songId: Loose(Schema.Finite),
  songName: Loose(Schema.String),
});

const SeasonSong = UpstreamObject({
  artistId: Loose(Schema.String),
  artistName: Loose(Schema.String),
  bpm: Loose(Schema.Finite),
  genreTagNameList: Loose(Schema.String),
  picId: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  playNum: Loose(Schema.Finite),
  seasonIndex: Loose(Schema.Finite),
  songId: Loose(Schema.Finite),
  songName: Loose(Schema.String),
});

const YearSong = UpstreamObject({
  artistName: Loose(Schema.String),
  songCoverUrl: Loose(Schema.String),
  songId: Loose(Schema.Finite),
  songName: Loose(Schema.String),
});

const AnnualData = UpstreamObject({
  aan: Loose(Schema.String),
  annualPlaylist: Loose(
    UpstreamObject({
      items: Loose(Schema.Array(AnnualPlaylistItem)),
      pureItems: Loose(Schema.Array(AnnualPlaylistItem)),
    }),
  ),
  annualPlaylistAlbum: Loose(
    UpstreamObject({
      favoriteAlbum: Loose(
        UpstreamObject({
          albumId: Loose(Schema.String),
          albumName: Loose(Schema.String),
          albumPicId: Loose(Schema.String),
          albumPicUrl: Loose(Schema.String),
          artistName: Loose(Schema.String),
          playCount: Loose(Schema.Finite),
          playDays: Loose(Schema.Finite),
          playDuration: Loose(Schema.Finite),
          playUrl: Loose(PlayProgress),
          songId: Loose(Schema.Finite),
          songName: Loose(Schema.String),
        }),
      ),
    }),
  ),
  annualSinger: Loose(
    UpstreamObject({
      artistId: Loose(Schema.String),
      follow: Loose(Schema.Boolean),
      playCount: Loose(Schema.Finite),
      playUrl: Loose(PlayProgress),
      singerId: Loose(Schema.String),
      singerName: Loose(Schema.String),
      singerPicId: Loose(Schema.String),
      singerPicUrl: Loose(Schema.String),
      singerPicid: Loose(Schema.String),
      singerPlayDays: Loose(Schema.Finite),
      top5Songs: Loose(
        Schema.Array(
          UpstreamObject({
            index: Loose(Schema.Finite),
            name: Loose(Schema.String),
            playCount: Loose(Schema.Finite),
            songId: Loose(Schema.Finite),
          }),
        ),
      ),
    }),
  ),
  annualSingerComparePage: Loose(
    UpstreamObject({
      singers: Loose(
        Schema.Array(
          UpstreamObject({
            singerId: Loose(Schema.String),
            singerName: Loose(Schema.String),
            singerPicUrl: Loose(Schema.String),
            singerPicid: Loose(Schema.String),
            year: Loose(Schema.Union([Schema.Finite, Schema.String])),
          }),
        ),
      ),
    }),
  ),
  annualSong: Loose(
    UpstreamObject({
      artistNameList: Loose(Schema.String),
      artistnamelist: Loose(Schema.String),
      firstDate: Loose(Schema.Finite),
      hundredthDate: Loose(Schema.Finite),
      playCnt: Loose(Schema.Finite),
      playDays: Loose(Schema.Finite),
      playUrl: Loose(PlayProgress),
      songId: Loose(Schema.Finite),
      songName: Loose(Schema.String),
      songPicId: Loose(Schema.String),
      songPicUrl: Loose(Schema.String),
      tune: Loose(Schema.String),
      userCountOfThisAnnualSong: Loose(Schema.Finite),
    }),
  ),
  arid: Loose(Schema.Finite),
  arpc: Loose(Schema.Finite),
  arstp: Loose(
    Schema.Array(
      UpstreamObject({
        an: Loose(Schema.String),
        pc: Loose(Schema.Finite),
        sid: Loose(Schema.Finite),
        sn: Loose(Schema.String),
      }),
    ),
  ),
  arul: Loose(Schema.String),
  aul: Loose(Schema.String),
  bydu: Loose(Schema.Finite),
  cc: Loose(Schema.Finite),
  clc: Loose(Schema.Finite),
  commentBizPage: Loose(
    UpstreamObject({
      bePraisedCount: Loose(Schema.Finite),
      commentPublish: Loose(
        UpstreamObject({
          bePraisedCount: Loose(Schema.Finite),
          count: Loose(Schema.Finite),
          maxPraisedCountComment: Loose(
            UpstreamObject({
              count: Loose(Schema.Finite),
              detail: Loose(Schema.String),
              name: Loose(Schema.String),
            }),
          ),
        }),
      ),
      commentSocial: Loose(
        UpstreamObject({
          maxPraiseComment: Loose(
            UpstreamObject({
              count: Loose(Schema.Finite),
              detail: Loose(Schema.String),
              name: Loose(Schema.String),
            }),
          ),
          praiseCommentCount: Loose(Schema.Finite),
        }),
      ),
      count: Loose(Schema.Finite),
      hqCount: Loose(Schema.Finite),
      maxPraisedCountComment: Loose(
        UpstreamObject({
          count: Loose(Schema.Finite),
          detail: Loose(Schema.String),
          name: Loose(Schema.String),
        }),
      ),
    }),
  ),
  cpc: Loose(Schema.Finite),
  cppc: Loose(Schema.Finite),
  cprc: Loose(Schema.Finite),
  cprpc: Loose(Schema.Finite),
  cprsc: Loose(Schema.Finite),
  cpsc: Loose(Schema.Finite),
  crlc: Loose(Schema.Finite),
  dopamineColor: Loose(
    UpstreamObject({
      dopamine: Loose(Schema.Finite),
      group: Loose(Schema.String),
      playDuration: Loose(Schema.Finite),
      rainbowText: Loose(Schema.Array(Schema.String)),
      type: Loose(Schema.String),
    }),
  ),
  eggStatistics: Loose(
    UpstreamObject({
      activeDaysThisYear: Loose(Schema.Finite),
      artistPlayCount: Loose(Schema.Finite),
      buyAlbumCount: Loose(Schema.Finite),
      commentCount: Loose(Schema.Finite),
      dailyRcmdViewDays: Loose(Schema.Finite),
      djPlayHours: Loose(Schema.Finite),
      genrePercents: Loose(
        Schema.Array(
          UpstreamObject({
            genrePlayCnt: Loose(Schema.Finite),
            genreTagName: Loose(Schema.String),
            rank: Loose(Schema.Finite),
          }),
        ),
      ),
      genrePlayCount: Loose(Schema.Finite),
      headArtistName: Loose(Schema.String),
      headArtistPlayCnt: Loose(Schema.Finite),
      latePlayDays: Loose(Schema.Finite),
      level: Loose(Schema.Finite),
      loginDays: Loose(Schema.Finite),
      playlistCount: Loose(Schema.Finite),
      searchCount: Loose(Schema.Finite),
      songPlayCount: Loose(Schema.Finite),
      songShareCount: Loose(Schema.Finite),
      starSongCount: Loose(Schema.Finite),
      voiceBookPlayCount: Loose(Schema.Finite),
    }),
  ),
  encUserId: Loose(Schema.String),
  fan: Loose(Schema.String),
  forgottenSong: Loose(
    UpstreamObject({
      datetime: Loose(Schema.Finite),
      songArtistDTO: Loose(SongArtistSummary),
    }),
  ),
  frsh: Loose(Schema.Finite),
  frth: Loose(Schema.Finite),
  fsan: Loose(Schema.String),
  fsid: Loose(Schema.Finite),
  fsn: Loose(Schema.String),
  genrePlayRank: Loose(
    UpstreamObject({
      genreRank: Loose(
        Schema.Array(
          UpstreamObject({
            genreTagName: Loose(Schema.String),
            oneGenreTagName: Loose(Schema.String),
            percent: Loose(Schema.Finite),
            rank: Loose(Schema.Finite),
          }),
        ),
      ),
      specialGenreRank: Loose(Schema.Array(Schema.String)),
    }),
  ),
  genrePlayRanks: Loose(
    Schema.Array(
      UpstreamObject({
        genreCnt: Loose(Schema.String),
        genreRank: Loose(
          Schema.Array(
            UpstreamObject({
              genrePlayCnt: Loose(Schema.String),
              genreTagName: Loose(Schema.String),
              rank: Loose(Schema.String),
            }),
          ),
        ),
        genreType: Loose(Schema.String),
      }),
    ),
  ),
  ha: Loose(Schema.Boolean),
  hcc: Loose(Schema.Finite),
  jcz: Loose(Schema.Finite),
  keyWord: Loose(
    UpstreamObject({
      keyword: Loose(Schema.String),
      lyricCnt: Loose(Schema.Finite),
      lyricList: Loose(
        Schema.Array(
          UpstreamObject({
            artistId: Loose(Schema.String),
            artistName: Loose(Schema.String),
            lyric: Loose(Schema.String),
            playCnt: Loose(Schema.Finite),
            songId: Loose(Schema.Finite),
            songName: Loose(Schema.String),
          }),
        ),
      ),
    }),
  ),
  kw: Loose(Schema.String),
  kwc: Loose(Schema.Finite),
  latePlayDTO: Loose(
    UpstreamObject({
      artistName: Loose(Schema.String),
      datetime: Loose(Schema.Finite),
      songId: Loose(Schema.Finite),
      songName: Loose(Schema.String),
      songPicId: Loose(Schema.String),
      songPicUrl: Loose(Schema.String),
    }),
  ),
  lc: Loose(Schema.Finite),
  lcc: Loose(Schema.Finite),
  le: Loose(Schema.String),
  lfc: Loose(Schema.Finite),
  listenOverview: Loose(
    UpstreamObject({
      daysSinceReg: Loose(Schema.Finite),
      firstPlaySongArtist: Loose(Schema.String),
      firstPlaySongID: Loose(Schema.Finite),
      firstPlaySongName: Loose(Schema.String),
      hisFirstSongCoverUrl: Loose(Schema.String),
      maxDaySongArtistName: Loose(Schema.String),
      maxDaySongCoverUrl: Loose(Schema.String),
      maxDaySongId: Loose(Schema.Finite),
      maxDaySongName: Loose(Schema.String),
      regTime: Loose(Schema.Finite),
    }),
  ),
  listenTimePeriod: Loose(
    UpstreamObject({
      distributions: Loose(
        Schema.Array(
          UpstreamObject({
            hour: Loose(Schema.Finite),
            month: Loose(Schema.Finite),
            peak: Loose(Schema.Finite),
          }),
        ),
      ),
      maxTimePeriod: Loose(Schema.String),
      totalMaxPlayCount: Loose(Schema.Finite),
    }),
  ),
  listenYears: Loose(
    UpstreamObject({
      pies: Loose(
        Schema.Array(
          UpstreamObject({
            count: Loose(Schema.Finite),
            name: Loose(Schema.String),
          }),
        ),
      ),
      songs: Loose(
        Schema.Array(
          UpstreamObject({
            artistName: Loose(Schema.String),
            playCount: Loose(Schema.Finite),
            publishYear: Loose(Schema.String),
            songId: Loose(Schema.Finite),
            songName: Loose(Schema.String),
            songPicId: Loose(Schema.Finite),
            songPicUrl: Loose(Schema.String),
          }),
        ),
      ),
    }),
  ),
  listenYearsAlbumCovers: Loose(Schema.Array(Schema.String)),
  loopSongDTO: Loose(
    UpstreamObject({
      playCount: Loose(Schema.Finite),
      playDate: Loose(Schema.Finite),
      singerId: Loose(Schema.String),
      singerName: Loose(Schema.String),
      songId: Loose(Schema.String),
      songName: Loose(Schema.String),
      songPicUrl: Loose(Schema.String),
    }),
  ),
  lsc: Loose(Schema.Finite),
  lyr: Loose(
    Schema.Array(
      UpstreamObject({
        an: Loose(Schema.String),
        lyc: Loose(Schema.String),
        sid: Loose(Schema.Finite),
        sn: Loose(Schema.String),
        w: Loose(Schema.String),
      }),
    ),
  ),
  man: Loose(Schema.String),
  mdan: Loose(Schema.String),
  mdc: Loose(Schema.Finite),
  mdsid: Loose(Schema.Finite),
  mdsn: Loose(Schema.String),
  mdspc: Loose(Schema.Finite),
  mdsu: Loose(Schema.Finite),
  minoritySong: Loose(
    UpstreamObject({
      minoritySingerId: Loose(Schema.String),
      minoritySingerName: Loose(Schema.String),
      minoritySongFirstDate: Loose(Schema.Finite),
      minoritySongId: Loose(Schema.String),
      minoritySongIrstDate: Loose(Schema.Finite),
      minoritySongName: Loose(Schema.String),
      minoritySongPlayCount: Loose(Schema.Finite),
      minoritySongPlayNum: Loose(Schema.Finite),
      minoritySongPlayUnt: Loose(Schema.Finite),
    }),
  ),
  mitc: Loose(Schema.Finite),
  mlbc: Loose(Schema.Finite),
  mlc: Loose(Schema.Union([Schema.Finite, Schema.String])),
  mlid: Loose(Schema.Finite),
  mln: Loose(Schema.String),
  mlpc: Loose(Schema.Finite),
  mpt: Loose(Schema.Finite),
  mran: Loose(Schema.String),
  mrsid: Loose(Schema.Finite),
  mrsn: Loose(Schema.String),
  mrspc: Loose(Schema.Finite),
  mrsu: Loose(Schema.Finite),
  msid: Loose(Schema.Finite),
  msn: Loose(Schema.String),
  mst: Loose(Schema.Finite),
  msu: Loose(Schema.Finite),
  musicEmotion: Loose(
    UpstreamObject({
      genre: Loose(Schema.String),
    }),
  ),
  musician: Loose(Schema.Boolean),
  musicianBizPage: Loose(
    UpstreamObject({
      bePlayedCount: Loose(Schema.Finite),
      beSubscribedCount: Loose(Schema.Finite),
      createCount: Loose(Schema.Finite),
      musicianAvatarUrl: Loose(Schema.String),
      musicianName: Loose(Schema.String),
    }),
  ),
  nkn: Loose(Schema.String),
  osan: Loose(Schema.String),
  osid: Loose(Schema.Finite),
  osn: Loose(Schema.String),
  ospb: Loose(Schema.Finite),
  ost: Loose(Schema.Finite),
  ouid: Loose(Schema.Finite),
  playlistBizPage: Loose(
    UpstreamObject({
      bePlayedCount: Loose(Schema.Finite),
      beSubscribedCount: Loose(Schema.Finite),
      createCount: Loose(Schema.Finite),
    }),
  ),
  plbc: Loose(Schema.Finite),
  plc: Loose(Schema.Finite),
  plpc: Loose(Schema.Finite),
  psc: Loose(Schema.Finite),
  pst: Loose(Schema.Finite),
  psto: Loose(Schema.String),
  raid: Loose(Schema.Finite),
  ran: Loose(Schema.String),
  rapc: Loose(Schema.Finite),
  ratpc: Loose(Schema.Finite),
  rbc: Loose(Schema.Finite),
  rc: Loose(Schema.Finite),
  rcc: Loose(Schema.Finite),
  rlc: Loose(Schema.Finite),
  rpc: Loose(Schema.Finite),
  rsc: Loose(Schema.Finite),
  rsd: Loose(Schema.String),
  rsid: Loose(Schema.Finite),
  rsn: Loose(Schema.String),
  rst: Loose(Schema.Finite),
  rt: Loose(Schema.Finite),
  sbc: Loose(Schema.Finite),
  scc: Loose(Schema.Finite),
  seasonsListen: Loose(
    UpstreamObject({
      autumn: Loose(SeasonSong),
      spring: Loose(SeasonSong),
      summer: Loose(SeasonSong),
      winter: Loose(SeasonSong),
    }),
  ),
  sil: Loose(
    Schema.Array(
      UpstreamObject({
        an: Loose(Schema.String),
        ap: Loose(Schema.String),
        sid: Loose(Schema.Finite),
        sn: Loose(Schema.String),
      }),
    ),
  ),
  slc: Loose(Schema.Finite),
  spc: Loose(Schema.Finite),
  specialDay: Loose(
    UpstreamObject({
      latePlay: Loose(
        UpstreamObject({
          artistId: Loose(Schema.String),
          artistName: Loose(Schema.String),
          datetime: Loose(Schema.Finite),
          songId: Loose(Schema.Finite),
          songName: Loose(Schema.String),
          songPicId: Loose(Schema.String),
          songPicUrl: Loose(Schema.String),
        }),
      ),
      maxLoopSong: Loose(
        UpstreamObject({
          playCount: Loose(Schema.Finite),
          playdate: Loose(Schema.Finite),
          singerName: Loose(Schema.String),
          songName: Loose(Schema.String),
        }),
      ),
      songArtistDTO: Loose(SongArtistSummary),
      specialDay: Loose(Schema.String),
      specialDayDate: Loose(Schema.Finite),
    }),
  ),
  specialMemory: Loose(
    UpstreamObject({
      datetime: Loose(Schema.Finite),
      relateIPName: Loose(Schema.String),
      song: Loose(SongArtistSummary),
    }),
  ),
  st: Loose(Schema.String),
  stc: Loose(Schema.Finite),
  sth: Loose(Schema.Finite),
  stl: Loose(
    Schema.Array(
      UpstreamObject({
        tn: Loose(Schema.String),
        tv: Loose(Schema.Finite),
      }),
    ),
  ),
  stp: Loose(
    Schema.Array(
      UpstreamObject({
        an: Loose(Schema.String),
        pc: Loose(Schema.Finite),
        sid: Loose(Schema.Finite),
        sn: Loose(Schema.String),
      }),
    ),
  ),
  summaryPage: Loose(
    UpstreamObject({
      colorCode: Loose(Schema.String),
      colorText: Loose(Schema.String),
      title: Loose(Schema.String),
    }),
  ),
  tod: Loose(Schema.String),
  tosid: Loose(Schema.Finite),
  tosn: Loose(Schema.String),
  tossu: Loose(Schema.Finite),
  typ: Loose(Schema.String),
  ufc: Loose(Schema.Finite),
  ufcc: Loose(Schema.Finite),
  uft: Loose(Schema.Finite),
  uid: Loose(Schema.String),
  uun: Loose(Schema.String),
  uvc: Loose(Schema.Finite),
  vaid: Loose(Schema.Finite),
  vd: Loose(Schema.String),
  vipBizPage: Loose(
    UpstreamObject({
      appIconUseNum: Loose(Schema.Finite),
      firstTime: Loose(Schema.Finite),
      freeVipDayNum: Loose(Schema.Finite),
      hqPlayDuration: Loose(Schema.Finite),
      pendantUseNum: Loose(Schema.Finite),
      playerModelUseNum: Loose(Schema.Finite),
      svip: Loose(Schema.Boolean),
      vip: Loose(Schema.Boolean),
      vipFirstTime: Loose(Schema.Finite),
      vipPlaySongNum: Loose(Schema.Finite),
      vipSongCount: Loose(Schema.Finite),
      vipSongPlayCount: Loose(Schema.Finite),
    }),
  ),
  voicePlayBizPage: Loose(
    UpstreamObject({
      activateDays: Loose(Schema.Finite),
      overUserPercent: Loose(Schema.Finite),
      playDuration: Loose(Schema.Finite),
      top1AudioPlayDuration: Loose(Schema.Finite),
      top1RadioPlayDuration: Loose(Schema.Finite),
    }),
  ),
  vpc: Loose(Schema.Finite),
  vpt: Loose(Schema.String),
  vraid: Loose(Schema.Finite),
  vsc: Loose(Schema.Finite),
  vsid: Loose(Schema.Finite),
  vt: Loose(Schema.Finite),
  yal: Loose(
    Schema.Array(
      UpstreamObject({
        pc: Loose(Schema.Finite),
        sn: Loose(Schema.String),
      }),
    ),
  ),
  yan: Loose(Schema.String),
  yap: Loose(Schema.String),
  ycc: Loose(Schema.Finite),
  yearOverview: Loose(
    UpstreamObject({
      firstPlayedSong: Loose(YearSong),
      maxPlayedSong: Loose(YearSong),
      playCount: Loose(Schema.Finite),
      playTime: Loose(Schema.Finite),
    }),
  ),
  ypc: Loose(Schema.Finite),
  ysc: Loose(Schema.Finite),
  yuncunFootprintPage: Loose(
    UpstreamObject({
      footprintItems: Loose(
        Schema.Array(
          UpstreamObject({
            publishYear: Loose(Schema.String),
            song: Loose(YearSong),
            year: Loose(Schema.Finite),
          }),
        ),
      ),
    }),
  ),
});

// 返回码和年度报告的路径 `data` 收紧；报告正文随年份变化（2020 年起是长键，2017–2019 走 `userdata` 短键），
// 已声明字段全部宽松，未声明的字段原样保留。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: AnnualData,
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const summaryAnnual: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    if (
      query.year !== undefined &&
      query.year !== null &&
      typeof query.year !== 'string' &&
      typeof query.year !== 'number' &&
      typeof query.year !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'year must be a primitive value',
      });
    }
    const data = {};
    const key = ['2017', '2018', '2019'].includes(String(query.year))
      ? 'userdata'
      : 'data';
    const response = yield* request(
      buildApiRequestIntent(
        `/api/activity/summary/annual/${String(query.year)}/${key}`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'summary_annual',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 年度听歌报告2017-2024
 */
export default summaryAnnual;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
