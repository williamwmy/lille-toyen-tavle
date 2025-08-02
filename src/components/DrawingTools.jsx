import React, { useState, useRef } from 'react';
import './DrawingTools.css';

const DrawingTools = ({ onAddDrawing, drawings = [], isToolbar = false, drawingMode, setDrawingMode, selectedDrawing, setSelectedDrawing }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [startPoint, setStartPoint] = useState(null);
  const [isDraggingDrawing, setIsDraggingDrawing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPreview, setDragPreview] = useState(null);
  const [justCreatedDrawing, setJustCreatedDrawing] = useState(null);
  const svgRef = useRef(null);

  const handleDrawingClick = (drawing, e) => {
    e.stopPropagation();
    if (selectedDrawing?.id === drawing.id) {
      // Double click to delete
      onAddDrawing({ type: 'delete', id: drawing.id });
    } else {
      setSelectedDrawing(drawing);
    }
  };

  const startDraggingDrawing = (drawing, e) => {
    // Prevent dragging if we just created this drawing
    if (justCreatedDrawing === drawing.id) {
      setJustCreatedDrawing(null);
      return;
    }
    
    if (selectedDrawing?.id !== drawing.id) return;
    
    e.stopPropagation();
    setIsDraggingDrawing(true);
    
    const svgRect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - svgRect.left) * (300 / svgRect.width);
    const y = (e.clientY - svgRect.top) * (420 / svgRect.height);
    
    if (drawing.type === 'arrow') {
      setDragOffset({
        x: x - drawing.start.x,
        y: y - drawing.start.y
      });
    } else if (drawing.type === 'box') {
      setDragOffset({
        x: x - drawing.x,
        y: y - drawing.y
      });
    }
  };

  const dragDrawing = (e) => {
    if (!isDraggingDrawing || !selectedDrawing) return;
    
    e.stopPropagation();
    const svgRect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - svgRect.left) * (300 / svgRect.width);
    const y = (e.clientY - svgRect.top) * (420 / svgRect.height);
    
    const newX = x - dragOffset.x;
    const newY = y - dragOffset.y;
    
    if (selectedDrawing.type === 'arrow') {
      const deltaX = newX - selectedDrawing.start.x;
      const deltaY = newY - selectedDrawing.start.y;
      
      const previewDrawing = {
        ...selectedDrawing,
        start: { x: newX, y: newY },
        end: { x: selectedDrawing.end.x + deltaX, y: selectedDrawing.end.y + deltaY },
        path: `M ${newX} ${newY} L ${selectedDrawing.end.x + deltaX} ${selectedDrawing.end.y + deltaY}`
      };
      
      setDragPreview(previewDrawing);
    } else if (selectedDrawing.type === 'box') {
      const previewDrawing = {
        id: selectedDrawing.id,
        type: 'box',
        x: newX,
        y: newY,
        width: selectedDrawing.width,
        height: selectedDrawing.height
      };
      
      setDragPreview(previewDrawing);
    }
  };

  const stopDraggingDrawing = () => {
    if (dragPreview) {
      onAddDrawing({ type: 'update', drawing: dragPreview });
      setSelectedDrawing(dragPreview);
      setDragPreview(null);
    }
    setIsDraggingDrawing(false);
  };

  const startDrawing = (e) => {
    // Clear selection if clicking on empty space
    if (!isDrawing && !drawingMode) {
      setSelectedDrawing(null);
      return;
    }

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
    if (isDraggingDrawing) {
      dragDrawing(e);
      return;
    }
    
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
    if (isDraggingDrawing) {
      stopDraggingDrawing();
      return;
    }
    
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
      setJustCreatedDrawing(newDrawing.id);
      // Clear drawing mode after creating
      setTimeout(() => {
        setDrawingMode(null);
        setSelectedDrawing(newDrawing);
      }, 0);
    } else if (drawingMode === 'box') {
      // FIX: Sørg for at boksen alltid har positiv bredde og høyde
      const width = Math.abs(x - startPoint.x);
      const height = Math.abs(y - startPoint.y);
      
      // Kun lag boksen hvis den har en meningsfull størrelse
      if (width >= 5 && height >= 5) {
        const newDrawing = {
          id: Date.now(),
          type: 'box',
          x: Math.min(startPoint.x, x),
          y: Math.min(startPoint.y, y),
          width: width,
          height: height
        };
        onAddDrawing(newDrawing);
        setJustCreatedDrawing(newDrawing.id);
        // Clear drawing mode after creating
        setTimeout(() => {
          setDrawingMode(null);
          setSelectedDrawing(newDrawing);
        }, 0);
      }
    }
    
    setIsDrawing(false);
    setCurrentPath('');
    setStartPoint(null);
  };

  const handleTouchStart = (e) => {
    if (!drawingMode && !isDraggingDrawing) return;
    const touch = e.touches[0];
    
    if (isDraggingDrawing) {
      return;
    }
    
    startDrawing({
      ...e,
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => {},
      stopPropagation: () => e.stopPropagation()
    });
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    
    if (isDraggingDrawing) {
      dragDrawing({
        ...e,
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => {},
        stopPropagation: () => e.stopPropagation()
      });
      return;
    }
    
    if (!isDrawing || !drawingMode || !startPoint) return;
    
    continueDrawing({
      ...e,
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => {},
      stopPropagation: () => e.stopPropagation()
    });
  };

  const handleTouchEnd = (e) => {
    if (isDraggingDrawing) {
      stopDraggingDrawing();
      return;
    }
    
    if (!isDrawing || !drawingMode || !startPoint) return;
    const touch = e.changedTouches[0];
    finishDrawing({
      ...e,
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => {},
      stopPropagation: () => e.stopPropagation()
    });
  };

  const renderArrow = (drawing) => {
    // Use dragPreview if this drawing is being dragged
    const drawingToRender = (isDraggingDrawing && selectedDrawing?.id === drawing.id && dragPreview) ? dragPreview : drawing;
    
    const angle = Math.atan2(drawingToRender.end.y - drawingToRender.start.y, drawingToRender.end.x - drawingToRender.start.x);
    const arrowLength = 8;
    const arrowAngle = Math.PI / 6;
    
    const arrowHead1X = drawingToRender.end.x - arrowLength * Math.cos(angle - arrowAngle);
    const arrowHead1Y = drawingToRender.end.y - arrowLength * Math.sin(angle - arrowAngle);
    const arrowHead2X = drawingToRender.end.x - arrowLength * Math.cos(angle + arrowAngle);
    const arrowHead2Y = drawingToRender.end.y - arrowLength * Math.sin(angle + arrowAngle);
    
    const isSelected = selectedDrawing?.id === drawing.id;
    const isDragging = isDraggingDrawing && isSelected;
    
    return (
      <g key={drawing.id}>
        {/* Invisible thick hitbox for easier interaction */}
        <path
          d={drawingToRender.path}
          stroke="transparent"
          strokeWidth="12"
          fill="none"
          onClick={(e) => handleDrawingClick(drawing, e)}
          onMouseDown={(e) => startDraggingDrawing(drawing, e)}
          onTouchStart={(e) => {
            if (isSelected) {
              const touch = e.touches[0];
              startDraggingDrawing(drawing, {
                ...e,
                clientX: touch.clientX,
                clientY: touch.clientY,
                stopPropagation: () => e.stopPropagation()
              });
            }
          }}
          style={{ cursor: isSelected ? 'move' : 'pointer', pointerEvents: 'all' }}
        />
        
        {/* Visible arrow line */}
        <path
          d={drawingToRender.path}
          stroke={isSelected ? "#FF9800" : "#FF5722"}
          strokeWidth={isSelected ? "3" : "2"}
          fill="none"
          opacity={isDragging ? 0.7 : 1}
          style={{ pointerEvents: 'none' }}
        />
        
        {/* Invisible thick hitbox for arrowhead */}
        <path
          d={`M ${drawingToRender.end.x} ${drawingToRender.end.y} L ${arrowHead1X} ${arrowHead1Y} M ${drawingToRender.end.x} ${drawingToRender.end.y} L ${arrowHead2X} ${arrowHead2Y}`}
          stroke="transparent"
          strokeWidth="12"
          fill="none"
          onClick={(e) => handleDrawingClick(drawing, e)}
          onMouseDown={(e) => startDraggingDrawing(drawing, e)}
          onTouchStart={(e) => {
            if (isSelected) {
              const touch = e.touches[0];
              startDraggingDrawing(drawing, {
                ...e,
                clientX: touch.clientX,
                clientY: touch.clientY,
                stopPropagation: () => e.stopPropagation()
              });
            }
          }}
          style={{ cursor: isSelected ? 'move' : 'pointer', pointerEvents: 'all' }}
        />
        
        {/* Visible arrowhead */}
        <path
          d={`M ${drawingToRender.end.x} ${drawingToRender.end.y} L ${arrowHead1X} ${arrowHead1Y} M ${drawingToRender.end.x} ${drawingToRender.end.y} L ${arrowHead2X} ${arrowHead2Y}`}
          stroke={isSelected ? "#FF9800" : "#FF5722"}
          strokeWidth={isSelected ? "3" : "2"}
          fill="none"
          opacity={isDragging ? 0.7 : 1}
          style={{ pointerEvents: 'none' }}
        />
        {isSelected && !isDragging && (
          <circle
            cx={drawingToRender.start.x}
            cy={drawingToRender.start.y}
            r="4"
            fill="#FF9800"
            stroke="white"
            strokeWidth="1"
          />
        )}
        {isSelected && !isDragging && (
          <circle
            cx={drawingToRender.end.x}
            cy={drawingToRender.end.y}
            r="4"
            fill="#FF9800"
            stroke="white"
            strokeWidth="1"
          />
        )}
      </g>
    );
  };

  const renderBox = (drawing) => {
    // Use dragPreview if this drawing is being dragged
    const drawingToRender = (isDraggingDrawing && selectedDrawing?.id === drawing.id && dragPreview) ? dragPreview : drawing;
    
    const isSelected = selectedDrawing?.id === drawing.id;
    const isDragging = isDraggingDrawing && isSelected;
    
    return (
      <g key={drawing.id}>
        <rect
          x={drawingToRender.x}
          y={drawingToRender.y}
          width={drawingToRender.width}
          height={drawingToRender.height}
          fill="rgba(255, 87, 34, 0.1)"
          stroke={isSelected ? "#FF9800" : "#FF5722"}
          strokeWidth={isSelected ? "3" : "2"}
          strokeDasharray="5,5"
          opacity={isDragging ? 0.7 : 1}
          onClick={(e) => handleDrawingClick(drawing, e)}
          onMouseDown={(e) => startDraggingDrawing(drawing, e)}
          onTouchStart={(e) => {
            if (isSelected) {
              const touch = e.touches[0];
              startDraggingDrawing(drawing, {
                ...e,
                clientX: touch.clientX,
                clientY: touch.clientY,
                stopPropagation: () => e.stopPropagation()
              });
            }
          }}
          style={{ cursor: isSelected ? 'move' : 'pointer', pointerEvents: 'all' }}
        />
        {isSelected && !isDragging && (
          <>
            <circle
              cx={drawingToRender.x}
              cy={drawingToRender.y}
              r="4"
              fill="#FF9800"
              stroke="white"
              strokeWidth="1"
            />
            <circle
              cx={drawingToRender.x + drawingToRender.width}
              cy={drawingToRender.y}
              r="4"
              fill="#FF9800"
              stroke="white"
              strokeWidth="1"
            />
            <circle
              cx={drawingToRender.x}
              cy={drawingToRender.y + drawingToRender.height}
              r="4"
              fill="#FF9800"
              stroke="white"
              strokeWidth="1"
            />
            <circle
              cx={drawingToRender.x + drawingToRender.width}
              cy={drawingToRender.y + drawingToRender.height}
              r="4"
              fill="#FF9800"
              stroke="white"
              strokeWidth="1"
            />
          </>
        )}
      </g>
    );
  };

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
          Slett alle
        </button>
        {selectedDrawing && (
          <button
            className="delete-selected-btn"
            onClick={() => {
              onAddDrawing({ type: 'delete', id: selectedDrawing.id });
              setSelectedDrawing(null);
            }}
          >
            Slett valgt
          </button>
        )}
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