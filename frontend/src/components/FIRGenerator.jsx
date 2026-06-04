import React, { useState, useEffect } from 'react'
import './FIRGenerator.css'

function FIRGenerator() {
  const [firData, setFirData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedData = sessionStorage.getItem('firData')
    if (storedData) {
      setFirData(JSON.parse(storedData))
    }
    setLoading(false)
  }, [])

  const downloadFIR = () => {
    if (!firData) return

    const element = document.createElement('a')
    const file = new Blob([firData.fir], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `FIR_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const copyToClipboard = () => {
    if (!firData) return
    navigator.clipboard.writeText(firData.fir)
    alert('FIR copied to clipboard!')
  }

  if (loading) {
    return <div className="fir-container">Loading FIR...</div>
  }

  if (!firData) {
    return (
      <div className="fir-container">
        <p className="error-text">No FIR data available. Please generate a FIR first.</p>
      </div>
    )
  }

  return (
    <div className="fir-container">
      <div className="fir-header">
        <h2>Generated FIR Document</h2>
        <p>Category: <strong>{firData.category}</strong></p>
        <p>Sections: <strong>{firData.sections.join(', ')}</strong></p>
      </div>

      <div className="fir-actions">
        <button onClick={downloadFIR} className="btn btn-download">
          ⬇️ Download FIR
        </button>
        <button onClick={copyToClipboard} className="btn btn-copy">
          📋 Copy to Clipboard
        </button>
      </div>

      <div className="fir-content">
        <pre>{firData.fir}</pre>
      </div>

      <div className="fir-footer">
        <p>✓ FIR generated using RAG-based legal AI system</p>
        <p style={{ fontSize: '0.85em', color: '#999' }}>
          Generated on: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  )
}

export default FIRGenerator
