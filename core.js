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

client.commands = new Collection();

// Example command
client.commands.set('importance', {
  execute: async (interaction) => {
    try {
      if (interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
        // ✅ First response
        await interaction.reply({ content: "📢 Importance command executed successfully!" });
      } else {
        await interaction.reply({ content: "❌ You don’t have permission to use this command." });
      }
    } catch (err) {
      console.error("❌ Command error:", err);

      // ✅ If already replied, use editReply or followUp
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: "⚠️ There was an error executing that command.", flags: 64 });
      } else {
        await interaction.reply({ content: "⚠️ There was an error executing that command.", flags: 64 });
      }
    }
  },
});

client.once('clientReady', (c) => {
  console.log(`🤖 Logged in as ${c.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  await command.execute(interaction);
});

client.login(process.env.TOKEN).catch(err => {
  console.error("❌ Failed to login. Check your TOKEN in .env", err);
});
