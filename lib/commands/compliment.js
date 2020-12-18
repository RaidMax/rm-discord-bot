require('../extensions')
const helpers = require('../helpers')
const randomComment = require('../integrations/reddit/random-comment');

(() => {
  exports.command = {
    name: 'compliment',
    description: 'compliments you or a target',
    arguments: [{
      name: 'user',
      description: 'user to compliment',
      required: false
    }],
    async execute (message, commandInfo, configHandler) {
      if (commandInfo.mention === undefined && commandInfo.args.length > 0) {
        await message.channel.send(configHandler.getMessageContent('commandMentionNotFound').format(commandInfo.args[0]))
        return
      }

      let response
      try {
        response = await randomComment.getComment(configHandler.commandConfig.source)
      } catch (error) {
        console.log('Could not get random comment', error)
        message.channel.send(configHandler.getMessageContent('randomCommentFail'))
        return
      }

      const mention = commandInfo.mention ?? message.author
      const formattedResponse = configHandler.getMessageContent('complimentCommandResponse').format(mention, response.content)
      await helpers.sendMessageAndWaitReaction(formattedResponse, message.channel, configHandler)
    }
  }
}).call(this)
