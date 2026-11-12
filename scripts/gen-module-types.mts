import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  isExportAssignment,
  isExportDeclaration,
  isFunctionDeclaration,
  isInterfaceDeclaration,
  isNamedExports,
  isTypeAliasDeclaration,
  isTypeReferenceNode,
  isVariableStatement,
  SyntaxKind,
} from 'typescript/unstable/ast';
import type { SourceFile } from 'typescript/unstable/ast';
import { API } from 'typescript/unstable/async';

import { validateModuleActions } from '../src/core/request-actions.ts';
import { discoverModuleFiles } from '../src/server/module-discovery.ts';
import type { DiscoveredModuleFile } from '../src/server/module-discovery.ts';

const MODULES_DIRECTORY = resolve(import.meta.dir, '../src/modules');
const OUTPUT_FILE = resolve(
  import.meta.dir,
  '../src/types/generated/module-surface.generated.ts',
);
const SDK_GENERATED_FILE = resolve(
  import.meta.dir,
  '../src/sdk/generated/client.generated.ts',
);
const SDK_FACTORY_FILE = resolve(
  import.meta.dir,
  '../src/sdk/generated/client-factory.generated.ts',
);
const SDK_REGISTRY_FILE = resolve(
  import.meta.dir,
  '../src/sdk/generated/registry.generated.ts',
);
const SDK_BODIES_FILE = resolve(
  import.meta.dir,
  '../src/sdk/generated/bodies.generated.ts',
);
const SDK_API_DIRECTORY = resolve(import.meta.dir, '../src/sdk/api');

interface GeneratedArtifacts {
  readonly files: ReadonlyArray<{
    readonly contents: string;
    readonly path: string;
  }>;
  readonly moduleCount: number;
}

const toCamelCase = (identifier: string): string =>
  identifier.replaceAll(/[/_-]+([a-zA-Z0-9])/g, (_match, char: string) =>
    char.toUpperCase(),
  );

