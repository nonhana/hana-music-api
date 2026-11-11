import { expect } from 'bun:test';

import { readWebBody } from '../../../_kit/upstream/wire.ts';
import type { EncodingCase } from './contract.ts';

export const cases: ReadonlyArray<EncodingCase> = [
  {
    module: 'album_list',
    input: { limit: '10', type: '1' },
    check: (wires) => {
      expect(wires[0]!.url).toContain('/weapi/vipmall/albumproduct/list');
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({
        limit: 10,
        offset: 0,
        total: true,
        area: 'ALL',
        type: 1,
      });
    },
  },
  {
    module: 'album_list_style',
    input: { area: 'E_A', offset: '10' },
    check: (wires) => {
      expect(wires[0]!.url).toContain('/weapi/vipmall/appalbum/album/style');
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({
        limit: 10,
        offset: 10,
        total: true,
        area: 'E_A',
      });
    },
  },
  {
    module: 'album_new',
    input: { area: 'KR' },
    check: (wires) => {
      expect(wires[0]!.url).toContain('/weapi/album/new');
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({
        limit: 30,
        offset: 0,
        total: true,
        area: 'KR',
      });
    },
  },
  {
    module: 'album_songsaleboard',
    input: {},
    check: (wires) => {
      expect(wires[0]!.url).toContain(
        '/weapi/feealbum/songsaleboard/daily/type',
      );
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({ albumType: 0 });
      expect(data).not.toHaveProperty('year');
    },
  },
  {
    module: 'album_songsaleboard',
    input: { type: 'year', albumType: '1', year: '2026' },
    check: (wires) => {
      expect(wires[0]!.url).toContain(
        '/weapi/feealbum/songsaleboard/year/type',
      );
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({ albumType: 1, year: 2026 });
    },
  },
  {
    module: 'album_songsaleboard',
    input: { type: 'custom', albumType: 1, year: 2026 },
    check: (wires) => {
      expect(wires[0]!.url).toContain(
        '/weapi/feealbum/songsaleboard/custom/type',
      );
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({ albumType: 1 });
      expect(data).not.toHaveProperty('year');
    },
  },
  {
    module: 'album_sub',
    input: { id: '17', t: '1' },
    check: (wires) => {
      expect(wires[0]!.url).toContain('/weapi/album/sub');
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({ id: '17' });
    },
  },
  {
    module: 'album_sub',
    input: { id: 17, t: 0 },
    check: (wires) => {
      expect(wires[0]!.url).toContain('/weapi/album/unsub');
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({ id: 17 });
    },
  },
  {
    module: 'album_sublist',
    input: {},
    check: (wires) => {
      expect(wires[0]!.url).toContain('/weapi/album/sublist');
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data).toMatchObject({ limit: 25, offset: 0, total: true });
    },
  },
];
