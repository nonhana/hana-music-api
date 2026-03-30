export { ensureAnonymousToken, startServer } from './src/app/cli.ts'
export { generateConfig, registerAnonymous } from './src/app/generate-config.ts'
export {
  createModuleApi,
  invokeModule,
  loadProgrammaticApi,
  NeteaseCloudMusicApi,
} from './src/app/module-api.ts'
export {
  aesDecrypt,
  aesEncrypt,
  createWeapiSecretKey,
  decrypt,
  eapi,
  eapiReqDecrypt,
  eapiResDecrypt,
  linuxapi,
  rsaEncrypt,
  weapi,
} from './src/core/crypto.ts'
export { createOption } from './src/core/options.ts'
export { createRequest } from './src/core/request.ts'
export { createServer } from './src/server/create-server.ts'
export { startServer as serveNcmApi } from './src/app/cli.ts'

export type {
  CreateModuleApiOptions,
  CreateRequestOptions,
  CreateServerOptions,
  GenerateConfigOptions,
  ModuleDefinition,
  ModuleQuery,
  ModuleRequest,
  NcmApiResponse,
  ProgrammaticApi,
  ProgrammaticModuleInvoker,
  RequestCrypto,
  RuntimeState,
  StartedServer,
  StartServerOptions,
} from './src/types/index.ts'
