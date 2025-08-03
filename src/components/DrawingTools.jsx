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
  const [polygonPoints, setPolygonPoints] = useState([]);
  const svgRef = useRef(null);

  const handleDrawingClick = (drawing, e) => {
    e.stopPropagation();
    
    // Don't handle clicks on drawings when in polygon mode
    if (drawingMode === 'polygon') return;
    
    if (selectedDrawing?.id === drawing.id) {
      // Double click to delete
      onAddDrawing({ type: 'delete', id: drawing.id });
    } else {
      setSelectedDrawing(drawing);
    }
  };

  const startDraggingDrawing = (drawing, e) => {
    // Don't allow dragging in polygon mode
    if (drawingMode === 'polygon') return;
    
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
    } else if (drawing.type === 'box' || drawing.type === 'oval') {
      setDragOffset({
        x: x - drawing.x,
        y: y - drawing.y
      });
    } else if (drawing.type === 'polygon') {
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
    } else if (selectedDrawing.type === 'box' || selectedDrawing.type === 'oval') {
      const previewDrawing = {
        id: selectedDrawing.id,
        type: selectedDrawing.type,
        x: newX,
        y: newY,
        width: selectedDrawing.width,
        height: selectedDrawing.height
      };
      
      setDragPreview(previewDrawing);
    } else if (selectedDrawing.type === 'polygon') {
      const deltaX = newX - selectedDrawing.x;
      const deltaY = newY - selectedDrawing.y;
      
      const previewDrawing = {
        id: selectedDrawing.id,
        type: 'polygon',
        x: newX,
        y: newY,
        width: selectedDrawing.width,
        height: selectedDrawing.height,
        points: selectedDrawing.points.map(point => ({
          x: point.x + deltaX,
          y: point.y + deltaY
        }))
      };
      
      setDragPreview(previewDrawing);
    }
  };

  const stopDraggingDrawing = () => {
    if (dragPreview) {
      // Check if dragged to trash zone (x: 5-55, y: 370-410)
      const isInTrashZone = dragPreview.x !== undefined ? 
        (dragPreview.x >= 5 && dragPreview.x <= 55 && dragPreview.y >= 370 && dragPreview.y <= 410) :
        (dragPreview.start && dragPreview.start.x >= 5 && dragPreview.start.x <= 55 && 
         dragPreview.start.y >= 370 && dragPreview.start.y <= 410);
      
      if (isInTrashZone) {
        // Delete the drawing
        onAddDrawing({ type: 'delete', id: selectedDrawing.id });
        setSelectedDrawing(null);
      } else {
        // Update the drawing position
        onAddDrawing({ type: 'update', drawing: dragPreview });
        setSelectedDrawing(dragPreview);
      }
      setDragPreview(null);
    }
    setIsDraggingDrawing(false);
  };

  const handlePolygonClick = (e) => {
    if (drawingMode !== 'polygon') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const svgRect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - svgRect.left) * (300 / svgRect.width);
    const y = (e.clientY - svgRect.top) * (420 / svgRect.height);
    
    // Check if click is too close to an existing point (avoid duplicates)
    const tooClose = polygonPoints.some(point => 
      Math.abs(point.x - x) < 5 && Math.abs(point.y - y) < 5
    );
    
    if (tooClose) return;
    
    const newPoints = [...polygonPoints, { x, y }];
    setPolygonPoints(newPoints);
    
    if (newPoints.length === 4) {
      // Create the polygon when we have 4 points
      const minX = Math.min(...newPoints.map(p => p.x));
      const maxX = Math.max(...newPoints.map(p => p.x));
      const minY = Math.min(...newPoints.map(p => p.y));
      const maxY = Math.max(...newPoints.map(p => p.y));
      
      const newDrawing = {
        id: Date.now(),
        type: 'polygon',
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        points: newPoints
      };
      
      onAddDrawing(newDrawing);
      setJustCreatedDrawing(newDrawing.id);
      setPolygonPoints([]);
      setTimeout(() => {
        setDrawingMode(null);
        setSelectedDrawing(newDrawing);
      }, 0);
    }
  };

  const startDrawing = (e) => {
    // Handle polygon mode separately with higher priority
    if (drawingMode === 'polygon') {
      handlePolygonClick(e);
      return;
    }
    
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
    // Skip if in polygon mode
    if (drawingMode === 'polygon') return;
    
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
    } else if (drawingMode === 'box' || drawingMode === 'oval') {
      // Update preview box/oval dimensions while drawing
      const width = Math.abs(x - startPoint.x);
      const height = Math.abs(y - startPoint.y);
      setCurrentPath({
        x: Math.min(startPoint.x, x),
        y: Math.min(startPoint.y, y),
        width: width,
        height: height
      });
    }
  };

  const finishDrawing = (e) => {
    // Skip if in polygon mode
    if (drawingMode === 'polygon') return;
    
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
    } else if (drawingMode === 'box' || drawingMode === 'oval') {
      // FIX: Sørg for at boksen/ovalen alltid har positiv bredde og høyde
      const width = Math.abs(x - startPoint.x);
      const height = Math.abs(y - startPoint.y);
      
      // Kun lag boksen/ovalen hvis den har en meningsfull størrelse
      if (width >= 5 && height >= 5) {
        const newDrawing = {
          id: Date.now(),
          type: drawingMode,
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
    // For polygon mode, handle immediately
    if (drawingMode === 'polygon') {
      const touch = e.touches[0];
      handlePolygonClick({
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => {},
        stopPropagation: () => e.stopPropagation()
      });
      return;
    }
    
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
    // Skip touch move for polygon mode
    if (drawingMode === 'polygon') return;
    
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
    // Skip touch end for polygon mode
    if (drawingMode === 'polygon') return;
    
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
      <g key={drawing.id} style={{ pointerEvents: drawingMode === 'polygon' ? 'none' : 'all' }}>
        {/* Invisible thick hitbox for easier interaction */}
        <path
          d={drawingToRender.path}
          stroke="transparent"
          strokeWidth="12"
          fill="none"
          onClick={(e) => handleDrawingClick(drawing, e)}
          onMouseDown={(e) => startDraggingDrawing(drawing, e)}
          onTouchStart={(e) => {
            if (isSelected && drawingMode !== 'polygon') {
              const touch = e.touches[0];
              startDraggingDrawing(drawing, {
                ...e,
                clientX: touch.clientX,
                clientY: touch.clientY,
                stopPropagation: () => e.stopPropagation()
              });
            }
          }}
          style={{ cursor: isSelected ? 'move' : 'pointer' }}
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
            if (isSelected && drawingMode !== 'polygon') {
              const touch = e.touches[0];
              startDraggingDrawing(drawing, {
                ...e,
                clientX: touch.clientX,
                clientY: touch.clientY,
                stopPropagation: () => e.stopPropagation()
              });
            }
          }}
          style={{ cursor: isSelected ? 'move' : 'pointer' }}
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
      <g key={drawing.id} style={{ pointerEvents: drawingMode === 'polygon' ? 'none' : 'all' }}>
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
            if (isSelected && drawingMode !== 'polygon') {
              const touch = e.touches[0];
              startDraggingDrawing(drawing, {
                ...e,
                clientX: touch.clientX,
                clientY: touch.clientY,
                stopPropagation: () => e.stopPropagation()
              });
            }
          }}
          style={{ cursor: isSelected ? 'move' : 'pointer' }}
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

  const renderOval = (drawing) => {
    // Use dragPreview if this drawing is being dragged
    const drawingToRender = (isDraggingDrawing && selectedDrawing?.id === drawing.id && dragPreview) ? dragPreview : drawing;
    
    const isSelected = selectedDrawing?.id === drawing.id;
    const isDragging = isDraggingDrawing && isSelected;
    
    const rx = drawingToRender.width / 2;
    const ry = drawingToRender.height / 2;
    const cx = drawingToRender.x + rx;
    const cy = drawingToRender.y + ry;
    
    return (
      <g key={drawing.id} style={{ pointerEvents: drawingMode === 'polygon' ? 'none' : 'all' }}>
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="rgba(255, 87, 34, 0.1)"
          stroke={isSelected ? "#FF9800" : "#FF5722"}
          strokeWidth={isSelected ? "3" : "2"}
          strokeDasharray="5,5"
          opacity={isDragging ? 0.7 : 1}
          onClick={(e) => handleDrawingClick(drawing, e)}
          onMouseDown={(e) => startDraggingDrawing(drawing, e)}
          onTouchStart={(e) => {
            if (isSelected && drawingMode !== 'polygon') {
              const touch = e.touches[0];
              startDraggingDrawing(drawing, {
                ...e,
                clientX: touch.clientX,
                clientY: touch.clientY,
                stopPropagation: () => e.stopPropagation()
              });
            }
          }}
          style={{ cursor: isSelected ? 'move' : 'pointer' }}
        />
        {isSelected && !isDragging && (
          <>
            <circle cx={cx - rx} cy={cy} r="4" fill="#FF9800" stroke="white" strokeWidth="1" />
            <circle cx={cx + rx} cy={cy} r="4" fill="#FF9800" stroke="white" strokeWidth="1" />
            <circle cx={cx} cy={cy - ry} r="4" fill="#FF9800" stroke="white" strokeWidth="1" />
            <circle cx={cx} cy={cy + ry} r="4" fill="#FF9800" stroke="white" strokeWidth="1" />
          </>
        )}
      </g>
    );
  };

  const renderPolygon = (drawing) => {
    // Use dragPreview if this drawing is being dragged
    const drawingToRender = (isDraggingDrawing && selectedDrawing?.id === drawing.id && dragPreview) ? dragPreview : drawing;
    
    const isSelected = selectedDrawing?.id === drawing.id;
    const isDragging = isDraggingDrawing && isSelected;
    
    const pointsString = drawingToRender.points.map(p => `${p.x},${p.y}`).join(' ');
    
    return (
      <g key={drawing.id} style={{ pointerEvents: drawingMode === 'polygon' ? 'none' : 'all' }}>
        <polygon
          points={pointsString}
          fill="rgba(255, 87, 34, 0.1)"
          stroke={isSelected ? "#FF9800" : "#FF5722"}
          strokeWidth={isSelected ? "3" : "2"}
          strokeDasharray="5,5"
          opacity={isDragging ? 0.7 : 1}
          onClick={(e) => handleDrawingClick(drawing, e)}
          onMouseDown={(e) => startDraggingDrawing(drawing, e)}
          onTouchStart={(e) => {
            if (isSelected && drawingMode !== 'polygon') {
              const touch = e.touches[0];
              startDraggingDrawing(drawing, {
                ...e,
                clientX: touch.clientX,
                clientY: touch.clientY,
                stopPropagation: () => e.stopPropagation()
              });
            }
          }}
          style={{ cursor: isSelected ? 'move' : 'pointer' }}
        />
        {isSelected && !isDragging && drawingToRender.points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#FF9800"
            stroke="white"
            strokeWidth="1"
          />
        ))}
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
          ↗
        </button>
        <button
          className={`tool-btn ${drawingMode === 'box' ? 'active' : ''}`}
          onClick={() => setDrawingMode(drawingMode === 'box' ? null : 'box')}
        >
          ⬜
        </button>
        <button
          className={`tool-btn ${drawingMode === 'oval' ? 'active' : ''}`}
          onClick={() => setDrawingMode(drawingMode === 'oval' ? null : 'oval')}
        >
          ⭕
        </button>
        <button
          className={`tool-btn ${drawingMode === 'polygon' ? 'active' : ''}`}
          onClick={() => {
            if (drawingMode === 'polygon') {
              setDrawingMode(null);
              setPolygonPoints([]);
            } else {
              setDrawingMode('polygon');
            }
          }}
        >
          ◇{polygonPoints.length > 0 && ` ${polygonPoints.length}/4`}
        </button>
        {drawingMode === 'polygon' && polygonPoints.length > 0 && (
          <button
            className="cancel-polygon-btn"
            onClick={() => {
              setPolygonPoints([]);
              setDrawingMode(null);
            }}
          >
            Avbryt
          </button>
        )}
        <button
          className="clear-drawings-btn"
          onClick={() => onAddDrawing({ type: 'clear' })}
        >
          Slett
        </button>
        <button
          className={`delete-selected-btn ${!selectedDrawing ? 'disabled' : ''}`}
          onClick={() => {
            if (selectedDrawing) {
              onAddDrawing({ type: 'delete', id: selectedDrawing.id });
              setSelectedDrawing(null);
            }
          }}
          disabled={!selectedDrawing}
        >
          Valgt
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
        if (drawing.type === 'oval') return renderOval(drawing);
        if (drawing.type === 'polygon') return renderPolygon(drawing);
        return null;
      })}
      
      {isDrawing && drawingMode === 'arrow' && currentPath && (
        <path
          d={currentPath}
          stroke="#FF5722"
          strokeWidth="2"
          fill="none"
          opacity="0.7"
          pointerEvents="none"
        />
      )}
      
      {isDrawing && drawingMode === 'box' && startPoint && currentPath && typeof currentPath === 'object' && (
        <rect
          x={currentPath.x}
          y={currentPath.y}
          width={currentPath.width}
          height={currentPath.height}
          fill="rgba(255, 87, 34, 0.1)"
          stroke="#FF5722"
          strokeWidth="2"
          strokeDasharray="5,5"
          opacity="0.7"
          pointerEvents="none"
        />
      )}
      
      {isDrawing && drawingMode === 'oval' && startPoint && currentPath && typeof currentPath === 'object' && (
        <ellipse
          cx={currentPath.x + currentPath.width / 2}
          cy={currentPath.y + currentPath.height / 2}
          rx={currentPath.width / 2}
          ry={currentPath.height / 2}
          fill="rgba(255, 87, 34, 0.1)"
          stroke="#FF5722"
          strokeWidth="2"
          strokeDasharray="5,5"
          opacity="0.7"
          pointerEvents="none"
        />
      )}
      
      {drawingMode === 'polygon' && polygonPoints.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r="4"
          fill="#FF5722"
          stroke="white"
          strokeWidth="2"
          pointerEvents="none"
        />
      ))}
      
      {drawingMode === 'polygon' && polygonPoints.length >= 2 && (
        <polyline
          points={polygonPoints.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="#FF5722"
          strokeWidth="2"
          strokeDasharray="5,5"
          opacity="0.7"
          pointerEvents="none"
        />
      )}
      
      {drawingMode === 'polygon' && polygonPoints.length === 3 && (
        <line
          x1={polygonPoints[2].x}
          y1={polygonPoints[2].y}
          x2={polygonPoints[0].x}
          y2={polygonPoints[0].y}
          stroke="#FF5722"
          strokeWidth="2"
          strokeDasharray="5,5"
          opacity="0.7"
          pointerEvents="none"
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