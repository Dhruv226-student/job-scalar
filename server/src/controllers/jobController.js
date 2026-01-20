const { importQueue } = require("../queues/importQueue");
const ImportLog = require("../models/ImportLog");
const feeds = require("../config/feeds");
const { v4: uuidv4 } = require('uuid');

const triggerImport = async (req, res) => {
  try {
    const { feedUrl, category } = req.body;

    if (!feedUrl) {
      return res.status(400).send({ message: "feedUrl is required" });
    }

    // 1. Create a Log Entry (Pending)
    const importLog = await ImportLog.create({
      importId: uuidv4(),
      feedUrl,
      status: "pending",
    });

    // 2. Add to Queue
    await importQueue.add("import-xml", {
      feedUrl,
      category, // Pass category to worker
      importLogId: importLog._id,
    });

    res.status(200).send({
      status: 200,
      message: "Import started successfully",
      data: { importId: importLog.importId },
    });
  } catch (error) {
    console.error("Trigger import error:", error);
    res.status(500).send({
      status: 500,
      message: "Internal Server Error",
      data: {},
    });
  }
};

const importAllFeeds = async (req, res) => {
  try {
    const results = [];
    
    for (const feed of feeds) {
      // Create independent log for each feed
      const importLog = await ImportLog.create({
        importId: uuidv4(),
        feedUrl: feed.url,
        status: "pending",
      });

      await importQueue.add("import-xml", {
        feedUrl: feed.url,
        category: feed.category,
        importLogId: importLog._id,
      });

      results.push({ 
        url: feed.url, 
        status: "queued", 
        importId: importLog.importId 
      });
    }

    res.status(200).send({
      status: 200,
      message: `Started ${results.length} imports`,
      data: results,
    });
  } catch (error) {
     console.error("Import all error:", error);
     res.status(500).send({
       status: 500,
       message: "Internal Server Error",
       data: {},
     });
  }
};

const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await ImportLog.countDocuments();
    const logs = await ImportLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate overall stats across ALL imports
    const allLogs = await ImportLog.find();
    const overallStats = {
      totalImports: allLogs.length,
      completedImports: allLogs.filter(log => log.status === 'completed').length,
      totalNewJobs: allLogs.reduce((sum, log) => sum + (log.newJobs || 0), 0),
      totalUpdatedJobs: allLogs.reduce((sum, log) => sum + (log.updatedJobs || 0), 0),
      totalFailedJobs: allLogs.reduce((sum, log) => sum + (log.failedJobs || 0), 0),
    };

    res.status(200).send({
      status: 200,
      message: "History fetched successfully",
      data: logs,
      stats: overallStats,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        page,
        limit,
      }
    });
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: "Error fetching history",
      data: {},
    });
  }
};

module.exports = {
  triggerImport,
  importAllFeeds,
  getHistory,
};
