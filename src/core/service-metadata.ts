// 版本号必须由构建内联进产物：打包进云函数或 unbundle 分发后，产物旁边可能没有 package.json 可读。
import packageJson from '../../package.json' with { type: 'json' };

declare const __HANA_SERVICE_VERSION__: string | undefined;

export const SERVICE_VERSION: string =
  typeof __HANA_SERVICE_VERSION__ === 'string'
    ? __HANA_SERVICE_VERSION__
    : packageJson.version;
