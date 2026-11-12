import { expect } from 'bun:test';

import { readEapiBody, readWebBody } from '../../../_kit/upstream/wire.ts';
import type { EncodingCase } from './contract.ts';

export const cases: ReadonlyArray<EncodingCase> = [
  {
    module: 'daily_signin',
    input: { type: '1' },
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({ type: 1 });
    },
  },
  {
    module: 'daily_signin',
    input: {},
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({ type: 0 });
    },
  },
  {
    module: 'musician_cloudbean_obtain',
    input: { id: '7036416928', period: '7' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        userMissionId: '7036416928',
        period: 7,
      });
    },
  },
  {
    module: 'signin_progress',
    input: {},
    respond: () =>
      Response.json({
        code: 200,
        data: {
          records: [],
          stats: [],
          today: { todaySignedIn: false, todayStats: [] },
        },
      }),
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        moduleId: '1207signin-1207signin',
      });
    },
  },
];
