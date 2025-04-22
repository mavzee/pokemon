import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BattleHistory.css';

const BattleHistory = ({ onBack }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:3001/battles');
      setHistory(res.data.reverse());
    } catch (err) {
      console.error('Error loading battle history', err);
    }
  };

  const getStatColor = (userStat, enemyStat) => {
    if (userStat > enemyStat) return ['green', 'red'];
    if (userStat < enemyStat) return ['red', 'green'];
    return ['gray', 'gray'];
  };

  return (
    <div className="history-container">
        <h2 style={{ color: 'white', fontSize: '1.5rem', textAlign: 'center' }}>
    Battle History
  </h2>
      <button onClick={onBack}>Back</button>
      <table className="history-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User Pokémon</th>
            <th>Enemy Pokémon</th>
            <th>HP</th>
            <th>Attack</th>
            <th>Speed</th>
            <th>Winner</th>
          </tr>
        </thead>
        <tbody>
          {history.map(battle => {
            const [hpColorUser, hpColorEnemy] = getStatColor(battle.userPokemon.hp, battle.enemyPokemon.hp);
            const [attColorUser, attColorEnemy] = getStatColor(battle.userPokemon.attack, battle.enemyPokemon.attack);
            const [spdColorUser, spdColorEnemy] = getStatColor(battle.userPokemon.speed, battle.enemyPokemon.speed);

            return (
              <tr key={battle.id}>
                <td>{new Date(battle.timestamp).toLocaleString()}</td>
                <td>{battle.userPokemon.name}</td>
                <td>{battle.enemyPokemon.name}</td>
                <td>
                  <span className={`stat ${hpColorUser}`}>{battle.userPokemon.hp}</span> / 
                  <span className={`stat ${hpColorEnemy}`}> {battle.enemyPokemon.hp}</span>
                </td>
                <td>
                  <span className={`stat ${attColorUser}`}>{battle.userPokemon.attack}</span> / 
                  <span className={`stat ${attColorEnemy}`}> {battle.enemyPokemon.attack}</span>
                </td>
                <td>
                  <span className={`stat ${spdColorUser}`}>{battle.userPokemon.speed}</span> / 
                  <span className={`stat ${spdColorEnemy}`}> {battle.enemyPokemon.speed}</span>
                </td>
                <td>{battle.winner}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BattleHistory;
