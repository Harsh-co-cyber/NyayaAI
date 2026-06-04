import React, { useState } from 'react'
import './QueryForm.css'

const CRIME_OPTIONS = [
  'Theft', 'Robbery', 'Burglary', 'Assault', 'Physical Attack',
  'Murder', 'Culpable Homicide', 'Sexual Harassment', 'Molestation',
  'Rape', 'Sexual Assault', 'Kidnapping', 'Abduction', 'Fraud',
  'Cheating', 'Forgery', 'Cybercrime', 'Online Fraud',
  'Domestic Violence', 'Extortion', 'Blackmail',
  'Drug Offence', 'Narcotics Offence', 'Property Damage',
  'Vandalism', 'Trespass', 'Unlawful Entry', 'Other',
]

const LOCATION_OPTIONS = [
  'Public Place', 'Street', 'Park', 'Market',
  'Residence', 'Home', 'Workplace', 'Office',
  'Bus', 'Train', 'Auto', 'Transport',
  'Educational Institution', 'Hospital',
  'Online', 'Cyber Space', 'Rural Area', 'Village', 'Other',
]

const GENDER_OPTIONS = ['Male', 'Female', 'Transgender', 'Other']
const AGE_OPTIONS = ['Minor (below 18)', 'Adult (18–60)', 'Senior Citizen (60+)', 'Other']
const ACCUSED_OPTIONS = ['Known to Victim', 'Stranger', 'Partially Known', 'Relative', 'Colleague', 'Other']
const WEAPON_OPTIONS = ['Knife', 'Rod', 'Gun', 'Firearm', 'Hands', 'Chemical', 'Vehicle', 'None', 'Other']

// multi=true → checkboxes, multi=false → radio (single select)
function SelectGroup({ options, selected, onChange, otherId, otherValue, onOtherChange, multi = true }) {
  const isSelected = (val) => multi ? selected.includes(val) : selected === val

  const toggle = (val) => {
    if (multi) {
      if (selected.includes(val)) onChange(selected.filter(v => v !== val))
      else onChange([...selected, val])
    } else {
      onChange(selected === val ? '' : val)
    }
  }

  const showOther = multi ? selected.includes('Other') : selected === 'Other'

  return (
    <div className="checkbox-group">
      {options.map(opt => (
        <label key={opt} className={`checkbox-item ${isSelected(opt) ? 'checked' : ''}`}>
          <input
            type={multi ? 'checkbox' : 'radio'}
            checked={isSelected(opt)}
            onChange={() => toggle(opt)}
          />
          <span>{opt}</span>
        </label>
      ))}
      {showOther && (
        <input
          id={otherId}
          type="text"
          className="other-input"
          placeholder="Please specify..."
          value={otherValue}
          onChange={e => onOtherChange(e.target.value)}
        />
      )}
    </div>
  )
}

function resolveMulti(arr, otherVal) {
  const items = arr.filter(x => x !== 'Other')
  if (arr.includes('Other') && otherVal) items.push(otherVal)
  return items
}

function resolveSingle(val, otherVal) {
  if (!val) return ''
  return val === 'Other' && otherVal ? otherVal : val
}

function buildQuery(f, freeText) {
  // Build a natural narrative complaint for better RAG retrieval
  const parts = []
  
  // Opening statement with victim info
  let opening = "I"
  if (f.victimName) opening = `I, ${f.victimName},`
  const gender = resolveSingle(f.victimGender, f.victimGenderOther)
  const age = resolveSingle(f.victimAge, f.victimAgeOther)
  if (age || gender) {
    const details = [age, gender].filter(Boolean).join(', ')
    opening += ` (${details}),`
  }
  opening += " state that"
  
  // Crime description with accused and relation
  const crimes = resolveMulti(f.crimeTypes, f.crimeTypeOther)
  if (crimes.length) {
    const crimeText = crimes.join(', ')
    if (f.accusedName) {
      const relation = resolveSingle(f.accusedRelation, f.accusedRelationOther)
      const relationText = relation ? ` (my ${relation})` : ''
      parts.push(`${opening} ${f.accusedName}${relationText} committed ${crimeText} against me`)
    } else {
      parts.push(`${opening} a crime of ${crimeText} was committed against me`)
    }
  } else {
    parts.push(`${opening} the following incident occurred`)
  }
  
  // Location details
  const locType = resolveSingle(f.locationType, f.locationTypeOther)
  if (locType || f.locationDetail) {
    const location = f.locationDetail || locType
    parts.push(`The incident took place at ${location}`)
  }
  
  // Date and time
  if (f.incidentDate || f.incidentTime) {
    const when = [f.incidentDate, f.incidentTime].filter(Boolean).join(' at ')
    parts.push(`This occurred on ${when}`)
  }
  
  // Weapons used
  const weapons = resolveMulti(f.weapons, f.weaponOther)
  if (weapons.length) {
    const weaponText = weapons.join(', ')
    parts.push(`The accused used ${weaponText} during the incident`)
  }
  
  // Additional details
  if (freeText.trim()) {
    parts.push(freeText.trim())
  }
  
  return parts.join('. ') + '.'
}

