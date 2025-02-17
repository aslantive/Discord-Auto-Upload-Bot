module.exports = {
    name: 'stop',
    description: 'Stop the upload process',
    async execute(message, args, client) {
        // Optional: Check if the user has the correct permissions
        if (!message.member.permissions.has('MANAGE_MESSAGES')) {
            return await message.reply('You do not have permission to use this command.');
        }

        // Check if an upload process is active
        if (client.isUploading) {
            client.stopUploading = true;
            client.isUploading = false; // Ensure the process stops correctly
            await message.reply('Upload process has been stopped.');
        } else {
            await message.reply('There is currently no active upload process.');
        }
    },
};
