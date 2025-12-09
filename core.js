// core.js
require('dotenv').config();
const { Client, GatewayIntentBits, PermissionsBitField, Collection } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// ✅ Command collection
client.commands = new Collection();

// ----------------------
// /importance command
// ----------------------
client.commands.set('importance', {
  execute: async (interaction) => {
    try {
      if (interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
        await interaction.reply({ content: "📢 Importance command executed successfully!" });
      } else {
        await interaction.reply({ content: "❌ You don’t have permission to use /importance", flags: 64 });
      }
    } catch (err) {
      console.error("❌ Importance command error:", err);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: "⚠️ Error executing /importance", flags: 64 });
      } else {
        await interaction.reply({ content: "⚠️ Error executing /importance", flags: 64 });
      }
    }
  },
});

// ----------------------
// /ssu command
// ----------------------
client.commands.set('ssu', {
  execute: async (interaction) => {
    try {
      if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: "❌ You don’t have permission to use /ssu", flags: 64 });
      }

      // ✅ First and only reply (ephemeral confirmation)
      await interaction.reply({ content: "✅ SSU announcement sent!", flags: 64 });

      // Public announcement message
      const announcement = `# 📢 @here Server Startup Update!**\n\nThe server is now starting up. Please join accordingly https://www.roblox.com/games/86345940733879/Roman-Jerusalem#!/about .`;

      // ✅ Send announcement separately (not another reply)
      if (interaction.channel) {
        await interaction.channel.send(announcement);
      } else {
        await interaction.followUp({ content: announcement });
      }
    } catch (err) {
      console.error("❌ SSU command error:", err);

      // ✅ Only use followUp here, never reply again
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: "⚠️ Error executing /ssu", flags: 64 });
      } else {
        await interaction.reply({ content: "⚠️ Error executing /ssu", flags: 64 });
      }
    }
  },
});

// ----------------------
// Bot lifecycle
// ----------------------
client.once('clientReady', (c) => {
  console.log(`🤖 Logged in as ${c.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  await command.execute(interaction);
});

// ✅ Login
client.login(process.env.TOKEN).catch(err => {
  console.error("❌ Failed to login. Check your TOKEN in .env", err);
});
