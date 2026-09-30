export const resolveDjToplistType = (value: unknown): 0 | 1 => {
  return value === 'hot' ? 1 : 0;
};
