import { expect } from 'bun:test';

import { readEapiBody, readWebBody } from '../../../_kit/upstream/wire.ts';
import type { EncodingCase } from './contract.ts';

export const cases: ReadonlyArray<EncodingCase> = [
  {
    module: 'mlog_music_rcmd',
    input: { songid: 43 },
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        id: 0,
        type: 2,
        rcmdType: 20,
        limit: 10,
        extInfo: '{"songId":"43"}',
      });
    },
  },
  {
    module: 'mlog_music_rcmd',
    input: { songid: '43', mvid: '31', limit: '7' },
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        id: '31',
        type: 2,
        rcmdType: 20,
        limit: 7,
        extInfo: '{"songId":"43"}',
      });
    },
  },
  {
    module: 'mlog_url',
    input: { id: 'a1PvyoDUbEJmk0' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        id: 'a1PvyoDUbEJmk0',
        resolution: 1080,
        type: 1,
      });
    },
  },
  {
    module: 'mlog_url',
    input: { id: '17', res: '720' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        id: '17',
        resolution: 720,
        type: 1,
      });
    },
  },
  {
    module: 'program_recommend',
    input: {},
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        limit: 10,
        offset: 0,
      });
    },
  },
  {
    module: 'program_recommend',
    input: { type: 'PUBLIC', limit: '5', offset: '3' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        cateId: 'PUBLIC',
        limit: 5,
        offset: 3,
      });
    },
  },
  {
    module: 'voice_delete',
    input: { ids: [17, '19'] },
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        ids: '[17,"19"]',
      });
    },
  },
  {
    module: 'voicelist_list',
    input: { voiceListId: 792544462 },
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        limit: '200',
        offset: '0',
        voiceListId: 792544462,
      });
    },
  },
  {
    module: 'voicelist_list',
    input: { voiceListId: '37', limit: '7', offset: 3 },
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        limit: 7,
        offset: 3,
        voiceListId: '37',
      });
    },
  },
  {
    module: 'voicelist_list_search',
    input: { voiceListId: 37 },
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        limit: '200',
        offset: '0',
        name: null,
        displayStatus: null,
        type: null,
        voiceFeeType: null,
        radioId: 37,
      });
    },
  },
  {
    module: 'voicelist_list_search',
    input: {
      voiceListId: '37',
      limit: 7,
      offset: '3',
      name: 'synthetic voice',
      displayStatus: 'ONLINE',
      type: 'PUBLIC',
      voiceFeeType: 1,
    },
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        limit: 7,
        offset: 3,
        name: 'synthetic voice',
        displayStatus: 'ONLINE',
        type: 'PUBLIC',
        voiceFeeType: 1,
        radioId: '37',
      });
    },
  },
  {
    module: 'voicelist_search',
    input: {},
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        fee: '-1',
        limit: '200',
        offset: '0',
        podcastName: '',
      });
    },
  },
  {
    module: 'voicelist_search',
    input: { limit: '7', offset: 3, podcastName: 'synthetic podcast' },
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        fee: '-1',
        limit: 7,
        offset: 3,
        podcastName: 'synthetic podcast',
      });
    },
  },
  {
    module: 'voicelist_trans',
    input: {},
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        limit: '200',
        offset: '0',
        radioId: null,
        programId: '0',
        position: '1',
      });
    },
  },
  {
    module: 'voicelist_trans',
    input: { limit: 7, offset: '3', radioId: '37', programId: 41, position: 3 },
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        limit: 7,
        offset: 3,
        radioId: '37',
        programId: 41,
        position: 3,
      });
    },
  },
];
