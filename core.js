require('dotenv').config();
const {
  Client,
  IntentsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
} = require('discord.js');
const mongoose = require('mongoose');

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMembers],
});

// ---------- MongoDB ----------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));

// ---------- Ready ----------
client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// ---------- Helpers ----------
function inTicketChannel(channel) {
  return channel && channel.name && channel.name.includes('ticket-');
}
function stripEmojiPrefix(name) {
  return name.replace(/^(🟢 |🟠 |🔴 )/, '');
}
function isAdmin(member) {
  return member.roles.cache.has('1439018340281487420');
}

// ---------- Interaction handling ----------
client.on('interactionCreate', async (interaction) => {
  try {
    // -------- /ticket --------
    if (interaction.isChatInputCommand() && interaction.commandName === 'ticket') {
      if (!isAdmin(interaction.member)) {
        await interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        return;
      }

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('🎫 Support Tickets')
            .setDescription('Need help? Click the button below to open a support ticket.')
            .setColor(0x00aaff),
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_ticket').setLabel('Support').setStyle(ButtonStyle.Primary),
          ),
        ],
      });
      return;
    }

    // -------- Button: open_ticket --------
    if (interaction.isButton() && interaction.customId === 'open_ticket') {
      await interaction.deferReply({ ephemeral: true });

      const ticketChannel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: 0,
        permissionOverwrites: [
          { id: interaction.guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
          { id: '1439018340281487420', allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        ],
      });

      await ticketChannel.send(
        `🎫 Support ticket opened by ${interaction.user}\n<@&1439018340281487420> will assist you shortly.`,
      );

      await interaction.editReply({ content: `✅ Ticket created: ${ticketChannel}` });
      return;
    }

    // -------- /close --------
    if (interaction.isChatInputCommand() && interaction.commandName === 'close') {
      if (!isAdmin(interaction.member)) {
        await interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        return;
      }

      const channel = interaction.channel;
      if (!inTicketChannel(channel)) {
        await interaction.reply({ content: '⚠️ This command can only be used inside a ticket channel.', ephemeral: true });
        return;
      }

      await interaction.deferReply();

      const caseId = interaction.user.id;

      const logChannel = interaction.guild.channels.cache.get('1353491486733373443');
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('📝 Ticket Closed')
          .setDescription(
            `Ticket: ${channel.name}\nClosed by: ${interaction.user.tag} (${interaction.user.id})\nCase ID: **${caseId}**`,
          )
          .setColor(0xff0000)
          .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
      }

      await interaction.editReply(`✅ Ticket closed. Case ID: **${caseId}**`);
      await channel.delete();
      return;
    }

    // -------- /importance --------
    if (interaction.isChatInputCommand() && interaction.commandName === 'importance') {
      if (!isAdmin(interaction.member)) {
        await interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        return;
      }

      const channel = interaction.channel;
      if (!inTicketChannel(channel)) {
        await interaction.reply({ content: '⚠️ This command can only be used inside a ticket channel.', ephemeral: true });
        return;
      }

      await interaction.deferReply();

      const level = interaction.options.getString('level');
      const emoji = level === 'admin' ? '🔴' : level === 'quick' ? '🟠' : '🟢';

      const baseName = stripEmojiPrefix(channel.name);
      await channel.setName(`${emoji} ${baseName}`);

      await interaction.editReply(`${emoji} Ticket importance set to **${level.toUpperCase()}**`);
      return;
    }

    // -------- /ssu --------
    if (interaction.isChatInputCommand() && interaction.commandName === 'ssu') {
      if (!isAdmin(interaction.member)) {
        await interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        return;
      }

      await interaction.reply({
        content:
          `# SERVER STARTUP <:roman:1439723688403402813>\n` +
          `Fight, Explore, Forge Your Story in the Province!\n` +
          `@here https://www.roblox.com/games/86345940733879/Roman-Jerusalem`,
        allowedMentions: { parse: ['everyone', 'roles'] },
      });
      return;
    }
  } catch (err) {
    console.error('❌ Command error:', err.message);
  }
});

// ---------- Login ----------
client.login(process.env.TOKEN);
