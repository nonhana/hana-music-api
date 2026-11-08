export const mutations = [
  {
    id: 'module-config-removed-key-accepted',
    file: 'src/core/options.ts',
    find: '!allowed.includes(key)',
    replace: 'allowed.length < 0',
    expectedFailures: [
      'module config rejects crypto=api before local execution',
    ],
  },
  {
    id: 'module-query-execution-key-accepted',
    file: 'src/core/options.ts',
    find: 'if (Object.hasOwn(value, key))',
    replace: 'if (false)',
    expectedFailures: ['module query rejects execution key crypto'],
  },
  {
    id: 'module-client-config-unchecked',
    file: 'src/core/call.ts',
    find: '  validateModuleConfig(config, true);',
    replace: '  void config;',
    expectedFailures: ['module client rejects removed default crypto'],
  },
  {
    id: 'module-actions-missing-fallback-restored',
    file: 'src/core/call.ts',
    find: 'validateModuleActions(implementation.actions)',
    replace: 'validateModuleActions(implementation.actions ?? {})',
    expectedFailures: [
      'module assembly refuses missing actions before executing a local body',
    ],
  },
  {
    id: 'module-empty-actions-request-accepted',
    file: 'src/core/request.ts',
    find: 'if (call.rawOptions === undefined)',
    replace:
      'if (call.rawOptions === undefined && Object.keys(call.actions).length > 0)',
    expectedFailures: [
      'module empty actions cannot send an undeclared API request',
    ],
  },
  {
    id: 'module-generator-illegal-action-accepted',
    file: 'scripts/gen-module-types.mts',
    find: 'validateModuleActions(imported.moduleActions);',
    replace: 'validateModuleActions(imported.moduleActions && {});',
    expectedFailures: ['module generator and loader reject invalid actions'],
  },
  {
    id: 'module-sdk-original-config-unchecked',
    file: 'src/sdk/runtime.ts',
    find: '  try {\n    validateModuleConfig(config);',
    replace: '  try {\n    validateModuleConfig({});',
    expectedFailures: [
      'module non-enumerable crypto is rejected by every call entry',
    ],
  },
  {
    id: 'module-api-mode-validation-omitted',
    file: 'src/core/request-actions.ts',
    find: "profile.protocol !== 'plain' &&",
    replace: 'false &&',
    expectedFailures: [
      'module assembly rejects API method DELETE before execution',
    ],
  },
  {
    id: 'module-action-retry-coercion-restored',
    file: 'src/core/request-actions.ts',
    find: "typeof action.retry !== 'string' ||\n      !['never', 'connect', 'read'].includes(action.retry)",
    replace: "!['never', 'connect', 'read'].includes(String(action.retry))",
    expectedFailures: [
      'module illegal retry array cannot grant connection replay',
    ],
  },
  {
    id: 'module-direct-static-query-type-widened',
    file: 'src/app/module-api.ts',
    find: 'query: SdkQueryOf<K> & ModuleQuery,',
    replace: 'query: ModuleQuery | (SdkQueryOf<K> & ModuleQuery),',
    expectedFailures: [
      'module direct dynamic invocation types reject crypto in both queries',
    ],
  },
  {
    id: 'module-direct-dynamic-query-type-widened',
    file: 'src/app/module-api.ts',
    find: 'query: ModuleQuery & DisallowExecutionKeys,',
    replace: 'query: ModuleQuery | (ModuleQuery & DisallowExecutionKeys),',
    expectedFailures: [
      'module direct dynamic invocation types reject crypto in both queries',
    ],
  },
  {
    id: 'module-debug-services-omitted',
    file: 'src/demo/api-debug-request.ts',
    find: 'request(intent).pipe(Effect.provideService(CallServices, services))',
    replace:
      'request(intent).pipe(Effect.tap(() => Effect.serviceOption(CallServices)))',
    expectedFailures: [
      'debug raw request retains the HTTP call services for its controlled handler',
    ],
  },
  {
    id: 'module-debug-instance-fetcher-omitted',
    file: 'src/core/request.ts',
    find: 'fetcher: options.fetcher ?? execution?.fetcher,',
    replace: 'fetcher: options.fetcher,',
    expectedFailures: [
      'debug raw request uses the internal instance fetcher at the final wire',
    ],
  },
  {
    id: 'module-debug-instance-clock-omitted',
    file: 'src/core/request.ts',
    find: 'const startedAt = Effect.runSync(now);',
    replace: 'const startedAt = Effect.runSync(Clock.currentTimeMillis);',
    expectedFailures: [
      'debug raw request keeps the instance clock for its deadline and body cancellation',
    ],
  },
  {
    id: 'module-query-cache-type-widened',
    file: 'src/types/sdk.ts',
    find: "| 'cache'",
    replace: '| never',
    expectedFailures: [
      'module direct dynamic invocation types reject cache in both queries',
    ],
  },
  {
    id: 'module-query-identity-pool-type-widened',
    file: 'src/types/sdk.ts',
    find: "| 'identityPool'",
    replace: '| never',
    expectedFailures: [
      'module direct dynamic invocation types reject identityPool in both queries',
    ],
  },
];
