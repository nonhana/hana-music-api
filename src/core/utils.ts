import { randomBytes } from 'node:crypto'

import type { BooleanLike, CookieRecord, CookieValue } from '../types/index.ts'

const CHINA_IP_PREFIXES = [
  '116.25',
  '116.76',
  '116.77',
  '116.78',
  '116.79',
  '116.80',
  '116.81',
  '116.82',
  '116.83',
  '116.84',
  '116.85',
  '116.86',
  '116.87',
  '116.88',
  '116.89',
  '116.90',
  '116.91',
  '116.92',
  '116.93',
  '116.94',
] as const

const DEVICE_ID_CHARS = '0123456789ABCDEF'

export function toBoolean(value: BooleanLike | undefined): '' | boolean {
  if (typeof value === 'boolean') {
    return value
  }

  if (value === '') {
    return value
  }

  return value === 'true' || value === 1 || value === '1'
}

// 将 cookie 字符串转换为 JSON 对象
// 单个 cookie 的格式为 "key=value"，多个 cookie 之间用 ";" 分隔
export function cookieToJson(cookie: string | undefined): CookieRecord {
  if (!cookie) {
    return {}
  }

  const result: CookieRecord = {}

  for (const part of cookie.split(';')) {
    const equalsIndex = part.indexOf('=')

    if (equalsIndex < 1 || equalsIndex >= part.length - 1) {
      continue
    }

    const key = part.slice(0, equalsIndex).trim()
    const value = part.slice(equalsIndex + 1).trim()
    result[key] = value
  }

  return result
}

export function cookieObjToString(cookie: CookieRecord): string {
  return Object.entries(cookie)
    .filter((entry): entry is [string, CookieValue] => entry[1] !== undefined)
    .map(([key, value]) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    })
    .join('; ')
}

export function getRandom(length: number): number {
  const randomValue = Math.random()
  const floorValue = Math.floor(randomValue * 9 + 1)
  const powerValue = 10 ** (length - 1)

  return Math.floor((randomValue + floorValue) * powerValue)
}

export function generateRandomChineseIP(): string {
  const prefix = CHINA_IP_PREFIXES[Math.floor(Math.random() * CHINA_IP_PREFIXES.length)]

  return `${prefix}.${generateIPSegment()}.${generateIPSegment()}`
}

export function generateChainId(cookie: CookieRecord | string | undefined): string {
  const version = 'v1'
  const randomNumber = Math.floor(Math.random() * 1e6)
  const deviceId = getCookieValue(cookie, 'sDeviceId') || `unknown-${randomNumber}`
  const platform = 'web'
  const action = 'login'
  const timestamp = Date.now()

  return `${version}_${deviceId}_${platform}_${action}_${timestamp}`
}

export function generateDeviceId(): string {
  const characters: string[] = []

  for (let index = 0; index < 52; index += 1) {
    const randomIndex = Math.floor(Math.random() * DEVICE_ID_CHARS.length)
    const character = DEVICE_ID_CHARS[randomIndex]
    characters.push(character === undefined ? '0' : character)
  }

  return characters.join('')
}

export function createRandomHex(byteLength: number): string {
  return randomBytes(byteLength).toString('hex')
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function generateIPSegment(): number {
  return Math.floor(Math.random() * 255) + 1
}

function getCookieValue(cookie: CookieRecord | string | undefined, name: string): string {
  if (!cookie) {
    return ''
  }

  if (isRecord(cookie)) {
    const value = cookie[name]
    return value === undefined ? '' : String(value)
  }

  const parts = `; ${cookie}`.split(`; ${name}=`)
  if (parts.length !== 2) {
    return ''
  }

  return parts[1]?.split(';')[0] ?? ''
}
