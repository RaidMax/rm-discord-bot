const commandParser = require('./command-parser')
const configHelper = require('./config-helper')
const fs = require('fs');

(() => {
  exports.run = function (options) {
    const Discord = require('discord.js')
    const client = new Discord.Client()
    client.commands = new Discord.Collection()

    const commandFiles = fs.readdirSync('./lib/commands').filter(file => file.endsWith('.js'))

    for (const file of commandFiles) {
      const command = require(`./commands/${file}`).command
      client.commands.set(command.name.toLowerCase(), command)
    }

    client.on('ready', () => {
      console.log(`Logged in as ${client.user.tag}!`)
    })

    client.on('message', async message => {
      const content = message.content
      if (content.length === 0 || !content.startsWith(options.commandPrefix)) {
        return
      }

      const commandInfo = await commandParser.parse(content, options.commandPrefix, message.guild)
      const command = client.commands.find(item => item.name === commandInfo.name)

      if (command === undefined) {
        return
      }

      try {
        const configHandler = configHelper.build(options.config, command.name, message.guild.id)
        if (!commandParser.hasRequiredArguments(command, commandInfo)) {
          await message.channel.send(configHandler.getMessageContent('missingArguments'))
          return
        }
        await command.execute(message, commandInfo, configHandler)
      } catch (error) {
        console.log('Could not execute command', error)
      }
    })

    client.login(options.token)
  }
}).call(this)
