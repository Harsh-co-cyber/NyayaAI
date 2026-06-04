import React, { useState } from 'react'
import './RelatedJudgements.css'

function RelatedJudgements({ judgements, loading, bnsSummary, judgementsSummary }) {
  const [expandedJudgements, setExpandedJudgements] = useState({})

  const toggleExpanded = (index) => {
    setExpandedJudgements(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  if (loading) {
    return (
      <div className="judgements-container">
        <p className="loading">⏳ Loading related judgements...</p>
      </div>
    )
  }

  if (!judgements || judgements.length === 0) {
    return (
      <div className="judgements-container">
        <p className="no-judgements">No related judgements found in the database.</p>
      </div>
    )
  }

  return (
    <div className="judgements-container">
      <div className="judgements-info">
        <h3>⚖️ Related Supreme Court Judgements</h3>
        <p className="info-text">
          These are similar cases from the Indian Supreme Court that may provide relevant precedents and legal insights.
        </p>
        {bnsSummary && (
          <div className="bns-summary">
            <h4>🔍 Search Results</h4>
            <p>{bnsSummary}</p>
          </div>
        )}
      </div>

      <div className="judgements-list">
        {judgements.map((judgment, index) => {
          const isExpanded = expandedJudgements[index]
          const summaryText = judgment.summary || judgment.text || 'No content available'
          const shouldShowReadMore = summaryText.length > 300

          return (
            <div key={index} className="judgement-card">
              <div className="judgement-header">
                <span className="case-number">Case #{index + 1}</span>
                <span className="relevance-badge">
                  {(judgment.relevance_score * 100).toFixed(0)}% Relevant
                </span>
              </div>

              <div className="judgement-details">
                <div className="detail-row">
                  <span className="label">Case ID:</span>
                  <span className="value">{judgment.case_id}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Court:</span>
                  <span className="value">{judgment.court}</span>
                </div>
              </div>

              <div className="judgement-content">
                <p className="content-label">Judgement:</p>
                <div className={`content-text ${isExpanded ? 'expanded' : 'collapsed'}`}>
                  {isExpanded ? summaryText : summaryText.slice(0, 300)}
                  {!isExpanded && shouldShowReadMore && '...'}
                </div>
                
                {shouldShowReadMore && (
                  <button 
                    className="read-more-btn"
                    onClick={() => toggleExpanded(index)}
                  >
                    {isExpanded ? '📖 Show Less' : '📖 Read More'}
                  </button>
                )}
              </div>

              {judgment.applicable_sections && judgment.applicable_sections !== 'N/A' && (
                <div className="applicable-sections">
                  <p className="sections-label">Applicable Sections:</p>
                  <div className="sections-tags">
                    {judgment.applicable_sections.split(',').map((section, idx) => (
                      <span key={idx} className="section-tag">
                        Section {section.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="judgements-footer">
        <p>💡 Tip: Click "Read More" to view the complete judgement text and understand the full legal reasoning.</p>
      </div>
    </div>
  )
}

export default RelatedJudgements
