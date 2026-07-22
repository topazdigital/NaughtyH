module.exports = {
  apps: [
    {
      name: "naughtyhaughty-api",
      script: "./artifacts/api-server/dist/index.mjs",
      interpreter: "node",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: 7081,
      },
      max_memory_restart: "512M",
      restart_delay: 3000,
      max_restarts: 10,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "~/.pm2/logs/naughtyhaughty-api-error.log",
      out_file:   "~/.pm2/logs/naughtyhaughty-api-out.log",
    },
  ],
}
