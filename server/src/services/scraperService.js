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

    console.log(`Starting scrape for: ${url}`);

    // Enhanced headers to avoid blocking
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0',
    };

    // Fetch HTML content from the URL with better configuration
    const response = await axios.get(url, {
      headers: headers,
      timeout: 15000, // 15 seconds timeout
      maxRedirects: 5, // Follow up to 5 redirects
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Accept 2xx and 3xx status codes
      },
    });

    console.log(`Successfully fetched URL. Status: ${response.status}`);

    // Load HTML into cheerio for parsing
    const $ = cheerio.load(response.data);

    // Remove script and style elements for cleaner text extraction
    $('script, style, noscript, iframe').remove();

    // Extract page title
    const title = $('title').text().trim() || 
                  $('h1').first().text().trim() || 
                  'No title found';

    // Extract meta description
    const description =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('p').first().text().trim().substring(0, 200) ||
      'No description found';

    // Extract all headings
    const h1 = [];
    const h2 = [];
    const h3 = [];

    $('h1').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 0 && text.length < 200) {
        h1.push(text);
      }
    });

    $('h2').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 0 && text.length < 200) {
        h2.push(text);
      }
    });

    $('h3').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 0 && text.length < 200) {
        h3.push(text);
      }
    });

    // Extract all links
    const links = [];
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      
      if (href && href.length > 0) {
        // Convert relative URLs to absolute
        let absoluteHref = href;
        try {
          if (href.startsWith('/')) {
            const urlObj = new URL(url);
            absoluteHref = `${urlObj.protocol}//${urlObj.host}${href}`;
          } else if (!href.startsWith('http')) {
            absoluteHref = new URL(href, url).href;
          }
        } catch (e) {
          // Keep original href if URL parsing fails
        }

        links.push({
          text: text || 'No text',
          href: absoluteHref,
        });
      }
    });

    // Extract all images
    const images = [];
    $('img').each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      const alt = $(el).attr('alt') || 'No alt text';
      
      if (src) {
        // Convert relative URLs to absolute
        let absoluteSrc = src;
        try {
          if (src.startsWith('/')) {
            const urlObj = new URL(url);
            absoluteSrc = `${urlObj.protocol}//${urlObj.host}${src}`;
          } else if (!src.startsWith('http')) {
            absoluteSrc = new URL(src, url).href;
          }
        } catch (e) {
          // Keep original src if URL parsing fails
        }

        images.push({
          alt: alt,
          src: absoluteSrc,
        });
      }
    });

    // Extract all paragraphs
    const paragraphs = [];
    $('p').each((i, el) => {
      const text = $(el).text().trim();
      // Only include meaningful paragraphs (min 20 chars, max 1000 chars)
      if (text && text.length >= 20 && text.length <= 1000) {
        paragraphs.push(text);
      }
    });

    console.log(`Extracted - Title: ${title}, H1: ${h1.length}, H2: ${h2.length}, Links: ${links.length}, Images: ${images.length}, Paragraphs: ${paragraphs.length}`);

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
    console.log(`Successfully saved to database with ID: ${savedData._id}`);

    return savedData;
  } catch (error) {
    console.error('Scraping error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
    });

    // Determine user-friendly error message
    let errorMessage = 'Failed to scrape website';
    
    if (error.code === 'ENOTFOUND') {
      errorMessage = 'Website not found. Please check the URL and try again.';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused. The website may be down.';
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. The website is taking too long to respond.';
    } else if (error.response) {
      const status = error.response.status;
      if (status === 403) {
        errorMessage = 'Access forbidden (403). This website blocks automated scraping. Try a different URL like https://example.com';
      } else if (status === 404) {
        errorMessage = 'Page not found (404). Please check the URL.';
      } else if (status === 429) {
        errorMessage = 'Too many requests (429). Please wait a moment and try again.';
      } else if (status === 500) {
        errorMessage = 'Server error (500). The website is experiencing issues.';
      } else if (status >= 400) {
        errorMessage = `HTTP Error ${status}: ${error.response.statusText || 'Request failed'}`;
      }
    } else if (error.message.includes('Invalid URL')) {
      errorMessage = error.message;
    }

    // Save failed scraping attempt to database
    try {
      await ScrapedData.create({
        url: url,
        title: 'Scraping Failed',
        description: errorMessage,
        status: 'failed',
        errorMessage: errorMessage,
        headings: { h1: [], h2: [], h3: [] },
        links: [],
        images: [],
        paragraphs: [],
      });
    } catch (dbError) {
      console.error('Failed to save error to database:', dbError.message);
    }

    throw new Error(errorMessage);
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