// 版本号必须由构建内联进产物：打包进云函数后，产物旁边可能没有 package.json 可读。
import packageJson from '../../package.json' with { type: 'json' };

export const SERVICE_VERSION: string = packageJson.version;
