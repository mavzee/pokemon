import React from 'react';
import './PokemonDetails.css'; // Ensure this CSS file is created and imported

const typeColors = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

const PokemonDetails = ({ details, onClose, isLoading }) => {
  if (isLoading) return <div className="loading">Loading...</div>;
  if (!details) return null;

  // Construct the background image URL using the Pokémon's name
  const backgroundImageUrl = `https://img.pokemondb.net/artwork/chibi/${details.name.toLowerCase()}.jpg`;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pokemon-name"
    >
      <div
        className="modal"
        style={{
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <button
          className="close-btn"
          onClick={onClose}
          aria-label="Close"
          title="Close"
        >
          ✖
        </button>
        <h2 id="pokemon-name" className="pokemon-name">{details.name}</h2>

        <div className="type-icons">
          {details.types?.map((type) => (
            <div
              key={type}
              className="type-badge"
              style={{ backgroundColor: typeColors[type.toLowerCase()] || '#777' }}
            >
              <img
                src={`https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${type.toLowerCase()}.svg`}
                alt={type}
                title={type}
                className="type-icon"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'fallback-icon.svg'; // Replace with your fallback icon path
                }}
              />
              <span className="type-name">{type}</span>
            </div>
          ))}
        </div>

        <div className="stats">
          <div className="stat-box">
            <strong>HP</strong>
            <div>{details.hp}</div>
          </div>
          <div className="stat-box">
            <strong>Attack</strong>
            <div>{details.attack}</div>
          </div>
          <div className="stat-box">
            <strong>Speed</strong>
            <div>{details.speed}</div>
          </div>
        </div>
        <p className="description">{details.description}</p>
      </div>
    </div>
  );
};

export default PokemonDetails;
