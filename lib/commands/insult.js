require('../extensions')
const randomComment = require('../integrations/reddit/random-comment')
const helpers = require('../helpers');

(() => {
  exports.command = {
    name: 'insult',
    description: 'insults you or a target',
    arguments: [{
      name: 'user',
      description: 'user to insult',
      required: false
    }],
    async execute (message, commandInfo, config) {
      if (commandInfo.mention === undefined && commandInfo.args.length > 0) {
        await message.channel.send(config.getMessageContent('commandMentionNotFound').format(commandInfo.args[0]))
        return
      }

      let response
      try {
        response = await randomComment.getComment(config.commandConfig.source)
      } catch (error) {
        console.log('Could not get random comment', error)
        message.channel.send(config.getMessageContent('randomCommentFail'))
        return
      }

      const mention = commandInfo.mention ?? message.author
      const formattedResponse = config.getMessageContent('insultCommandResponse').format(mention, response.content)
      await helpers.sendMessageAndWaitReaction(formattedResponse, message.channel, config)
    }
  }
}).call(this)
