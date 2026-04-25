import React from 'react';

export default function ThemeToggle({ isDayMode, onToggle }) {
  return (
    <button
      className="theme-toggle-btn"
      onClick={onToggle}
      title={isDayMode ? 'Switch to night mode' : 'Switch to day mode'}
    >
      {/* Sun / Moon icon */}
      {isDayMode ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="5" fill="#009bff"/>
          <line x1="12" y1="2"  x2="12" y2="5"  stroke="#009bff" strokeWidth="2" strokeLinecap="round"/>
          <line x1="12" y1="19" x2="12" y2="22" stroke="#009bff" strokeWidth="2" strokeLinecap="round"/>
          <line x1="2"  y1="12" x2="5"  y2="12" stroke="#009bff" strokeWidth="2" strokeLinecap="round"/>
          <line x1="19" y1="12" x2="22" y2="12" stroke="#009bff" strokeWidth="2" strokeLinecap="round"/>
          <line x1="4.22"  y1="4.22"  x2="6.34"  y2="6.34"  stroke="#009bff" strokeWidth="2" strokeLinecap="round"/>
          <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="#009bff" strokeWidth="2" strokeLinecap="round"/>
          <line x1="4.22"  y1="19.78" x2="6.34"  y2="17.66" stroke="#009bff" strokeWidth="2" strokeLinecap="round"/>
          <line x1="17.66" y1="6.34"  x2="19.78" y2="4.22"  stroke="#009bff" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
            fill="rgba(167,139,250,0.8)" stroke="rgba(167,139,250,0.9)" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}

      {/* Track */}
      <div className={`theme-track${isDayMode ? ' day' : ''}`}>
        <div className="theme-thumb"/>
      </div>

      <span style={{ fontSize: 11, letterSpacing: '0.04em' }}>
        {isDayMode ? 'DAY' : 'NIGHT'}
      </span>
    </button>
  );
}