const helpers = require('../helpers');

(() => {
  exports.command = {
    name: 'help',
    description: 'list all commands',
    async execute (message, commandInfo, configHandler) {
      let formattedMessage = '```css\n'
      message.client.commands.forEach((command) => {
        formattedMessage += `${configHandler.getMessageContent('helpCommandName')}        [ ${command.name} ]\n`
        formattedMessage += `${configHandler.getMessageContent('helpCommandDescription')} [ ${command.description} ]\n`
        formattedMessage += `${configHandler.getMessageContent('helpCommandArguments')}   ${formatArguments(command.arguments, configHandler)}\n`
        formattedMessage += '\n'
      })
      formattedMessage += '```'

      await helpers.sendMessageAndWaitReaction(formattedMessage, message.channel, configHandler)
    }
  }

  function formatArguments (args, configHandler) {
    if (args === undefined || args.length === 0) {
      return `[ ${configHandler.getMessageContent('helpNoArgs')} ]`
    }

    let formattedArgument = '{ '
    args.forEach((argument) => {
      formattedArgument += `${argument.name}: ${argument.description}`
    })
    formattedArgument += ' }'
    return formattedArgument
  }
}).call(this)
