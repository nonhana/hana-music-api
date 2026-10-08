import { basename } from 'node:path';
import { pathToFileURL } from 'node:url';

// 模拟一次云函数冷启动：加载打包好的单文件 SDK，不带 Cookie 发出第一批调用。
const [bundlePath] = process.argv.slice(2);
const accesses = globalThis.fsAccesses;
const accessesBeforeLoad = accesses.length;
const upstreamUrls = [];
const fetcher = async (input) => {
  const url = String(input);
  upstreamUrls.push(url);
  const headers = new Headers({ 'content-type': 'application/json' });
  if (url.includes('/register/anonimous')) {
    headers.append('set-cookie', 'MUSIC_A=cold-start-token; Path=/');
  }
  return new Response(JSON.stringify({ code: 200, result: { songs: [] } }), {
    headers,
  });
};

const { innerVersion, search } = await import(pathToFileURL(bundlePath).href);
const searchResult = await search({ keywords: 'demo' }, { fetcher });
const versionResult = await innerVersion({}, { fetcher });
const bundleName = basename(bundlePath);

console.log(
  JSON.stringify({
    anonymousRegistrations: upstreamUrls.filter((url) =>
      url.includes('/register/anonimous'),
    ).length,
    fileAccesses: accesses
      .slice(accessesBeforeLoad)
      .filter((access) => !access.endsWith(bundleName)),
    searchStatus: searchResult.status,
    version: versionResult.body.data.version,
  }),
);
