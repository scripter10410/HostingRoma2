// core.js
const { Client, GatewayIntentBits, Collection, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

// Inline /ssu command
const ssuCommand = {
  data: new SlashCommandBuilder()
    .setName('ssu')
    .setDescription('Trigger emergency alert mode')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(interaction) {
    const guild = interaction.guild;
    const emergencyChannel = interaction.channel;

    // Lock down all other channels
    guild.channels.cache.forEach(channel => {
      if (channel.id !== emergencyChannel.id && channel.isTextBased()) {
        channel.permissionOverwrites.edit(guild.roles.everyone, {
          SendMessages: false,
          ViewChannel: false,
        }).catch(err => console.error(`Failed to lock ${channel.name}:`, err));
      }
    });

    // Emergency announcement
    const message = `@here\n\n# 🚨 JOIN THIS SERVER 🚨\n**EVACUATE CURRENT — WE ARE NUKE**\n\nLINK = https://discord.gg/XZxdJHGD2W`;

    try {
      await emergencyChannel.send(message);
      await emergencyChannel.send('⚠️ Emergency mode activated. All other channels are locked.');
      await interaction.reply({ content: '✅ Emergency alert sent.', ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Could not send the emergency alert.', ephemeral: true });
    }
  },
};

client.commands.set(ssuCommand.data.name, ssuCommand);

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Handle slash commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: '❌ Error executing command.', ephemeral: true });
    } else {
      await interaction.reply({ content: '❌ Error executing command.', ephemeral: true });
    }
  }
});

// 🛑 Auto‑moderation for "the"
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // Check if message contains "the" (case‑insensitive, whole word)
  if (/\bthe\b/i.test(message.content)) {
    try {
      await message.reply(
        `Oh you can’t say "the" here 😅\nTry again with another conversation!\nOr join https://discord.gg/XZxdJHGD2W for a free text server`
      );
    } catch (err) {
      console.error('Failed to send moderation reply:', err);
    }
  }
});

client.login(process.env.TOKEN);
