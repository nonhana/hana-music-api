import { spawnSync } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

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

import { discoverModuleFiles } from '../src/server/module-discovery.ts';
import type { DiscoveredModuleFile } from '../src/server/module-discovery.ts';

const MODULES_DIRECTORY = resolve(import.meta.dir, '../src/modules');
const OUTPUT_FILE = resolve(
  import.meta.dir,
  '../src/types/generated/module-surface.generated.ts',
);
const TEMP_FILE = resolve(
  import.meta.dir,
  '../src/types/generated/module-surface.tmp.ts',
);
const SDK_GENERATED_FILE = resolve(
  import.meta.dir,
  '../src/sdk/generated/client.generated.ts',
);
const SDK_GENERATED_TEMP_FILE = resolve(
  import.meta.dir,
  '../src/sdk/generated/client.tmp.ts',
);
const SDK_REGISTRY_FILE = resolve(
  import.meta.dir,
  '../src/sdk/generated/registry.generated.ts',
);
const SDK_REGISTRY_TEMP_FILE = resolve(
  import.meta.dir,
  '../src/sdk/generated/registry.tmp.ts',
);
const SDK_API_DIRECTORY = resolve(import.meta.dir, '../src/sdk/api');

interface GeneratedArtifacts {
  readonly files: ReadonlyArray<{
    readonly contents: string;
    readonly path: string;
    readonly tempPath?: string;
  }>;
  readonly moduleCount: number;
}

const toCamelCase = (identifier: string): string =>
  identifier.replaceAll(/[/_-]+([a-zA-Z0-9])/g, (_match, char: string) =>
    char.toUpperCase(),
  );

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
      `export const ${functionName} = createEffectModuleInvoker('${identifier}', sdkModuleRegistry.${identifier})`,
  );
  const clientLines = entries.map(
    ({ functionName, identifier }) =>
      `    ${functionName}: createEffectModuleInvoker('${identifier}', sdkModuleRegistry.${identifier}, config, context),`,
  );

  return `import type { CreateHanaMusicApiConfig, SdkModuleInvoker } from '../../types/index.ts'
import { createEffectModuleInvoker, createSdkClientContext } from '../runtime.ts'
import { sdkModuleRegistry } from './registry.generated.ts'

export interface HanaMusicApiClient {
${methodLines.join('\n')}
}

${exportLines.join('\n')}

export const createHanaMusicApi = (config: CreateHanaMusicApiConfig = {}): HanaMusicApiClient => {
  const context = createSdkClientContext(config)
  return {
${clientLines.join('\n')}
  }
}
`;
};

const buildSdkRegistry = (
  identifiers: ReadonlyArray<string>,
  routes: Readonly<Record<string, string>>,
): string => {
  const entries = buildSdkEntries(identifiers);
  const importLines = entries.map(
    ({ identifier, importName }) =>
      `import ${importName}, { decodeModuleInput as ${toCamelCase(identifier)}InputDecoder } from '../../modules/${identifier}.ts'`,
  );
  const effectLines = entries.map(
    ({ identifier, importName }) =>
      `  ${identifier}: { identifier: '${identifier}', route: '${routes[identifier]}', execute: ${importName}, decodeInput: ${toCamelCase(identifier)}InputDecoder },`,
  );

  return `import type { SdkModuleRegistry } from '../../types/index.ts'
${importLines.join('\n')}

export const sdkModuleRegistry = {
${effectLines.join('\n')}
} as const satisfies SdkModuleRegistry
`;
};

const readModuleContract = (source: SourceFile) => {
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
  if (
    !source.statements.some(
      (statement) =>
        (isTypeAliasDeclaration(statement) ||
          isInterfaceDeclaration(statement)) &&
        statement.name.text === 'ModuleInput' &&
        statement.modifiers?.some(
          (modifier) => modifier.kind === SyntaxKind.ExportKeyword,
        ),
    )
  ) {
    throw new Error(
      `Module "${source.fileName}" must declare ModuleInput locally and export it`,
    );
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
          declaration.type.typeName.getText(source) === 'ModuleEffect',
      ),
  );
  if (!effect) {
    throw new Error(
      `Module "${source.fileName}" default must be explicitly typed as ModuleEffect`,
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
  return { effect, decoder, body: exportsType('ModuleBody') };
};

const readModuleContracts = async (
  moduleFiles: ReadonlyArray<DiscoveredModuleFile>,
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
          return { ...moduleFile, ...readModuleContract(source) };
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
): Promise<GeneratedArtifacts> => {
  const discovered = await discoverModuleFiles(modulesDirectory);
  const sorted = discovered.toSorted((left, right) =>
    left.identifier.localeCompare(right.identifier),
  );

  const identifiers = sorted.map((moduleFile) => moduleFile.identifier);
  const routes = sorted.map(
    (moduleFile) => [moduleFile.identifier, moduleFile.route] as const,
  );
  const contracts = await readModuleContracts(sorted);

  return {
    files: [
      {
        contents: buildModuleSurface(contracts),
        path: OUTPUT_FILE,
        tempPath: TEMP_FILE,
      },
      {
        contents: buildSdkGeneratedClient(identifiers),
        path: SDK_GENERATED_FILE,
        tempPath: SDK_GENERATED_TEMP_FILE,
      },
      {
        contents: buildSdkRegistry(identifiers, Object.fromEntries(routes)),
        path: SDK_REGISTRY_FILE,
        tempPath: SDK_REGISTRY_TEMP_FILE,
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

const formatFile = (filePath: string): void => {
  const formatResult = spawnSync('bun', ['x', 'oxfmt', filePath], {
    stdio: 'inherit',
  });

  if (formatResult.status !== 0) {
    throw new Error(
      `Failed to format generated module type surface: ${filePath}`,
    );
  }
};

const writeSurface = async (): Promise<void> => {
  const { files, moduleCount } = await buildGeneratedArtifacts();

  for (const file of files) {
    await mkdir(dirname(file.path), {
      recursive: true,
    });
    await writeFile(file.path, file.contents);
    formatFile(file.path);
  }

  console.log(`Generated ${moduleCount} module identifiers -> ${OUTPUT_FILE}`);
};

const checkSurface = async (): Promise<void> => {
  const { files } = await buildGeneratedArtifacts();

  try {
    for (const file of files) {
      await mkdir(dirname(file.tempPath ?? file.path), {
        recursive: true,
      });
      const tempPath = file.tempPath ?? `${file.path}.check-tmp.ts`;
      await writeFile(tempPath, file.contents);
      formatFile(tempPath);
    }

    for (const file of files) {
      const expected = await readFile(
        file.tempPath ?? `${file.path}.check-tmp.ts`,
        'utf8',
      );
      const actual = await readFile(file.path, 'utf8').catch(() => '');

      if (expected !== actual) {
        throw new Error(
          `Generated SDK surface is out of date. Run "bun run types:modules:generate" and commit ${file.path}.`,
        );
      }
    }

    console.log(
      `Generated module type surface is up to date -> ${OUTPUT_FILE}`,
    );
  } finally {
    for (const file of files) {
      await rm(file.tempPath ?? `${file.path}.check-tmp.ts`, {
        force: true,
      });
    }
  }
};

if (import.meta.main) {
  if (process.argv.includes('--check')) {
    await checkSurface();
  } else {
    await writeSurface();
  }
}
