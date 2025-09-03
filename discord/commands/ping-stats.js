import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { getDatabase } from '../../db/database.js';
import { COLORS } from '../../config/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping-stats')
    .setDescription('Send a ping to the bound stats channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const guildId = interaction.guildId;

    try {
      const db = getDatabase();
      
      // Get current guild settings
      const settings = await db.get(
        'SELECT stats_channel_id FROM guild_settings WHERE guild_id = ?',
        [guildId]
      );

      if (!settings || !settings.stats_channel_id) {
        const embed = new EmbedBuilder()
          .setColor(COLORS.WARNING)
          .setTitle('⚠️ No Stats Channel Bound')
          .setDescription('Use `/bind stats_channel #channel` to set up a stats channel first.');
        
        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // Check if the channel still exists
      const statsChannel = interaction.guild.channels.cache.get(settings.stats_channel_id);
      
      if (!statsChannel) {
        const embed = new EmbedBuilder()
          .setColor(COLORS.ERROR)
          .setTitle('❌ Stats Channel Missing')
          .setDescription(`The bound stats channel (ID: ${settings.stats_channel_id}) no longer exists.\nPlease rebind using \`/bind stats_channel #channel\``);
        
        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // Send "pong" to the stats channel
      const pingEmbed = new EmbedBuilder()
        .setColor(COLORS.INFO)
        .setTitle('🏓 Pong!')
        .setDescription('Stats channel ping successful')
        .setFooter({ text: `Pinged by ${interaction.user.tag}` })
        .setTimestamp();

      await statsChannel.send({ embeds: [pingEmbed] });

      // Confirm to the user
      const confirmEmbed = new EmbedBuilder()
        .setColor(COLORS.SUCCESS)
        .setTitle('✅ Ping Sent')
        .setDescription(`"Pong" has been sent to ${statsChannel}`);

      await interaction.reply({ embeds: [confirmEmbed] });

    } catch (error) {
      console.error('Error in ping-stats command:', error);
      
      const embed = new EmbedBuilder()
        .setColor(COLORS.ERROR)
        .setTitle('❌ Ping Failed')
        .setDescription('An error occurred while sending the ping. Please try again.');
      
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
