const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sendmessage')
        .setDescription('Send a custom embed message in the channel.')
        .addStringOption(option =>
            option.setName('content')
                .setDescription('Regular text displayed alongside the embed')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Title of the embed')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Description of the embed')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Hex color code (e.g., #ff0000 for red)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('image')
                .setDescription('URL of an image')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('thumbnail')
                .setDescription('URL of a thumbnail image')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('footer')
                .setDescription('Text for the footer')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('footericon')
                .setDescription('URL of an icon for the footer')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('author')
                .setDescription('Name of the author')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('authoricon')
                .setDescription('URL of an icon for the author')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('authorurl')
                .setDescription('URL linked to the author')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('timestamp')
                .setDescription('Add a timestamp (true/false)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // Only users with this permission can use the command

    async execute(interaction) {
        try {
            const content = interaction.options.getString('content') || '';
            const title = interaction.options.getString('title');
            const description = interaction.options.getString('description');
            let color = interaction.options.getString('color') || '#0099ff'; // Default blue
            const image = interaction.options.getString('image');
            const thumbnail = interaction.options.getString('thumbnail');
            const footer = interaction.options.getString('footer');
            const footerIcon = interaction.options.getString('footericon');
            const author = interaction.options.getString('author');
            const authorIcon = interaction.options.getString('authoricon');
            const authorUrl = interaction.options.getString('authorurl');
            const timestamp = interaction.options.getBoolean('timestamp');

            // Validate hex color
            if (!/^#?[0-9A-Fa-f]{6}$/.test(color)) {
                color = '#0099ff'; // Default to blue if invalid color is given
            }
            if (!color.startsWith('#')) {
                color = `#${color}`;
            }

            // Create the embed
            const embed = new EmbedBuilder().setColor(color);

            if (title) embed.setTitle(title);
            if (description) embed.setDescription(description);
            if (image) embed.setImage(image);
            if (thumbnail) embed.setThumbnail(thumbnail);
            if (footer) embed.setFooter({ text: footer, iconURL: footerIcon || null });
            if (author) embed.setAuthor({ name: author, iconURL: authorIcon || null, url: authorUrl || null });
            if (timestamp) embed.setTimestamp();

            // Prevent sending an empty embed
            if (!title && !description && !image && !thumbnail && !footer && !author) {
                return await interaction.reply({ content: 'You must provide at least one embed field.', ephemeral: true });
            }

            // Send the message
            await interaction.reply({ content, embeds: [embed] });
        } catch (error) {
            console.error('Error sending embed:', error);
            await interaction.reply({ content: 'An error occurred while sending the embed.', ephemeral: true });
        }
    }
};