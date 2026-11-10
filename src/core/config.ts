const iphoneCookie = {
  os: 'iPhone OS',
  osver: '27.0',
  appver: '9.6.20',
  channel: 'distribution',
} as const;

const osxCookie = {
  os: 'osx',
  osver: '27.2.1',
  appver: '3.1.14',
  channel: 'netease',
} as const;

export const clientIdentities = {
  web: {
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36',
    cookie: { os: 'web' },
  },
  iphone: {
    userAgent: `NeteaseMusic ${iphoneCookie.appver}/7636 (iPhone; iOS ${iphoneCookie.osver}; zh_CN)`,
    cookie: iphoneCookie,
  },
  osx: {
    userAgent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 NeteaseMusicDesktop/${osxCookie.appver}.3459`,
    cookie: osxCookie,
  },
  linux: {
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
    cookie: {
      os: 'linux',
      osver: 'Deepin 20.9',
      appver: '1.2.1.0428',
      channel: 'netease',
    },
  },
  // 只有底层调用显式提供对应的 os 时才选择 Android 或 Windows。
  android: {
    userAgent:
      'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    cookie: {
      osver: '14',
      appver: '9.1.65.240927161425',
      channel: 'xiaomi',
    },
  },
  pc: {
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    cookie: {
      osver: 'Microsoft-Windows-10-Professional-build-19045-64bit',
      appver: '3.1.17.204416',
      channel: 'netease',
    },
  },
} as const;

export const SPECIAL_STATUS_CODES = new Set([
  201, 302, 400, 502, 800, 801, 802, 803,
]);
