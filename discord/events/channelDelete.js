import { Events } from 'discord.js';

export default {
  name: Events.ChannelDelete,
  async execute(channel) {
    try {
      const guildName = channel.guild?.name || 'Unknown Guild';
      console.log(`🗑️ Channel deleted in ${guildName}: #${channel.name} (${channel.id})`);
    } catch (err) {
      console.log('🗑️ Channel deleted');
    }
  }
};