const toPascalCase = (identifier: string): string => {
  const name = toCamelCase(identifier);
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const buildSdkEntries = (
  identifiers: ReadonlyArray<string>,
): ReadonlyArray<{
  readonly functionName: string;
  readonly identifier: string;
  readonly importName: string;
}> => {
  const entries = identifiers.map((identifier) => ({
    functionName: toCamelCase(identifier),
    identifier,
    importName: `${toCamelCase(identifier)}Module`,
  }));
  const collisions = new Map<string, string>();

  for (const entry of entries) {
    const existing = collisions.get(entry.functionName);
    if (existing) {
      throw new Error(
        `SDK export name collision: "${entry.functionName}" maps to both "${existing}" and "${entry.identifier}".`,
      );
    }

    collisions.set(entry.functionName, entry.identifier);
  }

  return entries;
};

const buildSdkGeneratedClient = (
  identifiers: ReadonlyArray<string>,
): string => {
  const entries = buildSdkEntries(identifiers);
  const methodLines = entries.map(
    ({ functionName, identifier }) =>
      `  ${functionName}: SdkModuleInvoker<'${identifier}'>`,
  );
  const exportLines = entries.map(
    ({ functionName, identifier }) =>
      `export const ${functionName}: SdkModuleInvoker<'${identifier}'> = createEffectModuleInvoker('${identifier}', sdkModuleRegistry.${identifier})`,
  );
  return `import type { CreateHanaMusicApiConfig, SdkModuleInvoker } from '../../types/index.ts'
import { createEffectModuleInvoker, createSdkClientContext } from '../runtime.ts'
import { sdkModuleRegistry } from './registry.generated.ts'
import { createClientFromContext } from './client-factory.generated.ts'

export interface HanaMusicApiClient {
${methodLines.join('\n')}
}

${exportLines.join('\n')}

export const createHanaMusicApi = (config: CreateHanaMusicApiConfig = {}): HanaMusicApiClient => {
  const context = createSdkClientContext(config)
  return createClientFromContext(config, context)
}
`;
};

const buildSdkFactory = (identifiers: ReadonlyArray<string>): string => {
  const entries = buildSdkEntries(identifiers);
  const clientLines = entries.map(
    ({ functionName, identifier }) =>
      `    ${functionName}: createEffectModuleInvoker('${identifier}', sdkModuleRegistry.${identifier}, config, context),`,
  );

  return `import type { CreateHanaMusicApiConfig } from '../../types/index.ts'
import { createEffectModuleInvoker } from '../runtime.ts'
import type { SdkClientContext } from '../runtime.ts'
import type { HanaMusicApiClient } from './client.generated.ts'
import { sdkModuleRegistry } from './registry.generated.ts'

export const createClientFromContext = (config: CreateHanaMusicApiConfig, context: SdkClientContext): HanaMusicApiClient => ({
${clientLines.join('\n')}
})
`;
};

const buildSdkRegistry = (
  identifiers: ReadonlyArray<string>,
  routes: Readonly<Record<string, string>>,
): string => {
  const entries = buildSdkEntries(identifiers);
  const importLines = entries.map(
    ({ identifier, importName }) =>
      `import ${importName}, { decodeModuleInput as ${toCamelCase(identifier)}InputDecoder, moduleActions as ${toCamelCase(identifier)}Actions } from '../../modules/${identifier}.ts'`,
  );
  const effectLines = entries.map(
    ({ identifier, importName }) =>
      `  ${identifier}: { identifier: '${identifier}', route: '${routes[identifier]}', execute: ${importName}, decodeInput: ${toCamelCase(identifier)}InputDecoder, actions: validateModuleActions(${toCamelCase(identifier)}Actions) },`,
  );

  // 显式标注 SdkModuleRegistry：352 条目的 `as const` 字面量让 declaration emit 序列化超过 1M，
  // `bun run build` 会报 TS7056（`tsc --noEmit` 不报）；标注后运行时值与生成输出不变。
  return `import { validateModuleActions } from '../../core/request-actions.ts'
import type { SdkModuleRegistry } from '../../types/index.ts'
${importLines.join('\n')}

export const sdkModuleRegistry: SdkModuleRegistry = {
${effectLines.join('\n')}
}
`;
};

// 模块导出了 ModuleBody 结构定义时连同类型一起公开，只导出类型的模块（返回体由 SDK 拼出且不校验）只公开类型。
const buildSdkBodies = (
  contracts: ReadonlyArray<{
    readonly identifier: string;
    readonly body: boolean;
    readonly bodySchema: boolean;
  }>,
): string =>
  contracts
    .filter(({ body }) => body)
    .map(
      ({ identifier, bodySchema }) =>
        `export ${bodySchema ? '' : 'type '}{ ModuleBody as ${toPascalCase(identifier)}Body } from '../../modules/${identifier}.ts'`,
    )
    .join('\n')
    .concat('\n');

// 合法开放字典必须在这里逐项登记理由；批次不能自行放行。
const OPEN_INPUT_EXCEPTIONS: Readonly<Record<string, string>> = {
  batch: 'batch 接口按 /api/ 路由转发子请求，值类型由目标接口决定',
};

const BROAD_INPUT_PATTERNS: ReadonlyArray<RegExp> = [
  /\bLegacyModuleInput\b/u,
  /\bLegacyModuleQuery\b/u,
  /Record<\s*string\s*,\s*(?:unknown|any)\s*>/u,
  /\bunknown\b/u,
  /\bany\b/u,
  /\bobject\b/u,
  /\{\s*\}/u,
];

const expandLocalAliases = (source: SourceFile, text: string): string => {
  const aliases = new Map<string, string>();
  for (const statement of source.statements) {
    if (
      isTypeAliasDeclaration(statement) &&
      statement.name.text !== 'ModuleInput'
    ) {
      aliases.set(statement.name.text, statement.type.getText(source));
    }
  }
  let expanded = text;
  for (let round = 0; round < 5; round += 1) {
    const next = expanded.replaceAll(/\b[A-Za-z_$][\w$]*\b/gu, (name) => {
      const alias = aliases.get(name);
      return alias === undefined ? name : `(${alias})`;
    });
    if (next === expanded) break;
    expanded = next;
  }
  return expanded;
};

const assertConcreteInput = (source: SourceFile, text: string): void => {
  const identifier =
    source.fileName.split(/[\\/]/u).at(-1)?.replace(/\.ts$/u, '') ??
    source.fileName;
  if (Object.hasOwn(OPEN_INPUT_EXCEPTIONS, identifier)) return;
  const expanded = expandLocalAliases(source, text);
  const broad = BROAD_INPUT_PATTERNS.find((pattern) => pattern.test(expanded));
  if (broad !== undefined) {
    throw new Error(
      `Module "${source.fileName}" ModuleInput must be a concrete business structure (matched ${String(broad)})`,
    );
  }
};

const readModuleContract = (source: SourceFile, strictInputs = false) => {
  const exportsType = (name: string) =>
    source.statements.some(
      (statement) =>
        ((isTypeAliasDeclaration(statement) ||
          isInterfaceDeclaration(statement)) &&
          statement.name.text === name &&
          statement.modifiers?.some(
            (modifier) => modifier.kind === SyntaxKind.ExportKeyword,
          )) ||
        (isExportDeclaration(statement) &&
          statement.exportClause &&
          isNamedExports(statement.exportClause) &&
          statement.exportClause.elements.some(
            (element) =>
              element.name.text === name &&
              (statement.isTypeOnly || element.isTypeOnly),
          )),
    );
  const inputDeclaration = source.statements.find(
    (statement) =>
      (isTypeAliasDeclaration(statement) ||
        isInterfaceDeclaration(statement)) &&
      statement.name.text === 'ModuleInput' &&
      statement.modifiers?.some(
        (modifier) => modifier.kind === SyntaxKind.ExportKeyword,
      ),
  );
  if (inputDeclaration === undefined) {
    throw new Error(
      `Module "${source.fileName}" must declare ModuleInput locally and export it`,
    );
  }
  if (strictInputs) {
    assertConcreteInput(source, inputDeclaration.getText(source));
  }
  const defaultExport = source.statements.find(isExportAssignment);
  const defaultName = defaultExport?.expression.getText(source);
  const effect = source.statements.some(
    (statement) =>
      isVariableStatement(statement) &&
      statement.declarationList.declarations.some(
        (declaration) =>
          declaration.name.getText(source) === defaultName &&
          declaration.type &&
          isTypeReferenceNode(declaration.type) &&
          declaration.type.typeName.getText(source) === 'ModuleEffect' &&
          declaration.type.typeArguments?.[2]
            ?.getText(source)
            .replace(/\s+/g, ' ') === 'typeof moduleActions',
      ),
  );
  if (!effect) {
    throw new Error(
      `Module "${source.fileName}" default must bind ModuleEffect to typeof moduleActions`,
    );
  }
  const decoder =
    effect &&
    source.statements.some(
      (statement) =>
        ((isFunctionDeclaration(statement) || isVariableStatement(statement)) &&
          statement.modifiers?.some(
            (modifier) => modifier.kind === SyntaxKind.ExportKeyword,
          ) &&
          ((isFunctionDeclaration(statement) &&
            statement.name?.text === 'decodeModuleInput') ||
            (isVariableStatement(statement) &&
              statement.declarationList.declarations.some(
                (declaration) =>
                  declaration.name.getText(source) === 'decodeModuleInput',
              )))) ||
        (isExportDeclaration(statement) &&
          !statement.isTypeOnly &&
          statement.exportClause &&
          isNamedExports(statement.exportClause) &&
          statement.exportClause.elements.some(
            (element) =>
              !element.isTypeOnly && element.name.text === 'decodeModuleInput',
          )),
    );
  if (!decoder) {
    throw new Error(
      `Module "${source.fileName}" must export decodeModuleInput`,
    );
  }
  const bodySchema = source.statements.some(
    (statement) =>
      isVariableStatement(statement) &&
      statement.modifiers?.some(
        (modifier) => modifier.kind === SyntaxKind.ExportKeyword,
      ) &&
      statement.declarationList.declarations.some(
        (declaration) => declaration.name.getText(source) === 'ModuleBody',
      ),
  );
  const actions = source.statements.some(
    (statement) =>
      (isVariableStatement(statement) &&
        statement.modifiers?.some(
          (modifier) => modifier.kind === SyntaxKind.ExportKeyword,
        ) &&
        statement.declarationList.declarations.some(
          (declaration) => declaration.name.getText(source) === 'moduleActions',
        )) ||
      (isExportDeclaration(statement) &&
        !statement.isTypeOnly &&
        statement.exportClause &&
        isNamedExports(statement.exportClause) &&
        statement.exportClause.elements.some(
          (element) =>
            !element.isTypeOnly && element.name.text === 'moduleActions',
        )),
  );
  if (!actions)
    throw new Error(`Module "${source.fileName}" must export moduleActions`);
  return {
    effect,
    decoder,
    body: exportsType('ModuleBody'),
    bodySchema,
    actions,
  };
};

const readModuleContracts = async (
  moduleFiles: ReadonlyArray<DiscoveredModuleFile>,
  strictInputs = false,
): Promise<
  Array<DiscoveredModuleFile & ReturnType<typeof readModuleContract>>
> => {
  const compiler = new API();
  try {
    const snapshot = await compiler.updateSnapshot({
      openFiles: moduleFiles.map((moduleFile) => moduleFile.filePath),
    });
    try {
      return await Promise.all(
        moduleFiles.map(async (moduleFile) => {
          const project = (await snapshot.getDefaultProjectForFile(
            moduleFile.filePath,
          ))!;
          const source = (await project.program.getSourceFile(
            moduleFile.filePath,
          ))!;
          const contract = readModuleContract(source, strictInputs);
          const imported = await import(
            pathToFileURL(moduleFile.filePath).href
          );
          validateModuleActions(imported.moduleActions);
          return { ...moduleFile, ...contract };
        }),
      );
    } finally {
      await snapshot.dispose();
    }
  } finally {
    await compiler.close();
  }
};

const buildModuleSurface = (
  contracts: ReadonlyArray<{
    readonly identifier: string;
    readonly route: string;
    readonly body: boolean;
    readonly actions: boolean;
  }>,
): string => {
  const identifiers = contracts.map(({ identifier }) => identifier);
  const routes = contracts.map(
    ({ identifier, route }) => [identifier, route] as const,
  );
  const localImports = contracts.map(({ identifier, body }) => {
    const name = toCamelCase(identifier);
    return `import type { ${body ? `ModuleBody as ${name}Body, ` : ''}ModuleInput as ${name}Input } from '../../modules/${identifier}.ts'`;
  });
  const contractLines = contracts.map(({ identifier, body }) => {
    const name = toCamelCase(identifier);
    return `  ${identifier}: { input: ${name}Input; query: ${name}Input; response: ModuleResponse${body ? `<${name}Body>` : ''} }`;
  });

  return `import type { ModuleResponse } from '../runtime.ts'
${localImports.join('\n')}

export const generatedModuleIdentifiers = ${JSON.stringify(identifiers, null, 2)} as const

export type GeneratedModuleIdentifier = (typeof generatedModuleIdentifiers)[number]

export const generatedModuleRoutes = ${JSON.stringify(Object.fromEntries(routes), null, 2)} as const satisfies Readonly<
  Record<GeneratedModuleIdentifier, string>
>

export interface GeneratedModuleContractMap {
${contractLines.join('\n')}
}
`;
};

export const buildGeneratedArtifacts = async (
  modulesDirectory = MODULES_DIRECTORY,
  options: { readonly strictInputs?: boolean } = {},
): Promise<GeneratedArtifacts> => {
  const discovered = await discoverModuleFiles(modulesDirectory);
  const sorted = discovered.toSorted((left, right) =>
    left.identifier.localeCompare(right.identifier),
  );

  const identifiers = sorted.map((moduleFile) => moduleFile.identifier);
  const routes = sorted.map(
    (moduleFile) => [moduleFile.identifier, moduleFile.route] as const,
  );
  const contracts = await readModuleContracts(
    sorted,
    options.strictInputs ?? resolve(modulesDirectory) === MODULES_DIRECTORY,
  );

  return {
    files: [
      {
        contents: buildModuleSurface(contracts),
        path: OUTPUT_FILE,
      },
      {
        contents: buildSdkGeneratedClient(identifiers),
        path: SDK_GENERATED_FILE,
      },
      {
        contents: buildSdkFactory(identifiers),
        path: SDK_FACTORY_FILE,
      },
      {
        contents: buildSdkRegistry(identifiers, Object.fromEntries(routes)),
        path: SDK_REGISTRY_FILE,
      },
      {
        contents: buildSdkBodies(contracts),
        path: SDK_BODIES_FILE,
      },
      ...identifiers.map((identifier) => {
        const sdkApiPath = resolve(SDK_API_DIRECTORY, `${identifier}.ts`);
        return {
          contents: `export { ${toCamelCase(identifier)} } from '../generated/client.generated.ts'\n`,
          path: sdkApiPath,
        };
      }),
    ],
    moduleCount: identifiers.length,
  };
};

const projectRoot = resolve(import.meta.dir, '..');
const formatFiles = (paths: Array<string>): void => {
  const result = spawnSync(
    'bun',
    [
      'x',
      'oxfmt',
      '--config',
      resolve(projectRoot, 'oxfmt.config.ts'),
      ...paths,
    ],
    {
      cwd: projectRoot,
      stdio: 'inherit',
    },
  );
  if (result.status !== 0)
    throw new Error('Failed to format generated module type surface');
};

const writeSurface = async (): Promise<void> => {
  const { files, moduleCount } = await buildGeneratedArtifacts();
  for (const file of files) {
    await mkdir(dirname(file.path), { recursive: true });
    await writeFile(file.path, file.contents);
  }
  formatFiles(files.map((file) => relative(projectRoot, file.path)));
  console.log(`Generated ${moduleCount} module identifiers -> ${OUTPUT_FILE}`);
};

const checkSurface = async (): Promise<void> => {
  const { files } = await buildGeneratedArtifacts();
  const temporary = await mkdtemp(resolve(tmpdir(), 'hana-generated-'));
  try {
    const staged = files.map((file) => ({
      actual: file.path,
      expected: resolve(temporary, relative(projectRoot, file.path)),
      contents: file.contents,
    }));
    for (const file of staged) {
      await mkdir(dirname(file.expected), { recursive: true });
      await writeFile(file.expected, file.contents);
    }
    formatFiles([temporary]);
    for (const file of staged) {
      const expected = await readFile(file.expected, 'utf8');
      const actual = await readFile(file.actual, 'utf8').catch(() => '');
      if (expected !== actual)
        throw new Error(
          `Generated SDK surface is out of date. Run "bun run types:modules:generate" and commit ${file.actual}.`,
        );
    }
    console.log(
      `Generated module type surface is up to date -> ${OUTPUT_FILE}`,
    );
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
};

if (import.meta.main) {
  if (process.argv.includes('--check')) {
    await checkSurface();
  } else {
    await writeSurface();
  }
}
