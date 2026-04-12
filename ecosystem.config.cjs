module.exports = {
  apps: [
    {
      name: 'hana-music-api',
      script: 'src/app/cli.ts',
      interpreter: 'bun',
      cwd: __dirname,
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 3000,
      kill_timeout: 10000,
      max_memory_restart: '512M',
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: '3021',
        ANONYMOUS_TOKEN_FILE: './data/runtime/anonymous_token',
      },
    },
  ],
}
