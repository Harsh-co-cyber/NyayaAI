import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="icon">⚖️</span>
            Nyaya Sahayak
          </h1>
          <p className="hero-subtitle">
            AI-Powered Legal Section Retrieval & FIR Generation System
          </p>
          <p className="hero-description">
            Intelligent analysis of complaints to identify applicable BNSS sections,
            with automated FIR document generation for law enforcement professionals.
          </p>
          <div className="hero-actions">
            <Link to="/analyzer" className="btn btn-primary btn-large">
              <span>🔍</span> Start Analysis
            </Link>
            <Link to="/about" className="btn btn-secondary btn-large">
              <span>📖</span> Learn More
            </Link>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon bns-color">⚖️</div>
            <div className="feature-content">
              <h3>BNS Section Analysis</h3>
              <p>358 sections from Bharatiya Nyaya Sanhita, 2023 - defines crimes and punishments</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon bnss-color">📋</div>
            <div className="feature-content">
              <h3>BNSS Procedure Guidance</h3>
              <p>531 sections from Bharatiya Nagarik Suraksha Sanhita, 2023 - outlines investigation procedures</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon fir-color">🤖</div>
            <div className="feature-content">
              <h3>RAG Technology</h3>
              <p>Retrieval-Augmented Generation with vector databases for accurate results</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon ai-color">📄</div>
            <div className="feature-content">
              <h3>Automated FIR</h3>
              <p>Generate properly formatted FIR documents with selected sections</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon severity-color">🎯</div>
            <div className="feature-content">
              <h3>Severity Classification</h3>
              <p>Sections categorized by severity (High/Medium/Low) for quick assessment</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon speed-color">⚡</div>
            <div className="feature-content">
              <h3>Fast & Accurate</h3>
              <p>Results in seconds with high accuracy using semantic search</p>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">⚖️</div>
          <div className="stat-number">358</div>
          <div className="stat-label">BNS Sections</div>
          <div className="stat-desc">Bharatiya Nyaya Sanhita, 2023</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-number">531</div>
          <div className="stat-label">BNSS Sections</div>
          <div className="stat-desc">Bharatiya Nagarik Suraksha Sanhita, 2023</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🤖</div>
          <div className="stat-number">889</div>
          <div className="stat-label">Total Legal Provisions</div>
          <div className="stat-desc">Retrieval-Augmented Generation</div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Analyze your complaint and get instant legal section recommendations</p>
        <Link to="/analyzer" className="btn btn-primary btn-large">
          <span>🚀</span> Launch Analyzer
        </Link>
      </div>
    </div>
  )
}

export default Home
