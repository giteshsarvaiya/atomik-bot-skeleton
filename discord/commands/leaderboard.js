import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { getDatabase } from '../../db/database.js';
import { COLORS } from '../../config/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Post leaderboard data to the bound leaderboard channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const guildId = interaction.guildId;

    try {
      const db = getDatabase();
      
      // Get current guild settings
      const settings = await db.get(
        'SELECT leaderboard_channel_id FROM guild_settings WHERE guild_id = ?',
        [guildId]
      );

      if (!settings || !settings.leaderboard_channel_id) {
        const embed = new EmbedBuilder()
          .setColor(COLORS.WARNING)
          .setTitle('⚠️ No Leaderboard Channel Bound')
          .setDescription('Use `/bind leaderboard_channel #channel` to set up a leaderboard channel first.');
        
        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // Check if the channel still exists
      const leaderboardChannel = interaction.guild.channels.cache.get(settings.leaderboard_channel_id);
      
      if (!leaderboardChannel) {
        const embed = new EmbedBuilder()
          .setColor(COLORS.ERROR)
          .setTitle('❌ Leaderboard Channel Missing')
          .setDescription(`The bound leaderboard channel (ID: ${settings.leaderboard_channel_id}) no longer exists.\nPlease rebind using \`/bind leaderboard_channel #channel\``);
        
        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // Generate mocked leaderboard data
      const mockData = generateMockLeaderboard();
      
      const leaderboardEmbed = new EmbedBuilder()
        .setColor(COLORS.SUCCESS)
        .setTitle('🏆 Server Leaderboard')
        .setDescription('Top performers this week')
        .addFields(mockData)
        .setFooter({ text: `Generated at ${new Date().toLocaleString()}` })
        .setTimestamp();

      // Post to the bound leaderboard channel
      await leaderboardChannel.send({ embeds: [leaderboardEmbed] });

      // Confirm to the user
      const confirmEmbed = new EmbedBuilder()
        .setColor(COLORS.SUCCESS)
        .setTitle('✅ Leaderboard Posted')
        .setDescription(`Leaderboard has been posted to ${leaderboardChannel}`);

      await interaction.reply({ embeds: [confirmEmbed] });

    } catch (error) {
      console.error('Error in leaderboard command:', error);
      
      const embed = new EmbedBuilder()
        .setColor(COLORS.ERROR)
        .setTitle('❌ Leaderboard Failed')
        .setDescription('An error occurred while posting the leaderboard. Please try again.');
      
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};

/**
 * Generate mocked leaderboard data
 */
function generateMockLeaderboard() {
  const mockUsers = [
    { name: 'Player1', score: 1250, rank: 1 },
    { name: 'Player2', score: 1180, rank: 2 },
    { name: 'Player3', score: 1120, rank: 3 },
    { name: 'Player4', score: 1050, rank: 4 },
    { name: 'Player5', score: 980, rank: 5 }
  ];

  return mockUsers.map(user => ({
    name: `#${user.rank} ${user.name}`,
    value: `Score: ${user.score.toLocaleString()}`,
    inline: true
  }));
}
