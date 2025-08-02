import { useState, useEffect } from 'react'
import FootballPitch from './components/FootballPitch'
import VolleyballCourt from './components/VolleyballCourt'
import PlayerRoster from './components/PlayerRoster'
import DraggablePlayer from './components/DraggablePlayer'
import DraggableBall from './components/DraggableBall'
import DrawingTools from './components/DrawingTools'
import './App.css'

function App() {
  const [playersOnPitch, setPlayersOnPitch] = useState([])
  const [ballPosition, setBallPosition] = useState({ x: 180, y: 210 })
  const [drawings, setDrawings] = useState([])
  const [drawingMode, setDrawingMode] = useState(null)
  const [selectedDrawing, setSelectedDrawing] = useState(null)
  const [currentSport, setCurrentSport] = useState('football')
  const [showMenu, setShowMenu] = useState(false)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.app-header')) {
        setShowMenu(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showMenu])

  const handlePlayerSelect = (player) => {
    const playerOnPitch = {
      ...player,
      id: player.id || Date.now(),
      pitchPosition: {
        x: Math.random() * 180 + 80,
        y: Math.random() * 320 + 50
      }
    }
    setPlayersOnPitch(prev => [...prev, playerOnPitch])
  }

  const handlePlayerDragEnd = (playerId, position) => {
    // Check if dragged to trash zone (x: 5-55, y: 370-410)
    if (position.x >= 5 && position.x <= 55 && position.y >= 370 && position.y <= 410) {
      // Remove player from pitch
      setPlayersOnPitch(prev => prev.filter(player => player.id !== playerId))
    } else {
      // Update player position
      setPlayersOnPitch(prev => 
        prev.map(player => 
          player.id === playerId 
            ? { ...player, pitchPosition: position }
            : player
        )
      )
    }
  }

  const handleBallDragEnd = (position) => {
    setBallPosition(position)
  }


  const clearPitch = () => {
    setPlayersOnPitch([])
    setBallPosition({ x: 180, y: 210 })
    setDrawings([])
  }

  const switchSport = (sport) => {
    clearPitch()
    setCurrentSport(sport)
    setShowMenu(false)
    // Reset ball position based on sport
    setBallPosition(sport === 'volleyball' ? { x: 180, y: 200 } : { x: 180, y: 210 })
  }

  const handleAddDrawing = (drawing) => {
    if (drawing.type === 'clear') {
      setDrawings([])
      setSelectedDrawing(null)
    } else if (drawing.type === 'delete') {
      setDrawings(prev => prev.filter(d => d.id !== drawing.id))
      setSelectedDrawing(null)
    } else if (drawing.type === 'update') {
      setDrawings(prev => prev.map(d => d.id === drawing.drawing.id ? drawing.drawing : d))
    } else if (drawing.type === 'select') {
      setSelectedDrawing(drawing.drawing)
    } else {
      setDrawings(prev => [...prev, drawing])
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <button 
            className="hamburger-btn"
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Meny"
          >
            ☰
          </button>
          <h1>{currentSport === 'football' ? '⚽ Lille Tøyen Tavle' : '🏐 Lille Tøyen Tavle'}</h1>
        </div>
        <div className="header-controls">
          <button onClick={clearPitch} className="clear-btn">
            Tøm banen
          </button>
        </div>
        
        {showMenu && (
          <div className="menu-dropdown">
            <button 
              className={`menu-item ${currentSport === 'football' ? 'active' : ''}`}
              onClick={() => switchSport('football')}
            >
              ⚽ Fotball
            </button>
            <button 
              className={`menu-item ${currentSport === 'volleyball' ? 'active' : ''}`}
              onClick={() => switchSport('volleyball')}
            >
              🏐 Volleyball
            </button>
          </div>
        )}
      </header>

      <main className="app-main">
        <div className="pitch-container">
          <DrawingTools 
            onAddDrawing={handleAddDrawing} 
            drawings={drawings} 
            isToolbar={true}
            drawingMode={drawingMode}
            setDrawingMode={setDrawingMode}
            selectedDrawing={selectedDrawing}
            setSelectedDrawing={setSelectedDrawing}
          />
          {currentSport === 'football' ? (
            <FootballPitch>
              {playersOnPitch.map(player => (
                <DraggablePlayer
                  key={player.id}
                  player={player}
                  isOnPitch={true}
                  initialX={player.pitchPosition.x}
                  initialY={player.pitchPosition.y}
                  onDragEnd={handlePlayerDragEnd}
                />
              ))}
              <DraggableBall
                initialX={ballPosition.x}
                initialY={ballPosition.y}
                onDragEnd={handleBallDragEnd}
                sportType={currentSport}
              />
              <DrawingTools 
                onAddDrawing={handleAddDrawing} 
                drawings={drawings}
                drawingMode={drawingMode}
                setDrawingMode={setDrawingMode}
                selectedDrawing={selectedDrawing}
                setSelectedDrawing={setSelectedDrawing}
              />
            </FootballPitch>
          ) : (
            <VolleyballCourt>
              {playersOnPitch.map(player => (
                <DraggablePlayer
                  key={player.id}
                  player={player}
                  isOnPitch={true}
                  initialX={player.pitchPosition.x}
                  initialY={player.pitchPosition.y}
                  onDragEnd={handlePlayerDragEnd}
                />
              ))}
              <DraggableBall
                initialX={ballPosition.x}
                initialY={ballPosition.y}
                onDragEnd={handleBallDragEnd}
                sportType={currentSport}
              />
              <DrawingTools 
                onAddDrawing={handleAddDrawing} 
                drawings={drawings}
                drawingMode={drawingMode}
                setDrawingMode={setDrawingMode}
                selectedDrawing={selectedDrawing}
                setSelectedDrawing={setSelectedDrawing}
              />
            </VolleyballCourt>
          )}
        </div>
        
        <PlayerRoster 
          onPlayerSelect={handlePlayerSelect} 
          maxPlayers={currentSport === 'volleyball' ? 6 : 12}
          sportType={currentSport}
        />
      </main>
      
      <div className="version-info">
        v1.4.0
      </div>
    </div>
  )
}

export default App
