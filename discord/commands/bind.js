import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } from 'discord.js';
import { getDatabase } from '../../db/database.js';
import { SUPPORTED_RESOURCES, COLORS } from '../../config/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('bind')
    .setDescription('Bind a resource to a channel or user')
    .addStringOption(option =>
      option.setName('resource')
        .setDescription('The resource type to bind')
        .setRequired(true)
        .addChoices(
          { name: 'Stats Channel', value: 'stats_channel' },
          { name: 'Leaderboard Channel', value: 'leaderboard_channel' },
          { name: 'Admin (User)', value: 'admin_role' }
        )
    )
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to bind (for stats/leaderboard)')
        .addChannelTypes(
          ChannelType.GuildText,
          ChannelType.GuildAnnouncement
        )
        .setRequired(false)
    )
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to bind (for admin)')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    // Always defer immediately to avoid 3s timeout and use ephemeral once
    await interaction.deferReply({ ephemeral: true });

    const resource = interaction.options.getString('resource');
    const selectedChannel = interaction.options.getChannel('channel');
    const selectedUser = interaction.options.getUser('user');
    const guildId = interaction.guildId;

    try {
      const db = getDatabase();
      
      if (!SUPPORTED_RESOURCES.includes(resource)) {
        const embed = new EmbedBuilder()
          .setColor(COLORS.ERROR)
          .setTitle('❌ Invalid Resource')
          .setDescription(`Supported resources: ${SUPPORTED_RESOURCES.join(', ')}`);
        return await interaction.editReply({ embeds: [embed] });
      }

      if (resource === 'admin_role') {
        if (!selectedUser) {
          const embed = new EmbedBuilder()
            .setColor(COLORS.ERROR)
            .setTitle('❌ Missing User')
            .setDescription('Please provide a user using the "user" option for admin.');
          return await interaction.editReply({ embeds: [embed] });
        }

        await db.run(`
          INSERT INTO guild_settings (guild_id, admin_role_id, updated_at)
          VALUES (?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(guild_id) DO UPDATE SET
            admin_role_id = ?,
            updated_at = CURRENT_TIMESTAMP
        `, [guildId, selectedUser.id, selectedUser.id]);

        const success = new EmbedBuilder()
          .setColor(COLORS.SUCCESS)
          .setTitle('✅ Binding Successful')
          .setDescription(`**admin** has been bound to ${selectedUser}`)
          .setFooter({ text: `Guild ID: ${guildId}` })
          .setTimestamp();

        return await interaction.editReply({ embeds: [success] });
      }

      if (!selectedChannel) {
        const embed = new EmbedBuilder()
          .setColor(COLORS.ERROR)
          .setTitle('❌ Missing Channel')
          .setDescription(`Please provide a channel using the "channel" option for ${resource.replace('_', ' ')}.`);
        return await interaction.editReply({ embeds: [embed] });
      }

      const allowedTypes = new Set([
        ChannelType.GuildText,
        ChannelType.GuildAnnouncement
      ]);
      if (!allowedTypes.has(selectedChannel.type)) {
        const embed = new EmbedBuilder()
          .setColor(COLORS.ERROR)
          .setTitle('❌ Invalid Channel Type')
          .setDescription('Please select a Text or Announcement channel.');
        return await interaction.editReply({ embeds: [embed] });
      }

      const columnName = resource === 'stats_channel' ? 'stats_channel_id' : 'leaderboard_channel_id';

      await db.run(`
        INSERT INTO guild_settings (guild_id, ${columnName}, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(guild_id) DO UPDATE SET
          ${columnName} = ?,
          updated_at = CURRENT_TIMESTAMP
      `, [guildId, selectedChannel.id, selectedChannel.id]);

      const embed = new EmbedBuilder()
        .setColor(COLORS.SUCCESS)
        .setTitle('✅ Binding Successful')
        .setDescription(`**${resource.replace('_', ' ')}** has been bound to ${selectedChannel}`)
        .setFooter({ text: `Guild ID: ${guildId}` })
        .setTimestamp();

      return await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in bind command:', error);
      const embed = new EmbedBuilder()
        .setColor(COLORS.ERROR)
        .setTitle('❌ Binding Failed')
        .setDescription('An error occurred while binding the resource. Please try again.');
      try {
        await interaction.editReply({ embeds: [embed] });
      } catch (_) {
        // noop: interaction might already be acknowledged
      }
    }
  }
};
