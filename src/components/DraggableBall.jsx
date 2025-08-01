import React, { useState, useRef } from 'react';

const DraggableBall = ({ 
  initialX = 180, 
  initialY = 210,
  onDragEnd,
  pitchBounds = { minX: 5, maxX: 295, minY: 10, maxY: 410 }
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const ballRef = useRef(null);

  const handleMouseDown = (e) => {
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
    if (!isDragging) return;
    
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
        onDragEnd(position);
      }
    }
  };

  const handleTouchStart = (e) => {
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
    if (!isDragging) return;
    
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
        onDragEnd(position);
      }
    }
  };

  return (
    <g
      ref={ballRef}
      className={`draggable-ball ${isDragging ? 'dragging' : ''}`}
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
        r="6"
        fill="#FFA500"
        stroke="#333"
        strokeWidth="1"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}
      />
      <circle
        cx={position.x - 1.5}
        cy={position.y - 1.5}
        r="1"
        fill="#FFD700"
        opacity="0.8"
      />
    </g>
  );
};

export default DraggableBall;