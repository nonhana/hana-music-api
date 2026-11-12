import { expect } from 'bun:test';

import { readEapiBody, readWebBody } from '../../../_kit/upstream/wire.ts';
import type { EncodingCase, EncodingWire } from './contract.ts';

const webData = (wire: EncodingWire): Record<string, unknown> => {
  const {
    csrf_token: _csrf,
    e_r: _encryptResponse,
    ...data
  } = readWebBody(wire.body) as Record<string, unknown>;
  return data;
};

const eapiData = (wire: EncodingWire): Record<string, unknown> => {
  const {
    header: _header,
    e_r: _encryptResponse,
    csrf_token: _csrf,
    checkToken: _checkToken,
    ...data
  } = readEapiBody(wire.body).data as Record<string, unknown>;
  return data;
};

export const cases: ReadonlyArray<EncodingCase> = [
  {
    module: 'djRadio_top',
    input: {},
    check: (wires) => {
      expect(wires[0]!.url).toBe(
        'https://interface.music.163.com/eapi/expert/worksdata/works/top/get',
      );
      expect(eapiData(wires[0]!)).toEqual({
        djRadioId: null,
        sortIndex: 1,
        dataGapDays: 7,
        dataType: 3,
      });
    },
  },
  {
    module: 'djRadio_top',
    input: {
      dataGapDays: '30',
      dataType: '4',
      djRadioId: '29',
      sortIndex: '2',
    },
    check: (wires) => {
      expect(eapiData(wires[0]!)).toEqual({
        djRadioId: '29',
        sortIndex: 2,
        dataGapDays: 30,
        dataType: 4,
      });
    },
  },
  {
    module: 'dj_difm_all_style_channel',
    input: {},
    check: (wires) => {
      expect(wires[0]!.url).toBe(
        'https://interface.music.163.com/eapi/dj/difm/all/style/channel/v2',
      );
      expect(eapiData(wires[0]!)).toEqual({ sources: '[0]' });
    },
  },
  {
    module: 'dj_difm_all_style_channel',
    input: { sources: [1, '2'] },
    check: (wires) => {
      expect(eapiData(wires[0]!)).toEqual({ sources: '[1,2]' });
    },
  },
  {
    module: 'dj_difm_playing_tracks_list',
    input: { channelId: '41' },
    check: (wires) => {
      expect(eapiData(wires[0]!)).toEqual({
        limit: 5,
        source: 0,
        channelId: '41',
      });
    },
  },
  {
    module: 'dj_difm_playing_tracks_list',
    input: { channelId: 41, limit: '7', source: '2' },
    check: (wires) => {
      expect(eapiData(wires[0]!)).toEqual({
        limit: 7,
        source: 2,
        channelId: 41,
      });
    },
  },
  {
    module: 'dj_difm_subscribe_channels_get',
    input: {},
    check: (wires) => {
      expect(eapiData(wires[0]!)).toEqual({ sources: '[0]' });
    },
  },
  {
    module: 'dj_difm_subscribe_channels_get',
    input: { sources: ['2', 1] },
    check: (wires) => {
      expect(eapiData(wires[0]!)).toEqual({ sources: '[2,1]' });
    },
  },
  {
    module: 'dj_hot',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({ limit: 30, offset: 0 });
    },
  },
  {
    module: 'dj_hot',
    input: { limit: '7', offset: '3' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({ limit: 7, offset: 3 });
    },
  },
  {
    module: 'dj_paygift',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        limit: 30,
        offset: 0,
        _nmclfl: 1,
      });
    },
  },
  {
    module: 'dj_paygift',
    input: { limit: '7', offset: '3' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        limit: 7,
        offset: 3,
        _nmclfl: 1,
      });
    },
  },
  {
    module: 'dj_personalize_recommend',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({ limit: 6 });
    },
  },
  {
    module: 'dj_personalize_recommend',
    input: { limit: '3' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({ limit: 3 });
    },
  },
  {
    module: 'dj_program',
    input: { rid: '29' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        radioId: '29',
        limit: 30,
        offset: 0,
        asc: false,
      });
    },
  },
  {
    module: 'dj_program',
    input: { asc: 'true', limit: '7', offset: '3', rid: 29 },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        radioId: 29,
        limit: 7,
        offset: 3,
        asc: true,
      });
    },
  },
  {
    module: 'dj_program',
    input: { asc: 0, rid: 29 },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        radioId: 29,
        limit: 30,
        offset: 0,
        asc: false,
      });
    },
  },
  {
    module: 'dj_program_toplist',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({ limit: 100, offset: 0 });
    },
  },
  {
    module: 'dj_program_toplist',
    input: { limit: '7', offset: '3' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({ limit: 7, offset: 3 });
    },
  },
  {
    module: 'dj_program_toplist_hours',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({ limit: 100 });
    },
  },
  {
    module: 'dj_program_toplist_hours',
    input: { limit: '7' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({ limit: 7 });
    },
  },
  {
    module: 'dj_radio_hot',
    input: { cateId: '3' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        cateId: '3',
        limit: 30,
        offset: 0,
      });
    },
  },
  {
    module: 'dj_radio_hot',
    input: { cateId: 3, limit: '7', offset: '3' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        cateId: 3,
        limit: 7,
        offset: 3,
      });
    },
  },
  {
    module: 'dj_sub',
    input: { rid: '29' },
    check: (wires) => {
      expect(wires[0]!.url).toBe('https://music.163.com/weapi/djradio/unsub');
      expect(webData(wires[0]!)).toEqual({ id: '29' });
    },
  },
  {
    module: 'dj_sub',
    input: { rid: '29', t: '1' },
    check: (wires) => {
      expect(wires[0]!.url).toBe('https://music.163.com/weapi/djradio/sub');
      expect(webData(wires[0]!)).toEqual({ id: '29' });
    },
  },
  {
    module: 'dj_sublist',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        limit: 30,
        offset: 0,
        total: true,
      });
    },
  },
  {
    module: 'dj_sublist',
    input: { limit: '7', offset: '3' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        limit: 7,
        offset: 3,
        total: true,
      });
    },
  },
  {
    module: 'dj_subscriber',
    input: { id: '17' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        time: '-1',
        id: '17',
        limit: '20',
        total: 'true',
      });
    },
  },
  {
    module: 'dj_subscriber',
    input: { id: 17, limit: '7', time: '1700000000000' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        time: 1_700_000_000_000,
        id: 17,
        limit: 7,
        total: 'true',
      });
    },
  },
  {
    module: 'dj_subscriber',
    input: { id: 17, time: -1 },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        time: -1,
        id: 17,
        limit: '20',
        total: 'true',
      });
    },
  },
  {
    module: 'dj_today_perfered',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({ page: 0 });
    },
  },
  {
    module: 'dj_today_perfered',
    input: { page: '2' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({ page: 2 });
    },
  },
  {
    module: 'dj_toplist',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        limit: 100,
        offset: 0,
        type: 0,
      });
    },
  },
  {
    module: 'dj_toplist',
    input: { type: 'hot' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        limit: 100,
        offset: 0,
        type: 1,
      });
    },
  },
  {
    module: 'dj_toplist',
    input: { limit: '7', offset: '3', type: 'new' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({
        limit: 7,
        offset: 3,
        type: 0,
      });
    },
  },
  {
    module: 'dj_toplist_hours',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({ limit: 100 });
    },
  },
  {
    module: 'dj_toplist_hours',
    input: { limit: '7' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({ limit: 7 });
    },
  },
  {
    module: 'dj_toplist_newcomer',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({ limit: 100, offset: 0 });
    },
  },
  {
    module: 'dj_toplist_newcomer',
    input: { limit: '7', offset: '3' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({ limit: 7, offset: 3 });
    },
  },
  {
    module: 'dj_toplist_pay',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({ limit: 100 });
    },
  },
  {
    module: 'dj_toplist_pay',
    input: { limit: '7' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({ limit: 7 });
    },
  },
  {
    module: 'dj_toplist_popular',
    input: {},
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({ limit: 100 });
    },
  },
  {
    module: 'dj_toplist_popular',
    input: { limit: '7' },
    check: (wires) => {
      expect(webData(wires[0]!)).toEqual({ limit: 7 });
    },
  },
];
