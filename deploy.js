// deploy.js
require('dotenv').config();
const { REST, Routes } = require('discord.js');

// Define your commands
const commands = [
  {
    name: 'importance',
    description: 'Mark a ticket with importance level',
  },
  {
    name: 'ssu',
    description: 'Start a server startup announcement',
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🚀 Started refreshing application (/) commands.');

    // ✅ Guild-specific registration (instant updates in your server)
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );

    console.log('✅ Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
})();
