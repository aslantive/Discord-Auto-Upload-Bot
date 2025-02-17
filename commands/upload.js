const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Fixed list of categories
const categories = ['men', 'women', 'cars', 'motorcycles'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('upload')
        .setDescription('Upload images from a selected category to a channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel where the images will be posted')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText) // Allow only text channels
        )
        .addIntegerOption(option =>
            option.setName('cooldown')
                .setDescription('Cooldown between images in seconds (min 10, max 60)')
                .setRequired(true)
                .setMinValue(10)
                .setMaxValue(60)
        )
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Choose a category to upload images from')
                .setRequired(true)
                .addChoices( // Add fixed categories as choices
                    { name: 'Men', value: 'men' },
                    { name: 'Women', value: 'women' },
                    { name: 'Cars', value: 'cars' },
                    { name: 'Motorcycles', value: 'motorcycles' }
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages) // Only users with the correct permissions can use this command
        .setDMPermission(false), // This command cannot be used in direct messages

    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel');
        const cooldown = interaction.options.getInteger('cooldown') * 1000; // Convert to milliseconds
        const category = interaction.options.getString('category');

        // Check if the bot has permission to send messages in the selected channel
        if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.SendMessages)) {
            await interaction.reply({ content: 'I do not have permission to send messages in this channel.', ephemeral: true });
            return;
        }

        await interaction.reply({ 
            content: `Images from the category "${category}" will be uploaded to ${channel.name} with a cooldown of ${cooldown / 1000} seconds. Use \`,stop\` to stop.`, 
            ephemeral: true 
        });

        // Path to the selected category folder
        const categoryDir = path.join(__dirname, '../icons', category);
        console.log('Path to category folder:', categoryDir); // Debugging: Log the path

        // Check if the folder exists
        if (!fs.existsSync(categoryDir)) {
            console.error('The category folder does not exist at the following path:', categoryDir); // Debugging: Log the error
            await interaction.followUp({ content: `The category "${category}" does not exist.`, ephemeral: true });
            return;
        }

        const imageFiles = fs.readdirSync(categoryDir).filter(file => 
            file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.gif')
        );

        if (imageFiles.length === 0) {
            await interaction.followUp({ content: `No images found in the category "${category}".`, ephemeral: true });
            return;
        }

        // Start the upload process
        client.isUploading = true;
        client.stopUploading = false;

        try {
            // Loop through all images and post them in an embed
            for (const file of imageFiles) {
                if (client.stopUploading) break; // Stop the upload process if stopUploading is true

                const imagePath = path.join(categoryDir, file);

                // Create a minimalistic embed
                const embed = new EmbedBuilder()
                    .setImage(`attachment://${file}`) // Use the attachment as an image
                    .setColor(0x000000); // Black color (or use 0xFFFFFF for white)

                // Send the embed with the attachment
                await channel.send({ 
                    embeds: [embed], 
                    files: [imagePath] 
                });

                await new Promise(resolve => setTimeout(resolve, cooldown)); // Wait for the cooldown
            }

            await interaction.followUp({ content: 'Upload process completed.', ephemeral: true });
        } catch (error) {
            console.error('Error uploading images:', error);
            await interaction.followUp({ content: 'An error occurred while uploading the images.', ephemeral: true });
        } finally {
            // Reset variables
            client.isUploading = false;
            client.stopUploading = false;
        }
    },
};