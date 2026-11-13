export const mutations = [
  {
    id: 'identity-device-omitted-from-fingerprint',
    file: 'src/core/identity-snapshot.ts',
    find: '[value, deviceId]',
    replace: '[value]',
    expectedFailures: [
      'identity shared cache includes a changing runtime device with the same anonymous credentials',
    ],
  },
  {
    id: 'identity-invalid-state-erases-pool-device',
    file: 'src/core/call.ts',
    find: 'deviceId: identityConfig.deviceId,',
    replace: 'deviceId: config.state?.deviceId,',
    expectedFailures: [
      'identity pool ignores undefined state device through a concurrent runtime change',
    ],
  },
  {
    id: 'identity-pool-overrides-caller-device',
    file: 'src/core/call.ts',
    find: '!explicitIdentity && !explicitDevice && needsSession && scoped.pool',
    replace:
      '!explicitIdentity && explicitDevice !== undefined && needsSession && scoped.pool',
    expectedFailures: [
      'identity caller cookie device wins over an anonymous pool including registration',
    ],
  },
  {
    id: 'identity-raw-os-defaults-ignored',
    file: 'src/core/request.ts',
    find: 'const rawOs = rawCookie.os;',
    replace: 'const rawOs = [undefined, rawCookie.os][0];',
    expectedFailures: [
      'identity low-level partial PC override gets matching generated platform defaults',
    ],
  },
  {
    id: 'identity-cookie-precedence-restored',
    file: 'src/core/identity-snapshot.ts',
    find: '[config.state?.deviceId, cookie.deviceId, state.deviceId]',
    replace: '[cookie.deviceId, config.state?.deviceId, state.deviceId]',
    expectedFailures: ['identity selects one device conflict at the SDK wire'],
  },
  {
    id: 'identity-mixed-eapi-ua-restored',
    file: 'src/core/request-profiles.ts',
    find: "eapi: {\n    protocol: 'eapi',\n    domain: 'https://interface.music.163.com',\n    ...clientIdentities.iphone,",
    replace:
      "eapi: {\n    protocol: 'eapi',\n    domain: 'https://interface.music.163.com',\n    ...clientIdentities.iphone,\n    userAgent: clientIdentities.web.userAgent,",
    expectedFailures: ['identity sdk Ficus sky uses its declared identity'],
  },
  {
    id: 'identity-case-cleanup-lost',
    file: 'src/core/request-plan.ts',
    find: 'if (controlled.has(name.toLowerCase())) delete cookie[name];',
    replace: 'if (controlled.has(name)) delete cookie[name];',
    expectedFailures: [
      'identity web removes conflicting case platform cookies',
    ],
  },
  {
    id: 'identity-unproven-build-default-restored',
    file: 'src/core/request-plan.ts',
    find: 'requestId: entropy.requestId,',
    replace: 'requestId: entropy.requestId, buildver: String(entropy.now),',
    expectedFailures: [
      'identity projection is deterministic and omits unproven desktop defaults',
    ],
  },
  {
    id: 'identity-implicit-username-drift',
    file: 'src/core/anonymous.ts',
    find: 'username: createAnonymousUsername(deviceId)',
    replace: "username: createAnonymousUsername('wrong-device')",
    expectedFailures: [
      'identity implicit anonymous conflict shares its device with the business call',
    ],
  },
];
