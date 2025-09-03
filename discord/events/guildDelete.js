import { Events } from 'discord.js';

export default {
  name: Events.GuildDelete,
  async execute(guild) {
    const name = guild?.name || 'Unknown Guild';
    const id = guild?.id || 'Unknown ID';
    console.log(`➖ Removed from guild: ${name} (${id})`);
  }
};
