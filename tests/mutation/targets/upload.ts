export const mutations = [
  {
    id: 'upload-commits-after-failed-pre-check',
    file: 'src/modules/voice_upload.ts',
    find: '      );\n      const submitted = yield* stage(',
    replace:
      '      ).pipe(Effect.ignore);\n      const submitted = yield* stage(',
    expectedFailures: [
      'public voiceUpload stops after a failed strict stage 4',
    ],
  },
];
