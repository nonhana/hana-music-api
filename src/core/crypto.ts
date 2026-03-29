import {
  constants,
  createCipheriv,
  createDecipheriv,
  createHash,
  createPublicKey,
  publicEncrypt,
} from 'node:crypto'
import { gunzipSync } from 'node:zlib'

const IV = '0102030405060708'
const PRESET_KEY = '0CoJUm6Qyw8W8jud'
const LINUXAPI_KEY = 'rFgB&h#%2?^eDg:Q'
const EAPI_KEY = 'e82ckenh8dichen8'
const BASE62 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const WEAPI_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDgtQn2JZ34ZC28NWYpAUd98iZ37BUrX/aKzmFbt7clFSs6sXqHauqKWqdtLkF2KexO40H1YTX8z2lSgBBOAxLsvaklV8k4cBFK9snQXE9/DDaFt6Rr7iVZMldczhC0JNgTz+SHXT6CBHuX3e9SdB1Ua44oncaTWz7OBGLbCiK45wIDAQAB
-----END PUBLIC KEY-----`
const EAPI_DELIMITER = '-36cd479b6b5-'
const RSA_BLOCK_SIZE = 128

export type AesMode = 'cbc' | 'ecb'
export type CipherOutputFormat = 'base64' | 'hex'

export function aesEncrypt(
  text: string,
  mode: AesMode,
  key: string,
  // 旧调用点即使在 ECB 模式下也会继续传 iv，这里保留同样的函数签名，避免迁移期额外改调用方。
  iv: string,
  format: CipherOutputFormat = 'base64',
): string {
  const algorithm = getAesAlgorithm(mode)
  const nodeCipher = createCipher(algorithm, key, mode === 'ecb' ? null : iv)
  const encrypted = Buffer.concat([nodeCipher.update(text, 'utf8'), nodeCipher.final()])

  return format === 'hex' ? encrypted.toString('hex').toUpperCase() : encrypted.toString('base64')
}

export function aesDecrypt(
  ciphertext: string,
  mode: AesMode,
  key: string,
  iv: string,
  format: CipherOutputFormat = 'base64',
): Buffer {
  const encryptedBuffer =
    format === 'hex' ? Buffer.from(ciphertext, 'hex') : Buffer.from(ciphertext, 'base64')
  const algorithm = getAesAlgorithm(mode)
  const decipher = createDecipher(algorithm, key, mode === 'ecb' ? null : iv)

  return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()])
}

export function rsaEncrypt(plaintext: string, publicKey = WEAPI_PUBLIC_KEY): string {
  const paddedBuffer = Buffer.alloc(RSA_BLOCK_SIZE)
  Buffer.from(plaintext, 'utf8').copy(paddedBuffer, RSA_BLOCK_SIZE - plaintext.length)

  return publicEncrypt(
    {
      key: createPublicKey(publicKey),
      padding: constants.RSA_NO_PADDING,
    },
    paddedBuffer,
  ).toString('hex')
}

export function createWeapiSecretKey(): string {
  let secretKey = ''

  for (let index = 0; index < 16; index += 1) {
    const randomIndex = Math.round(Math.random() * 61)
    secretKey += BASE62[randomIndex] ?? BASE62[0]
  }

  return secretKey
}

export function weapi(
  object: Record<string, unknown>,
  secretKey = createWeapiSecretKey(),
): {
  readonly encSecKey: string
  readonly params: string
} {
  const text = JSON.stringify(object)

  return {
    encSecKey: rsaEncrypt(secretKey.split('').toReversed().join('')),
    params: aesEncrypt(aesEncrypt(text, 'cbc', PRESET_KEY, IV), 'cbc', secretKey, IV),
  }
}

export function linuxapi(object: Record<string, unknown>): {
  readonly eparams: string
} {
  return {
    eparams: aesEncrypt(JSON.stringify(object), 'ecb', LINUXAPI_KEY, '', 'hex'),
  }
}

export function eapi(
  url: string,
  object: Record<string, unknown> | string,
): {
  readonly params: string
} {
  const text = typeof object === 'string' ? object : JSON.stringify(object)
  const message = `nobody${url}use${text}md5forencrypt`
  const digest = createHash('md5').update(message).digest('hex')
  const data = `${url}${EAPI_DELIMITER}${text}${EAPI_DELIMITER}${digest}`

  return {
    params: aesEncrypt(data, 'ecb', EAPI_KEY, '', 'hex'),
  }
}

export function eapiResDecrypt(
  encryptedParams: string,
  aeapi = false,
): Record<string, unknown> | null {
  try {
    const decrypted = aesDecrypt(encryptedParams, 'ecb', EAPI_KEY, '', 'hex')
    if (aeapi) {
      return parseJsonRecord(gunzipSync(decrypted).toString('utf8'))
    }

    return parseJsonRecord(decrypted.toString('utf8'))
  } catch (error) {
    console.log('eapiResDecrypt error:', error)
    return null
  }
}

export function eapiReqDecrypt(
  encryptedParams: string,
): { readonly data: Record<string, unknown>; readonly url: string } | null {
  const decrypted = aesDecrypt(encryptedParams, 'ecb', EAPI_KEY, '', 'hex').toString('utf8')
  const match = decrypted.match(/(.*?)-36cd479b6b5-(.*?)-36cd479b6b5-(.*)/)

  if (!match) {
    return null
  }

  const url = match[1] ?? ''
  const data = match[2]
  if (data === undefined) {
    return null
  }

  return {
    data: parseJsonRecord(data),
    url,
  }
}

export function decrypt(cipher: string): string {
  return aesDecrypt(cipher, 'ecb', EAPI_KEY, '', 'hex').toString('utf8')
}

function getAesAlgorithm(mode: AesMode): 'aes-128-cbc' | 'aes-128-ecb' {
  return mode === 'cbc' ? 'aes-128-cbc' : 'aes-128-ecb'
}

function createCipher(algorithm: 'aes-128-cbc' | 'aes-128-ecb', key: string, iv: string | null) {
  const created = createCipheriv(
    algorithm,
    Buffer.from(key, 'utf8'),
    iv === null ? null : Buffer.from(iv, 'utf8'),
  )
  created.setAutoPadding(true)
  return created
}

function createDecipher(algorithm: 'aes-128-cbc' | 'aes-128-ecb', key: string, iv: string | null) {
  const created = createDecipheriv(
    algorithm,
    Buffer.from(key, 'utf8'),
    iv === null ? null : Buffer.from(iv, 'utf8'),
  )
  created.setAutoPadding(true)
  return created
}

function parseJsonRecord(text: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(text)

  if (isJsonRecord(parsed)) {
    return parsed
  }

  throw new TypeError('Expected JSON object payload')
}

function isJsonRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
