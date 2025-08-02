import React from 'react';
import './VolleyballCourt.css';

const VolleyballCourt = ({ children }) => {
  return (
    <div className="volleyball-court-container">
      <svg 
        className="volleyball-court" 
        viewBox="0 0 300 420" 
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Bench area on left side */}
        <rect 
          x="0" 
          y="0" 
          width="60" 
          height="420" 
          fill="#8D6E63" 
          rx="8"
        />
        
        {/* Main volleyball court - 9m x 18m (maximizing screen space) */}
        <rect 
          x="60" 
          y="40" 
          width="240" 
          height="340" 
          fill="#D2691E" 
          stroke="#ffffff" 
          strokeWidth="3"
          rx="0"
        />
        
        {/* Center line (net) - divides 18m court into two 9m halves */}
        <line 
          x1="60" 
          y1="210" 
          x2="300" 
          y2="210" 
          stroke="#ffffff" 
          strokeWidth="4"
        />
        
        {/* Net visualization */}
        <rect 
          x="60" 
          y="207" 
          width="240" 
          height="6" 
          fill="#000000" 
          opacity="0.7"
        />
        
        {/* 3-meter attack lines (3m from net on each side) */}
        <line 
          x1="60" 
          y1="150" 
          x2="300" 
          y2="150" 
          stroke="#ffffff" 
          strokeWidth="2"
        />
        
        <line 
          x1="60" 
          y1="270" 
          x2="300" 
          y2="270" 
          stroke="#ffffff" 
          strokeWidth="2"
        />
        
        
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

export default VolleyballCourt;