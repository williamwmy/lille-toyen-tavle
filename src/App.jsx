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
  const [currentSport, setCurrentSport] = useState(() => {
    return localStorage.getItem('selectedSport') || 'football'
  })
  const [showMenu, setShowMenu] = useState(false)
  const [savedPositions, setSavedPositions] = useState(() => {
    const saved = localStorage.getItem('savedPositions')
    return saved ? JSON.parse(saved) : { football: [], volleyball: [] }
  })
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [saveName, setSaveName] = useState('')

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
    // For named players, check if already on pitch
    if (player.name && playersOnPitch.some(p => p.name === player.name && p.name !== '')) {
      return; // Don't add if named player already exists
    }
    
    const playerOnPitch = {
      ...player,
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
    localStorage.setItem('selectedSport', sport)
    setShowMenu(false)
    // Reset ball position based on sport
    setBallPosition(sport === 'volleyball' ? { x: 180, y: 200 } : { x: 180, y: 210 })
  }

  const saveCurrentPosition = () => {
    if (!saveName.trim()) return
    
    const currentPosition = {
      id: Date.now(),
      name: saveName.trim(),
      date: new Date().toISOString(),
      players: playersOnPitch,
      ballPosition: ballPosition,
      drawings: drawings
    }
    
    const newSavedPositions = { ...savedPositions }
    const sportPositions = newSavedPositions[currentSport]
    
    // Limit to 8 saves per sport
    if (sportPositions.length >= 8) {
      sportPositions.shift() // Remove oldest
    }
    
    sportPositions.push(currentPosition)
    setSavedPositions(newSavedPositions)
    localStorage.setItem('savedPositions', JSON.stringify(newSavedPositions))
    
    setSaveName('')
    setShowSaveDialog(false)
    setShowMenu(false)
  }

  const loadPosition = (position) => {
    setPlayersOnPitch(position.players)
    setBallPosition(position.ballPosition)
    setDrawings(position.drawings)
    setShowLoadDialog(false)
    setShowMenu(false)
  }

  const deletePosition = (positionId) => {
    const newSavedPositions = { ...savedPositions }
    newSavedPositions[currentSport] = newSavedPositions[currentSport].filter(p => p.id !== positionId)
    setSavedPositions(newSavedPositions)
    localStorage.setItem('savedPositions', JSON.stringify(newSavedPositions))
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
            <div className="menu-divider"></div>
            <button 
              className="menu-item"
              onClick={() => {
                setShowSaveDialog(true)
                setShowMenu(false)
              }}
            >
              💾 Lagre posisjon
            </button>
            <button 
              className="menu-item"
              onClick={() => {
                setShowLoadDialog(true)
                setShowMenu(false)
              }}
              disabled={savedPositions[currentSport].length === 0}
            >
              📂 Last posisjon
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
          playersOnPitch={playersOnPitch}
        />
      </main>
      
      <div className="version-info">
        v1.7.0
      </div>

      {/* Save Position Dialog */}
      {showSaveDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>Lagre posisjon</h3>
            <input
              type="text"
              placeholder="Navn på posisjon..."
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              maxLength={40}
              autoFocus
            />
            <div className="dialog-buttons">
              <button 
                onClick={saveCurrentPosition}
                disabled={!saveName.trim()}
                className="save-btn"
              >
                Lagre
              </button>
              <button 
                onClick={() => {
                  setShowSaveDialog(false)
                  setSaveName('')
                }}
                className="cancel-btn"
              >
                Avbryt
              </button>
            </div>
            <p className="dialog-info">
              {savedPositions[currentSport].length}/8 posisjoner lagret for {currentSport === 'football' ? 'fotball' : 'volleyball'}
            </p>
          </div>
        </div>
      )}

      {/* Load Position Dialog */}
      {showLoadDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>Last posisjon</h3>
            <div className="saved-positions-list">
              {savedPositions[currentSport].map(position => (
                <div key={position.id} className="saved-position-item">
                  <div className="position-info">
                    <div className="position-name">{position.name}</div>
                    <div className="position-date">
                      {new Date(position.date).toLocaleDateString('no-NO')}
                    </div>
                  </div>
                  <div className="position-actions">
                    <button 
                      onClick={() => loadPosition(position)}
                      className="load-btn"
                    >
                      Last
                    </button>
                    <button 
                      onClick={() => deletePosition(position.id)}
                      className="delete-btn"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="dialog-buttons">
              <button 
                onClick={() => setShowLoadDialog(false)}
                className="cancel-btn"
              >
                Lukk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
