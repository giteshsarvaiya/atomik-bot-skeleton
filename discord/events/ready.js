import { Events, REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`✅ ${client.user.tag} is online and ready!`);
    
    try {
      // Register slash commands
      await registerCommands(client);
      console.log('✅ Slash commands registered successfully');
    } catch (error) {
      console.error('❌ Failed to register slash commands:', error);
    }
  }
};

/**
 * Register slash commands with Discord
 */
async function registerCommands(client) {
  const commands = [];
  
  // Import all commands from barrel file
  const commandModules = await import('../commands/index.js');
  
  Object.values(commandModules).forEach(command => {
    if ('data' in command) {
      commands.push(command.data.toJSON());
    }
  });

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  // Register commands globally
  await rest.put(
    Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
    { body: commands }
  );
}
