import { Events } from 'discord.js';

export default {
  name: Events.GuildCreate,
  async execute(guild) {
    console.log(`➕ Joined guild: ${guild.name} (${guild.id})`);
  }
};
