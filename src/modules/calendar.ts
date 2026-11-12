import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

// 毫秒时间戳，省略时各自取当前时间，保持原有零长度区间的默认行为。
export type ModuleInput = {
  endTime?: NaturalValue;
  startTime?: NaturalValue;
};

const inputSchema = Schema.Struct({
  endTime: Schema.optional(NaturalValue),
  startTime: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const CalendarEvent = UpstreamObject({
  id: Schema.String,
  eventType: Loose(Schema.String),
  onlineTime: Loose(Schema.Finite),
  offlineTime: Loose(Schema.Finite),
  tag: Loose(Schema.String),
  title: Loose(Schema.String),
  imgUrl: Loose(Schema.String),
  canRemind: Loose(Schema.Boolean),
  reminded: Loose(Schema.Boolean),
  targetUrl: Loose(Schema.String),
  remindText: Loose(Schema.String),
  resourceType: Loose(Schema.String),
  resourceId: Loose(Schema.String),
  eventStatus: Loose(Schema.String),
  remindedText: Loose(Schema.String),
  headline: Loose(Schema.Boolean),
  subCount: Loose(Schema.Finite),
});

const CalendarButton = UpstreamObject({
  text: Loose(Schema.String),
  targetUrl: Loose(Schema.String),
});

const CalendarConfig = UpstreamObject({
  button: Loose(CalendarButton),
});

// 返回码、音乐日历的事件路径 data.calendarEvents 和事件自己的编号 id 收紧；日历事件就是接口要返回的东西，日历按钮等展示信息宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      calendarEvents: Schema.Array(CalendarEvent),
      calendarConfig: Loose(CalendarConfig),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/mcalendar/detail',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const calendar: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      startTime: query.startTime || Date.now(),
      endTime: query.endTime || Date.now(),
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody('calendar', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

export default calendar;
