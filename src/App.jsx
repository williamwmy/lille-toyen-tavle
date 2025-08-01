import { useState } from 'react'
import FootballPitch from './components/FootballPitch'
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
    setPlayersOnPitch(prev => 
      prev.map(player => 
        player.id === playerId 
          ? { ...player, pitchPosition: position }
          : player
      )
    )
  }

  const handleBallDragEnd = (position) => {
    setBallPosition(position)
  }


  const clearPitch = () => {
    setPlayersOnPitch([])
    setBallPosition({ x: 180, y: 210 })
    setDrawings([])
  }

  const handleAddDrawing = (drawing) => {
    if (drawing.type === 'clear') {
      setDrawings([])
    } else {
      setDrawings(prev => [...prev, drawing])
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>⚽ Lille Tøyen Tavle</h1>
        <div className="header-controls">
          <button onClick={clearPitch} className="clear-btn">
            Tøm banen
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="pitch-container">
          <DrawingTools 
            onAddDrawing={handleAddDrawing} 
            drawings={drawings} 
            isToolbar={true}
            drawingMode={drawingMode}
            setDrawingMode={setDrawingMode}
          />
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
            />
            <DrawingTools 
              onAddDrawing={handleAddDrawing} 
              drawings={drawings}
              drawingMode={drawingMode}
              setDrawingMode={setDrawingMode}
            />
          </FootballPitch>
          
          {playersOnPitch.length > 0 && (
            <div className="pitch-info">
              <p>Spillere på banen: {playersOnPitch.length}</p>
              <p>Blå: {playersOnPitch.filter(p => p.team === 'blue').length} | 
                 Røde: {playersOnPitch.filter(p => p.team === 'red').length}</p>
            </div>
          )}
        </div>
        
        <PlayerRoster onPlayerSelect={handlePlayerSelect} />
      </main>
      
      <div className="version-info">
        v1.1.0
      </div>
    </div>
  )
}

export default App
