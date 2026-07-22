const Redis = require("ioredis");

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,

  tls: {
    servername: process.env.REDIS_HOST,
  },

  lazyConnect: true,
  maxRetriesPerRequest: 1,
  connectTimeout: 10000,
});

connection
  .connect()
  .then(() => {
    console.log("✅ Redis Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ Redis Connection Failed");
    console.error(err);
  });

module.exports = connection;