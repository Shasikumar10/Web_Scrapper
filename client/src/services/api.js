import axios from 'axios';

/**
 * Base API URL - change this when deploying
 * In development, backend runs on localhost:5000
 * In production, replace with your deployed backend URL
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Create axios instance with default config
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for scraping operations
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Scrape a website
 * @param {string} url - The URL to scrape
 * @returns {Promise} - Scraped data
 */
export const scrapeWebsite = async (url) => {
  try {
    // Encode URL to handle special characters
    const encodedUrl = encodeURIComponent(url);
    
    const response = await apiClient.get(`/scrape?url=${encodedUrl}`);
    return response.data;
  } catch (error) {
    console.error('API Error - scrapeWebsite:', error);
    
    // Extract meaningful error message
    let errorMessage = 'Failed to scrape website';
    
    if (error.response) {
      // Server responded with error
      errorMessage = error.response.data?.message || errorMessage;
      
      // Add suggestion if available
      if (error.response.data?.suggestion) {
        errorMessage += `\n\n${error.response.data.suggestion}`;
      }
    } else if (error.request) {
      // Request was made but no response
      errorMessage = 'No response from server. Please check if the backend is running.';
    } else {
      // Something else happened
      errorMessage = error.message || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Get all scraped data from database
 * @returns {Promise} - Array of all scraped data
 */
export const getAllScrapedData = async () => {
  try {
    const response = await apiClient.get('/data');
    return response.data;
  } catch (error) {
    console.error('API Error - getAllScrapedData:', error);
    
    let errorMessage = 'Failed to fetch scraped data';
    
    if (error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    } else if (error.request) {
      errorMessage = 'No response from server. Please check if the backend is running.';
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Delete scraped data by ID
 * @param {string} id - MongoDB document ID
 * @returns {Promise} - Delete confirmation
 */
export const deleteScrapedData = async (id) => {
  try {
    const response = await apiClient.delete(`/data/${id}`);
    return response.data;
  } catch (error) {
    console.error('API Error - deleteScrapedData:', error);
    
    let errorMessage = 'Failed to delete data';
    
    if (error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    } else if (error.request) {
      errorMessage = 'No response from server. Please check if the backend is running.';
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Check server health
 * @returns {Promise} - Server health status
 */
export const checkServerHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`, {
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    console.error('API Error - checkServerHealth:', error);
    throw new Error('Server is not responding. Please make sure the backend is running on http://localhost:5000');
  }
};