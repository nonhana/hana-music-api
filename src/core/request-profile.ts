import type { RequestProfile, RequestProfileName } from '../types/index.ts';
import { USER_AGENT_MAP } from './config.ts';

/**
 * 请求 profile 把协议、客户端身份、UA 和 token 策略绑成一个整体。
 * 模块只能选择一个已存在的 profile，不能再用零散字段拼出混合身份。
 */
export const REQUEST_PROFILES = {
  web: {
    protocol: 'weapi',
    client: 'web',
    userAgent: USER_AGENT_MAP.weapi.pc,
    cookie: {
      os: 'web',
      // 官方网页不发送 eapi 客户端字段；显式清空调用方可能带来的客户端身份。
      appver: undefined,
      channel: undefined,
      deviceId: undefined,
      osver: undefined,
    },
    checkToken: 'optional',
    cache: { reads: true },
    retry: { read: true },
  },
  desktop: {
    protocol: 'eapi',
    client: 'desktop',
    userAgent: 'NeteaseMusic/3451 CFNetwork/3896.100.1.1.1 Darwin/27.0.0',
    cookie: {
      os: 'osx',
      appver: '3.1.13',
      channel: 'netease',
      osver: '27.0.1',
    },
    // 官方 Mac 的 deviceId/clientSign 是设备相关值，由调用方或运行时 state 提供，不在这里伪造。
    checkToken: 'optional',
    cache: { reads: true },
    retry: { read: true },
  },
} as const satisfies Record<RequestProfileName, RequestProfile>;
