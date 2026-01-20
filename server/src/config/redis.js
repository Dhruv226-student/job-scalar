const Redis = require("ioredis");
require("dotenv").config();

const redisOptions = {
  maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
};

// Use REDIS_URL if available (Render), otherwise fallback to host/port (Local)
const connection = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, redisOptions)
    : new Redis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: process.env.REDIS_PORT || 6379,
        ...redisOptions,
    });

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
