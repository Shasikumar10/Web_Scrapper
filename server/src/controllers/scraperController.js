const scraperService = require('../services/scraperService');

/**
 * Handle scrape request
 * GET /api/scrape?url=someurl
 */
const scrapeUrl = async (req, res) => {
  try {
    const { url } = req.query;

    // Validate URL parameter
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL parameter is required',
      });
    }

    // Decode URL in case it's encoded
    const decodedUrl = decodeURIComponent(url);
    console.log(`Scraping request received for: ${decodedUrl}`);

    // Call scraper service
    const scrapedData = await scraperService.scrapeWebsite(decodedUrl);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Website scraped successfully',
      data: scrapedData,
    });
  } catch (error) {
    console.error('Controller error:', error.message);

    // Return appropriate error response
    const statusCode = error.message.includes('Invalid URL') ? 400 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to scrape website',
      suggestion: 'Try a simpler website like https://example.com or https://httpbin.org/html',
    });
  }
};

/**
 * Get all scraped data
 * GET /api/data
 */
const getAllData = async (req, res) => {
  try {
    console.log('Fetching all scraped data...');

    // Call service to get all data
    const data = await scraperService.getAllScrapedData();

    // Return success response
    res.status(200).json({
      success: true,
      count: data.length,
      data: data,
    });
  } catch (error) {
    console.error('Controller error:', error.message);

    // Return error response
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch data',
    });
  }
};

/**
 * Delete scraped data by ID
 * DELETE /api/data/:id
 */
const deleteData = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Deleting data with ID: ${id}`);

    // Call service to delete data
    await scraperService.deleteScrapedData(id);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Data deleted successfully',
    });
  } catch (error) {
    console.error('Controller error:', error.message);

    // Return error response
    res.status(404).json({
      success: false,
      message: error.message || 'Failed to delete data',
    });
  }
};

module.exports = {
  scrapeUrl,
  getAllData,
  deleteData,
};