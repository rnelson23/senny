module.exports = {
    /** @param {import('discord.js/typings').CommandInteraction} command */
    async execute(command) {
        try {
            const schedule = require('node-schedule');

            const Reminders = sequelize.define('reminders', {
                reminderId: DataTypes.STRING(10),
                channelId: DataTypes.STRING(20),
                userId: DataTypes.STRING(20),
                time: DataTypes.BIGINT({length: 20}),
                message: DataTypes.TEXT
            });

            /** @param {int} length */
            const newId = (length) => {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                let reminderId = '';

                for (let i = 0; i < length; i++) {
                    reminderId += chars.charAt(Math.floor(Math.random() * chars.length));
                }

                return reminderId;
            }

            /** @param {string} time */
            const parse = async (time) => {
                const times = time.match(/\d+\s*\w+/g);
                let duration = 0;

                if (!times) return await command.reply('Invalid time format');

                times.forEach(time => {
                    const value = time.match(/\d+/g)[0];
                    const label = time.match(/(?<=\s|\d)(mo|[ywdhms])/gi)[0];

                    const conversions = {
                        y: value * 31536000000,
                        mo: value * 2592000000,
                        w: value * 604800000,
                        d: value * 86400000,
                        h: value * 3600000,
                        m: value * 60000,
                        s: value * 1000,
                    };

                    duration += conversions[label];
                });

                return duration;
            }

            const subcommand = command.options.getSubcommand();

            if (subcommand === 'channel' || subcommand === 'user') {
                const time = command.options.getString('time');
                const msg = command.options.getString('message');
                const reminderId = newId(5);

                let channel;
                let location;
                if (subcommand === 'channel') {
                    channel = command.options.getChannel('channel');
                    location = channel.toString();

                } else {
                    channel = command.options.getUser('user');
                    location = 'you';
                }

                let timestamp = Date.parse(time);
                if (isNaN(timestamp)) {
                    const duration = await parse(time);

                    if (!duration) return await command.reply('Invalid time format');

                    timestamp = Date.now() + await parse(time);
                }

                const end = `<t:${Math.round(timestamp / 1000)}:R>`;
                const now = `<t:${Math.round(Date.now() / 1000)}:R>`;

                let destination = channel.toString();
                let invoker = command.user.toString();
                if (channel.id === command.user.id) {
                    invoker = 'You';
                    destination = 'you';
                }

                const message = `Hello! ${invoker} asked me to remind ${location} about "${msg}" ${now}`;

                await Reminders.create({
                    reminderId: reminderId,
                    channelId: channel.id,
                    userId: command.user.id,
                    time: timestamp,
                    message: message
                });

                schedule.scheduleJob(timestamp, async () => {
                    try {
                        const reminder = await Reminders.findOne({where: {reminderId: reminderId}});

                        if (reminder) {
                            const user = client.users.cache.get(reminder.userId);

                            let channel;
                            if (reminder.channelId === user.id) channel = await user.createDM();
                            else channel = client.channels.cache.get(reminder.channelId);

                            if (!channel) throw new Error(`Reminder ${reminder.reminderId} not sent: channel not found`);

                            await channel.send(reminder.message);
                            await reminder.destroy();
                        }

                    } catch (err) {
                        logger.error(err);
                    }
                });

                await command.reply(`Okay! I'll remind ${destination} about "${msg}" ${end}`);

            } else if (subcommand === 'list') {
                const reminders = await Reminders.findAll({where: {userId: command.user.id}});

                const embed = new discord.MessageEmbed()
                    .setAuthor(`Reminders for ${command.user.username}`)
                    .setColor(0x2F3136);

                if (reminders.length === 0) {
                    embed.setDescription('You have no reminders');

                } else {
                    reminders.forEach(reminder => {
                        const time = `<t:${Math.round(reminder.time / 1000)}:R>`;

                        let channel;
                        if (reminder.channelId === reminder.userId) channel = client.users.cache.get(reminder.channelId);
                        else channel = client.channels.cache.get(reminder.channelId);

                        embed.addField(
                            `${reminder.message}`,
                            `${channel.toString()} ${time} ${reminder.reminderId}`
                        );
                    });
                }

                await command.reply({embeds: [embed]});

            } else {
                const reminderId = command.options.getString('id').toLowerCase();

                if (reminderId === 'all') {
                    const rows = await Reminders.destroy({where: {userId: command.user.id}});

                    if (!rows) return await command.reply('You have no reminders to delete');

                    await command.reply('All your reminders have been deleted');

                } else {
                    const reminder = await Reminders.findOne({where: {reminderId: reminderId}});

                    if (!reminder) return await command.reply('Reminder not found');
                    if (reminder.userId !== command.user.id) return await command.reply('You cannot delete this reminder');

                    await reminder.destroy();
                    await command.reply('Reminder deleted');
                }
            }

        } catch (err) {
            logger.error(err);
        }
    },

    data: [
        {
            type: 'CHAT_INPUT',
            name: 'remind',
            description: 'Set a reminder',
            options: [
                {
                    type: 'SUB_COMMAND',
                    name: 'channel',
                    description: 'Send the reminder in a channel',
                    options: [
                        {
                            type: 'CHANNEL',
                            name: 'channel',
                            description: 'The channel to send the reminder to',
                            required: true,
                            channel_types: [
                                'GUILD_TEXT'
                            ]
                        },
                        {
                            type: 'STRING',
                            name: 'time',
                            description: 'The time to set the reminder for (accepts both durations and dates)',
                            required: true
                        },
                        {
                            type: 'STRING',
                            name: 'message',
                            description: 'The message to send',
                            required: true
                        }
                    ]
                },
                {
                    type: 'SUB_COMMAND',
                    name: 'user',
                    description: 'Send the reminder to a user in DMs',
                    options: [
                        {
                            type: 'USER',
                            name: 'user',
                            description: 'The user to send the reminder to',
                            required: true
                        },
                        {
                            type: 'STRING',
                            name: 'time',
                            description: 'The time to set the reminder for (accepts both durations and dates)',
                            required: true
                        },
                        {
                            type: 'STRING',
                            name: 'message',
                            description: 'The message to send',
                            required: true
                        }
                    ]
                },
                {
                    type: 'SUB_COMMAND',
                    name: 'list',
                    description: 'List all reminders'
                },
                {
                    type: 'SUB_COMMAND',
                    name: 'delete',
                    description: 'Delete a reminder',
                    options: [
                        {
                            type: 'STRING',
                            name: 'id',
                            description: 'The id of the reminder to delete',
                            required: true
                        }
                    ]
                }
            ]
        }
    ]
};