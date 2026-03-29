export { startServer } from './src/app/cli.ts'
export { generateConfig, registerAnonymous } from './src/app/generate-config.ts'
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

export type {
  CreateRequestOptions,
  CreateServerOptions,
  GenerateConfigOptions,
  NcmApiResponse,
  RequestCrypto,
  RuntimeState,
  StartedServer,
  StartServerOptions,
} from './src/types/index.ts'
