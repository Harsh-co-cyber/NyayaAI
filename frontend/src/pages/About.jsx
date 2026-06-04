import React from 'react'
import { Link } from 'react-router-dom'
import './About.css'

function About() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>About Naya Sahayak</h1>
        <p className="about-subtitle">
          Empowering law enforcement with AI-driven legal intelligence
        </p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>🎯 Our Mission</h2>
          <p>
            To streamline the legal process for law enforcement officers by providing instant,
            accurate identification of applicable legal sections and automated FIR generation,
            reducing manual effort and improving efficiency.
          </p>
        </section>

        <section className="about-section">
          <h2>🛠️ How It Works</h2>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <h3>Input Complaint</h3>
              <p>Enter the complaint narrative in natural language</p>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <h3>AI Analysis</h3>
              <p>RAG-based system analyzes using vector databases</p>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <h3>Section Retrieval</h3>
              <p>Identifies applicable BNSS sections</p>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <h3>FIR Generation</h3>
              <p>Automatically generates formatted FIR document</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>⚡ Key Features</h2>
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">⚖️</span>
              <div>
                <h3>BNS Section Analysis</h3>
                <p>358 sections from Bharatiya Nyaya Sanhita, 2023 - defines crimes and punishments</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📋</span>
              <div>
                <h3>BNSS Procedure Guidance</h3>
                <p>532 sections from Bharatiya Nagarik Suraksha Sanhita, 2023 - outlines investigation procedures</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🤖</span>
              <div>
                <h3>RAG Technology</h3>
                <p>Retrieval-Augmented Generation with vector databases for accurate results</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📄</span>
              <div>
                <h3>Automated FIR</h3>
                <p>Generate properly formatted FIR documents with selected sections</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <div>
                <h3>Severity Classification</h3>
                <p>Sections categorized by severity (High/Medium/Low) for quick assessment</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <div>
                <h3>Fast & Accurate</h3>
                <p>Results in seconds with high accuracy using semantic search</p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>🔧 Technology Stack</h2>
          <div className="tech-grid">
            <div className="tech-card">
              <h3>Backend</h3>
              <ul>
                <li>FastAPI (Python)</li>
                <li>ChromaDB (Vector Database)</li>
                <li>HuggingFace Embeddings</li>
                <li>LangChain</li>
              </ul>
            </div>
            <div className="tech-card">
              <h3>Frontend</h3>
              <ul>
                <li>React 18</li>
                <li>React Router</li>
                <li>Axios</li>
                <li>Modern CSS3</li>
              </ul>
            </div>
            <div className="tech-card">
              <h3>AI/ML</h3>
              <ul>
                <li>BAAI/bge-base-en-v1.5</li>
                <li>Sentence Transformers</li>
                <li>Semantic Search</li>
                <li>RAG Architecture</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>👥 Who Can Use This?</h2>
          <div className="users-grid">
            <div className="user-card">
              <span className="user-icon">👮</span>
              <h3>Police Officers</h3>
              <p>Quick FIR registration with accurate section identification</p>
            </div>
            <div className="user-card">
              <span className="user-icon">⚖️</span>
              <h3>Legal Professionals</h3>
              <p>Research tool for case preparation and legal analysis</p>
            </div>
            <div className="user-card">
              <span className="user-icon">👨‍💼</span>
              <h3>Government Officials</h3>
              <p>Streamline legal processes and improve efficiency</p>
            </div>
            <div className="user-card">
              <span className="user-icon">👥</span>
              <h3>Citizens & Public</h3>
              <p>Understand applicable laws and BNSS procedures for filing complaints</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>👥 Contributors</h2>
          <div className="contributors-grid">
            <div className="contributor-card">
              <div className="contributor-avatar">👨‍💻</div>
              <h3>Harsh Pahariya</h3>
              <p className="contributor-role">Lead Developer</p>
              <p className="contributor-desc">Full-stack development, AI/ML integration, and system architecture</p>
            </div>
            <div className="contributor-card">
              <div className="contributor-avatar">👨‍💼</div>
              <h3>Kshitij Raj</h3>
              <p className="contributor-role">Backend Developer</p>
              <p className="contributor-desc">API development, database design, and RAG implementation</p>
            </div>
          </div>
        </section>

        <section className="about-section cta-section">
          <h2>Ready to Try It?</h2>
          <p>Experience the power of AI-driven legal assistance</p>
          <Link to="/analyzer" className="btn btn-primary btn-large">
            <span>🚀</span> Start Analyzing
          </Link>
        </section>
      </div>
    </div>
  )
}

export default About
