const MISSING_MODULE_CODES = new Set([
  'ERR_MODULE_NOT_FOUND',
  'MODULE_NOT_FOUND',
]);

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');

export const isMissingOptionalDependencyError = (
  error: unknown,
  packageName: string,
): boolean => {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const message = Reflect.get(error, 'message');
  if (typeof message !== 'string') {
    return false;
  }
  const code = Reflect.get(error, 'code');
  const name = Reflect.get(error, 'name');
  const isMissingModuleError =
    (typeof code === 'string' && MISSING_MODULE_CODES.has(code)) ||
    name === 'ResolveMessage' ||
    /(?:Cannot find (?:package|module)|Failed to resolve)/u.test(message);
  if (!isMissingModuleError) {
    return false;
  }
  const missingSpecifierPattern = new RegExp(
    `(?:Cannot find (?:package|module)|Failed to resolve(?: import)?)\\s+['"]${escapeRegExp(packageName)}['"]`,
    'u',
  );
  return missingSpecifierPattern.test(message);
};

// 参数化 specifier 阻止打包器与 NFT 静态解析未安装的可选依赖。
export const loadOptionalDependency = async <Module>(
  packageName: string,
): Promise<Module> => {
  const specifier = packageName;
  return (await import(specifier)) as Module;
};
