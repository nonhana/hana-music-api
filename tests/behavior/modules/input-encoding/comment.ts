import { expect } from 'bun:test';

import { readEapiBody, readWebBody } from '../../../_kit/upstream/wire.ts';
import type { EncodingCase } from './contract.ts';

export const cases: ReadonlyArray<EncodingCase> = [
  {
    module: 'comment',
    input: { content: 'hello', id: '1', t: 1, type: 0 },
    check: (wires) => {
      expect(wires).toHaveLength(1);
      expect(wires[0]!.url).toContain('/weapi/resource/comments/add');
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        threadId: 'R_SO_4_1',
        content: 'hello',
      });
    },
  },
  {
    module: 'comment',
    input: {
      commentId: '3',
      content: 'reply',
      id: 1,
      t: 2,
      threadId: 'A_EV_2_1_2',
      type: 6,
    },
    check: (wires) => {
      expect(wires[0]!.url).toContain('/weapi/resource/comments/reply');
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        threadId: 'A_EV_2_1_2',
        commentId: '3',
        content: 'reply',
      });
    },
  },
  {
    module: 'comment',
    input: { commentId: 4, id: 2, t: '0', type: '0' },
    check: (wires) => {
      expect(wires[0]!.url).toContain('/weapi/resource/comments/delete');
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        threadId: 'R_SO_4_2',
        commentId: 4,
      });
    },
  },
  {
    module: 'comment_album',
    input: { before: '100', id: '84072830', limit: '5', offset: '2' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        rid: '84072830',
        limit: 5,
        offset: 2,
        beforeTime: 100,
      });
    },
  },
  {
    module: 'comment_dj',
    input: { id: 1 },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        rid: 1,
        limit: 20,
        offset: 0,
        beforeTime: 0,
      });
    },
  },
  {
    module: 'comment_event',
    input: {
      before: '50',
      limit: '10',
      offset: '3',
      threadId: 'A_EV_2_1_2',
    },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        limit: 10,
        offset: 3,
        beforeTime: 50,
      });
    },
  },
  {
    module: 'comment_floor',
    input: {
      id: '2092595510',
      parentCommentId: '7431461934',
      time: '-1',
      type: '6',
    },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        parentCommentId: '7431461934',
        threadId: 'A_EV_2_2092595510',
        time: -1,
        limit: 20,
      });
    },
  },
  {
    module: 'comment_hot',
    input: { id: 1, type: 0 },
    check: (wires) => {
      expect(wires[0]!.url).toContain(
        '/weapi/v1/resource/hotcomments/R_SO_4_1',
      );
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        rid: 1,
        limit: 20,
        offset: 0,
        beforeTime: 0,
      });
    },
  },
  {
    module: 'comment_hug_list',
    input: {
      cid: '2',
      cursor: 'c0',
      idCursor: '7',
      page: '2',
      pageSize: '5',
      sid: '3',
      type: '0',
      uid: '1',
    },
    check: (wires) => {
      const data = readEapiBody(wires[0]!.body).data as Record<string, unknown>;
      expect(data).toMatchObject({
        targetUserId: '1',
        commentId: '2',
        cursor: 'c0',
        threadId: 'R_SO_4_3',
        pageNo: 2,
        idCursor: 7,
        pageSize: 5,
      });
    },
  },
  {
    module: 'comment_like',
    input: { cid: 2, id: 1, t: 1, type: 0 },
    check: (wires) => {
      expect(wires[0]!.url).toContain('/weapi/v1/comment/like');
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        threadId: 'R_SO_4_1',
        commentId: 2,
      });
    },
  },
  {
    module: 'comment_like',
    input: {
      cid: '2',
      id: '1',
      t: '0',
      threadId: 'A_EV_2_1_2',
      type: '6',
    },
    check: (wires) => {
      expect(wires[0]!.url).toContain('/weapi/v1/comment/unlike');
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        threadId: 'A_EV_2_1_2',
        commentId: '2',
      });
    },
  },
  {
    module: 'comment_music',
    input: { id: '2092595510' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        rid: '2092595510',
        limit: 20,
        offset: 0,
        beforeTime: 0,
      });
    },
  },
  {
    module: 'comment_mv',
    input: { id: 34734028, offset: '100000' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        rid: 34734028,
        limit: 20,
        offset: 100000,
        beforeTime: 0,
      });
    },
  },
  {
    module: 'comment_new',
    input: { id: 1, type: 0 },
    check: (wires) => {
      const data = readEapiBody(wires[0]!.body).data as Record<string, unknown>;
      expect(data).toMatchObject({
        threadId: 'R_SO_4_1',
        pageNo: 1,
        showInner: true,
        pageSize: 20,
        cursor: '0',
        sortType: 99,
      });
    },
  },
  {
    module: 'comment_new',
    input: {
      cursor: '123',
      id: '1',
      pageNo: '2',
      pageSize: '5',
      showInner: '0',
      sortType: '3',
      type: '2',
    },
    check: (wires) => {
      const data = readEapiBody(wires[0]!.body).data as Record<string, unknown>;
      expect(data).toMatchObject({
        threadId: 'A_PL_0_1',
        pageNo: 2,
        showInner: false,
        pageSize: 5,
        cursor: '123',
        sortType: 3,
      });
    },
  },
  {
    module: 'comment_playlist',
    input: { id: '2284177332', limit: '20', offset: '100000' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        rid: '2284177332',
        limit: 20,
        offset: 100000,
        beforeTime: 0,
      });
    },
  },
  {
    module: 'comment_video',
    input: { id: 'E949B72F3F8A9851AF68B4FD700F6784', limit: '20' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        rid: 'E949B72F3F8A9851AF68B4FD700F6784',
        limit: 20,
        offset: 0,
        beforeTime: 0,
      });
    },
  },
];
