const IORedis = require("ioredis");

const connection = new IORedis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  tls: {}, // Required for Upstash
  maxRetriesPerRequest: null,
});

connection.on("connect", () => {
  console.log("✅ Redis Connected Successfully");
});

connection.on("error", (err) => {
  console.error("❌ Redis Error:", err);
});

module.exports = connection;