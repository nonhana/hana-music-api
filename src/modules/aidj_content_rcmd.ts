import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';
// 私人 DJ
// 实际请求参数如下, 部分内容省略, 敏感信息已进行混淆
// 可按需修改此 API 的代码
/* {"extInfo":"{\"lastRequestTimestamp\":1692358373509,\"lbsInfoList\":[{\"lat\":40.23076381,\"lon\":129.07545186,\"time\":1692358543},{\"lat\":40.23076381,\"lon\":129.07545186,\"time\":1692055283}],\"listenedTs\":false,\"noAidjToAidj\":true}","header":"{}"} */
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';

const aidjContentRcmd: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const extInfo: Record<string, unknown> = {};
    if (query.latitude !== undefined) {
      extInfo.lbsInfoList = [
        {
          lat: query.latitude,
          lon: query.longitude,
          time: Math.floor(Date.now() / 1000),
        },
      ];
    }
    extInfo.noAidjToAidj = false;
    extInfo.lastRequestTimestamp = Date.now();
    extInfo.listenedTs = false;
    const data = {
      extInfo: JSON.stringify(extInfo),
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/aidj/content/rcmd/info`,
          data,
          createOption(query),
        ),
      ),
    );
  });

export default aidjContentRcmd;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
