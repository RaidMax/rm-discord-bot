const helpers = require('../helpers');

(() => {
  exports.command = {
    name: 'help',
    description: 'list all commands',
    async execute (message, commandInfo, configHandler) {
      let formattedMessage = '```\n'
      message.client.commands.forEach((command) => {
        formattedMessage += `${command.name}->${command.description}\n`
      })

      formattedMessage += '```'
      await helpers.sendMessageAndWaitReaction(formattedMessage, message.channel, configHandler)
    }
  }
}).call(this)
