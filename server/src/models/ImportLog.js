const mongoose = require("mongoose");

const importLogSchema = new mongoose.Schema(
  {
    importId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    feedUrl: {
      type: String,
      required: true,
    },
    totalFetched: {
      type: Number,
      default: 0,
    },
    newJobs: {
      type: Number,
      default: 0,
    },
    updatedJobs: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    // Detailed list of failed jobs
    failedJobs: [
      {
        jobId: String,
        reason: String,
      }
    ],
    error: {
      type: String, // Store main error message if entire import failed
    },
    logs: [
      // Optional: Detailed logs for specific failures
      {
        jobId: String,
        reason: String,
      },
    ],
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const ImportLog = mongoose.model("ImportLog", importLogSchema);

module.exports = ImportLog;
