export const APP_CONF = {
  apiDomain: 'https://interface.music.163.com',
  domain: 'https://music.163.com',
  encrypt: true,
  encryptResponse: false,
  checkToken:
    '9ca17ae2e6ffcda170e2e6ee8af14fbabdb988f225b3868eb2c15a879b9a83d274a790ac8ff54a97b889d5d42af0feaec3b92af58cff99c470a7eafd88f75e839a9ea7c14e909da883e83fb692a3abdb6b92adee9e',
} as const;

export const OS_PROFILES = {
  android: {
    appver: '9.1.65.240927161425',
    channel: 'xiaomi',
    os: 'android',
    osver: '14',
  },
  iphone: {
    appver: '9.0.90',
    channel: 'distribution',
    os: 'iPhone OS',
    osver: '16.2',
  },
  linux: {
    appver: '1.2.1.0428',
    channel: 'netease',
    os: 'linux',
    osver: 'Deepin 20.9',
  },
  pc: {
    appver: '3.1.17.204416',
    channel: 'netease',
    os: 'pc',
    osver: 'Microsoft-Windows-10-Professional-build-19045-64bit',
  },
} as const;

export const USER_AGENT_MAP = {
  api: {
    iphone: 'NeteaseMusic 9.0.90/5038 (iPhone; iOS 16.2; zh_CN)',
  },
  linuxapi: {
    linux:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
  },
  weapi: {
    pc: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
  },
} as const;

export const SPECIAL_STATUS_CODES = new Set([
  201, 302, 400, 502, 800, 801, 802, 803,
]);
