import fs from "fs"

// Create initial db.json file with the correct structure
const initialDb = {
  teams: [],
  battles: [],
}

// Write the initial db.json file
fs.writeFileSync("db.json", JSON.stringify(initialDb, null, 2))
console.log("Created initial db.json file with the correct structure")

console.log("\nSetup complete! Make sure to:")
console.log("1. Start json-server with: npx json-server --watch db.json --port 3001")
console.log("2. Start your React app with: npm start")
