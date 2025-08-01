import React, { useState, useRef } from 'react';
import './DrawingTools.css';

const DrawingTools = ({ onAddDrawing, drawings = [], isToolbar = false, drawingMode, setDrawingMode }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [startPoint, setStartPoint] = useState(null);
  const svgRef = useRef(null);

  const startDrawing = (e) => {
    if (!drawingMode) return;
    
    e.preventDefault();
    setIsDrawing(true);
    
    const svgRect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - svgRect.left) * (300 / svgRect.width);
    const y = (e.clientY - svgRect.top) * (420 / svgRect.height);
    
    setStartPoint({ x, y });
    
    if (drawingMode === 'arrow') {
      setCurrentPath(`M ${x} ${y}`);
    }
  };

  const continueDrawing = (e) => {
    if (!isDrawing || !drawingMode || !startPoint) return;
    
    e.preventDefault();
    const svgRect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - svgRect.left) * (300 / svgRect.width);
    const y = (e.clientY - svgRect.top) * (420 / svgRect.height);
    
    if (drawingMode === 'arrow') {
      setCurrentPath(`M ${startPoint.x} ${startPoint.y} L ${x} ${y}`);
    }
  };

  const finishDrawing = (e) => {
    if (!isDrawing || !drawingMode || !startPoint) return;
    
    e.preventDefault();
    const svgRect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - svgRect.left) * (300 / svgRect.width);
    const y = (e.clientY - svgRect.top) * (420 / svgRect.height);
    
    if (drawingMode === 'arrow') {
      const newDrawing = {
        id: Date.now(),
        type: 'arrow',
        path: `M ${startPoint.x} ${startPoint.y} L ${x} ${y}`,
        start: startPoint,
        end: { x, y }
      };
      onAddDrawing(newDrawing);
    } else if (drawingMode === 'box') {
      const newDrawing = {
        id: Date.now(),
        type: 'box',
        x: Math.min(startPoint.x, x),
        y: Math.min(startPoint.y, y),
        width: Math.abs(x - startPoint.x),
        height: Math.abs(y - startPoint.y)
      };
      onAddDrawing(newDrawing);
    }
    
    setIsDrawing(false);
    setCurrentPath('');
    setStartPoint(null);
    setDrawingMode(null);
  };

  const handleTouchStart = (e) => {
    if (!drawingMode) return;
    const touch = e.touches[0];
    startDrawing({
      ...e,
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => {}
    });
  };

  const handleTouchMove = (e) => {
    if (!isDrawing || !drawingMode || !startPoint) return;
    const touch = e.touches[0];
    continueDrawing({
      ...e,
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => {}
    });
  };

  const handleTouchEnd = (e) => {
    if (!isDrawing || !drawingMode || !startPoint) return;
    const touch = e.changedTouches[0];
    finishDrawing({
      ...e,
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => {}
    });
  };

  const renderArrow = (drawing) => {
    const angle = Math.atan2(drawing.end.y - drawing.start.y, drawing.end.x - drawing.start.x);
    const arrowLength = 8;
    const arrowAngle = Math.PI / 6;
    
    const arrowHead1X = drawing.end.x - arrowLength * Math.cos(angle - arrowAngle);
    const arrowHead1Y = drawing.end.y - arrowLength * Math.sin(angle - arrowAngle);
    const arrowHead2X = drawing.end.x - arrowLength * Math.cos(angle + arrowAngle);
    const arrowHead2Y = drawing.end.y - arrowLength * Math.sin(angle + arrowAngle);
    
    return (
      <g key={drawing.id}>
        <path
          d={drawing.path}
          stroke="#FF5722"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrowhead)"
        />
        <path
          d={`M ${drawing.end.x} ${drawing.end.y} L ${arrowHead1X} ${arrowHead1Y} M ${drawing.end.x} ${drawing.end.y} L ${arrowHead2X} ${arrowHead2Y}`}
          stroke="#FF5722"
          strokeWidth="2"
          fill="none"
        />
      </g>
    );
  };

  const renderBox = (drawing) => (
    <rect
      key={drawing.id}
      x={drawing.x}
      y={drawing.y}
      width={drawing.width}
      height={drawing.height}
      fill="rgba(255, 87, 34, 0.1)"
      stroke="#FF5722"
      strokeWidth="2"
      strokeDasharray="5,5"
    />
  );

  if (isToolbar) {
    return (
      <div className="drawing-tools">
        <button
          className={`tool-btn ${drawingMode === 'arrow' ? 'active' : ''}`}
          onClick={() => setDrawingMode(drawingMode === 'arrow' ? null : 'arrow')}
        >
          ↗ Pil
        </button>
        <button
          className={`tool-btn ${drawingMode === 'box' ? 'active' : ''}`}
          onClick={() => setDrawingMode(drawingMode === 'box' ? null : 'box')}
        >
          ⬜ Boks
        </button>
        <button
          className="clear-drawings-btn"
          onClick={() => onAddDrawing({ type: 'clear' })}
        >
          Slett tegninger
        </button>
      </div>
    );
  }

  return (
    <g
      ref={svgRef}
      className={`drawing-overlay ${drawingMode ? 'drawing-mode' : ''}`}
      onMouseDown={startDrawing}
      onMouseMove={continueDrawing}
      onMouseUp={finishDrawing}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {drawings.map(drawing => {
        if (drawing.type === 'arrow') return renderArrow(drawing);
        if (drawing.type === 'box') return renderBox(drawing);
        return null;
      })}
      
      {isDrawing && drawingMode === 'arrow' && currentPath && (
        <path
          d={currentPath}
          stroke="#FF5722"
          strokeWidth="2"
          fill="none"
          opacity="0.7"
        />
      )}
      
      {isDrawing && drawingMode === 'box' && startPoint && (
        <rect
          x={startPoint.x}
          y={startPoint.y}
          width="0"
          height="0"
          fill="rgba(255, 87, 34, 0.1)"
          stroke="#FF5722"
          strokeWidth="2"
          strokeDasharray="5,5"
          opacity="0.7"
        />
      )}
      
      <rect
        x="0"
        y="0"
        width="300"
        height="420"
        fill="transparent"
        pointerEvents={drawingMode ? 'all' : 'none'}
      />
    </g>
  );
};

export default DrawingTools;