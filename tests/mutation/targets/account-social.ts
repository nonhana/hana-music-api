export const mutations = [
  {
    id: 'account-login-protocol-swapped',
    file: 'src/modules/login.ts',
    find: "profile: 'eapi',",
    replace: "profile: 'weapiPc',",
    expectedFailures: [
      'account client login/default owns its baseline wire contract',
    ],
  },
  {
    id: 'account-captcha-priority-lost',
    file: 'src/modules/login_cellphone.ts',
    find: "[query.captcha ? 'captcha' : 'password']: query.captcha",
    replace: "[false ? 'captcha' : 'password']: query.captcha",
    expectedFailures: [
      'account client login_cellphone/captcha-priority owns its baseline wire contract',
    ],
  },
  {
    id: 'account-md5-priority-lost',
    file: 'src/modules/login.ts',
    find: 'query.md5_password ||',
    replace: 'query.password ||',
    expectedFailures: [
      'account client login/md5 owns its baseline wire contract',
    ],
  },
  {
    id: 'account-comment-delete-lost',
    file: 'src/modules/comment.ts',
    find: "0: 'delete',",
    replace: "0: 'add',",
    expectedFailures: [
      'account client comment/action-0 owns its baseline wire contract',
    ],
  },
  {
    id: 'account-sync-display-list-lost',
    file: 'src/modules/listentogether_sync_list_command.ts',
    find: "displayList: query.displayList.split(','),",
    replace: "displayList: query.randomList.split(','),",
    expectedFailures: [
      'account client listentogether_sync_list_command/default owns its baseline wire contract',
    ],
  },
  {
    id: 'account-message-read-retried',
    file: 'src/modules/msg_private_history.ts',
    find: "retry: 'never',",
    replace: "retry: 'connect',",
    expectedFailures: [
      'account msg_private_history preserves EAI_AGAIN retry eligibility',
    ],
  },
  {
    id: 'account-poll-retried',
    file: 'src/modules/login_qr_check.ts',
    find: "semantic: 'poll',\n    cache: 'none',\n    retry: 'never',",
    replace: "semantic: 'read',\n    cache: 'none',\n    retry: 'connect',",
    expectedFailures: [
      'account login_qr_check preserves EAI_AGAIN retry eligibility',
    ],
  },
  {
    id: 'account-extra-cache-granted',
    file: 'src/modules/user_binding.ts',
    find: "cache: 'none',",
    replace: "cache: 'shared',",
    expectedFailures: [
      'account user_binding never shares or caches successful calls',
    ],
  },
];
