export const RESOURCE_TYPE_MAP = {
  0: 'R_SO_4_',
  1: 'R_MV_5_',
  2: 'A_PL_0_',
  3: 'R_AL_3_',
  4: 'A_DJ_1_',
  5: 'R_VI_62_',
  6: 'A_EV_2_',
  7: 'A_DR_14_',
} as const

export const APP_CONF = {
  apiDomain: 'https://interface.music.163.com',
  domain: 'https://music.163.com',
  encrypt: true,
  encryptResponse: false,
  clientSign:
    '18:C0:4D:B9:8F:FE@@@453832335F384641365F424635335F303030315F303031425F343434415F343643365F333638332@@@@@@6ff673ef74955b38bce2fa8562d95c976ed4758b1227c4e9ee345987cee17bc9',
  checkToken:
    '9ca17ae2e6ffcda170e2e6ee8af14fbabdb988f225b3868eb2c15a879b9a83d274a790ac8ff54a97b889d5d42af0feaec3b92af58cff99c470a7eafd88f75e839a9ea7c14e909da883e83fb692a3abdb6b92adee9e',
} as const

export const OS_PROFILES = {
  android: {
    appver: '8.20.20.231215173437',
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
    // 这里刻意保留旧桌面端伪装串，迁移阶段不能因为“看起来过时”就擅自改掉。
    osver: 'Microsoft-Windows-10-Professional-build-19045-64bit',
  },
} as const

export const USER_AGENT_MAP = {
  api: {
    android:
      'NeteaseMusic/9.1.65.240927161425(9001065);Dalvik/2.1.0 (Linux; U; Android 14; 23013RK75C Build/UKQ1.230804.001)',
    iphone: 'NeteaseMusic 9.0.90/5038 (iPhone; iOS 16.2; zh_CN)',
    pc: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/3.0.18.203152',
  },
  linuxapi: {
    linux:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
  },
  weapi: {
    pc: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
  },
} as const

export const SPECIAL_STATUS_CODES = new Set([201, 302, 400, 502, 800, 801, 802, 803])
