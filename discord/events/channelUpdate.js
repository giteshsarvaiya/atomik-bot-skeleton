import { Events } from 'discord.js';

export default {
  name: Events.ChannelUpdate,
  async execute(oldChannel, newChannel) {
    try {
      const guildName = newChannel.guild?.name || 'Unknown Guild';
      console.log(`♻️ Channel updated in ${guildName}: #${oldChannel.name} -> #${newChannel.name} (${newChannel.id})`);
    } catch (err) {
      console.log('♻️ Channel updated');
    }
  }
};
