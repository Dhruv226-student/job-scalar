const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Route to trigger a new import job
router.post('/import', jobController.triggerImport);

// Route to trigger all configured feeds
router.post('/import-all', jobController.importAllFeeds);

// Route to get import history
router.get('/history', jobController.getHistory);

module.exports = router;
