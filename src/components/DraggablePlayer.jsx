import React, { useState, useRef } from 'react';
import './DraggablePlayer.css';

const DraggablePlayer = ({ 
  player, 
  isOnPitch = false, 
  initialX = 0, 
  initialY = 0, 
  onDragEnd,
  pitchBounds = { minX: 5, maxX: 295, minY: 10, maxY: 410 }
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const playerRef = useRef(null);

  const handleMouseDown = (e) => {
    if (!isOnPitch) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const svgRect = e.currentTarget.closest('svg').getBoundingClientRect();
    const svgX = (e.clientX - svgRect.left) * (300 / svgRect.width);
    const svgY = (e.clientY - svgRect.top) * (420 / svgRect.height);
    
    setDragOffset({
      x: svgX - position.x,
      y: svgY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !isOnPitch) return;
    
    e.preventDefault();
    const svgRect = e.currentTarget.closest('svg').getBoundingClientRect();
    const svgX = (e.clientX - svgRect.left) * (300 / svgRect.width);
    const svgY = (e.clientY - svgRect.top) * (420 / svgRect.height);
    
    const newX = Math.max(pitchBounds.minX, Math.min(pitchBounds.maxX, svgX - dragOffset.x));
    const newY = Math.max(pitchBounds.minY, Math.min(pitchBounds.maxY, svgY - dragOffset.y));
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (onDragEnd) {
        onDragEnd(player.id, position);
      }
    }
  };

  const handleTouchStart = (e) => {
    if (!isOnPitch) return;
    
    setIsDragging(true);
    
    const touch = e.touches[0];
    const svgRect = e.currentTarget.closest('svg').getBoundingClientRect();
    const svgX = (touch.clientX - svgRect.left) * (300 / svgRect.width);
    const svgY = (touch.clientY - svgRect.top) * (420 / svgRect.height);
    
    setDragOffset({
      x: svgX - position.x,
      y: svgY - position.y
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !isOnPitch) return;
    
    const touch = e.touches[0];
    const svgRect = e.currentTarget.closest('svg').getBoundingClientRect();
    const svgX = (touch.clientX - svgRect.left) * (300 / svgRect.width);
    const svgY = (touch.clientY - svgRect.top) * (420 / svgRect.height);
    
    const newX = Math.max(pitchBounds.minX, Math.min(pitchBounds.maxX, svgX - dragOffset.x));
    const newY = Math.max(pitchBounds.minY, Math.min(pitchBounds.maxY, svgY - dragOffset.y));
    
    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      if (onDragEnd) {
        onDragEnd(player.id, position);
      }
    }
  };

  if (!isOnPitch) {
    return (
      <div className={`roster-player ${player.team}`}>
        <div className="player-circle">
          {player.name ? player.name.charAt(0).toUpperCase() : '?'}
        </div>
        {player.name && (
          <div className="player-name">{player.name}</div>
        )}
      </div>
    );
  }

  return (
    <g
      ref={playerRef}
      className={`draggable-player ${isDragging ? 'dragging' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <circle
        cx={position.x}
        cy={position.y}
        r="12"
        fill={player.team === 'blue' ? '#2196F3' : '#F44336'}
        stroke="#ffffff"
        strokeWidth="2"
        className="player-circle-svg"
      />
      <text
        x={position.x}
        y={position.y + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="8"
        fontWeight="bold"
        pointerEvents="none"
      >
        {player.name ? player.name.charAt(0).toUpperCase() : '?'}
      </text>
      {player.name && (
        <text
          x={position.x}
          y={position.y + 25}
          textAnchor="middle"
          fill="#333"
          fontSize="6"
          fontWeight="bold"
          pointerEvents="none"
        >
          {player.name}
        </text>
      )}
    </g>
  );
};

export default DraggablePlayer;