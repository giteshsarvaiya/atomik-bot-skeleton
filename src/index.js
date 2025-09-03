import { Client, GatewayIntentBits, Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configure dotenv
dotenv.config();

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import config and database
import { validateConfig } from '../config/env.js';
import { initializeDatabase } from '../db/database.js';

// Validate environment variables
validateConfig();

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

// Collections for commands and events
client.commands = new Collection();
client.events = new Collection();

// Import all commands and events from barrel files
import * as commands from '../discord/commands/index.js';
import * as events from '../discord/events/index.js';

// Register commands
Object.values(commands).forEach(command => {
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    console.log(`✅ Loaded command: ${command.data.name}`);
  } else {
    console.log(`⚠️  Command missing required "data" or "execute" property`);
  }
});

// Register events
Object.values(events).forEach(event => {
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
  
  console.log(`✅ Loaded event: ${event.name}`);
});

// Initialize database
initializeDatabase()
  .then(() => {
    console.log('✅ Database initialized successfully');
    
    // Login to Discord
    client.login(process.env.DISCORD_TOKEN);
  })
  .catch(error => {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  });

// Handle process errors gracefully
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});
