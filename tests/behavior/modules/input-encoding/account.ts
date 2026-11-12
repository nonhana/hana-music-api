import { expect } from 'bun:test';

import { readEapiBody, readWebBody } from '../../../_kit/upstream/wire.ts';
import type { EncodingCase } from './contract.ts';

export const cases: ReadonlyArray<EncodingCase> = [
  {
    module: 'captcha_sent',
    input: { phone: '13800138000' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        ctcode: '86',
        secrete: 'music_middleuser_pclogin',
        cellphone: '13800138000',
      });
    },
  },
  {
    module: 'captcha_sent',
    input: { ctcode: 852, phone: '13800138000' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toHaveProperty('ctcode', 852);
    },
  },
  {
    module: 'captcha_verify',
    input: { captcha: '1234', phone: '13800138000' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        ctcode: '86',
        cellphone: '13800138000',
        captcha: '1234',
      });
    },
  },
  {
    module: 'login_cellphone',
    input: { captcha: '1234', phone: '13800138000' },
    respond: () =>
      Response.json(
        { account: { id: 17, anonimousUser: false }, profile: { userId: 17 } },
        { headers: { 'set-cookie': 'MUSIC_U=synthetic; Path=/' } },
      ),
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        type: '1',
        https: 'true',
        phone: '13800138000',
        countrycode: '86',
        captcha: '1234',
        remember: 'true',
      });
    },
  },
  {
    module: 'rebind',
    input: { captcha: '1234', oldcaptcha: '5678', phone: '13800138000' },
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        captcha: '1234',
        phone: '13800138000',
        oldcaptcha: '5678',
        ctcode: '86',
      });
    },
  },
  {
    module: 'register_cellphone',
    input: {
      captcha: '1234',
      nickname: 'listener',
      password: 'secret',
      phone: '13800138000',
    },
    check: (wires) => {
      expect(readEapiBody(wires[0]!.body).data).toMatchObject({
        captcha: '1234',
        phone: '13800138000',
        password: '5ebe2294ecd0e0f08eab7690d2a6ee69',
        nickname: 'listener',
        countrycode: '86',
        force: 'false',
      });
    },
  },
  {
    module: 'verify_getQr',
    input: {
      evid: 'event',
      sign: 'sign',
      token: 'token',
      type: '2',
      vid: 'config',
    },
    respond: () => Response.json({ code: 200, data: { qrCode: 'abc' } }),
    check: (wires) => {
      expect(readWebBody(wires[0]!.body)).toMatchObject({
        verifyConfigId: 'config',
        verifyType: 2,
        token: 'token',
        params: JSON.stringify({ event_id: 'event', sign: 'sign' }),
        size: 150,
      });
    },
  },
];
