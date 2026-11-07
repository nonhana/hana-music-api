export const mutations = [
  {
    id: 'typecheck-browser-project-omitted',
    file: 'package.json',
    find: '"typecheck": "tsc --noEmit -p tsconfig.json && tsc --noEmit -p src/browser/tsconfig.json"',
    replace: '"typecheck": "tsc --noEmit -p tsconfig.json"',
    expectedFailures: [
      'typecheck rejects an invalid browser source even when the server project is valid',
    ],
  },
  {
    id: 'typecheck-server-project-omitted',
    file: 'package.json',
    find: '"typecheck": "tsc --noEmit -p tsconfig.json && tsc --noEmit -p src/browser/tsconfig.json"',
    replace: '"typecheck": "tsc --noEmit -p src/browser/tsconfig.json"',
    expectedFailures: [
      'typecheck rejects an invalid server source even when the browser project is valid',
    ],
  },
];
