export const mutations = [
  {
    id: 'watchman-initialization-not-reused',
    file: 'src/browser/watchman.ts',
    find: 'Reflect.get(page, initializationKey) as',
    replace: "Reflect.get(page, Symbol('isolated')) as",
    expectedFailures: [
      'parallel initialization reuses one script and one official instance',
    ],
  },
  {
    id: 'watchman-cached-token',
    file: 'src/browser/watchman.ts',
    find: 'instance.getToken(config.businessKey, settle);',
    replace: `const cached = Reflect.get(instance, '__cachedToken');
                  if (typeof cached === 'string') settle(cached);
                  else instance.getToken(config.businessKey, (token) => {
                    Reflect.set(instance, '__cachedToken', token);
                    settle(token);
                  });`,
    expectedFailures: [
      'each token call forwards official defaults and returns its own fresh result',
    ],
  },
  {
    id: 'watchman-failed-state-retained',
    file: 'src/browser/watchman.ts',
    find: 'Reflect.deleteProperty(page, initializationKey);',
    replace: 'Reflect.has(page, initializationKey);',
    expectedFailures: [
      'initialization recovers from initialization-failure on the next explicit call',
    ],
  },
];
