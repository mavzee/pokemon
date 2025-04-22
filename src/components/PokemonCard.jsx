import React from "react";

export default function PokemonCard({ name, sprite, stats }) {
  return (
    <div className="bg-gray-900 text-white rounded-xl shadow-lg p-4 w-64 border border-yellow-500">
      <h2 className="text-xl font-bold capitalize text-center">{name}</h2>
      <img src={sprite} alt={name} className="w-24 h-24 mx-auto my-4" />
      <ul className="text-sm">
        <li>HP: {stats.hp}</li>
        <li>Attack: {stats.atk}</li>
        <li>Speed: {stats.spd}</li>
      </ul>
    </div>
  );
}
