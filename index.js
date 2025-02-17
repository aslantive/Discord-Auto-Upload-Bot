const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const { token, developerId } = require('./config.json'); // Add developerId
const fs = require('fs');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Global variable to manage the upload process
client.isUploading = false;
client.stopUploading = false;

// Load slash commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// Load chat commands
client.chatCommands = new Collection();
const chatCommandFiles = fs.readdirSync('./chatCommands').filter(file => file.endsWith('.js'));

for (const file of chatCommandFiles) {
    const chatCommand = require(`./chatCommands/${file}`);
    client.chatCommands.set(chatCommand.name, chatCommand);
}

// Event: When the bot is ready
client.once('ready', () => {
    console.log(`Bot is online as ${client.user.tag}`);

    // Set activity on startup
    client.user.setActivity('aslan hihi', {
        type: ActivityType.Streaming,
        url: 'https://twitch.tv/aslantive', // Twitch URL
    });
    console.log('Activity set to Streaming: Aslan hihi');

    // Log the number of servers the bot is in
    const serverCount = client.guilds.cache.size;
    console.log(`The bot is in ${serverCount} server(s):`);

    // Log the names of the servers
    client.guilds.cache.forEach((guild) => {
        console.log(`- ${guild.name} (ID: ${guild.id})`);
    });
});

// Event: When an interaction (slash command) is executed
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    // Check if the command is developer-only and if the user is the developer
    if (command.developerOnly && interaction.user.id !== developerId) {
        await interaction.reply({ content: 'You do not have permission to execute this command.', ephemeral: true });
        return;
    }

    try {
        await command.execute(interaction, client); // Pass the client for access to global variables
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'An error occurred while executing this command!', ephemeral: true });
    }
});

// Event: When a message is sent
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const prefix = ',';

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.chatCommands.get(commandName);

    if (!command) return;

    // Check if the command is developer-only and if the user is the developer
    if (command.developerOnly && message.author.id !== developerId) {
        await message.reply('You do not have permission to execute this command.');
        return;
    }

    try {
        await command.execute(message, args, client); // Pass the client for access to global variables
    } catch (error) {
        console.error(error);
        await message.reply('An error occurred while executing this command!');
    }
});

// Start the bot
client.login(token);