/**
 * @param {import('../types').Interaction} command
 * @param {import('../types').Utils} utils
 */
module.exports.execute = async (command, utils) => {
    try {
        const memberID = command.data.options[0].value;
        const authorID = command.user.id;
        const guildID = command.guildID;
        const guild = command.client.guilds.cache.get(guildID);
        const member = await guild.members.fetch(memberID);
        const author = await guild.members.fetch(authorID);

        if (!author.hasPermission('MANAGE_NICKNAMES') && await utils.isStaff(author, guildID) === false) {
            throw new Error('Missing Permissions');
        }

        switch (command.data.options[1]?.value) {
            case undefined:
                var nick = null;
                break;

            default:
                var nick = command.data.options[1].value;
        }

        await member.setNickname(nick);
        command.send(`${member.toString()}'s nickname has been set to: \`${nick || 'None'}\``);

    } catch (err) {
        command.send(`${utils.constants.emojis.redX} Error: \`${err}\``, {type: 3, flags: 64});
        utils.logger.error(err);
    }
};