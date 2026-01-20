const express = require("express");
const cors = require("cors");
const jobRoutes = require("./routes/jobRoutes");
const { successHandler, errorHandler } = require("./config/morgan");
const serverAdapter = require("./config/bullBoard");

const app = express();

// Enable CORS
app.use(cors());

// Logger
app.use(successHandler);
app.use(errorHandler);

// Bull Board (Redis Dashboard)
app.use('/admin/queues', serverAdapter.getRouter());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use Routes
app.use("/api/jobs", jobRoutes);

module.exports = app;