import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

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

const calendar: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      startTime: query.startTime || Date.now(),
      endTime: query.endTime || Date.now(),
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/mcalendar/detail`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('calendar', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

export default calendar;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
