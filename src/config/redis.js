const Redis = require("ioredis");

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,

  tls: {
    servername: process.env.REDIS_HOST,
  },

  lazyConnect: false,
  maxRetriesPerRequest: null,
  connectTimeout: 10000,
});

connection.on("connect", () => {
  console.log("✅ Redis Connected Successfully");
});

connection.on("error", (err) => {
  console.error("❌ Redis Error:", err);
});

module.exports = connection;