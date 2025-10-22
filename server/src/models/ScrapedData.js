const mongoose = require('mongoose');

/**
 * Schema for storing scraped website data
 * Includes URL, title, description, headings, links, and metadata
 */
const scrapedDataSchema = new mongoose.Schema(
  {
    // Original URL that was scraped
    url: {
      type: String,
      required: true,
      trim: true,
    },
    // Page title extracted from <title> tag
    title: {
      type: String,
      default: 'No title found',
    },
    // Meta description from <meta name="description">
    description: {
      type: String,
      default: 'No description found',
    },
    // All heading tags (h1, h2, h3, etc.)
    headings: {
      h1: [String],
      h2: [String],
      h3: [String],
    },
    // All links found on the page
    links: [
      {
        text: String,
        href: String,
      },
    ],
    // All images found on the page
    images: [
      {
        alt: String,
        src: String,
      },
    ],
    // All paragraph text content
    paragraphs: [String],
    // Scraping status
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
    },
    // Error message if scraping failed
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Create index on url for faster queries
scrapedDataSchema.index({ url: 1 });
scrapedDataSchema.index({ createdAt: -1 });

const ScrapedData = mongoose.model('ScrapedData', scrapedDataSchema);

module.exports = ScrapedData;