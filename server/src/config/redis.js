const Redis = require("ioredis");
require("dotenv").config();

// Default to local redis if env not found
const redisOptions = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null, // Required by BullMQ
};

const connection = new Redis(redisOptions);

connection.on("connect", () => {
    console.log("✅ Redis connected");
});

connection.on("error", (err) => {
    console.error("❌ Redis connection error:", err);
});

module.exports = {
    connection,
    redisOptions
};
