import express from "express";
import "dotenv/config";
import sqlite from 'better-sqlite3';

import { Airfryer } from "./helpers/airfryer";
import { AH } from "./helpers/ah";
import { TokenRepository } from "./repositories/tokenRepository";
import { slackRoutes } from "./routes/slack";
import { tokenRoutes } from "./routes/token";
import { SlackFunctions } from "./helpers/slackFunctions";

const app = express();
app.use(express.json());
app.use(express.urlencoded());

// Function to initialize and start the app
async function initializeApp() {
  try {
    // Init db
    const db = sqlite("./slackbot.db");

    const tokenRepository = new TokenRepository(db);
    await tokenRepository.initialize();

    // Helpers
    const slackFunctions = new SlackFunctions();
    const airfryer = new Airfryer();
    const ah = new AH(tokenRepository, slackFunctions);

    // Start routes
    slackRoutes(app, slackFunctions, airfryer, ah);
    tokenRoutes(app, tokenRepository);

    // Optionally: Start listening for requests here if needed
    // app.listen(port, () => console.log(`Server running on port ${port}`));

  } catch (error) {
    console.error("Failed to initialize application:", error);
    process.exit(1); // Exit if initialization fails
  }
}

// Call the async IIFE
initializeApp();
