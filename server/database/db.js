// Database connection logic

const { MongoClient } = require("mongodb");
const { retryApiCall, accessSecret } = require("../utils/apiutils.js");

let client;
let dbName = "EthrHub";

async function getClient() {
  if (!client || !client.topology.isConnected()) {
    const DB_URI = await retryApiCall(() => accessSecret("DB_URI"));
    client = new MongoClient(DB_URI);
    await retryApiCall(() => client.connect());
    console.log("Connected to the database");
  }
  return client.db(dbName);
}

async function closeConnection() {
  if (client) {
    await client.close();
    console.log("Database connection closed");
  }
}

module.exports = { getClient, closeConnection };
