// PM2 ecosystem config — loads .env so keys (RESEND_API_KEY etc.) are always present.
require("dotenv").config({ path: __dirname + "/.env" });

module.exports = {
  apps: [
    {
      name: "psl",
      script: "dist/index.js",
      cwd: __dirname,
      exec_mode: "cluster",
      instances: 1,
      env: {
        NODE_ENV: "production",
        ...process.env,
      },
    },
  ],
};
