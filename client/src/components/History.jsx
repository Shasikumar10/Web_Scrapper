import React, { useState } from 'react';

/**
 * History Component
 * Displays all previously scraped data from database
 */
const History = ({ history, onDelete, onViewDetails }) => {
  const [expandedId, setExpandedId] = useState(null);

  /**
   * Toggle expand/collapse for a history item
   */
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (!history || history.length === 0) {
    return (
      <div className="history-container">
        <h3>📚 Scraping History</h3>
        <div className="empty-state">
          <p>No scraping history yet. Start by scraping your first website!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h3>📚 Scraping History</h3>
        <span className="history-count">{history.length} records</span>
      </div>

      <div className="history-list">
        {history.map((item) => (
          <div 
            key={item._id} 
            className={`history-item ${item.status === 'failed' ? 'failed' : ''}`}
          >
            <div className="history-item-header">
              <div className="history-item-info">
                <h4 className="history-title">
                  {item.status === 'success' ? '✅' : '❌'} {item.title}
                </h4>
                <p className="history-url">{item.url}</p>
                <p className="history-date">
                  {new Date(item.createdAt).toLocaleDateString()} at{' '}
                  {new Date(item.createdAt).toLocaleTimeString()}
                </p>
              </div>

              <div className="history-item-actions">
                <button
                  onClick={() => toggleExpand(item._id)}
                  className="action-button view-button"
                  title="View details"
                >
                  {expandedId === item._id ? '▼' : '▶'}
                </button>
                <button
                  onClick={() => onDelete(item._id)}
                  className="action-button delete-button"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === item._id && item.status === 'success' && (
              <div className="history-item-details">
                <div className="detail-section">
                  <strong>Description:</strong>
                  <p>{item.description}</p>
                </div>

                {item.headings && (
                  <div className="detail-section">
                    <strong>Headings Found:</strong>
                    <p>
                      H1: {item.headings.h1?.length || 0}, 
                      H2: {item.headings.h2?.length || 0}, 
                      H3: {item.headings.h3?.length || 0}
                    </p>
                  </div>
                )}

                {item.links && (
                  <div className="detail-section">
                    <strong>Links:</strong>
                    <p>{item.links.length} links found</p>
                  </div>
                )}

                {item.images && (
                  <div className="detail-section">
                    <strong>Images:</strong>
                    <p>{item.images.length} images found</p>
                  </div>
                )}

                {item.paragraphs && (
                  <div className="detail-section">
                    <strong>Paragraphs:</strong>
                    <p>{item.paragraphs.length} paragraphs extracted</p>
                  </div>
                )}

                <button
                  onClick={() => onViewDetails(item)}
                  className="view-full-button"
                >
                  View Full Details
                </button>
              </div>
            )}

            {/* Failed scraping error */}
            {expandedId === item._id && item.status === 'failed' && (
              <div className="history-item-details error-details">
                <strong>Error:</strong>
                <p>{item.errorMessage || 'Unknown error occurred'}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;