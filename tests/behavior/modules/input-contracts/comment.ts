import type { ModuleInputCase } from './contract.ts';

export const cases: ReadonlyArray<ModuleInputCase> = [
  {
    module: 'comment',
    valid: [
      { id: 1, type: 0, t: 1, content: 'hello' },
      { commentId: '3', content: 'reply', id: '2', t: '2', type: '2' },
      {
        commentId: 4,
        id: 3,
        t: 0,
        threadId: 'A_EV_2_1_2',
        type: 6,
      },
    ],
    invalid: [
      { id: 1, type: 0, t: 3, content: 'hello' },
      { id: 0, type: 0, t: 1, content: 'hello' },
      { id: '1,2', type: 0, t: 1, content: 'hello' },
      { id: 1, type: 0, t: 1, content: 5 },
      { id: 1, type: 0, t: '1,0', content: 'hello' },
    ],
  },
  {
    module: 'comment_album',
    valid: [{ id: 1 }, { before: '100', id: '2', limit: '20', offset: '0' }],
    invalid: [
      {},
      { id: 0 },
      { id: '1,2' },
      { id: 1, limit: -1 },
      { id: 1, limit: 1.5 },
      { id: 1, offset: 'x' },
      { id: 1, before: -1 },
    ],
  },
  {
    module: 'comment_dj',
    valid: [{ id: 1 }, { before: '100', id: '2', limit: 20, offset: 0 }],
    invalid: [{}, { id: 0 }, { id: '1,2' }, { id: 1, limit: 1.5 }],
  },
  {
    module: 'comment_event',
    valid: [
      { threadId: 'A_EV_2_1_2' },
      {
        before: '100',
        limit: '10',
        offset: '0',
        threadId: 'R_SO_4_1',
      },
    ],
    invalid: [
      {},
      { threadId: 1 },
      { limit: -1, threadId: 'R_SO_4_1' },
      { threadId: 'R_SO_4_1', offset: -1 },
      { threadId: 'R_SO_4_1', before: 1.5 },
    ],
  },
  {
    module: 'comment_floor',
    valid: [
      { id: 1, parentCommentId: 2, type: 0 },
      {
        id: '1',
        limit: '20',
        parentCommentId: '3',
        time: '-1',
        type: '6',
      },
    ],
    invalid: [
      { id: 1, parentCommentId: 2 },
      { id: 1, type: 0 },
      { id: 0, parentCommentId: 2, type: 0 },
      { id: 1, parentCommentId: '1,2', type: 0 },
      { id: 1, parentCommentId: 2, time: 1.5, type: 0 },
    ],
  },
  {
    module: 'comment_hot',
    valid: [
      { id: 1, type: 0 },
      { before: '100', id: '2', limit: '10', offset: 0, type: '3' },
    ],
    invalid: [
      { id: 1 },
      { type: 0 },
      { id: 0, type: 0 },
      { id: 1, type: 0, offset: -1 },
    ],
  },
  {
    module: 'comment_hug_list',
    valid: [
      { cid: 2, sid: 3, uid: 1 },
      {
        cid: '2',
        cursor: 'c0',
        idCursor: '-1',
        page: '2',
        pageSize: '100',
        sid: '3',
        type: '0',
        uid: '1',
      },
    ],
    invalid: [
      { cid: 2, sid: 3 },
      { cid: 2, sid: 3, uid: 0 },
      { cid: 2, sid: '3', uid: 1, cursor: 5 },
      { cid: 2, sid: '3', uid: 1, page: 1.5 },
      { cid: 2, sid: '3', uid: 1, pageSize: 1.5 },
    ],
  },
  {
    module: 'comment_like',
    valid: [
      { cid: 2, id: 1, t: 1, type: 0 },
      { cid: '2', id: '1', t: '0', threadId: 'A_EV_2_1_2', type: '6' },
    ],
    invalid: [
      { cid: 2, id: 1, t: 2, type: 0 },
      { cid: 2, id: 1, t: '1,0', type: 0 },
      { cid: 2, id: 0, t: 1, type: 0 },
      { cid: '2,3', id: 1, t: 1, type: 0 },
      { cid: 2, id: 1, t: 1 },
    ],
  },
  {
    module: 'comment_music',
    valid: [{ id: 1 }, { before: '100', id: '2', limit: 20, offset: '0' }],
    invalid: [{}, { id: 0 }, { id: '1,2' }, { id: 1, offset: 1.5 }],
  },
  {
    module: 'comment_mv',
    valid: [{ id: 1 }, { before: '100', id: '2', limit: 20, offset: '0' }],
    invalid: [{}, { id: 0 }, { id: '1,2' }, { id: 1, before: 1.5 }],
  },
  {
    module: 'comment_new',
    valid: [
      { id: 1, type: 0 },
      {
        cursor: '123',
        id: '1',
        pageNo: '2',
        pageSize: 20,
        showInner: '0',
        sortType: '3',
        type: '2',
      },
      { id: 1, showInner: true, type: 0 },
    ],
    invalid: [
      { id: 1 },
      { id: 0, type: 0 },
      { id: 1, showInner: 'maybe', type: 0 },
      { id: 1, pageNo: 1.5, type: 0 },
      { id: 1, pageSize: 1.5, type: 0 },
    ],
  },
  {
    module: 'comment_playlist',
    valid: [{ id: 1 }, { before: '100', id: '2', limit: 20, offset: '0' }],
    invalid: [{}, { id: 0 }, { id: '1,2' }, { id: 1, limit: -1 }],
  },
  {
    module: 'comment_video',
    valid: [
      { id: 'E949B72F3F8A9851AF68B4FD700F6784' },
      { before: '100', id: 'video', limit: '20', offset: '0' },
    ],
    invalid: [
      {},
      { id: 12345 },
      { id: 'video', limit: -1 },
      { id: 'video', offset: 1.5 },
      { id: 'video', before: -1 },
    ],
  },
];
