import type { ModuleInputCase } from './contract.ts';

export const cases: ReadonlyArray<ModuleInputCase> = [
  {
    module: 'event',
    valid: [
      {},
      { pagesize: 5 },
      { pagesize: '20', lasttime: '-1' },
      { lasttime: 0 },
    ],
    invalid: [{ pagesize: -1 }, { pagesize: 'abc' }, { lasttime: 1.5 }],
  },
  {
    module: 'event_del',
    valid: [{ evId: 1 }, { evId: '6712917601' }],
    invalid: [{}, { evId: 0 }, { evId: '1,2' }],
  },
  {
    module: 'event_forward',
    valid: [
      { uid: 1, evId: 2 },
      { uid: '1', evId: '2', forwards: 'synthetic forward' },
    ],
    invalid: [
      { uid: 1 },
      { evId: 2 },
      { uid: 0, evId: 2 },
      { uid: 1, evId: 2, forwards: 1 },
    ],
  },
  {
    module: 'follow',
    valid: [
      { id: 1, t: 1 },
      { id: '2', t: '0' },
    ],
    invalid: [{ id: 1 }, { id: 1, t: 2 }, { id: 0, t: 1 }, { id: 1, t: 'yes' }],
  },
  {
    module: 'get_userids',
    valid: [{ nicknames: ['synthetic'] }, { nicknames: ['a', 'b'] }],
    invalid: [
      {},
      { nicknames: [] },
      { nicknames: 'a;b' },
      { nicknames: ['a;b'] },
      { nicknames: [''] },
    ],
  },
  {
    module: 'hug_comment',
    valid: [
      { uid: 1, cid: 2, sid: 3 },
      { uid: '1', cid: '2', sid: '3', type: '6' },
    ],
    invalid: [
      { uid: 1, cid: 2 },
      { type: 6 },
      { uid: 0, cid: 2, sid: 3 },
      { uid: 1, cid: 2, sid: 3, type: 1.5 },
    ],
  },
  {
    module: 'resource_like',
    valid: [
      { id: 1, type: 0, t: 1 },
      { id: '2', type: '6', t: '0', threadId: 'A_EV_2_synthetic' },
    ],
    invalid: [
      { id: 1, type: 0 },
      { id: 1, t: 1 },
      { id: 1, type: 0, t: 2 },
      { id: 0, type: 0, t: 1 },
      { id: 1, type: -1, t: 1 },
    ],
  },
  {
    module: 'send_album',
    valid: [
      { id: 1, userIds: [2] },
      { id: '1', userIds: ['2', 3], msg: 'synthetic message' },
    ],
    invalid: [
      { id: 1 },
      { userIds: [2] },
      { id: 1, userIds: [] },
      { id: 1, userIds: ['2,3'] },
      { id: 1, userIds: 2 },
    ],
  },
  {
    module: 'send_playlist',
    valid: [
      { playlist: 1, userIds: [2] },
      { playlist: '1', userIds: ['2', 3], msg: 'synthetic message' },
    ],
    invalid: [
      { playlist: 1 },
      { playlist: 0, userIds: [2] },
      { playlist: 1, userIds: '2' },
      {},
    ],
  },
  {
    module: 'send_song',
    valid: [
      { id: 1, userIds: [2] },
      { id: '1', userIds: ['2', 3], msg: 'synthetic message' },
    ],
    invalid: [
      { id: 1 },
      { userIds: [2] },
      { id: 1, userIds: [] },
      { id: 1, userIds: ['2,3'] },
    ],
  },
  {
    module: 'send_text',
    valid: [{ userIds: [2] }, { userIds: ['2', 3], msg: 'synthetic message' }],
    invalid: [{}, { userIds: [] }, { userIds: '2,3' }, { userIds: ['2,3'] }],
  },
  {
    module: 'share_resource',
    valid: [
      {},
      { id: 1 },
      { id: '2', type: 'mv', msg: 'synthetic share' },
      { id: 1, type: '' },
    ],
    invalid: [{ id: 0 }, { type: 'podcast' }, { id: '1,2' }],
  },
];
