const entry = new URL('../dist/index.js', import.meta.url).href;

if (process.env.LIVE_UPSTREAM !== '1') {
  throw new Error('Run with LIVE_UPSTREAM=1 after bun run build');
}

for (const [mode, count] of [
  ['implicit', 20],
  ['configured', 10],
] as const) {
  for (let attempt = 1; attempt <= count; attempt += 1) {
    const probe = `
      const sdk = await import(${JSON.stringify(entry)});
      const deviceId = ${mode === 'configured' ? 'sdk.generateDeviceId()' : 'undefined'};
      let registrations = 0;
      let receivedToken = false;
      let matchingDevice = true;
      const result = await sdk.loginQrKey({}, {
        deviceId,
        retry: { retries: 0 },
        timeoutMs: 15000,
        fetcher: async (input, init) => {
          const target = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
          const response = await fetch(input, init);
          if (target.includes('/register/anonimous')) {
            registrations += 1;
            receivedToken = response.headers.getSetCookie().some(cookie => /^MUSIC_A=[^;]+/.test(cookie));
            matchingDevice = deviceId === undefined || new Headers(init?.headers).get('cookie')?.includes('deviceId=' + deviceId);
          }
          return response;
        },
      }).catch(error => error);
      const passed = result.status === 200 && result.body?.code === 200 &&
        typeof result.body?.data?.unikey === 'string' && result.body.data.unikey.length > 0 &&
        registrations === 1 && receivedToken && matchingDevice;
      console.log(JSON.stringify({
        mode: ${JSON.stringify(mode)}, attempt: ${attempt}, passed,
        status: result.status, code: result.body?.code, registrations, receivedToken, matchingDevice,
      }));
      process.exitCode = passed ? 0 : 1;
    `;
    const child = Bun.spawn(['node', '--input-type=module', '--eval', probe], {
      stdout: 'pipe',
      stderr: 'pipe',
    });
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    console.log(stdout.trim());
    if (exitCode !== 0) {
      throw new Error(
        `Anonymous cold start failed: ${mode} ${attempt}: ${stderr}`,
      );
    }
    await Bun.sleep(500);
  }
}
