import React, { useState } from 'react'
import axios from 'axios'
import QueryForm from '../components/QueryForm'
import SectionResults from '../components/SectionResults'
import FIRGenerator from '../components/FIRGenerator'
import './Analyzer.css'

function Analyzer() {
  const [complaint, setComplaint] = useState('')
  const [sections, setSections] = useState([])
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('bns') // 'bns', 'bnss', or 'fir'
  const [selectedSections, setSelectedSections] = useState([])

  const bnsSections  = sections.filter(s => s.law_type === 'BNS')
  const bnssSections = sections.filter(s => s.law_type === 'BNSS')

  const handleSubmitComplaint = async (complaintText) => {
    if (!complaintText.trim()) {
      setError('Please enter a complaint')
      return
    }

    setLoading(true)
    setError('')
    setSections([])
    setCategory('')
    setSelectedSections([])

    try {
      // Fetch sections only (no judgements)
      const sectionsResponse = await axios.post('/api/sections', {
        query: complaintText
      })

      setComplaint(complaintText)
      setSections(sectionsResponse.data.sections)
      setCategory(sectionsResponse.data.category)
      setSelectedSections(sectionsResponse.data.sections.map(s => s.section_id))
      setActiveTab('bns')
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Error retrieving sections. Make sure the backend is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  const toggleSectionSelection = (sectionId) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleGenerateFIR = async () => {
    if (!complaint.trim()) {
      setError('Please submit a complaint first')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/fir', {
        query: complaint,
        section_ids: selectedSections
      })

      setActiveTab('fir')
      // Store FIR response for display
      sessionStorage.setItem('firData', JSON.stringify(response.data))
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Error generating FIR. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="analyzer-page">
      <div className="analyzer-header">
        <h1>Legal Section Analyzer</h1>
        <p>Enter your complaint to identify applicable BNS and BNSS sections</p>
      </div>

      <div className="analyzer-container">
        {/* Complaint Form */}
        <QueryForm
          onSubmit={handleSubmitComplaint}
          loading={loading}
          error={error}
        />

        {/* Results Tabs */}
        {sections.length > 0 && (
          <div className="results-container">
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'bns' ? 'active' : ''}`}
                onClick={() => setActiveTab('bns')}
                disabled={bnsSections.length === 0}
              >
                <span className="tab-icon">⚖️</span>
                <span className="tab-text">
                  <span className="tab-title">BNS Sections</span>
                  <span className="tab-count">({bnsSections.length})</span>
                </span>
              </button>
              <button
                className={`tab ${activeTab === 'bnss' ? 'active' : ''}`}
                onClick={() => setActiveTab('bnss')}
                disabled={bnssSections.length === 0}
              >
                <span className="tab-icon">📋</span>
                <span className="tab-text">
                  <span className="tab-title">BNSS Sections</span>
                  <span className="tab-count">({bnssSections.length})</span>
                </span>
              </button>
              <button
                className={`tab ${activeTab === 'fir' ? 'active' : ''}`}
                onClick={() => setActiveTab('fir')}
              >
                <span className="tab-icon">📄</span>
                <span className="tab-text">
                  <span className="tab-title">Generate FIR</span>
                </span>
              </button>
            </div>

            {/* BNS Sections Tab */}
            {activeTab === 'bns' && (
              <div className="tab-content">
                <SectionResults
                  sections={bnsSections}
                  category={category}
                  selectedSections={selectedSections}
                  onToggleSelection={toggleSectionSelection}
                  onGenerateFIR={handleGenerateFIR}
                  loading={loading}
                  lawType="BNS"
                />
              </div>
            )}

            {/* BNSS Sections Tab */}
            {activeTab === 'bnss' && (
              <div className="tab-content">
                <SectionResults
                  sections={bnssSections}
                  category={category}
                  selectedSections={selectedSections}
                  onToggleSelection={toggleSectionSelection}
                  onGenerateFIR={handleGenerateFIR}
                  loading={loading}
                  lawType="BNSS"
                />
              </div>
            )}

            {/* FIR Tab */}
            {activeTab === 'fir' && (
              <div className="tab-content">
                <FIRGenerator />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Analyzer
