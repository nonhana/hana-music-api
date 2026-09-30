import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  isCallExpression,
  isExportDeclaration,
  isExportSpecifier,
  isExternalModuleReference,
  isIdentifier,
  isImportDeclaration,
  isImportSpecifier,
  isImportTypeNode,
  isLiteralTypeNode,
  isNamespaceExport,
  isNoSubstitutionTemplateLiteral,
  isPrivateIdentifier,
  isStringLiteral,
  SyntaxKind,
  visitEachChild,
} from 'typescript/unstable/ast';
import type { Node } from 'typescript/unstable/ast';
import { API } from 'typescript/unstable/async';
import { createVirtualFileSystem } from 'typescript/unstable/fs';

const forbiddenIdentifier =
  /\b(?:RawRequest|RawRequestOptions|RawResponse|ModuleRequest|legacyModule|LegacyModuleDefinition|LegacySdkModuleImplementation|LegacySdkModuleRegistry|legacySdkModuleRegistry|createLegacyModuleInvoker|loadLegacyModuleDefinitions|MemoryResponseCache)\b/g;
const retiredPath =
  /(?:^|[/\\])(_migration|_module-inputs|_voice-upload-xml|raw-request|shared-task|invocation-context|request-runtime|module-runtime)(?:\.[cm]?[jt]sx?)?$/;
const codeArtifact = /\.(?:[cm]?js|d\.[cm]?ts)$/;
const sourceExtension = /(?:\.d)?\.[cm]?[jt]sx?$/;

export const findForbiddenArtifactSymbols = async (
  directory: string,
): Promise<Array<string>> => {
  const findings = new Map<string, Set<string>>();
  const sources: Array<{ file: string; path: string; content: string }> = [];
  const virtualRoot = resolve(directory, '__syntax__').replaceAll('\\', '/');
  const addSource = (file: string, path: string, content: string) => {
    const extension = sourceExtension.exec(path)?.[0];
    if (extension) {
      sources.push({
        file,
        path: virtualRoot + '/source-' + sources.length + extension,
        content,
      });
    }
  };
  for (const file of readdirSync(directory, {
    recursive: true,
    encoding: 'utf8',
  })) {
    const symbols = new Set<string>();
    findings.set(file, symbols);
    if (codeArtifact.test(file)) {
      addSource(file, file, readFileSync(resolve(directory, file), 'utf8'));
    } else if (file.endsWith('.map') && codeArtifact.test(file.slice(0, -4))) {
      const map = JSON.parse(
        readFileSync(resolve(directory, file), 'utf8'),
      ) as {
        names?: Array<string>;
        sources?: Array<string>;
        sourcesContent?: Array<string | null>;
      };
      for (const name of map.names ?? []) {
        for (const match of name.matchAll(forbiddenIdentifier))
          {symbols.add(match[0]);}
      }
      for (const [index, path] of (map.sources ?? []).entries()) {
        const retired = retiredPath.exec(path);
        if (retired) {
          symbols.add(retired[1]!);
        }
        const content = map.sourcesContent?.[index];
        if (content) {
          addSource(file, path, content);
        }
      }
    }
  }

  const configPath = virtualRoot + '/tsconfig.json';
  const compiler = new API({
    cwd: virtualRoot,
    fs: createVirtualFileSystem({
      ...Object.fromEntries(
        sources.map(({ path, content }) => [path, content]),
      ),
      [configPath]: JSON.stringify({
        compilerOptions: {
          allowJs: true,
          noResolve: true,
          noLib: true,
          jsx: 'preserve',
        },
        files: sources.map(({ path }) => path),
      }),
    }),
  });
  try {
    const snapshot = await compiler.updateSnapshot({
      openProjects: [configPath],
    });
    try {
      const project = snapshot.getProject(configPath)!;
      await Promise.all(
        sources.map(async ({ file, path }) => {
          const source = await project.program.getSourceFile(path);
          if (!source) {
            throw new Error('Artifact could not be parsed: ' + file);
          }
          const symbols = findings.get(file)!;
          const identifier = (name: string) => {
            for (const match of name.matchAll(forbiddenIdentifier)) {
              symbols.add(match[0]);
            }
          };
          const modulePath = (node: Node | undefined) => {
            if (
              node &&
              (isStringLiteral(node) || isNoSubstitutionTemplateLiteral(node))
            ) {
              const retired = retiredPath.exec(node.text);
              if (retired) {
                symbols.add(retired[1]!);
              }
            }
          };
          const visit = (node: Node): Node => {
            if (isIdentifier(node) || isPrivateIdentifier(node)) {
              identifier(node.text);
            }
            if (isImportDeclaration(node) || isExportDeclaration(node)) {
              modulePath(node.moduleSpecifier);
            }
            if (
              isCallExpression(node) &&
              (node.expression.kind === SyntaxKind.ImportKeyword ||
                (isIdentifier(node.expression) &&
                  node.expression.text === 'require'))
            ) {
              modulePath(node.arguments[0]);
            }
            if (isExternalModuleReference(node)) {
              modulePath(node.expression);
            }
            if (isImportTypeNode(node) && isLiteralTypeNode(node.argument)) {
              modulePath(node.argument.literal);
            }
            if (
              isImportSpecifier(node) ||
              isExportSpecifier(node) ||
              isNamespaceExport(node)
            ) {
              if (isStringLiteral(node.name)) {
                identifier(node.name.text);
              }
              if (
                'propertyName' in node &&
                node.propertyName &&
                isStringLiteral(node.propertyName)
              ) {
                identifier(node.propertyName.text);
              }
            }
            visitEachChild(node, visit);
            return node;
          };
          visit(source);
        }),
      );
    } finally {
      await snapshot.dispose();
    }
  } finally {
    await compiler.close();
  }
  return [...findings]
    .flatMap(([file, symbols]) =>
      [...symbols].map((symbol) => file + ': ' + symbol),
    )
    .toSorted();
};
