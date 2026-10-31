#!/usr/bin/env bun

/**
 * 按 demo 的 8 kHz / 3 秒流程生成 audio_match 指纹。
 *
 * 用法：
 *   bun scripts/audio-fingerprint.mts <音频文件> [--offset 0] [--duration 3]
 *   bun scripts/audio-fingerprint.mts --tone 440 [--duration 3]
 *
 * 音频文件需要本机有 ffmpeg；`--tone` 用合成正弦波生成没有命中的指纹。
 * 输出只包含指纹，可直接给 `fixtures:record --query "audioFP=$(...)"` 使用。
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';

const SAMPLE_RATE = 8000;
const ASSET_DIRECTORY = resolve(
  import.meta.dir,
  '../src/demo/assets/audio-match',
);

const createLocalFileRequest = () => {
  const request = {
    url: '',
    response: undefined as ArrayBuffer | undefined,
    status: 0,
    onload: undefined as (() => void) | undefined,
    onerror: undefined as ((error: unknown) => void) | undefined,
    open(_method: string, url: string) {
      request.url = url;
    },
    send() {
      try {
        const bytes = readFileSync(new URL(request.url));
        request.response = bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.byteLength,
        );
        request.status = 200;
        request.onload?.();
      } catch (error) {
        request.onerror?.(error);
      }
    },
  };
  return request;
};

// Emscripten 用 `new XMLHttpRequest()` 取 wasm，所以这里必须是可构造的普通函数。
function LocalFileRequest() {
  return createLocalFileRequest();
}

const decode = (input: string, offset: number, duration: number) => {
  const result = Bun.spawnSync(
    [
      'ffmpeg',
      '-v',
      'error',
      '-ss',
      String(offset),
      '-t',
      String(duration),
      '-i',
      input,
      '-ac',
      '1',
      '-ar',
      String(SAMPLE_RATE),
      '-f',
      'f32le',
      '-',
    ],
    { stdout: 'pipe', stderr: 'pipe' },
  );
  if (result.exitCode !== 0 || result.stdout.byteLength === 0) {
    throw new Error(result.stderr.toString() || 'ffmpeg 没有输出音频');
  }
  const bytes = result.stdout;
  const samples = new Float32Array(
    bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer,
  );
  return samples.slice(0, Math.round(duration * SAMPLE_RATE));
};

const loadGenerateFingerprint = async () => {
  const scope = globalThis as Record<string, unknown>;
  scope.window = globalThis;
  scope.document = {
    currentScript: { src: `file://${resolve(ASSET_DIRECTORY, 'afp.js')}` },
  };
  scope.XMLHttpRequest = LocalFileRequest;
  const source = readFileSync(resolve(ASSET_DIRECTORY, 'afp.js'), 'utf8');
  // afp.js 会优先走 Node 分支并 require 内置模块；把 process 传成 undefined 才能走浏览器分支。
  // oxlint-disable-next-line typescript/no-implied-eval
  const create = new Function(
    'window',
    'document',
    'process',
    'globalThis',
    `${source}\nreturn globalThis.GenerateFP;`,
  );
  const generate = create(globalThis, scope.document, undefined, globalThis);
  if (typeof generate !== 'function') {
    throw new Error('音频运行时没有导出 GenerateFP');
  }
  return generate as (samples: Float32Array) => Promise<string>;
};

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  allowPositionals: true,
  options: {
    offset: { type: 'string', default: '0' },
    duration: { type: 'string', default: '3' },
    tone: { type: 'string' },
  },
});

const duration = Number(values.duration);
if (!Number.isFinite(duration) || duration <= 0) {
  throw new Error('duration 必须是大于 0 的数字');
}

const tone = values.tone === undefined ? undefined : Number(values.tone);
if (tone !== undefined && !Number.isFinite(tone)) {
  throw new Error('tone 必须是数字');
}

let samples: Float32Array;
if (tone === undefined) {
  const [input] = positionals;
  if (input === undefined) {
    throw new Error(
      '用法：bun scripts/audio-fingerprint.mts <音频文件> [--offset 0] [--duration 3]，或用 --tone <频率>',
    );
  }
  const offset = Number(values.offset);
  if (!Number.isFinite(offset)) {
    throw new Error('offset 必须是数字');
  }
  samples = decode(input, offset, duration);
} else {
  const length = Math.round(duration * SAMPLE_RATE);
  samples = new Float32Array(length);
  for (let index = 0; index < length; index += 1) {
    samples[index] = Math.sin((2 * Math.PI * tone * index) / SAMPLE_RATE) * 0.3;
  }
}

const generate = await loadGenerateFingerprint();
process.stdout.write(`${await generate(samples)}\n`);
