import React from 'react';
import './FootballPitch.css';

const FootballPitch = ({ children }) => {
  return (
    <div className="football-pitch-container">
      <svg 
        className="football-pitch" 
        viewBox="0 0 300 420" 
        preserveAspectRatio="xMidYMid meet"
      >
        <rect 
          x="0" 
          y="0" 
          width="60" 
          height="420" 
          fill="#2E7D32" 
          rx="8"
        />
        
        <rect 
          x="60" 
          y="20" 
          width="240" 
          height="380" 
          fill="#4CAF50" 
          stroke="#ffffff" 
          strokeWidth="2"
          rx="5"
        />
        
        <line 
          x1="60" 
          y1="210" 
          x2="300" 
          y2="210" 
          stroke="#ffffff" 
          strokeWidth="2"
        />
        
        <circle 
          cx="180" 
          cy="210" 
          r="30" 
          fill="none" 
          stroke="#ffffff" 
          strokeWidth="2"
        />
        
        <circle 
          cx="180" 
          cy="210" 
          r="2" 
          fill="#ffffff"
        />
        
        <rect 
          x="120" 
          y="20" 
          width="120" 
          height="40" 
          fill="none" 
          stroke="#ffffff" 
          strokeWidth="2"
        />
        
        <rect 
          x="120" 
          y="360" 
          width="120" 
          height="40" 
          fill="none" 
          stroke="#ffffff" 
          strokeWidth="2"
        />
        
        <rect 
          x="150" 
          y="20" 
          width="60" 
          height="20" 
          fill="none" 
          stroke="#ffffff" 
          strokeWidth="2"
        />
        
        <rect 
          x="150" 
          y="380" 
          width="60" 
          height="20" 
          fill="none" 
          stroke="#ffffff" 
          strokeWidth="2"
        />
        
        <circle 
          cx="180" 
          cy="40" 
          r="25" 
          fill="none" 
          stroke="#ffffff" 
          strokeWidth="2"
          clipPath="url(#topGoalClip)"
        />
        
        <circle 
          cx="180" 
          cy="380" 
          r="25" 
          fill="none" 
          stroke="#ffffff" 
          strokeWidth="2"
          clipPath="url(#bottomGoalClip)"
        />
        
        <defs>
          <clipPath id="topGoalClip">
            <rect x="0" y="60" width="300" height="360" />
          </clipPath>
          <clipPath id="bottomGoalClip">
            <rect x="0" y="0" width="300" height="360" />
          </clipPath>
        </defs>
        
        <text x="5" y="15" fill="#ffffff" fontSize="10" fontWeight="bold">BENK</text>
        
        {/* Remove zone at bottom of bench */}
        <rect 
          x="5" 
          y="370" 
          width="50" 
          height="40" 
          fill="none" 
          stroke="#ffffff" 
          strokeWidth="1"
          strokeDasharray="3,3"
          rx="5"
          className="remove-zone"
        />
        <text x="30" y="385" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">↩️</text>
        <text x="30" y="395" fill="#ffffff" fontSize="6" fontWeight="bold" textAnchor="middle">BENK</text>
        
        {children}
      </svg>
    </div>
  );
};

export default FootballPitch;