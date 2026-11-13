import { expect } from 'bun:test';

import { readEapiBody, readWebBody } from '../../../_kit/upstream/wire.ts';
import type { EncodingCase } from './contract.ts';

export const cases: ReadonlyArray<EncodingCase> = [
  {
    module: 'listen_data_realtime_report',
    input: {},
    check: (wires) => {
      const data = readEapiBody(wires[0]!.body).data as Record<string, unknown>;
      expect(data).toMatchObject({ type: 'week' });
    },
  },
  {
    module: 'listen_data_report',
    input: {},
    check: (wires) => {
      const data = readEapiBody(wires[0]!.body).data as Record<string, unknown>;
      expect(data).toMatchObject({ type: 'week' });
      expect(data).not.toHaveProperty('endTime');
    },
  },
  {
    module: 'listen_data_report',
    input: { endTime: '1704067200000', type: 'year' },
    check: (wires) => {
      const data = readEapiBody(wires[0]!.body).data as Record<string, unknown>;
      expect(data).toMatchObject({ endTime: 1704067200000, type: 'year' });
    },
  },
  {
    module: 'listentogether_play_command',
    input: {
      clientSeq: 3,
      commandType: 'PLAY',
      formerSongId: -1,
      playStatus: 'PLAY',
      roomId: 'room_1',
      targetSongId: '1394617453',
    },
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data.roomId).toBe('room_1');
      expect(JSON.parse(data.commandInfo as string)).toEqual({
        clientSeq: 3,
        commandType: 'PLAY',
        formerSongId: -1,
        playStatus: 'PLAY',
        progress: 0,
        targetSongId: '1394617453',
      });
    },
  },
  {
    module: 'listentogether_sync_list_command',
    input: {
      roomId: 'room_1',
      commandType: 'REPLACE',
      version: 2,
      userId: 3,
      randomList: [4, '5'],
      displayList: [],
    },
    check: (wires) => {
      const data = readWebBody(wires[0]!.body) as Record<string, unknown>;
      expect(data.roomId).toBe('room_1');
      expect(JSON.parse(data.playlistParam as string)).toEqual({
        anchorPosition: -1,
        anchorSongId: '',
        commandType: 'REPLACE',
        displayList: [],
        randomList: ['4', '5'],
        version: [{ userId: 3, version: 2 }],
      });
    },
  },
];
