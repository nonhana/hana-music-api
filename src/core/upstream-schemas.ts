import { Schema } from 'effect';

import { UpstreamObject } from './upstream-body.ts';

export const Artist = UpstreamObject({
  id: Schema.Finite,
  name: Schema.String,
});

export const Song = UpstreamObject({
  id: Schema.Finite,
  name: Schema.String,
  ar: Schema.Array(Artist),
  al: UpstreamObject({
    id: Schema.Finite,
    name: Schema.String,
    picUrl: Schema.String,
  }),
  dt: Schema.Finite,
  fee: Schema.Finite,
});
