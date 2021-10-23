module.exports = {
    /**
     * @param {import('../utils').Interaction} command
     * @param {import('../utils')} utils
     */
    async execute(command, utils) {
        try {
            const guild = command.client.guilds.cache.get(command.guildID);
            const member = await guild.members.fetch(command.data.options[0].value);
            const author = await guild.members.fetch(command.authorID);
            const role = await guild.roles.fetch(command.data.options[1].value);

            if (await utils.check(author, guild.id, {permissions: ['MANAGE_ROLES'], roles: ['admin']}) === false) {
                throw new Error('Missing Permissions');
            }

            await member.roles.remove(role);
            await command.send(`**Success!** ${role} has been removed from ${member.toString()}`, 64);

        } catch (err) {
            await command.error(err);
        }
    },

    data: {
        name: 'removerole',
        description: 'Remove a role from a member',
        options: [
            {
                name: 'member',
                description: 'Member to remove from',
                required: true,
                type: 6
            },
            {
                name: 'role',
                description: 'Role to remove',
                required: true,
                type: 8
            }
        ]
    }
};