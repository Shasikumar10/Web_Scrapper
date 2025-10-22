import React from 'react';

/**
 * ResultsDisplay Component
 * Displays the scraped data in a structured format
 */
const ResultsDisplay = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="results-container">
      <div className="results-header">
        <h3>✅ Scraping Results</h3>
        <button onClick={onClose} className="close-button">
          ✕
        </button>
      </div>

      <div className="results-content">
        {/* Basic Info */}
        <div className="result-section">
          <h4>📄 Basic Information</h4>
          <div className="info-grid">
            <div className="info-item">
              <strong>URL:</strong>
              <a href={data.url} target="_blank" rel="noopener noreferrer">
                {data.url}
              </a>
            </div>
            <div className="info-item">
              <strong>Title:</strong>
              <span>{data.title}</span>
            </div>
            <div className="info-item">
              <strong>Description:</strong>
              <span>{data.description}</span>
            </div>
            <div className="info-item">
              <strong>Scraped At:</strong>
              <span>{new Date(data.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Headings */}
        {data.headings && (
          <div className="result-section">
            <h4>📝 Headings</h4>
            
            {data.headings.h1 && data.headings.h1.length > 0 && (
              <div className="heading-group">
                <strong>H1 Tags ({data.headings.h1.length}):</strong>
                <ul>
                  {data.headings.h1.map((h, index) => (
                    <li key={index}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.headings.h2 && data.headings.h2.length > 0 && (
              <div className="heading-group">
                <strong>H2 Tags ({data.headings.h2.length}):</strong>
                <ul>
                  {data.headings.h2.slice(0, 5).map((h, index) => (
                    <li key={index}>{h}</li>
                  ))}
                  {data.headings.h2.length > 5 && (
                    <li className="more-items">
                      ...and {data.headings.h2.length - 5} more
                    </li>
                  )}
                </ul>
              </div>
            )}

            {data.headings.h3 && data.headings.h3.length > 0 && (
              <div className="heading-group">
                <strong>H3 Tags ({data.headings.h3.length}):</strong>
                <ul>
                  {data.headings.h3.slice(0, 5).map((h, index) => (
                    <li key={index}>{h}</li>
                  ))}
                  {data.headings.h3.length > 5 && (
                    <li className="more-items">
                      ...and {data.headings.h3.length - 5} more
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Links */}
        {data.links && data.links.length > 0 && (
          <div className="result-section">
            <h4>🔗 Links ({data.links.length})</h4>
            <div className="links-grid">
              {data.links.slice(0, 10).map((link, index) => (
                <div key={index} className="link-item">
                  <span className="link-text">{link.text || 'No text'}</span>
                  <a 
                    href={link.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="link-href"
                  >
                    {link.href}
                  </a>
                </div>
              ))}
              {data.links.length > 10 && (
                <div className="more-items">
                  ...and {data.links.length - 10} more links
                </div>
              )}
            </div>
          </div>
        )}

        {/* Images */}
        {data.images && data.images.length > 0 && (
          <div className="result-section">
            <h4>🖼️ Images ({data.images.length})</h4>
            <div className="images-grid">
              {data.images.slice(0, 6).map((image, index) => (
                <div key={index} className="image-item">
                  <img 
                    src={image.src} 
                    alt={image.alt}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <p className="image-alt">{image.alt}</p>
                </div>
              ))}
              {data.images.length > 6 && (
                <div className="more-items">
                  ...and {data.images.length - 6} more images
                </div>
              )}
            </div>
          </div>
        )}

        {/* Paragraphs */}
        {data.paragraphs && data.paragraphs.length > 0 && (
          <div className="result-section">
            <h4>📖 Paragraphs ({data.paragraphs.length})</h4>
            <div className="paragraphs-container">
              {data.paragraphs.slice(0, 3).map((p, index) => (
                <p key={index} className="paragraph-text">
                  {p.substring(0, 200)}
                  {p.length > 200 && '...'}
                </p>
              ))}
              {data.paragraphs.length > 3 && (
                <div className="more-items">
                  ...and {data.paragraphs.length - 3} more paragraphs
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;