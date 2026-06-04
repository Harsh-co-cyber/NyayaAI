import React, { useState } from 'react'
import './SectionResults.css'

function SectionCard({ section, lawType, selectedSections, onToggleSelection, getSeverityClass, getSeverityIcon }) {
  const [expanded, setExpanded] = useState(false)
  const PREVIEW_LENGTH = 300
  const description = section.description || ''
  const isLong = description.length > PREVIEW_LENGTH

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-title">
          <h3>{lawType} Section {section.section_id}</h3>
          <p className="section-name">{section.section_name}</p>
        </div>
        <div className="section-severity">
          <span className={`severity-badge ${getSeverityClass(section.severity)}`}>
            {getSeverityIcon(section.severity)} {section.severity}
          </span>
        </div>
      </div>

      <div className="section-body">
        <div className="section-meta">
          <span className="meta-item">
            <strong>Category:</strong> {section.category}
          </span>
        </div>

        <div className="section-description">
          <p>
            {expanded || !isLong
              ? description
              : description.slice(0, PREVIEW_LENGTH) + '...'}
          </p>
          {isLong && (
            <button className="read-more-btn" onClick={() => setExpanded(prev => !prev)}>
              {expanded ? '▲ Read Less' : '▼ Read More'}
            </button>
          )}
        </div>

        <div className="keywords">
          <strong>Keywords:</strong>
          <div className="keyword-tags">
            {section.keywords.split(',').slice(0, 5).map((kw, idx) => (
              <span key={idx} className="keyword-tag">{kw.trim()}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="section-footer">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={selectedSections.includes(section.section_id)}
            onChange={() => onToggleSelection(section.section_id)}
          />
          <span>Include in FIR</span>
        </label>
      </div>
    </div>
  )
}

function SectionResults({
  sections,
  category,
  selectedSections,
  onToggleSelection,
  onGenerateFIR,
  loading,
  lawType = 'BNS'
}) {
  const getSeverityClass = (severity) => {
    return severity.toLowerCase()
  }

  const getSeverityIcon = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return '⚠️'
      case 'medium':
        return '⚡'
      case 'low':
        return '✓'
      default:
        return '•'
    }
  }

  const getLawTypeColor = () => {
    return lawType === 'BNS' ? '#059669' : '#7C3AED'
  }

  const getLawTypeIcon = () => {
    return lawType === 'BNS' ? '⚖️' : '📋'
  }

  const getLawTypeTitle = () => {
    return lawType === 'BNS'
      ? 'BNS Sections (Bharatiya Nyaya Sanhita)'
      : 'BNSS Sections (Bharatiya Nagarik Suraksha Sanhita)'
  }

  const getLawTypeDescription = () => {
    return lawType === 'BNS'
      ? 'These sections define what constitutes a crime and the punishment for it under BNS 2023.'
      : 'These sections define the procedures for investigation, arrest, trial, and other legal processes under BNSS 2023.'
  }

  return (
    <div className="section-results">
      <div className="category-info" style={{ borderColor: getLawTypeColor() }}>
        <h2>{getLawTypeIcon()} {getLawTypeTitle()}</h2>
        <p className="law-description">{getLawTypeDescription()}</p>
        <p className="category-badge" style={{ borderColor: getLawTypeColor(), color: getLawTypeColor() }}>{category}</p>
      </div>

      <div className="sections-list">
        <p className="sections-count">Found {sections.length} applicable {lawType} sections</p>

        {sections.map((section) => (
          <SectionCard
            key={`${section.law_type}-${section.section_id}`}
            section={section}
            lawType={lawType}
            selectedSections={selectedSections}
            onToggleSelection={onToggleSelection}
            getSeverityClass={getSeverityClass}
            getSeverityIcon={getSeverityIcon}
          />
        ))}
      </div>

      <div className="actions">
        <button
          className="fir-btn"
          onClick={onGenerateFIR}
          disabled={loading || selectedSections.length === 0}
        >
          {loading ? '⏳ Generating...' : '📄 Generate FIR Document'}
        </button>
        <p className="selected-info">
          {selectedSections.length} section(s) selected
        </p>
      </div>
    </div>
  )
}

export default SectionResults
