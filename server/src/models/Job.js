const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true, // Identify jobs uniquely to avoid duplicates
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    description: {
      type: String,
    },
    jobType: {
      type: String, // e.g., 'full-time', 'contract'
    },
    publishedDate: {
      type: Date,
    },
    url: {
      type: String,
    },
    source: {
      type: String, // e.g., 'jobicy'
    },
    category: {
      type: String, 
      index: true,
    },
    salary: {
      type: String,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
