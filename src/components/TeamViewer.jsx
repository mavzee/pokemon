import React from "react";

export default function TeamViewer({ team }) {
  return (
    <div className="bg-gray-800 text-white p-4 rounded-xl shadow-md mt-4">
      <h2 className="text-xl font-bold mb-4">Your Team (Max 6)</h2>
      <div className="grid grid-cols-3 gap-4">
        {team.map((pokemon, i) => (
          <div key={i} className="bg-gray-700 rounded p-2 text-center">
            <img src={pokemon.sprite} alt={pokemon.name} className="mx-auto w-20 h-20" />
            <p className="capitalize mt-2">{pokemon.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
