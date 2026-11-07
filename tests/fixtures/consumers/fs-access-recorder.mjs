import fs from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';

// 经 --import 预加载：记下本进程按路径发起的每一次文件系统调用；按文件描述符的调用之前必有一次按路径的 open，不重复记录。
const accesses = [];
globalThis.fsAccesses = accesses;

const recordCalls = (target, prefix) => {
  for (const [name, original] of Object.entries(target)) {
    if (typeof original !== 'function' || /^[A-Z]/.test(name)) {
      continue;
    }
    const recorded = (...args) => {
      const [subject] = args;
      if (
        typeof subject === 'string' ||
        subject instanceof URL ||
        Buffer.isBuffer(subject)
      ) {
        accesses.push(`${prefix}${name} ${String(subject)}`);
      }
      return original(...args);
    };
    target[name] = Object.assign(recorded, original);
  }
};

recordCalls(fs, 'fs.');
recordCalls(fs.promises, 'fs.promises.');
syncBuiltinESMExports();
