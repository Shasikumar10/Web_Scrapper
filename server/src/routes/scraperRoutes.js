const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraperController');

/**
 * @route   GET /api/scrape?url=someurl
 * @desc    Scrape a website and save to database
 * @access  Public
 */
router.get('/scrape', scraperController.scrapeUrl);

/**
 * @route   GET /api/data
 * @desc    Get all scraped data from database
 * @access  Public
 */
router.get('/data', scraperController.getAllData);

/**
 * @route   DELETE /api/data/:id
 * @desc    Delete a scraped data entry
 * @access  Public
 */
router.delete('/data/:id', scraperController.deleteData);

module.exports = router;