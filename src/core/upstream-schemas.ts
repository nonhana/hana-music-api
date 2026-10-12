import { Schema } from 'effect';

import { UpstreamObject } from './upstream-body.ts';

// 云盘上传、没有匹配上曲库的歌，歌手和专辑的编号是 0、名字是 null（nonhana/hana-music-api#48）。
export const Artist = UpstreamObject({
  id: Schema.Finite,
  name: Schema.NullOr(Schema.String),
});

export const Song = UpstreamObject({
  id: Schema.Finite,
  name: Schema.String,
  ar: Schema.Array(Artist),
  al: UpstreamObject({
    id: Schema.Finite,
    name: Schema.NullOr(Schema.String),
    picUrl: Schema.String,
  }),
  dt: Schema.Finite,
  fee: Schema.Finite,
});
