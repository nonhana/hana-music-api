import { afterAll, describe, test } from 'bun:test';

const violations: Array<string> = [];
const rejectFocus = () => {
  violations.push('Focused selection is forbidden');
  throw new Error('Focused selection is forbidden');
};

const guard = (register: object) => {
  Object.defineProperty(register, 'only', {
    configurable: true,
    value: rejectFocus,
  });
  const each: unknown = Reflect.get(register, 'each');
  if (typeof each === 'function') {
    Object.defineProperty(register, 'each', {
      configurable: true,
      value: (...args: Array<unknown>) => {
        const built: unknown = Reflect.apply(each, register, args);
        if (typeof built === 'function') guard(built);
        return built;
      },
    });
  }
};
for (const register of [test, describe]) guard(register);
afterAll(() => {
  if (violations.length) throw new Error(violations.join('; '));
});
