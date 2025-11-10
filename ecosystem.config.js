const ecosystemConfig = {
  apps: [
    {
      name: "BotConsultasWeb",
      script: "app.js",
      args: "BotConsultasWeb",
      cwd: "./",
      instances: 1,
      autorestart: false,
      max_restarts: 10, 
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
      },
    },
    {
      name: "BotAugustoTucuman",
      script: "app.js",
      args: "BotAugustoTucuman",
      cwd: "./",
      instances: 1,
      autorestart: false,
      max_restarts: 10, 
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};

module.exports = ecosystemConfig;
