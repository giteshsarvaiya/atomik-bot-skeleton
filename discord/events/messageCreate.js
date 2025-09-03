import { Events } from 'discord.js';

export default {
  name: Events.MessageCreate,
  async execute(message) {
    try {
      const guildName = message.guild?.name || 'DM';
      const authorTag = message.author?.tag || 'Unknown';
      console.log(`💬 Message in ${guildName} by ${authorTag}: ${message.content}`);
    } catch (err) {
      console.log('💬 Message created');
    }
  }
};
