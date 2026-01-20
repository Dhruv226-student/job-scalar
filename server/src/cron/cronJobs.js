const cron = require("node-cron");
const { importQueue } = require("../queues/importQueue");
const ImportLog = require("../models/ImportLog");
const { v4: uuidv4 } = require('uuid');

const feeds = require("../config/feeds");

const setupCronJobs = () => {
  // Run every hour: '0 * * * *'
  // For testing, we can use every minute: '* * * * *'
  const schedule = "0 * * * *"; 

  cron.schedule(schedule, async () => {
    console.log("⏰ Cron Job Triggered: Starting hourly import...");

    for (const feed of feeds) {
      try {
        console.log(`➡️ Queuing import for: ${feed.url} (${feed.category})`);
        
        // Create Log
        const importLog = await ImportLog.create({
          importId: uuidv4(),
          feedUrl: feed.url,
          status: "pending",
        });

        // Add to Queue
        await importQueue.add("import-xml", {
          feedUrl: feed.url,
          category: feed.category,
          importLogId: importLog._id,
        });

      } catch (error) {
        console.error(`❌ Failed to queue ${feed.url}:`, error);
      }
    }
  });

  console.log(`🕒 Cron Job scheduled: ${schedule}`);
};

module.exports = setupCronJobs;
