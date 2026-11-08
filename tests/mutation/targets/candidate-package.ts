export const mutations = [
  {
    id: 'candidate-package-hash-check-omitted',
    file: '.github/workflows/release.yml',
    find: 'if (hash !== process.env.HANA_CANDIDATE_SHA256)',
    replace: 'if (false)',
    expectedFailures: [
      'candidate publication guard rejects wrong tarball digest',
    ],
  },
  {
    id: 'candidate-package-tag-check-omitted',
    file: '.github/workflows/release.yml',
    find: 'pre.tag !== "next" ||',
    replace: '',
    expectedFailures: ['candidate publication guard rejects wrong tag'],
  },
];
