import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { getDatabase } from '../../db/database.js';
import { COLORS } from '../../config/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Show current bindings and their status')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const guildId = interaction.guildId;

    try {
      const db = getDatabase();
      
      // Get current guild settings
      const settings = await db.get(
        'SELECT * FROM guild_settings WHERE guild_id = ?',
        [guildId]
      );

      const embed = new EmbedBuilder()
        .setColor(COLORS.INFO)
        .setTitle('📊 Bot Bindings Status')
        .setDescription(`Current bindings for **${interaction.guild.name}**`)
        .setTimestamp();

      if (!settings) {
        embed.addFields({
          name: '❌ No Settings Found',
          value: 'This guild has no bindings configured. Use `/bind` to set them up.',
          inline: false
        });
      } else {
        // Check stats channel
        const statsChannel = settings.stats_channel_id ? 
          interaction.guild.channels.cache.get(settings.stats_channel_id) : null;
        
        embed.addFields({
          name: '📈 Stats Channel',
          value: statsChannel ? `✅ ${statsChannel}` : `❌ Missing (ID: ${settings.stats_channel_id})`,
          inline: true
        });

        // Check leaderboard channel
        const leaderboardChannel = settings.leaderboard_channel_id ? 
          interaction.guild.channels.cache.get(settings.leaderboard_channel_id) : null;
        
        embed.addFields({
          name: '🏆 Leaderboard Channel',
          value: leaderboardChannel ? `✅ ${leaderboardChannel}` : `❌ Missing (ID: ${settings.leaderboard_channel_id})`,
          inline: true
        });

        // Check admin role
        const adminRole = settings.admin_role_id ? 
          interaction.guild.roles.cache.get(settings.admin_role_id) : null;
        
        embed.addFields({
          name: '👑 Admin Role',
          value: adminRole ? `✅ ${adminRole}` : `❌ Missing (ID: ${settings.admin_role_id})`,
          inline: true
        });

        // Add warnings for missing resources
        const warnings = [];
        if (!statsChannel && settings.stats_channel_id) {
          warnings.push('⚠️ Stats channel is missing - some features may not work');
        }
        if (!leaderboardChannel && settings.leaderboard_channel_id) {
          warnings.push('⚠️ Leaderboard channel is missing - leaderboard feature disabled');
        }
        if (!adminRole && settings.admin_role_id) {
          warnings.push('⚠️ Admin role is missing - admin features disabled');
        }

        if (warnings.length > 0) {
          embed.addFields({
            name: '⚠️ Warnings',
            value: warnings.join('\n'),
            inline: false
          });
        }

        // Add last updated info
        if (settings.updated_at) {
          embed.setFooter({ 
            text: `Last updated: ${new Date(settings.updated_at).toLocaleString()}` 
          });
        }
      }

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in status command:', error);
      
      const embed = new EmbedBuilder()
        .setColor(COLORS.ERROR)
        .setTitle('❌ Status Check Failed')
        .setDescription('An error occurred while checking the status. Please try again.');
      
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
