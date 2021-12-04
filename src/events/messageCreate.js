module.exports = {
    name: 'messageCreate',
    /** @param {import('discord.js/typings').Message} message */
    async execute(message) {
        try {
            if (message.channelId !== '755904515080847493') return;
            const messages = await message.channel.messages.fetch({ limit: 2 });

            const newMessage = messages.first();
            const oldMessage = messages.last();

            const newValue = parseInt(newMessage.content);
            const currentValue = parseInt(oldMessage.content);

            if (isNaN(newValue) || newMessage.content.match(/\D/g) || newValue <= currentValue || newMessage.author === oldMessage.author) {
                await message.delete();
            }

        } catch (err) {
            logger.error(err);
        }
    }
};