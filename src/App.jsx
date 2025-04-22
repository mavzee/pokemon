"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Swal from 'sweetalert2'

import PokemonDetails from "./components/PokemonDetails"
import "./styles.css"
import "./components/BattleHistory.css"

const App = () => {
  const [allPokemon, setAllPokemon] = useState([])
  const [currentList, setCurrentList] = useState([])
  const [filteredList, setFilteredList] = useState([])
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [userTeam, setUserTeam] = useState([])
  const [enemyTeam, setEnemyTeam] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState("")
  const [selectedEnemy, setSelectedEnemy] = useState("")
  const [battleHistory, setBattleHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [defeatedPokemon, setDefeatedPokemon] = useState([])

  const limit = 20
  const TEAM_API = "http://localhost:3001/teams/1"
  const HISTORY_API = "http://localhost:3001/battleHistory"

  useEffect(() => {
    fetchAllPokemon()
    fetchTeams()
    fetchBattleHistory()
  }, [])

  useEffect(() => {
    paginate()
  }, [allPokemon, page, search])

  const fetchAllPokemon = async () => {
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=10000`)
    setAllPokemon(res.data.results)
  }

  const fetchTeams = async () => {
    try {
      const res = await axios.get(TEAM_API)
      setUserTeam(res.data.userTeam || [])
      setEnemyTeam(res.data.enemyTeam || [])
    } catch (err) {
      console.error("Error fetching teams, creating new team data", err)
      // Initialize teams if they don't exist
      await axios.post("http://localhost:3001/teams", {
        id: 1,
        userTeam: [],
        enemyTeam: [],
      })
      setUserTeam([])
      setEnemyTeam([])
    }
  }

  const fetchBattleHistory = async () => {
    try {
      const res = await axios.get(HISTORY_API)
      setBattleHistory(res.data)
      const defeated = res.data.map((b) => b.loser)
      setDefeatedPokemon(defeated)
    } catch (err) {
      console.error("Error fetching battle history", err)
      setBattleHistory([])
      setDefeatedPokemon([])
    }
  }

  const paginate = async () => {
    let list = allPokemon
    if (search.trim()) {
      list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    }
    const pageList = list.slice((page - 1) * limit, page * limit)
    const loaded = await Promise.all(
      pageList.map(async (poke) => {
        const data = await axios.get(poke.url)
        return {
          name: poke.name,
          image: data.data.sprites.other["official-artwork"].front_default,
          url: poke.url,
        }
      }),
    )
    setCurrentList(loaded)
    setFilteredList(list)
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const showDetails = async (pokemon) => {
    setIsLoading(true)
    try {
      const data = await axios.get(pokemon.url)
      const speciesData = await axios.get(data.data.species.url)
      const descriptionEntry = speciesData.data.flavor_text_entries.find((entry) => entry.language.name === "en")
      const stats = data.data.stats.reduce((acc, stat) => {
        acc[stat.stat.name] = stat.base_stat
        return acc
      }, {})
      const types = data.data.types.map((t) => t.type.name)
      setSelectedPokemon({
        name: pokemon.name,
        hp: stats.hp,
        attack: stats.attack,
        speed: stats.speed,
        types,
        description: descriptionEntry?.flavor_text || "No description available.",
      })
    } catch (err) {
      console.error("Error loading Pokémon details", err)
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to load Pokémon details',
        icon: 'error',
        confirmButtonText: 'OK'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateTeams = async (updatedUser, updatedEnemy) => {
    try {
      await axios.put(TEAM_API, {
        id: 1,
        userTeam: updatedUser,
        enemyTeam: updatedEnemy,
      })
    } catch (err) {
      console.error("Error updating teams", err)
      // If the team doesn't exist yet, create it
      try {
        await axios.post("http://localhost:3001/teams", {
          id: 1,
          userTeam: updatedUser,
          enemyTeam: updatedEnemy,
        })
      } catch (postErr) {
        console.error("Error creating teams", postErr)
      }
    }
  }

  const togglePokemon = (team, setter, pokemon, maxLimit) => {
    return async () => {
      // Check if pokemon is already in team by comparing names
      const isInTeam = team.some((p) => (typeof p === "string" ? p === pokemon.name : p.name === pokemon.name))

      if (isInTeam) {
        // Remove pokemon from team
        const updatedTeam = team.filter((p) => (typeof p === "string" ? p !== pokemon.name : p.name !== pokemon.name))
        setter(updatedTeam)
        await updateTeams(
          setter === setUserTeam ? updatedTeam : userTeam,
          setter === setEnemyTeam ? updatedTeam : enemyTeam,
        )
      } else if (team.length < maxLimit) {
        // Add pokemon to team (ensure it's an object with name and image)
        const pokemonObj =
          typeof pokemon === "string"
            ? { name: pokemon, image: null } // Handle legacy string format
            : { name: pokemon.name, image: pokemon.image }

        const updatedTeam = [...team, pokemonObj]
        setter(updatedTeam)
        await updateTeams(
          setter === setUserTeam ? updatedTeam : userTeam,
          setter === setEnemyTeam ? updatedTeam : enemyTeam,
        )
      } else {
        await Swal.fire({
          title: 'Team Full!',
          text: `You can only have ${maxLimit} Pokémon in this team`,
          icon: 'warning',
          confirmButtonText: 'OK'
        })
      }
    }
  }

  const generateRandomEnemyTeam = async () => {
    setIsLoading(true)
    try {
      // Clear current enemy team
      setEnemyTeam([])

      // Get random Pokémon
      // Use the user's team size, or default to a small team if user team is empty
      const teamSize = userTeam.length > 0 ? userTeam.length : Math.floor(Math.random() * 2) + 1
      const randomIndices = []

      // Generate unique random indices
      while (randomIndices.length < teamSize) {
        const randomIndex = Math.floor(Math.random() * allPokemon.length)
        if (!randomIndices.includes(randomIndex)) {
          randomIndices.push(randomIndex)
        }
      }

      // Get the Pokémon data from the random indices
      const randomTeam = await Promise.all(
        randomIndices.map(async (index) => {
          const pokemonData = await axios.get(allPokemon[index].url)
          return {
            name: allPokemon[index].name,
            image: pokemonData.data.sprites.other["official-artwork"].front_default,
          }
        }),
      )

      // Update state and save to db.json
      setEnemyTeam(randomTeam)
      await updateTeams(userTeam, randomTeam)

      // Auto-select first enemy Pokémon for battle
      if (randomTeam.length > 0) {
        setSelectedEnemy(randomTeam[0].name)
      }

      await Swal.fire({
        title: 'Enemy Team Generated!',
        text: `Generated a random enemy team with ${teamSize} Pokémon to match your team size!`,
        icon: 'success',
        confirmButtonText: 'Cool'
      })
    } catch (err) {
      console.error("Error generating random team", err)
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to generate random team. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBattle = async () => {
    if (!selectedUser || !selectedEnemy) {
      await Swal.fire({
        title: 'Selection Required',
        text: 'Choose Pokémon to fight',
        icon: 'warning',
        confirmButtonText: 'OK'
      })
      return
    }

    try {
      const [userData, enemyData] = await Promise.all([
        axios.get(`https://pokeapi.co/api/v2/pokemon/${selectedUser}`),
        axios.get(`https://pokeapi.co/api/v2/pokemon/${selectedEnemy}`),
      ])

      const getStats = (data) => {
        const stats = data.stats.reduce((acc, stat) => {
          acc[stat.stat.name] = stat.base_stat
          return acc
        }, {})
        return {
          name: data.name,
          hp: stats.hp,
          attack: stats.attack,
          speed: stats.speed,
        }
      }

      const userStats = getStats(userData.data)
      const enemyStats = getStats(enemyData.data)

      let userPoints = 0
      let enemyPoints = 0

      if (userStats.hp > enemyStats.hp) userPoints++
      else if (userStats.hp < enemyStats.hp) enemyPoints++
      if (userStats.attack > enemyStats.attack) userPoints++
      else if (userStats.attack < enemyStats.attack) enemyPoints++
      if (userStats.speed > enemyStats.speed) userPoints++
      else if (userStats.speed < enemyStats.speed) enemyPoints++

      const winner = userPoints > enemyPoints ? userStats.name : enemyStats.name
      const loser = userPoints < enemyPoints ? userStats.name : enemyStats.name

      const battleResult = {
        id: Date.now(),
        userPokemon: userStats,
        enemyPokemon: enemyStats,
        winner,
        loser,
        userPoints,
        enemyPoints,
        timestamp: new Date().toISOString(),
      }

      try {
        await axios.post(HISTORY_API, battleResult)
      } catch (err) {
        // If the endpoint doesn't exist, create it
        console.error("Error posting battle history, attempting to initialize", err)
        try {
          await axios.post("http://localhost:3001/battleHistory", battleResult)
        } catch (postErr) {
          console.error("Failed to initialize battle history", postErr)
        }
      }

      await fetchBattleHistory()

      // Remove the losing Pokémon from its team
      if (winner === userStats.name) {
        // Enemy Pokémon lost
        const updatedEnemyTeam = enemyTeam.filter((p) =>
          typeof p === "string" ? p !== enemyStats.name : p.name !== enemyStats.name,
        )
        setEnemyTeam(updatedEnemyTeam)
        await updateTeams(userTeam, updatedEnemyTeam)
        if (selectedEnemy === enemyStats.name) {
          setSelectedEnemy("")
        }
      } else {
        // User Pokémon lost
        const updatedUserTeam = userTeam.filter((p) =>
          typeof p === "string" ? p !== userStats.name : p.name !== userStats.name,
        )
        setUserTeam(updatedUserTeam)
        await updateTeams(updatedUserTeam, enemyTeam)
        if (selectedUser === userStats.name) {
          setSelectedUser("")
        }
      }

      await Swal.fire({
        title: 'Battle Result!',
        html: `
          <div style="text-align: center;">
            <h3>Winner: ${winner.toUpperCase()}!</h3>
            <div style="display: flex; justify-content: space-around; margin-top: 20px;">
              <div>
                <h4>${userStats.name}</h4>
                <p>HP: ${userStats.hp}</p>
                <p>ATK: ${userStats.attack}</p>
                <p>SPD: ${userStats.speed}</p>
              </div>
              <div>
                <h4>VS</h4>
              </div>
              <div>
                <h4>${enemyStats.name}</h4>
                <p>HP: ${enemyStats.hp}</p>
                <p>ATK: ${enemyStats.attack}</p>
                <p>SPD: ${enemyStats.speed}</p>
              </div>
            </div>
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'OK'
      })
    } catch (err) {
      console.error("Battle error", err)
      await Swal.fire({
        title: 'Battle Error!',
        text: 'An error occurred during the battle. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      })
    }
  }

  const totalPages = Math.ceil(filteredList.length / limit)

  const getStatColor = (userVal, enemyVal) => {
    if (userVal > enemyVal) return ["green", "red"]
    if (userVal < enemyVal) return ["red", "green"]
    return ["gray", "gray"]
  }

  const resetAll = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, reset all!'
    })

    if (result.isConfirmed) {
      try {
        // Reset teams
        await axios.put(TEAM_API, {
          id: 1,
          userTeam: [],
          enemyTeam: [],
        })

        // Reset battle history by replacing it with an empty array
        const historyRes = await axios.get(HISTORY_API)
        await Promise.all(historyRes.data.map((item) => axios.delete(`${HISTORY_API}/${item.id}`)))

        // Update local state
        setUserTeam([])
        setEnemyTeam([])
        setBattleHistory([])
        setDefeatedPokemon([])
        setSelectedUser("")
        setSelectedEnemy("")

        await Swal.fire(
          'Reset!',
          'All data has been reset successfully.',
          'success'
        )
      } catch (err) {
        console.error("Reset error", err)
        await Swal.fire({
          title: 'Error!',
          text: 'Error resetting data.',
          icon: 'error',
          confirmButtonText: 'OK'
        })
      }
    }
  }

  return (
    <div className="container">
      <div className="logo-container">
        <img src="https://media.tenor.com/L5qC_TTSMJMAAAAi/mew-pokemon.gif" alt="Teleporting Mew" className="mew-gif" />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/9/98/International_Pok%C3%A9mon_logo.svg"
          alt="Pokémon Logo"
          className="pokemon-logo"
        />
      </div>

      <input
        type="text"
        className="search-input"
        placeholder="Search Pokémon..."
        value={search}
        onChange={handleSearch}
      />

<div className="teams-container">
  <div className="team-box">
    <h2>My Team ({userTeam.length}/6)</h2>
    {userTeam.map((pokemon) => {
      const name = typeof pokemon === "string" ? pokemon : pokemon.name
      const image = typeof pokemon === "string" ? null : pokemon.image

      return (
        <div key={name} className="team-member">
          {image && (
            <img
              src={image || "/placeholder.svg"}
              alt={name}
              style={{ width: "40px", height: "40px", borderRadius: "50%" }}
            />
          )}
          <span className="pokemon-name">{name}</span>
          <button onClick={togglePokemon(userTeam, setUserTeam, pokemon, 6)}>Remove</button>
          <input
            type="radio"
            name="user"
            checked={selectedUser === name}
            onChange={() => setSelectedUser(name)}
          />
        </div>
      )
    })}
  </div>

  <div className="team-box">
    <h2>Enemy Team ({enemyTeam.length}/6)</h2>
    
    {enemyTeam.map((pokemon) => {
      const name = typeof pokemon === "string" ? pokemon : pokemon.name
      const image = typeof pokemon === "string" ? null : pokemon.image

      return (
        <div key={name} className="team-member">
          {image && (
            <img
              src={image || "/placeholder.svg"}
              alt={name}
              style={{ width: "40px", height: "40px", borderRadius: "50%" }}
            />
          )}
          <span className="pokemon-name">{name}</span>
          <button onClick={togglePokemon(enemyTeam, setEnemyTeam, pokemon, 6)}>Remove</button>
          <input
            type="radio"
            name="enemy"
            checked={selectedEnemy === name}
            onChange={() => setSelectedEnemy(name)}
          />
        </div>
      )
    })}
  </div>
</div>

      <div className="button-group">
        <button onClick={handleBattle}>Battle!</button>
        <button onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? "Hide Battle History" : "View Battle History"}
        </button>
        <button onClick={generateRandomEnemyTeam} className="random-team-button">
          Generate Random Enemy
        </button>
         
      </div>

      {showHistory && (
        <div className="battle-history">
          <h2 style={{ fontSize: "0.6rem", color: "white" }}>Battle History</h2>
          <table className="history-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User Pokémon</th>
                <th>Enemy Pokémon</th>
                <th>HP</th>
                <th>ATK</th>
                <th>SPD</th>
                <th>Winner</th>
              </tr>
            </thead>
            <tbody>
              {battleHistory.map((b) => {
                const [hpUserColor, hpEnemyColor] = getStatColor(b.userPokemon.hp, b.enemyPokemon.hp)
                const [atkUserColor, atkEnemyColor] = getStatColor(b.userPokemon.attack, b.enemyPokemon.attack)
                const [spdUserColor, spdEnemyColor] = getStatColor(b.userPokemon.speed, b.enemyPokemon.speed)
                return (
                  <tr key={b.id}>
                    <td>{new Date(b.timestamp).toLocaleString()}</td>
                    <td>{b.userPokemon.name}</td>
                    <td>{b.enemyPokemon.name}</td>
                    <td>
                      <span className={`stat ${hpUserColor}`}>{b.userPokemon.hp}</span> vs{" "}
                      <span className={`stat ${hpEnemyColor}`}>{b.enemyPokemon.hp}</span>
                    </td>
                    <td>
                      <span className={`stat ${atkUserColor}`}>{b.userPokemon.attack}</span> vs{" "}
                      <span className={`stat ${atkEnemyColor}`}>{b.enemyPokemon.attack}</span>
                    </td>
                    <td>
                      <span className={`stat ${spdUserColor}`}>{b.userPokemon.speed}</span> vs{" "}
                      <span className={`stat ${spdEnemyColor}`}>{b.enemyPokemon.speed}</span>
                    </td>
                    <td>{b.winner}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid">
        {currentList.map((pokemon) => {
          const isInUser = userTeam.some((p) => (typeof p === "string" ? p === pokemon.name : p.name === pokemon.name))
          const isInEnemy = enemyTeam.some((p) =>
            typeof p === "string" ? p === pokemon.name : p.name === pokemon.name,
          )

          return (
            <div key={pokemon.name} className="card">
              <img src={pokemon.image || "/placeholder.svg"} alt={pokemon.name} onClick={() => showDetails(pokemon)} />
              <h3>{pokemon.name}</h3>
              <div className="team-buttons">
                <button
                  disabled={
                    userTeam.some((p) => (typeof p === "string" ? p === pokemon.name : p.name === pokemon.name)) ||
                    (userTeam.length >= 6 &&
                      !userTeam.some((p) => (typeof p === "string" ? p === pokemon.name : p.name === pokemon.name)))
                  }
                  onClick={togglePokemon(userTeam, setUserTeam, pokemon, 6)}
                >
                  {userTeam.some((p) => (typeof p === "string" ? p === pokemon.name : p.name === pokemon.name))
                    ? "Remove"
                    : "Add to  Team"}
                </button>
                <button
                  disabled={
                    enemyTeam.some((p) => (typeof p === "string" ? p === pokemon.name : p.name === pokemon.name)) ||
                    (enemyTeam.length >= 6 &&
                      !enemyTeam.some((p) => (typeof p === "string" ? p === pokemon.name : p.name === pokemon.name)))
                  }
                  onClick={togglePokemon(enemyTeam, setEnemyTeam, pokemon, 6)}
                >
                  {enemyTeam.some((p) => (typeof p === "string" ? p === pokemon.name : p.name === pokemon.name))
                    ? "Remove from Enemy"
                    : "Add to Enemy"}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>

      <PokemonDetails details={selectedPokemon} onClose={() => setSelectedPokemon(null)} isLoading={isLoading} />
    </div>
  )
}

export default App