const INIT = {
  crimeTypes: [], crimeTypeOther: '',
  victimName: '',
  victimGender: '', victimGenderOther: '',
  victimAge: '', victimAgeOther: '',
  accusedName: '',
  accusedRelation: '', accusedRelationOther: '',
  locationType: '', locationTypeOther: '',
  locationDetail: '',
  incidentDate: '',
  incidentTime: '',
  weapons: [], weaponOther: '',
}

function QueryForm({ onSubmit, loading, error }) {
  const [complaint, setComplaint] = useState('')
  const [showStructured, setShowStructured] = useState(false)
  const [f, setF] = useState(INIT)

  const set = (key, val) => setF(prev => ({ ...prev, [key]: val }))

  const hasData = f.crimeTypes.length > 0 || f.victimName || f.locationDetail ||
    f.locationType || f.incidentDate

  // Generate complaint preview from structured form
  const generatedComplaint = showStructured ? buildQuery(f, complaint) : ''

  const handleSubmit = (e) => {
    e.preventDefault()
    const finalComplaint = showStructured ? buildQuery(f, complaint) : complaint
    onSubmit(finalComplaint)
  }

  return (
    <div className="query-form-container">
      <form onSubmit={handleSubmit} className="query-form">

        <div className="form-mode-toggle">
          <button type="button" className={`mode-btn ${!showStructured ? 'active' : ''}`}
            onClick={() => setShowStructured(false)}>
            📝 Text Complaint
          </button>
          <button type="button" className={`mode-btn ${showStructured ? 'active' : ''}`}
            onClick={() => setShowStructured(true)}>
            📋 Structured Form
          </button>
        </div>

        {showStructured && (
          <div className="structured-form">

            {/* Crime Types */}
            <div className="sf-section">
              <div className="sf-label">🔴 Type of Crime <span className="sf-hint">(select all that apply)</span></div>
              <SelectGroup
                options={CRIME_OPTIONS}
                selected={f.crimeTypes}
                onChange={v => set('crimeTypes', v)}
                otherId="crimeTypeOther"
                otherValue={f.crimeTypeOther}
                onOtherChange={v => set('crimeTypeOther', v)}
                multi={true}
              />
            </div>

            {/* Victim Info */}
            <div className="sf-section">
              <div className="sf-label">👤 Victim Details</div>
              <div className="sf-row">
                <div className="form-group">
                  <label htmlFor="victimName">Full Name</label>
                  <input id="victimName" type="text" placeholder="Victim's full name"
                    value={f.victimName} onChange={e => set('victimName', e.target.value)} disabled={loading} />
                </div>
              </div>
              <div className="sf-sublabel">Gender</div>
              <SelectGroup
                options={GENDER_OPTIONS}
                selected={f.victimGender}
                onChange={v => set('victimGender', v)}
                otherId="victimGenderOther"
                otherValue={f.victimGenderOther}
                onOtherChange={v => set('victimGenderOther', v)}
                multi={false}
              />
              <div className="sf-sublabel">Age Group</div>
              <SelectGroup
                options={AGE_OPTIONS}
                selected={f.victimAge}
                onChange={v => set('victimAge', v)}
                otherId="victimAgeOther"
                otherValue={f.victimAgeOther}
                onOtherChange={v => set('victimAgeOther', v)}
                multi={false}
              />
            </div>

            {/* Accused Info */}
            <div className="sf-section">
              <div className="sf-label">🕵️ Accused Details <span className="sf-hint">(optional)</span></div>
              <div className="sf-row">
                <div className="form-group">
                  <label htmlFor="accusedName">Full Name (if known)</label>
                  <input id="accusedName" type="text" placeholder="Accused's full name (optional)"
                    value={f.accusedName} onChange={e => set('accusedName', e.target.value)} disabled={loading} />
                </div>
              </div>
              <div className="sf-sublabel">Relationship to Victim</div>
              <SelectGroup
                options={ACCUSED_OPTIONS}
                selected={f.accusedRelation}
                onChange={v => set('accusedRelation', v)}
                otherId="accusedRelationOther"
                otherValue={f.accusedRelationOther}
                onOtherChange={v => set('accusedRelationOther', v)}
                multi={false}
              />
            </div>

            {/* Incident Info */}
            <div className="sf-section">
              <div className="sf-label">📍 Incident Details</div>
              <div className="sf-sublabel">Location Type</div>
              <SelectGroup
                options={LOCATION_OPTIONS}
                selected={f.locationType}
                onChange={v => set('locationType', v)}
                otherId="locationTypeOther"
                otherValue={f.locationTypeOther}
                onOtherChange={v => set('locationTypeOther', v)}
                multi={false}
              />
              <div className="sf-row three-col">
                <div className="form-group">
                  <label htmlFor="locationDetail">📌 Specific Location</label>
                  <input id="locationDetail" type="text" placeholder="e.g. MG Road, Bangalore"
                    value={f.locationDetail} onChange={e => set('locationDetail', e.target.value)} disabled={loading} />
                </div>
                <div className="form-group">
                  <label htmlFor="incidentDate">📅 Date of Incident</label>
                  <input id="incidentDate" type="date"
                    value={f.incidentDate} onChange={e => set('incidentDate', e.target.value)} disabled={loading} />
                </div>
                <div className="form-group">
                  <label htmlFor="incidentTime">🕐 Time of Incident</label>
                  <input id="incidentTime" type="time"
                    value={f.incidentTime} onChange={e => set('incidentTime', e.target.value)} disabled={loading} />
                </div>
              </div>
            </div>

            {/* Weapon */}
            <div className="sf-section">
              <div className="sf-label">🔪 Weapon / Instrument Used <span className="sf-hint">(select all that apply)</span></div>
              <SelectGroup
                options={WEAPON_OPTIONS}
                selected={f.weapons}
                onChange={v => set('weapons', v)}
                otherId="weaponOther"
                otherValue={f.weaponOther}
                onOtherChange={v => set('weaponOther', v)}
                multi={true}
              />
            </div>

          </div>
        )}

        

        {/* Free text */}
        <div className="form-group">
          <label htmlFor="complaint">
            {showStructured ? '📝 Additional Details (optional)' : '📝 Enter Complaint'}
          </label>
          <textarea
            id="complaint"
            value={complaint}
            onChange={e => setComplaint(e.target.value)}
            placeholder={showStructured
              ? 'Add any extra details not covered above...'
              : 'Enter detailed complaint. Example: A person was assaulted at a bus station...'}
            rows={showStructured ? 3 : 6}
            disabled={loading}
          />
          {!showStructured && <small>Provide at least 10 characters for accurate results</small>}
        </div>
{/* Complaint Preview for Structured Form */}
        {showStructured && hasData && (
          <div className="complaint-preview">
            <div className="preview-header">
              <strong>📄 Generated Complaint Preview:</strong>
            </div>
            <div className="preview-content">
              {generatedComplaint || 'Fill in the fields above to see the complaint preview...'}
            </div>
          </div>
        )}
        {error && <div className="error-message">⚠️ {error}</div>}

        <button type="submit"
          disabled={loading || (!complaint.trim() && !hasData)}
          className="submit-btn">
          {loading ? '⏳ Analyzing...' : '🔍 Find Applicable Sections'}
        </button>
      </form>
    </div>
  )
}

export default QueryForm
