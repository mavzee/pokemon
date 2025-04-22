import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PokemonList({ onSelect }) {
  const [pokemons, setPokemons] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=151");
      setPokemons(res.data.results);
    };
    fetchData();
  }, []);

  const filtered = pokemons.filter(p => p.name.includes(search.toLowerCase()));

  return (
    <div className="p-4 bg-gray-900 text-white rounded-xl shadow-lg max-w-3xl mx-auto mt-6">
      <input
        type="text"
        placeholder="Search Pokémon"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 rounded mb-4 text-black"
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {filtered.map((poke, i) => (
          <button
            key={i}
            onClick={() => onSelect(poke.name)}
            className="bg-yellow-600 hover:bg-yellow-500 transition px-4 py-2 rounded text-black font-bold capitalize"
          >
            {poke.name}
          </button>
        ))}
      </div>
    </div>
  );
}
