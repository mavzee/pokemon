import React, { useEffect, useState } from "react";
import axios from "axios";

export default function TeamManager() {
  const [availablePokemons, setAvailablePokemons] = useState([]);
  const [yourTeamPokemons, setYourTeamPokemons] = useState([]);

  useEffect(() => {
    const loadAvailable = async () => {
      const res = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=20");
      setAvailablePokemons(res.data.results);
    };

    const loadSavedTeam = async () => {
      const res = await axios.get("http://localhost:3001/teams");
      if (res.data.length > 0) {
        setYourTeamPokemons(res.data[0].pokemons); // Get the first team's pokemons
      }
    };

    loadAvailable();
    loadSavedTeam();
  }, []);

  const saveTeamToServer = async (team) => {
    try {
      // Check if a team already exists
      const res = await axios.get("http://localhost:3001/teams");
      if (res.data.length > 0) {
        // Update existing team
        const teamId = res.data[0].id;
        await axios.put(`http://localhost:3001/teams/${teamId}`, {
          name: "My Team",
          pokemons: team,
        });
      } else {
        // Create new team
        await axios.post("http://localhost:3001/teams", {
          name: "My Team",
          pokemons: team,
        });
      }
    } catch (error) {
      console.error("Error saving team:", error);
    }
  };

  const handleAddToTeam = async (pokemon) => {
    if (yourTeamPokemons.includes(pokemon.name)) {
      return alert("Already in team!");
    }

    const updatedTeam = [...yourTeamPokemons, pokemon.name];
    setYourTeamPokemons(updatedTeam);
    await saveTeamToServer(updatedTeam);
  };

  return (
    <div className="p-6 bg-white text-black max-w-xl mx-auto mt-10 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Available Pokémons</h1>
      <ul className="space-y-2">
        {availablePokemons.map((pokemon) => (
          <li key={pokemon.name} className="flex justify-between items-center border p-2 rounded">
            <span className="capitalize">{pokemon.name}</span>
            <button
              onClick={() => handleAddToTeam(pokemon)}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              Add to Team
            </button>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">Your Team</h2>
      <ul className="list-disc list-inside">
        {yourTeamPokemons.map((name) => (
          <li key={name} className="capitalize">{name}</li>
        ))}
      </ul>
    </div>
  );
}
