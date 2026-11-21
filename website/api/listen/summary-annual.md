---
title: '年度听歌报告'
description: '登录后调用此接口，使用此接口，可获取当前登录用户年度听歌报告，目前支持2017-2024年的报告'
---

# 年度听歌报告

登录后调用此接口，使用此接口，可获取当前登录用户年度听歌报告，目前支持2017-2024年的报告

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                     |
| ---------- | ------------------------------------------------------ |
| 接口地址   | `/summary/annual`                                      |
| 请求方式   | `GET` / `POST`                                         |
| 需要登录   | 是                                                     |
| 对应模块   | `summary_annual`                                       |
| SDK 函数   | `summaryAnnual`（`hana-music-api/api/summary_annual`） |
| 返回体类型 | `SummaryAnnualBody`（已建模返回体）                    |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { summaryAnnual } from 'hana-music-api';

const result = await summaryAnnual(
  {
    year: 2024,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/summary/annual' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'year=2024'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数   | 类型     | 必填 | 默认值 | 说明     |
| ------ | -------- | ---- | ------ | -------- |
| `year` | `number` | 是   | -      | 报告年份 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SummaryAnnualBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/summary_annual`、`hana-music-api/schemas/summary_annual` 导入运行时校验器）。

```ts
type AnnualPlaylistItem = {
  artistId?: string | null;
  artistName?: string | null;
  chorusSegmentEndPosition?: number | null;
  chorusSegmentStartPosition?: number | null;
  index?: number | null;
  picUrl?: string | null;
  picid?: string | null;
  playCount?: number | null;
  songId?: number | null;
  songName?: string | null;
};

type PlayProgress = {
  chorusEnd?: number | null;
  chorusStart?: number | null;
  songId?: number | null;
};

type SongArtistSummary = {
  artistName?: string | null;
  playCount?: number | null;
  songId?: number | null;
  songName?: string | null;
};

type SeasonSong = {
  artistId?: string | null;
  artistName?: string | null;
  bpm?: number | null;
  genreTagNameList?: string | null;
  picId?: string | null;
  picUrl?: string | null;
  playNum?: number | null;
  seasonIndex?: number | null;
  songId?: number | null;
  songName?: string | null;
};

type YearSong = {
  artistName?: string | null;
  songCoverUrl?: string | null;
  songId?: number | null;
  songName?: string | null;
};

type AnnualData = {
  aan?: string | null;
  annualPlaylist?: {
    items?: Array<AnnualPlaylistItem> | null;
    pureItems?: Array<AnnualPlaylistItem> | null;
  } | null;
  annualPlaylistAlbum?: {
    favoriteAlbum?: {
      albumId?: string | null;
      albumName?: string | null;
      albumPicId?: string | null;
      albumPicUrl?: string | null;
      artistName?: string | null;
      playCount?: number | null;
      playDays?: number | null;
      playDuration?: number | null;
      playUrl?: PlayProgress | null;
      songId?: number | null;
      songName?: string | null;
    } | null;
  } | null;
  annualSinger?: {
    artistId?: string | null;
    follow?: boolean | null;
    playCount?: number | null;
    playUrl?: PlayProgress | null;
    singerId?: string | null;
    singerName?: string | null;
    singerPicId?: string | null;
    singerPicUrl?: string | null;
    singerPicid?: string | null;
    singerPlayDays?: number | null;
    top5Songs?: Array<{
      index?: number | null;
      name?: string | null;
      playCount?: number | null;
      songId?: number | null;
    }> | null;
  } | null;
  annualSingerComparePage?: {
    singers?: Array<{
      singerId?: string | null;
      singerName?: string | null;
      singerPicUrl?: string | null;
      singerPicid?: string | null;
      year?: number | string | null;
    }> | null;
  } | null;
  annualSong?: {
    artistNameList?: string | null;
    artistnamelist?: string | null;
    firstDate?: number | null;
    hundredthDate?: number | null;
    playCnt?: number | null;
    playDays?: number | null;
    playUrl?: PlayProgress | null;
    songId?: number | null;
    songName?: string | null;
    songPicId?: string | null;
    songPicUrl?: string | null;
    tune?: string | null;
    userCountOfThisAnnualSong?: number | null;
  } | null;
  arid?: number | null;
  arpc?: number | null;
  arstp?: Array<{
    an?: string | null;
    pc?: number | null;
    sid?: number | null;
    sn?: string | null;
  }> | null;
  arul?: string | null;
  aul?: string | null;
  bydu?: number | null;
  cc?: number | null;
  clc?: number | null;
  commentBizPage?: {
    bePraisedCount?: number | null;
    commentPublish?: {
      bePraisedCount?: number | null;
      count?: number | null;
      maxPraisedCountComment?: {
        count?: number | null;
        detail?: string | null;
        name?: string | null;
      } | null;
    } | null;
    commentSocial?: {
      maxPraiseComment?: {
        count?: number | null;
        detail?: string | null;
        name?: string | null;
      } | null;
      praiseCommentCount?: number | null;
    } | null;
    count?: number | null;
    hqCount?: number | null;
    maxPraisedCountComment?: {
      count?: number | null;
      detail?: string | null;
      name?: string | null;
    } | null;
  } | null;
  cpc?: number | null;
  cppc?: number | null;
  cprc?: number | null;
  cprpc?: number | null;
  cprsc?: number | null;
  cpsc?: number | null;
  crlc?: number | null;
  dopamineColor?: {
    dopamine?: number | null;
    group?: string | null;
    playDuration?: number | null;
    rainbowText?: Array<string> | null;
    type?: string | null;
  } | null;
  eggStatistics?: {
    activeDaysThisYear?: number | null;
    artistPlayCount?: number | null;
    buyAlbumCount?: number | null;
    commentCount?: number | null;
    dailyRcmdViewDays?: number | null;
    djPlayHours?: number | null;
    genrePercents?: Array<{
      genrePlayCnt?: number | null;
      genreTagName?: string | null;
      rank?: number | null;
    }> | null;
    genrePlayCount?: number | null;
    headArtistName?: string | null;
    headArtistPlayCnt?: number | null;
    latePlayDays?: number | null;
    level?: number | null;
    loginDays?: number | null;
    playlistCount?: number | null;
    searchCount?: number | null;
    songPlayCount?: number | null;
    songShareCount?: number | null;
    starSongCount?: number | null;
    voiceBookPlayCount?: number | null;
  } | null;
  encUserId?: string | null;
  fan?: string | null;
  forgottenSong?: {
    datetime?: number | null;
    songArtistDTO?: SongArtistSummary | null;
  } | null;
  frsh?: number | null;
  frth?: number | null;
  fsan?: string | null;
  fsid?: number | null;
  fsn?: string | null;
  genrePlayRank?: {
    genreRank?: Array<{
      genreTagName?: string | null;
      oneGenreTagName?: string | null;
      percent?: number | null;
      rank?: number | null;
    }> | null;
    specialGenreRank?: Array<string> | null;
  } | null;
  genrePlayRanks?: Array<{
    genreCnt?: string | null;
    genreRank?: Array<{
      genrePlayCnt?: string | null;
      genreTagName?: string | null;
      rank?: string | null;
    }> | null;
    genreType?: string | null;
  }> | null;
  ha?: boolean | null;
  hcc?: number | null;
  jcz?: number | null;
  keyWord?: {
    keyword?: string | null;
    lyricCnt?: number | null;
    lyricList?: Array<{
      artistId?: string | null;
      artistName?: string | null;
      lyric?: string | null;
      playCnt?: number | null;
      songId?: number | null;
      songName?: string | null;
    }> | null;
  } | null;
  kw?: string | null;
  kwc?: number | null;
  latePlayDTO?: {
    artistName?: string | null;
    datetime?: number | null;
    songId?: number | null;
    songName?: string | null;
    songPicId?: string | null;
    songPicUrl?: string | null;
  } | null;
  lc?: number | null;
  lcc?: number | null;
  le?: string | null;
  lfc?: number | null;
  listenOverview?: {
    daysSinceReg?: number | null;
    firstPlaySongArtist?: string | null;
    firstPlaySongID?: number | null;
    firstPlaySongName?: string | null;
    hisFirstSongCoverUrl?: string | null;
    maxDaySongArtistName?: string | null;
    maxDaySongCoverUrl?: string | null;
    maxDaySongId?: number | null;
    maxDaySongName?: string | null;
    regTime?: number | null;
  } | null;
  listenTimePeriod?: {
    distributions?: Array<{
      hour?: number | null;
      month?: number | null;
      peak?: number | null;
    }> | null;
    maxTimePeriod?: string | null;
    totalMaxPlayCount?: number | null;
  } | null;
  listenYears?: {
    pies?: Array<{
      count?: number | null;
      name?: string | null;
    }> | null;
    songs?: Array<{
      artistName?: string | null;
      playCount?: number | null;
      publishYear?: string | null;
      songId?: number | null;
      songName?: string | null;
      songPicId?: number | null;
      songPicUrl?: string | null;
    }> | null;
  } | null;
  listenYearsAlbumCovers?: Array<string> | null;
  loopSongDTO?: {
    playCount?: number | null;
    playDate?: number | null;
    singerId?: string | null;
    singerName?: string | null;
    songId?: string | null;
    songName?: string | null;
    songPicUrl?: string | null;
  } | null;
  lsc?: number | null;
  lyr?: Array<{
    an?: string | null;
    lyc?: string | null;
    sid?: number | null;
    sn?: string | null;
    w?: string | null;
  }> | null;
  man?: string | null;
  mdan?: string | null;
  mdc?: number | null;
  mdsid?: number | null;
  mdsn?: string | null;
  mdspc?: number | null;
  mdsu?: number | null;
  minoritySong?: {
    minoritySingerId?: string | null;
    minoritySingerName?: string | null;
    minoritySongFirstDate?: number | null;
    minoritySongId?: string | null;
    minoritySongIrstDate?: number | null;
    minoritySongName?: string | null;
    minoritySongPlayCount?: number | null;
    minoritySongPlayNum?: number | null;
    minoritySongPlayUnt?: number | null;
  } | null;
  mitc?: number | null;
  mlbc?: number | null;
  mlc?: number | string | null;
  mlid?: number | null;
  mln?: string | null;
  mlpc?: number | null;
  mpt?: number | null;
  mran?: string | null;
  mrsid?: number | null;
  mrsn?: string | null;
  mrspc?: number | null;
  mrsu?: number | null;
  msid?: number | null;
  msn?: string | null;
  mst?: number | null;
  msu?: number | null;
  musicEmotion?: {
    genre?: string | null;
  } | null;
  musician?: boolean | null;
  musicianBizPage?: {
    bePlayedCount?: number | null;
    beSubscribedCount?: number | null;
    createCount?: number | null;
    musicianAvatarUrl?: string | null;
    musicianName?: string | null;
  } | null;
  nkn?: string | null;
  osan?: string | null;
  osid?: number | null;
  osn?: string | null;
  ospb?: number | null;
  ost?: number | null;
  ouid?: number | null;
  playlistBizPage?: {
    bePlayedCount?: number | null;
    beSubscribedCount?: number | null;
    createCount?: number | null;
  } | null;
  plbc?: number | null;
  plc?: number | null;
  plpc?: number | null;
  psc?: number | null;
  pst?: number | null;
  psto?: string | null;
  raid?: number | null;
  ran?: string | null;
  rapc?: number | null;
  ratpc?: number | null;
  rbc?: number | null;
  rc?: number | null;
  rcc?: number | null;
  rlc?: number | null;
  rpc?: number | null;
  rsc?: number | null;
  rsd?: string | null;
  rsid?: number | null;
  rsn?: string | null;
  rst?: number | null;
  rt?: number | null;
  sbc?: number | null;
  scc?: number | null;
  seasonsListen?: {
    autumn?: SeasonSong | null;
    spring?: SeasonSong | null;
    summer?: SeasonSong | null;
    winter?: SeasonSong | null;
  } | null;
  sil?: Array<{
    an?: string | null;
    ap?: string | null;
    sid?: number | null;
    sn?: string | null;
  }> | null;
  slc?: number | null;
  spc?: number | null;
  specialDay?: {
    latePlay?: {
      artistId?: string | null;
      artistName?: string | null;
      datetime?: number | null;
      songId?: number | null;
      songName?: string | null;
      songPicId?: string | null;
      songPicUrl?: string | null;
    } | null;
    maxLoopSong?: {
      playCount?: number | null;
      playdate?: number | null;
      singerName?: string | null;
      songName?: string | null;
    } | null;
    songArtistDTO?: SongArtistSummary | null;
    specialDay?: string | null;
    specialDayDate?: number | null;
  } | null;
  specialMemory?: {
    datetime?: number | null;
    relateIPName?: string | null;
    song?: SongArtistSummary | null;
  } | null;
  st?: string | null;
  stc?: number | null;
  sth?: number | null;
  stl?: Array<{
    tn?: string | null;
    tv?: number | null;
  }> | null;
  stp?: Array<{
    an?: string | null;
    pc?: number | null;
    sid?: number | null;
    sn?: string | null;
  }> | null;
  summaryPage?: {
    colorCode?: string | null;
    colorText?: string | null;
    title?: string | null;
  } | null;
  tod?: string | null;
  tosid?: number | null;
  tosn?: string | null;
  tossu?: number | null;
  typ?: string | null;
  ufc?: number | null;
  ufcc?: number | null;
  uft?: number | null;
  uid?: string | null;
  uun?: string | null;
  uvc?: number | null;
  vaid?: number | null;
  vd?: string | null;
  vipBizPage?: {
    appIconUseNum?: number | null;
    firstTime?: number | null;
    freeVipDayNum?: number | null;
    hqPlayDuration?: number | null;
    pendantUseNum?: number | null;
    playerModelUseNum?: number | null;
    svip?: boolean | null;
    vip?: boolean | null;
    vipFirstTime?: number | null;
    vipPlaySongNum?: number | null;
    vipSongCount?: number | null;
    vipSongPlayCount?: number | null;
  } | null;
  voicePlayBizPage?: {
    activateDays?: number | null;
    overUserPercent?: number | null;
    playDuration?: number | null;
    top1AudioPlayDuration?: number | null;
    top1RadioPlayDuration?: number | null;
  } | null;
  vpc?: number | null;
  vpt?: string | null;
  vraid?: number | null;
  vsc?: number | null;
  vsid?: number | null;
  vt?: number | null;
  yal?: Array<{
    pc?: number | null;
    sn?: string | null;
  }> | null;
  yan?: string | null;
  yap?: string | null;
  ycc?: number | null;
  yearOverview?: {
    firstPlayedSong?: YearSong | null;
    maxPlayedSong?: YearSong | null;
    playCount?: number | null;
    playTime?: number | null;
  } | null;
  ypc?: number | null;
  ysc?: number | null;
  yuncunFootprintPage?: {
    footprintItems?: Array<{
      publishYear?: string | null;
      song?: YearSong | null;
      year?: number | null;
    }> | null;
  } | null;
};

type SummaryAnnualBody = {
  code: 200;
  data: AnnualData;
  message?: string | null;
};
```

| 字段      | 类型         | 必填 | 说明                         |
| --------- | ------------ | ---- | ---------------------------- |
| `code`    | `200`        | 是   | 业务状态码（`200` 表示成功） |
| `data`    | `AnnualData` | 是   | 接口返回的数据主体           |
| `message` | `string`     | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->

## 注意事项

- **年份字段差异**：2020 年及以后年份的年度报告使用长字段键，2017–2019 年使用 `userdata` 短键结构。
