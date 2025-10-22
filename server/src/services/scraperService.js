const axios = require('axios');
const cheerio = require('cheerio');
const ScrapedData = require('../models/ScrapedData');

/**
 * Validate if the provided string is a valid URL
 */
const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
};

/**
 * Scrape website and extract relevant data
 * @param {string} url - The URL to scrape
 * @returns {object} - Scraped data object
 */
const scrapeWebsite = async (url) => {
  try {
    // Validate URL
    if (!isValidUrl(url)) {
      throw new Error('Invalid URL format. Please provide a valid HTTP/HTTPS URL.');
    }

    // Fetch HTML content from the URL
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000, // 10 seconds timeout
    });

    // Load HTML into cheerio for parsing
    const $ = cheerio.load(response.data);

    // Extract page title
    const title = $('title').text().trim() || 'No title found';

    // Extract meta description
    const description =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      'No description found';

    // Extract all headings
    const h1 = [];
    const h2 = [];
    const h3 = [];

    $('h1').each((i, el) => {
      const text = $(el).text().trim();
      if (text) h1.push(text);
    });

    $('h2').each((i, el) => {
      const text = $(el).text().trim();
      if (text) h2.push(text);
    });

    $('h3').each((i, el) => {
      const text = $(el).text().trim();
      if (text) h3.push(text);
    });

    // Extract all links
    const links = [];
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (href) {
        links.push({
          text: text || 'No text',
          href: href,
        });
      }
    });

    // Extract all images
    const images = [];
    $('img').each((i, el) => {
      const src = $(el).attr('src');
      const alt = $(el).attr('alt') || 'No alt text';
      if (src) {
        images.push({
          alt: alt,
          src: src,
        });
      }
    });

    // Extract all paragraphs
    const paragraphs = [];
    $('p').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 10) {
        // Only include meaningful paragraphs
        paragraphs.push(text);
      }
    });

    // Prepare scraped data object
    const scrapedData = {
      url: url,
      title: title,
      description: description,
      headings: {
        h1: h1.slice(0, 10), // Limit to first 10
        h2: h2.slice(0, 10),
        h3: h3.slice(0, 10),
      },
      links: links.slice(0, 50), // Limit to first 50 links
      images: images.slice(0, 20), // Limit to first 20 images
      paragraphs: paragraphs.slice(0, 10), // Limit to first 10 paragraphs
      status: 'success',
    };

    // Save to MongoDB
    const savedData = await ScrapedData.create(scrapedData);

    return savedData;
  } catch (error) {
    console.error('Scraping error:', error.message);

    // Save failed scraping attempt
    const failedData = await ScrapedData.create({
      url: url,
      status: 'failed',
      errorMessage: error.message,
    });

    throw new Error(error.message);
  }
};

/**
 * Get all scraped data from database
 * @returns {array} - Array of all scraped data
 */
const getAllScrapedData = async () => {
  try {
    // Fetch all data, sorted by most recent first
    const data = await ScrapedData.find()
      .sort({ createdAt: -1 })
      .limit(100); // Limit to last 100 records for performance

    return data;
  } catch (error) {
    console.error('Database fetch error:', error.message);
    throw new Error('Failed to fetch data from database');
  }
};

/**
 * Delete a scraped data entry by ID
 * @param {string} id - MongoDB document ID
 */
const deleteScrapedData = async (id) => {
  try {
    const result = await ScrapedData.findByIdAndDelete(id);
    if (!result) {
      throw new Error('Data not found');
    }
    return result;
  } catch (error) {
    console.error('Delete error:', error.message);
    throw new Error('Failed to delete data');
  }
};

module.exports = {
  scrapeWebsite,
  getAllScrapedData,
  deleteScrapedData,
};