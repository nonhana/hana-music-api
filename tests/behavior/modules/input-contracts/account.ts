import type { ModuleInputCase } from './contract.ts';

const imageFile = {
  data: new Uint8Array([1, 2, 3]),
  name: 'avatar.jpg',
  mimetype: 'image/jpeg',
  size: 3,
};

export const cases: ReadonlyArray<ModuleInputCase> = [
  {
    module: 'activate_init_profile',
    valid: [{ nickname: 'listener' }],
    invalid: [{}, { nickname: 1 }],
  },
  {
    module: 'avatar_upload',
    valid: [{}, { imgFile: imageFile }],
    invalid: [{ imgFile: { ...imageFile, data: 'text' } }],
  },
  {
    module: 'captcha_sent',
    valid: [{ phone: '13800138000' }, { ctcode: 852, phone: '13800138000' }],
    invalid: [{ phone: 13800138000 }, { phone: '13800138000', ctcode: '85-2' }],
  },
  {
    module: 'captcha_verify',
    valid: [{ captcha: '1234', phone: '13800138000' }],
    invalid: [{ phone: '13800138000' }, { captcha: '1234', phone: 1 }],
  },
  {
    module: 'cellphone_existence_check',
    valid: [
      { phone: '13800138000' },
      { countrycode: '86', phone: '13800138000' },
      { countrycode: 1, phone: '13800138000' },
    ],
    invalid: [
      { phone: '13800138000', countrycode: '86,1' },
      { phone: '13800138000', countrycode: true },
    ],
  },
  {
    module: 'countries_code_list',
    valid: [{}],
    invalid: [{ unexpected: true }],
  },
  {
    module: 'inner_version',
    valid: [{}],
    invalid: [{ unexpected: true }],
  },
  {
    module: 'login',
    valid: [
      { email: 'listener@example.invalid', password: 'secret' },
      { email: 'listener@example.invalid', md5_password: 'hash' },
    ],
    invalid: [
      { email: 'listener@example.invalid' },
      { email: 'listener@example.invalid', password: 1 },
    ],
  },
  {
    module: 'login_cellphone',
    valid: [
      { phone: '13800138000', captcha: '1234' },
      { phone: '13800138000', password: 'secret' },
      { countrycode: '86', md5_password: 'hash', phone: '13800138000' },
    ],
    invalid: [
      { phone: '13800138000' },
      { phone: '13800138000', captcha: '1234', countrycode: '86,1' },
    ],
  },
  {
    module: 'login_qr_check',
    valid: [{ key: 'qr-key' }],
    invalid: [{ key: 1 }],
  },
  {
    module: 'login_qr_create',
    valid: [
      { key: 'qr-key' },
      { key: 'qr-key', platform: 'web', qrimg: true },
      { key: 'qr-key', qrimg: 'true' },
    ],
    invalid: [
      { key: 'qr-key', platform: 'mobile' },
      { key: 'qr-key', qrimg: 'yes' },
    ],
  },
  {
    module: 'login_qr_key',
    valid: [{}],
    invalid: [{ type: 3 }],
  },
  {
    module: 'login_refresh',
    valid: [{}],
    invalid: [{ unexpected: true }],
  },
  {
    module: 'login_status',
    valid: [{}],
    invalid: [{ unexpected: true }],
  },
  {
    module: 'logout',
    valid: [{}],
    invalid: [{ unexpected: true }],
  },
  {
    module: 'nickname_check',
    valid: [{ nickname: 'listener' }],
    invalid: [{ nickname: 1 }],
  },
  {
    module: 'rebind',
    valid: [{ captcha: '1234', oldcaptcha: '5678', phone: '13800138000' }],
    invalid: [{ captcha: '1234', phone: '13800138000' }],
  },
  {
    module: 'register_anonimous',
    valid: [{}],
    invalid: [{ deviceId: 'x' }],
  },
  {
    module: 'register_cellphone',
    valid: [
      {
        captcha: '1234',
        nickname: 'listener',
        password: 'secret',
        phone: '13800138000',
      },
    ],
    invalid: [
      { captcha: '1234', nickname: 'listener', phone: '13800138000' },
      {
        captcha: '1234',
        countrycode: '86,1',
        nickname: 'listener',
        password: 'secret',
        phone: '13800138000',
      },
    ],
  },
  { module: 'setting', valid: [{}], invalid: [{ unexpected: true }] },
  {
    module: 'verify_getQr',
    valid: [
      {},
      {
        evid: 'event',
        sign: 'sign',
        token: 'token',
        type: '2',
        vid: 'config',
      },
    ],
    invalid: [{ type: 'arbitrary-type' }],
  },
  {
    module: 'verify_qrcodestatus',
    valid: [{ qr: 'qr-code' }, { qr: '' }],
    invalid: [{ qr: 1 }],
  },
];
