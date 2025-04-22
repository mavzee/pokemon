import React, { useState, useEffect } from 'react';
import axios from 'axios';

const fetchPokemonStats = async (name) => {
  const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
  const stats = res.data.stats.reduce((acc, stat) => {
    acc[stat.stat.name] = stat.base_stat;
    return acc;
  }, {});
  return {
    name,
    hp: stats.hp,
    attack: stats.attack,
    speed: stats.speed,
    image: res.data.sprites.other['official-artwork'].front_default,
  };
};

const Battle = ({ userTeam, enemyTeam, addBattleToHistory }) => {
  const [userPick, setUserPick] = useState('');
  const [enemyPick, setEnemyPick] = useState('');
  const [result, setResult] = useState(null);

  const handleBattle = async () => {
    if (!userPick || !enemyPick) return;

    const [userStats, enemyStats] = await Promise.all([
      fetchPokemonStats(userPick),
      fetchPokemonStats(enemyPick),
    ]);

    let userPoints = 0;
    let enemyPoints = 0;

    if (userStats.hp > enemyStats.hp) userPoints++; else if (enemyStats.hp > userStats.hp) enemyPoints++;
    if (userStats.attack > enemyStats.attack) userPoints++; else if (enemyStats.attack > userStats.attack) enemyPoints++;
    if (userStats.speed > enemyStats.speed) userPoints++; else if (enemyStats.speed > userStats.speed) enemyPoints++;

    const winner =
      userPoints > enemyPoints
        ? userStats.name
        : enemyPoints > userPoints
        ? enemyStats.name
        : 'Draw';

    const battleResult = {
      user: userStats,
      enemy: enemyStats,
      winner,
    };

    setResult(battleResult);
    addBattleToHistory(battleResult);
  };

  return (
    <div className="battle-container">
      <h2>Battle Arena</h2>

      <div className="battle-select">
        <select value={userPick} onChange={e => setUserPick(e.target.value)}>
          <option value="">Select from My Team</option>
          {userTeam.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <select value={enemyPick} onChange={e => setEnemyPick(e.target.value)}>
          <option value="">Select from Enemy Team</option>
          {enemyTeam.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <button onClick={handleBattle}>Start Battle</button>
      </div>

      {result && (
        <div className="battle-result">
          <h3>Winner: {result.winner}</h3>
          <table>
            <thead>
              <tr>
                <th>Stat</th>
                <th>{result.user.name}</th>
                <th>{result.enemy.name}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>HP</td>
                <td>{result.user.hp}</td>
                <td>{result.enemy.hp}</td>
              </tr>
              <tr>
                <td>Attack</td>
                <td>{result.user.attack}</td>
                <td>{result.enemy.attack}</td>
              </tr>
              <tr>
                <td>Speed</td>
                <td>{result.user.speed}</td>
                <td>{result.enemy.speed}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Battle;
