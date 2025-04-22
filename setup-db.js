import fs from "fs"
import axios from "axios"

// Create initial db.json file
const initialDb = {
  teams: [
    {
      id: 1,
      userTeam: [],
      enemyTeam: [],
    },
  ],
  battleHistory: [],
}

// Write the initial db.json file
fs.writeFileSync("db.json", JSON.stringify(initialDb, null, 2))
console.log("Created initial db.json file")

// Check if json-server is running
try {
  await axios.get("http://localhost:3001/teams")
  console.log("json-server is running correctly")
} catch (error) {
  console.error("Error: json-server might not be running on port 3001")
  console.log("Please start json-server with: npx json-server --watch db.json --port 3001")
}

console.log("\nSetup complete! Make sure to:")
console.log("1. Start json-server with: npx json-server --watch db.json --port 3001")
console.log("2. Start your React app with: npm start")
