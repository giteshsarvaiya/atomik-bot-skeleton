import { Events } from 'discord.js';

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // Log every interaction
    try {
      const userTag = interaction.user?.tag || 'Unknown User';
      const guildName = interaction.guild?.name || 'DM/Unknown Guild';
      console.log(`⚡ Interaction received from ${userTag} in ${guildName} (type: ${interaction.type}, command: ${interaction.commandName || 'n/a'})`);
    } catch (_) {
      console.log('⚡ Interaction received');
    }

    // Only handle slash (chat input) commands
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`❌ No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`❌ Error executing command ${interaction.commandName}:`, error);

      // Ensure we respond safely depending on current state
      if (interaction.deferred || interaction.replied) {
        try {
          await interaction.editReply({ content: '❌ There was an error while executing this command!' });
        } catch (_) {
          try {
            await interaction.followUp({ content: '❌ There was an error while executing this command!' });
          } catch (_) {}
        }
      } else {
        try {
          await interaction.reply({ content: '❌ There was an error while executing this command!', ephemeral: true });
        } catch (_) {}
      }
    }
  }
};
