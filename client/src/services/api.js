import axios from 'axios';

/**
 * Base API URL - change this when deploying
 * In development, backend runs on localhost:5000
 * In production, replace with your deployed backend URL
 */
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_BASE_URL = `${API_URL}/api`;

/**
 * Create default axios instance
 */
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds for general API calls
});

/**
 * Create another axios instance for API calls within /api endpoints
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
    const encodedUrl = encodeURIComponent(url);
    const response = await apiClient.get(`/scrape?url=${encodedUrl}`);
    return response.data;
  } catch (error) {
    console.error('API Error - scrapeWebsite:', error);
    let errorMessage = 'Failed to scrape website';

    if (error.response) {
      errorMessage = error.response.data?.message || errorMessage;
      if (error.response.data?.suggestion) {
        errorMessage += `\n\n${error.response.data.suggestion}`;
      }
    } else if (error.request) {
      errorMessage = 'No response from server. Please check if the backend is running.';
    } else {
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
    const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    return response.data;
  } catch (error) {
    console.error('API Error - checkServerHealth:', error);
    throw new Error('Server is not responding. Please make sure the backend is running on http://localhost:5000');
  }
};

/**
 * Example: Direct API call using environment variable
 * @returns {Promise} - Response from the endpoint
 */
export const fetchFromEndpoint = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/endpoint`);
    return response.data;
  } catch (error) {
    console.error('API Error - fetchFromEndpoint:', error);
    let errorMessage = 'Failed to fetch data from endpoint';

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
 * Default export for general API usage
 */
export default api;
