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
  const appId = process.env.DISCORD_CLIENT_ID;
  const devGuildId = process.env.DEV_GUILD_ID;

  if (devGuildId) {
    // Fast registration to a single guild for instant updates
    console.log(`🔧 Registering commands to dev guild ${devGuildId}...`);
    await rest.put(
      Routes.applicationGuildCommands(appId, devGuildId),
      { body: commands }
    );

    // Also clear global commands to avoid duplicates while developing
    try {
      console.log('🧹 Clearing global commands while DEV_GUILD_ID is set...');
      await rest.put(Routes.applicationCommands(appId), { body: [] });
      console.log('✅ Cleared global commands');
    } catch (clearErr) {
      console.warn('⚠️ Could not clear global commands:', clearErr?.message || clearErr);
    }
  } else {
    // Global registration (can take up to 1 hour to propagate)
    console.log('🌐 Registering commands globally...');
    await rest.put(
      Routes.applicationCommands(appId),
      { body: commands }
    );
  }
}
