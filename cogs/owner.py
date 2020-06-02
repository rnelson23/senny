import discord
from discord.ext import commands

class owner(commands.Cog, name="Owner Commands"):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    @commands.is_owner()
    async def say(self, ctx, id, *, message):
        """Sends a message"""

        channel = await self.bot.fetch_channel(id)
        await channel.send(f'{message}')

    @commands.command(description='Remember to use dot path. e.g: cogs.owner')
    @commands.is_owner()
    async def load(self, ctx, cog):
        """Loads a cog"""

        self.bot.load_extension(cog)
        await ctx.send(f'Loaded {cog}')

    @commands.command(description='Remember to use dot path. e.g: cogs.owner')
    @commands.is_owner()
    async def unload(self, ctx, cog):
        """Unloads a cog"""

        self.bot.unload_extension(cog)
        await ctx.send(f'Unloaded {cog}')

    @commands.command(description='Remember to use dot path. e.g: cogs.owner')
    @commands.is_owner()
    async def reload(self, ctx, cog):
        """Reloads a cog"""

        self.bot.unload_extension(cog)
        self.bot.load_extension(cog)
        await ctx.send(f'Reloaded {cog}')

def setup(bot):
    bot.add_cog(owner(bot))