import React, { useState, useEffect } from 'react';
import ScraperForm from './components/ScraperForm ';
import ResultsDisplay from './components/ResultsDisplay';
import History from './components/History';
import { scrapeWebsite, getAllScrapedData, deleteScrapedData, checkServerHealth } from './services/api';
import './styles/App.css';

/**
 * Main App Component
 * Manages state and orchestrates all components
 */
function App() {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');

  /**
   * Check server health on mount
   */
  useEffect(() => {
    checkServer();
  }, []);

  /**
   * Fetch all scraped data on component mount
   */
  useEffect(() => {
    if (serverStatus === 'online') {
      fetchHistory();
    }
  }, [serverStatus]);

  /**
   * Auto-clear messages after 8 seconds
   */
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  /**
   * Check if server is running
   */
  const checkServer = async () => {
    try {
      await checkServerHealth();
      setServerStatus('online');
      console.log('✅ Server is online');
    } catch (err) {
      setServerStatus('offline');
      setError('Backend server is not running. Please start the server with: cd server && npm run dev');
      console.error('❌ Server is offline:', err.message);
    }
  };

  /**
   * Fetch scraping history from database
   */
  const fetchHistory = async () => {
    try {
      const response = await getAllScrapedData();
      setHistory(response.data || []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      // Don't show error for initial fetch failure
    }
  };

  /**
   * Handle scraping operation
   */
  const handleScrape = async (url) => {
    // Check server status first
    if (serverStatus === 'offline') {
      setError('Backend server is offline. Please start the server first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setCurrentResult(null);

    try {
      console.log(`Starting scrape for: ${url}`);
      const response = await scrapeWebsite(url);
      
      if (response.success) {
        setCurrentResult(response.data);
        
        if (response.data.status === 'success') {
          setSuccessMessage('Website scraped successfully! ✅');
        } else {
          setError(response.data.errorMessage || 'Scraping failed');
        }
        
        // Refresh history
        await fetchHistory();
      } else {
        setError(response.message || 'Failed to scrape website');
      }
    } catch (err) {
      console.error('Scraping error:', err);
      
      // Format error message with line breaks
      const errorMsg = err.message || 'An error occurred while scraping';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle delete operation
   */
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }

    try {
      await deleteScrapedData(id);
      setSuccessMessage('Record deleted successfully! ✅');
      
      // Refresh history
      await fetchHistory();
      
      // Clear current result if it's the deleted item
      if (currentResult && currentResult._id === id) {
        setCurrentResult(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete record');
    }
  };

  /**
   * Handle view details from history
   */
  const handleViewDetails = (item) => {
    setCurrentResult(item);
    // Scroll to top to see results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Close current result view
   */
  const handleCloseResult = () => {
    setCurrentResult(null);
  };

  /**
   * Retry server connection
   */
  const retryServerConnection = () => {
    setServerStatus('checking');
    setError(null);
    checkServer();
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="app-header">
        <h1>🌐 Web Scraping Application</h1>
        <p>Extract data from any website with ease</p>
        {serverStatus === 'online' && (
          <span className="server-status online">🟢 Server Online</span>
        )}
        {serverStatus === 'offline' && (
          <span className="server-status offline">🔴 Server Offline</span>
        )}
        {serverStatus === 'checking' && (
          <span className="server-status checking">🟡 Checking...</span>
        )}
      </header>

      {/* Main Content */}
      <main className="app-main">
        {/* Server Offline Warning */}
        {serverStatus === 'offline' && (
          <div className="alert alert-error">
            <div>
              <strong>⚠️ Backend Server Not Running</strong>
              <p>Please start the backend server:</p>
              <code>cd server && npm run dev</code>
            </div>
            <button onClick={retryServerConnection} className="retry-button">
              🔄 Retry Connection
            </button>
          </div>
        )}

        {/* Global Messages */}
        {error && serverStatus === 'online' && (
          <div className="alert alert-error">
            <div style={{ whiteSpace: 'pre-line' }}>
              <span>⚠️</span> {error}
            </div>
            <button onClick={() => setError(null)} className="alert-close">✕</button>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            <span>✅</span> {successMessage}
            <button onClick={() => setSuccessMessage(null)} className="alert-close">✕</button>
          </div>
        )}

        {/* Scraper Form */}
        <ScraperForm 
          onScrape={handleScrape} 
          isLoading={isLoading}
          disabled={serverStatus !== 'online'}
        />

        {/* Current Result */}
        {currentResult && (
          <ResultsDisplay data={currentResult} onClose={handleCloseResult} />
        )}

        {/* History */}
        {serverStatus === 'online' && (
          <History 
            history={history} 
            onDelete={handleDelete}
            onViewDetails={handleViewDetails}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Built with React, Node.js, Express, MongoDB & Cheerio</p>
        <p>© 2025 Web Scraper App</p>
        <p className="footer-tip">
          💡 Tip: Some websites block scraping. Try simple sites like example.com, httpbin.org, or Wikipedia articles.
        </p>
      </footer>
    </div>
  );
}

export default App;