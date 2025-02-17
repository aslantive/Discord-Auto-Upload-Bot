module.exports = {
    name: 'ping',
    description: 'Reply with Pong!',
    async execute(message, args) {
        await message.reply('Pong!');
    },
};