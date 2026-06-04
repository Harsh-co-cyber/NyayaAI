import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './Navigation.css'

function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav>
      <div className="nav-container">
        <NavLink to="/" className="logo">
          <span className="logo-icon">⚖️</span>
          <span className="logo-text">
            Nyaya<span>Sahayak</span>
          </span>
        </NavLink>

        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/analyzer" 
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={() => setMobileMenuOpen(false)}
            >
              Analyzer
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/about" 
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/analyzer" 
              className="nav-cta"
              onClick={() => setMobileMenuOpen(false)}
            >
              Launch Analyzer →
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navigation
