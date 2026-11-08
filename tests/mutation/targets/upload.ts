export const mutations = [
  {
    id: 'upload-records-action-key',
    file: 'src/core/call.ts',
    find: '...stages,\n                logicalTarget,',
    replace: '...stages,\n                name,',
    expectedFailures: [
      'failure at stage 1 reports only completed stages and sends nothing further',
    ],
  },
  {
    id: 'upload-commits-after-failed-pre-check',
    file: 'src/modules/voice_upload.ts',
    find: '      });\n      const submitted = yield* stage(',
    replace:
      '      }).pipe(Effect.ignore);\n      const submitted = yield* stage(',
    expectedFailures: [
      'public voiceUpload stops after a failed strict stage 4',
    ],
  },
];
