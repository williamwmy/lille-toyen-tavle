import React, { useState, useEffect } from 'react';
import DraggablePlayer from './DraggablePlayer';
import './PlayerRoster.css';

const PlayerRoster = ({ onPlayerSelect, maxPlayers = 12, sportType = 'football' }) => {
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const savedPlayers = localStorage.getItem('footballPlayers');
    if (savedPlayers) {
      setPlayers(JSON.parse(savedPlayers));
    }
  }, []);

  const savePlayersToStorage = (updatedPlayers) => {
    localStorage.setItem('footballPlayers', JSON.stringify(updatedPlayers));
  };

  const addPlayer = () => {
    if (players.length >= maxPlayers) return;
    
    const newPlayer = {
      id: Date.now(),
      name: newPlayerName.trim() || '',
      team: 'blue'
    };
    
    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    savePlayersToStorage(updatedPlayers);
    setNewPlayerName('');
    setShowAddForm(false);
  };

  const removePlayer = (playerId) => {
    const updatedPlayers = players.filter(p => p.id !== playerId);
    setPlayers(updatedPlayers);
    savePlayersToStorage(updatedPlayers);
  };

  const handlePlayerClick = (player) => {
    if (onPlayerSelect) {
      onPlayerSelect(player);
    }
  };


  const addOpponentPlayer = () => {
    const newPlayer = {
      id: Date.now(),
      name: '',
      team: 'red'
    };
    
    if (onPlayerSelect) {
      onPlayerSelect(newPlayer);
    }
  };

  return (
    <div className="player-roster">
      <div className="roster-section">
        <h3>Spillerstall ({players.length}/{maxPlayers})</h3>
        <div className="players-grid">
          {players.map(player => (
            <div key={player.id} className="player-item">
              <div onClick={() => handlePlayerClick(player)}>
                <DraggablePlayer player={player} />
              </div>
              <button 
                className="remove-player-btn"
                onClick={() => removePlayer(player.id)}
                title="Fjern spiller"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        {players.length < maxPlayers && (
          <div className="add-player-section">
            {!showAddForm ? (
              <button 
                className="add-player-btn"
                onClick={() => setShowAddForm(true)}
              >
                + Legg til spiller
              </button>
            ) : (
              <div className="add-player-form">
                <input
                  type="text"
                  placeholder="Spillernavn (valgfritt)"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  maxLength={20}
                />
                <div className="form-buttons">
                  <button onClick={addPlayer}>Legg til</button>
                  <button onClick={() => {
                    setShowAddForm(false);
                    setNewPlayerName('');
                  }}>
                    Avbryt
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="roster-section">
        <h3>Generelle spillere</h3>
        <div className="generic-players">
          <button 
            className="add-generic-btn blue"
            onClick={() => {
              const genericPlayer = {
                id: Date.now(),
                name: '',
                team: 'blue'
              };
              onPlayerSelect(genericPlayer);
            }}
          >
            + Blå spiller
          </button>
          <button 
            className="add-generic-btn red"
            onClick={addOpponentPlayer}
          >
            + Rød spiller
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerRoster;