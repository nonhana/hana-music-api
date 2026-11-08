export const mutations = [
  {
    id: 'action-hidden-modes-not-captured',
    file: 'src/core/request-actions.ts',
    find: 'const field = action[key];',
    replace: 'const field = undefined;',
    expectedFailures: [
      'action snapshot rejects hidden method=GET, inherited=false',
    ],
  },
  {
    id: 'raw-config-signal-lost-by-copy',
    file: 'src/core/call.ts',
    find: '? input.config',
    replace: '? {...input.config}',
    expectedFailures: [
      'raw config root keeps non-enumerable signal when cancelled before the request',
    ],
  },
  {
    id: 'assembly-inherited-handler-silently-ignored',
    file: 'src/core/options.ts',
    find: "if ('requestHandler' in options)",
    replace: "if (Object.hasOwn(options, 'requestHandler'))",
    expectedFailures: [
      'assembly refuses removed requestHandler before copying options: inherited enumerable',
    ],
  },
  {
    id: 'assembly-removed-handler-silently-ignored',
    file: 'src/core/options.ts',
    find: "if ('requestHandler' in options)",
    replace: "if ('requestHandler' in options && false)",
    expectedFailures: [
      'assembly refuses removed requestHandler before copying options: own enumerable',
    ],
  },
  {
    id: 'bound-args-control-key-accepted',
    file: 'src/core/call.ts',
    find: '!allowedArguments.includes(key)',
    replace: 'allowedArguments.length < 0',
    expectedFailures: [
      'bound args reject non-enumerable protocol before token and transport',
    ],
  },
  {
    id: 'snapshot-caller-reference-retained',
    file: 'src/core/request.ts',
    find: "return capture(input, '');",
    replace: "capture(input, ''); return input;",
    expectedFailures: [
      'bound API snapshots data and request time before token waiting without freezing the input',
    ],
  },
  {
    id: 'snapshot-raw-json-object-leaked',
    file: 'src/core/request.ts',
    find: 'const primitive: unknown = JSON.parse(value.rawJSON);',
    replace: 'const primitive: unknown = value;',
    expectedFailures: ['API snapshot matches native JSON: raw primitive JSON'],
  },
  {
    id: 'bound-types-api-plain-merged',
    file: 'src/types/runtime.ts',
    find: '(RequestAction extends Action ? unknown : DeclaredArguments<Action>)',
    replace:
      '(RequestAction extends Action ? unknown : unknown & DeclaredArguments<RequestAction>)',
    expectedFailures: [
      'bound capability types constrain local actions and API/plain parameters',
    ],
  },
  {
    id: 'mutable-action-source-cache-reused',
    file: 'src/core/request-actions.ts',
    find: 'actionSnapshots.set(snapshot, snapshot);',
    replace:
      'actionSnapshots.set(source, snapshot); actionSnapshots.set(snapshot, snapshot);',
    expectedFailures: [
      'assembled actions survive source mutation while new assembly rejects the invalid source',
    ],
  },
  {
    id: 'api-header-case-merge-lost',
    file: 'src/core/request-plan.ts',
    find: 'if (controlledHeaders.size)',
    replace: 'if (false)',
    expectedFailures: [
      'api business headers preserve their original case-merge rule',
    ],
  },
  {
    id: 'request-entropy-uses-call-start',
    file: 'src/core/request.ts',
    find: 'scope.entropy?.(now)',
    replace: 'scope.entropy?.(scope.startedAt)',
    expectedFailures: [
      'bound API snapshots data and request time before token waiting without freezing the input',
    ],
  },
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
    file: 'src/core/call.ts',
    find: '? actions[name]\n            : undefined;',
    replace:
      "? actions[name] : {profile: 'eapi' as const, target: '/api/local', semantic: 'read' as const, cache: 'none' as const, retry: 'never' as const, method: 'POST' as const, response: 'json' as const};",
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
    file: 'src/core/call.ts',
    find: '    validateModuleConfig(input.config);',
    replace: '    validateModuleConfig({});',
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
      'module direct dynamic invocation types reject execution keys in both queries',
    ],
  },
  {
    id: 'module-direct-dynamic-query-type-widened',
    file: 'src/app/module-api.ts',
    find: 'query: ModuleQuery & DisallowExecutionKeys,',
    replace: 'query: ModuleQuery | (ModuleQuery & DisallowExecutionKeys),',
    expectedFailures: [
      'module direct dynamic invocation types reject execution keys in both queries',
    ],
  },
  {
    id: 'module-debug-instance-fetcher-omitted',
    file: 'src/core/call-context.ts',
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
      'module direct dynamic invocation types reject execution keys in both queries',
    ],
  },
  {
    id: 'module-query-identity-pool-type-widened',
    file: 'src/types/sdk.ts',
    find: "| 'identityPool'",
    replace: '| never',
    expectedFailures: [
      'module direct dynamic invocation types reject execution keys in both queries',
    ],
  },
];
