import type { ModuleInputCase } from './contract.ts';

export const cases: ReadonlyArray<ModuleInputCase> = [
  { module: 'activate_init_profile', valid: [], invalid: [] },
  { module: 'avatar_upload', valid: [], invalid: [] },
  { module: 'captcha_sent', valid: [], invalid: [] },
  { module: 'captcha_verify', valid: [], invalid: [] },
  { module: 'cellphone_existence_check', valid: [], invalid: [] },
  { module: 'countries_code_list', valid: [], invalid: [] },
  {
    module: 'inner_version',
    valid: [{}],
    invalid: [{ unexpected: true }],
  },
  { module: 'login', valid: [], invalid: [] },
  { module: 'login_cellphone', valid: [], invalid: [] },
  { module: 'login_qr_check', valid: [], invalid: [] },
  { module: 'login_qr_create', valid: [], invalid: [] },
  {
    module: 'login_qr_key',
    valid: [{}],
    invalid: [{ type: 3 }],
  },
  { module: 'login_refresh', valid: [], invalid: [] },
  { module: 'login_status', valid: [], invalid: [] },
  { module: 'logout', valid: [], invalid: [] },
  { module: 'nickname_check', valid: [], invalid: [] },
  { module: 'rebind', valid: [], invalid: [] },
  {
    module: 'register_anonimous',
    valid: [{}],
    invalid: [{ deviceId: 'x' }],
  },
  { module: 'register_cellphone', valid: [], invalid: [] },
  { module: 'setting', valid: [], invalid: [] },
  { module: 'verify_getQr', valid: [], invalid: [] },
  { module: 'verify_qrcodestatus', valid: [], invalid: [] },
];
