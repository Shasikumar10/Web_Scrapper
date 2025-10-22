import React, { useState } from 'react';

/**
 * ScraperForm Component
 * Input form for entering URL to scrape
 */
const ScraperForm = ({ onScrape, isLoading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  /**
   * Validate URL format
   */
  const isValidUrl = (string) => {
    try {
      const urlObj = new URL(string);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (err) {
      return false;
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate URL
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid HTTP/HTTPS URL');
      return;
    }

    // Call parent function to scrape
    onScrape(url);
  };

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    setUrl(e.target.value);
    setError(''); // Clear error on input change
  };

  /**
   * Try example URL
   */
  const tryExample = () => {
    setUrl('https://example.com');
    setError('');
  };

  return (
    <div className="scraper-form-container">
      <h2>🔍 Web Scraper</h2>
      <p className="subtitle">Enter a URL to extract data from any website</p>

      <form onSubmit={handleSubmit} className="scraper-form">
        <div className="input-group">
          <input
            type="text"
            value={url}
            onChange={handleChange}
            placeholder="https://example.com"
            className={`url-input ${error ? 'error' : ''}`}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="scrape-button"
            disabled={isLoading || !url.trim()}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Scraping...
              </>
            ) : (
              <>
                <span>🚀</span>
                Scrape Website
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️</span> {error}
          </div>
        )}

        <button 
          type="button" 
          onClick={tryExample} 
          className="example-button"
          disabled={isLoading}
        >
          Try Example URL
        </button>
      </form>
    </div>
  );
};

export default ScraperForm;