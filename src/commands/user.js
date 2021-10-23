module.exports = {
    /**
     * @param {import('../utils').Interaction} command
     * @param {import('../utils')} utils
     */
    async execute(command, utils) {
        try {
            const options = {format: 'png', dynamic: true, size: 4096};

            const guildID = command.guildID;
            const guild = command.client.guilds.cache.get(guildID);

            const memberID = command.data.options ? command.data.options[0].value : command.userID;
            const member = await command.client.guilds.cache.get(guildID).members.fetch(memberID);

            const statusIcon = {
                online: '<:online:718302081399783573>',
                idle: '<:idle:718302096096624741>',
                dnd: '<:dnd:718302130695438346>',
                offline: '<:offline:718302145698594838>'
            };

            const statusText = {
                online: 'Online',
                idle: 'Idle',
                dnd: 'Busy',
                offline: 'Offline'
            };

            const join = guild.members.cache.map(m => m.joinedTimestamp).sort((a, b) => a - b).indexOf(member.joinedTimestamp) + 1;

            const boost = member.premiumSince ? `Since ${utils.format(member.premiumSince)}` : 'No';

            const icon = member.user.avatarURL() ? `[\`Link\`](${member.user.avatarURL(options)})` : '`None`';

            let activities = '\n';
            member.presence.activities.length === 0 ? activities = '`None`\n' : member.presence.activities.forEach(activity => {
                switch (activity.type) {
                    case 'COMPETING': {
                        activities += `\nCompeting in **${activity.name}**\n`;
                        break;
                    }

                    case 'CUSTOM_STATUS': {
                        activities += `\n${activity.emoji || ''} ${activity.state || ''}\n`;
                        break;
                    }

                    case 'LISTENING': {
                        if (activity.name !== 'Spotify') {
                            activities += `\nListening to **${activity.name}**\n`;

                        } else {
                            activities +=
                                `\nListening to **${activity.name}**`+
                                `\n**[${activity.details}](https://open.spotify.com/track/${activity.syncID})**`+
                                `\nBy ${activity.state}`+
                                `\nOn ${activity.assets.largeText}\n`;
                        }

                        break;
                    }

                    case 'PLAYING': {
                        let duration = '';

                        if (activity.timestamps) {
                            const time = activity.timestamps;
                            const ms = time.end === null ? Date.now() - Date.parse(time.start) : Date.parse(time.end) - Date.now();
                            const type = time.end === null ? 'elapsed' : 'left';

                            if (ms > 0) {
                                let h;
                                let m;
                                let s;

                                h = Math.floor(ms / 1000 / 60 / 60);
                                m = Math.floor((ms / 1000 / 60 / 60 - h) * 60);
                                s = Math.floor(((ms / 1000 / 60 / 60 - h) * 60 - m) * 60);

                                h < 10 ? h = '0' + h : h = h;
                                m < 10 ? m = '0' + m : m = m;
                                s < 10 ? s = '0' + s : s = s;

                                h === '00' ? duration = `\n${m}:${s} ${type}` : duration = `\n${h}:${m}:${s} ${type}`;

                            } else {
                                duration = '\n00:00 left';
                            }
                        }

                        let party = '';
                        switch (!activity.party?.size) {
                            case false: {
                                party = `(${activity.party.size[0]} of ${activity.party.size[1]})`;
                                break;
                            }
                        }

                        activities +=
                            `\nPlaying: **${activity.name}**`+
                            `${activity.details ? `\n${activity.details}` : ''}`+
                            `${activity.state ? `\n${activity.state}` : ''} ${party}`+
                            `${duration}\n`;

                        break;
                    }

                    case 'STREAMING': {
                        activities +=
                            `\nLive on **${activity.name}**`+
                            `\n**[${activity.details}](${activity.url})**`+
                            `\nPlaying ${activity.state}\n`;

                        break;
                    }

                    case 'WATCHING': {
                        activities += `\nWatching **${activity.name}**\n`;
                        break;
                    }
                }
            });

            const roles = member.roles.cache.sort((a, b) => b.position - a.position).array();

            const flagNames = {
                DISCORD_EMPLOYEE: 'Discord Employee',
                PARTNERED_SERVER_OWNER: 'Partnered Server Owner',
                HYPESQUAD_EVENTS: 'HypeSquad Events',
                BUGHUNTER_LEVEL_1: 'Discord Bug Hunter Level 1',
                HOUSE_BRAVERY: 'HypeSquad Bravery',
                HOUSE_BRILLIANCE: 'HypeSquad Billiance',
                HOUSE_BALANCE: 'HypeSquad Balance',
                EARLY_SUPPORTER: 'Early Supporter',
                TEAM_USER: 'Team User',
                SYSTEM: 'System',
                BUGHUNTER_LEVEL_2: 'Discord Bug Hunter Level 2',
                VERIFIED_BOT: 'Verified Bot',
                EARLY_VERIFIED_BOT_DEVELOPER: 'Early Verified Bot Developer'
            }

            let flags = [];
            switch (member.user.flags?.equals(0)) {
                case undefined:
                    flags.push('None');
                    break;

                case true:
                    flags.push('None');
                    break;

                default:
                    member.user.flags.toArray().forEach(flag => flags.push(flagNames[flag]));
            }

            const permNames = {
                ADMINISTRATOR: 'Administrator',
                CREATE_INSTANT_INVITE: 'Create Invite',
                KICK_MEMBERS: 'Kick Members',
                BAN_MEMBERS: 'Ban Members',
                MANAGE_CHANNELS: 'Manage Channels',
                MANAGE_GUILD: 'Manage Server',
                ADD_REACTIONS: 'Add Reactions',
                VIEW_AUDIT_LOG: 'View Audit Log',
                PRIORITY_SPEAKER: 'Priority Speaker',
                STREAM: 'Video',
                VIEW_CHANNEL: 'View Channels',
                SEND_MESSAGES: 'Send Messages',
                SEND_TTS_MESSAGES: 'Send Text-to-Speak Messages',
                MANAGE_MESSAGES: 'Manage Messages',
                EMBED_LINKS: 'Embed Links',
                ATTACH_FILES: 'Attach Files',
                READ_MESSAGE_HISTORY: 'Read Message History',
                MENTION_EVERYONE: 'Mention @everyone, @here, and All Roles',
                USE_EXTERNAL_EMOJIS: 'Use External Emoji',
                VIEW_GUILD_INSIGHTS: 'View Server Insights',
                CONNECT: 'Connect',
                SPEAK: 'Speak',
                MUTE_MEMBERS: 'Mute Members',
                DEAFEN_MEMBERS: 'Deafen Members',
                MOVE_MEMBERS: 'Move Members',
                USE_VAD: 'Use Voice Activity',
                CHANGE_NICKNAME: 'Change Nickname',
                MANAGE_NICKNAMES: 'Manage Nicknames',
                MANAGE_ROLES: 'Manage Roles',
                MANAGE_WEBHOOKS: 'Manage Webhooks',
                MANAGE_EMOJIS: 'Manage Emojis',
            };

            let perms = [];
            switch (member.hasPermission('ADMINISTRATOR')) {
                case true:
                    perms.push('Administrator');
                    break;

                case false:
                    member.permissions.toArray().forEach(p => perms.push(permNames[p]));
                    break;
            }

            const embed = new utils.MessageEmbed()
                .setAuthor(`${member.user.tag} - Information`, null, member.user.avatarURL())
                .setDescription(
                    `Profile: ${member.toString()}\n`+
                    `ID: \`${member.id}\`\n`+
                    `Nick: \`${member.nickname || 'None'}\`\n`+
                    `Bot: \`${member.user.bot ? 'True' : 'False'}\`\n`+
                    `Status: ${statusIcon[member.user.presence.status]}\`${statusText[member.user.presence.status]}\`\n`+
                    `Created: \`${utils.format(member.user.createdAt)}\`\n`+
                    `Joined: \`${utils.format(member.joinedAt)}\`\n`+
                    `Activity: ${activities}\n`+
                    `Join Position: \`${join}\`\n`+
                    `Color: \`${member.displayHexColor}\`\n`+
                    `Booster: \`${boost}\`\n`+
                    `Icon: ${icon}\n\n`+
                    `Roles: ${roles.join(', ')}\n\n`+
                    `Flags: \`${flags.join(', ')}\`\n\n`+
                    `Permissions: \`${perms.join(', ')}\``
                )
                .setColor(process.env.color)
                .setThumbnail(member.user.displayAvatarURL(options));

            await command.embed([embed]);

        } catch (err) {
            await command.error(err);
        }
    },

    data: {
        name: 'user',
        description: 'Get a user\'s info',
        options: [
            {
                name: 'user',
                description: 'User to get',
                type: 6
            }
        ]
    }
};