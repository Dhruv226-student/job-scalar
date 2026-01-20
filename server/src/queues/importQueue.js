const { Queue, Worker } = require("bullmq");
const { connection } = require("../config/redis");
const { fetchAndParseFeed } = require("../services/jobService");
const Job = require("../models/Job");
const ImportLog = require("../models/ImportLog");

const QUEUE_NAME = "import-jobs";

// 1. Create the Queue (Producer uses this)
const importQueue = new Queue(QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 3, // Retry failed jobs 3 times
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true, // Keep Redis clean
    removeOnFail: false, // Keep failed jobs for inspection
  },
});

// 2. Define the Worker (Consumer / Processor)
const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    console.log(`👷 Worker started processing job: ${job.name} (ID: ${job.id})`);
    const { feedUrl, category, importLogId } = job.data;

    try {
      // Update Log: Processing
      await ImportLog.findByIdAndUpdate(importLogId, { status: "processing" });

      // Step 1: Fetch & Parse
      const { validJobs, failedJobs } = await fetchAndParseFeed(feedUrl, category);
      console.log(`Fetched ${validJobs.length} valid, ${failedJobs.length} failed from ${feedUrl}`);

      // Step 2: Upsert Jobs (Bulk Write)
      // We prepare bulk operations
      const bulkOps = validJobs.map((jobData) => ({
        updateOne: {
          filter: { jobId: jobData.jobId },
          update: { $set: jobData },
          upsert: true,
        },
      }));

      let newCount = 0;
      let updatedCount = 0;
      
      if (bulkOps.length > 0) {
        const bulkResult = await Job.bulkWrite(bulkOps);
        newCount = bulkResult.upsertedCount;
        updatedCount = bulkResult.modifiedCount + (bulkResult.matchedCount - bulkResult.modifiedCount); 
      }

      // Step 3: Update Log: Completed
      // Even if some failed, we mark as completed if we processed at least something. 
      // If 0 valid jobs and >0 failed jobs, maybe mark as "failed"? 
      // Requirement says: "50 failed". So status can be "completed" but with failures logged.
      // Let's stick to "completed" unless code crashes.
      
      await ImportLog.findByIdAndUpdate(importLogId, {
        status: "completed",
        totalFetched: validJobs.length + failedJobs.length,
        newJobs: newCount,
        updatedJobs: updatedCount,
        failedCount: failedJobs.length,
        failedJobs: failedJobs, // now an array of objects
        completedAt: new Date(),
        $push: { 
          logs: { 
            reason: `Successfully processed ${feedUrl}. Valid: ${validJobs.length}, Failed: ${failedJobs.length}.` 
          } 
        }
      });

      console.log(`✅ Job ${job.id} completed. New: ${newCount}, Updated: ${updatedCount}, Failed: ${failedJobs.length}`);
      return { status: "success", new: newCount, updated: updatedCount, failed: failedJobs.length };

    } catch (error) {
      console.error(`❌ Job ${job.id} failed:`, error);
      
      // Update Log: Failed
      await ImportLog.findByIdAndUpdate(importLogId, {
        status: "failed",
        error: error.message,
        failedCount: 0, // Code crash, so counts are unknown/0
        failedJobs: [],
        completedAt: new Date(),
        $push: { 
          logs: { 
            reason: `Import crashed: ${error.message}` 
          } 
        }
      });

      throw error; // Let BullMQ handle retries
    }
  },
  {
    connection,
    concurrency: 5, // Process 5 feeds in parallel
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  console.log(`Job ${job.id} has failed with ${err.message}`);
});

module.exports = {
  importQueue,
};
