import { expect } from 'bun:test';

import { readWebBody } from '../../../_kit/upstream/wire.ts';
import type { EncodingCase } from './contract.ts';

export const cases: ReadonlyArray<EncodingCase> = [
  {
    module: 'digitalAlbum_ordering',
    input: { id: '86286082', payment: '3', quantity: '2' },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        business: 'Album',
        paymentMethod: '3',
        digitalResources: JSON.stringify([
          { business: 'Album', resourceID: '86286082', quantity: 2 },
        ]),
        from: 'web',
      });
    },
  },
  {
    module: 'digitalAlbum_sales',
    input: { ids: [396372188, '2'] },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        albumIds: '396372188,2',
      });
    },
  },
  {
    module: 'digitalAlbum_purchased',
    input: { limit: '10', offset: '20' },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        limit: 10,
        offset: 20,
        total: true,
      });
    },
  },
  {
    module: 'digitalAlbum_purchased',
    input: {},
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        limit: 30,
        offset: 0,
      });
    },
  },
  {
    module: 'related_allvideo',
    input: { id: '419296' },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        id: '419296',
        type: 0,
      });
    },
  },
  {
    module: 'related_allvideo',
    input: { id: 'BFB0ABD6F5B0F069D3AC90021A1E680E' },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        id: 'BFB0ABD6F5B0F069D3AC90021A1E680E',
        type: 1,
      });
    },
  },
  {
    module: 'simi_playlist',
    input: { id: '108485', limit: '10', offset: '20' },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        songid: '108485',
        limit: 10,
        offset: 20,
      });
    },
  },
  {
    module: 'simi_song',
    input: { id: '108485', limit: '10', offset: '20' },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        songid: '108485',
        limit: 10,
        offset: 20,
      });
    },
  },
  {
    module: 'simi_user',
    input: { id: '108485', limit: '10', offset: '20' },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        songid: '108485',
        limit: 10,
        offset: 20,
      });
    },
  },
  {
    module: 'style_album',
    input: { tagId: '1000', cursor: '10', size: '20', sort: '1' },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        cursor: 10,
        size: 20,
        tagId: '1000',
        sort: 1,
      });
    },
  },
  {
    module: 'style_artist',
    input: { tagId: 1000, cursor: '10', size: '20' },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        cursor: 10,
        size: 20,
        tagId: 1000,
        sort: 0,
      });
    },
  },
  {
    module: 'style_playlist',
    input: { tagId: 1000, cursor: '10', size: '20' },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        cursor: 10,
        size: 20,
        tagId: 1000,
        sort: 0,
      });
    },
  },
  {
    module: 'style_song',
    input: { tagId: '1000', cursor: '10', size: '20', sort: '0' },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        cursor: 10,
        size: 20,
        tagId: '1000',
        sort: 0,
      });
    },
  },
  {
    module: 'top_album',
    input: { type: 'hot', limit: '10', offset: '20', year: '2024', month: '3' },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        area: 'ALL',
        limit: 10,
        month: 3,
        offset: 20,
        type: 'hot',
        year: 2024,
      });
    },
  },
  {
    module: 'top_artists',
    input: { limit: '10', offset: '20' },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        limit: 10,
        offset: 20,
        total: true,
      });
    },
  },
  {
    module: 'top_mv',
    input: { area: '欧美', limit: '10', offset: '20' },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        area: '欧美',
        limit: 10,
        offset: 20,
        total: true,
      });
    },
  },
  {
    module: 'top_playlist',
    input: { order: 'new', limit: '10', offset: '20' },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        cat: '全部',
        limit: 10,
        offset: 20,
        order: 'new',
        total: true,
      });
    },
  },
  {
    module: 'top_playlist_highquality',
    input: { limit: '10', before: '1700000000000' },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        cat: '全部',
        lasttime: 1700000000000,
        limit: 10,
        total: true,
      });
    },
  },
  {
    module: 'top_song',
    input: { type: '96' },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        areaId: 96,
        total: true,
      });
    },
  },
  {
    module: 'toplist_artist',
    input: { type: '2' },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        limit: 100,
        offset: 0,
        total: true,
        type: 2,
      });
    },
  },
];
