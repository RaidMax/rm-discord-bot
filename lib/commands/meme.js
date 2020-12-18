const randomPhoto = require('../integrations/reddit/random-media')
const helpers = require('../helpers');

(() => {
  exports.command = {
    name: 'meme',
    arguments: [{
      name: 'source',
      description: 'source of meme',
      required: false
    }],
    description: 'posts a random meme',
    async execute (message, commandInfo, configHandler) {
      const index = Math.floor(Math.random() * configHandler.commandConfig.subscriptions.length)
      let source = configHandler.commandConfig.subscriptions[index] ?? configHandler.commandConfig.defaultSource

      if (commandInfo.args.length > 0) {
        source = commandInfo.args[0]
      }

      // not allowed so we send replacement
      if (configHandler.commandConfig.blacklistedSources.includes(source.toLowerCase())) {
        await configHandler.commandConfig.blacklistedSourceReplacement.sendToChannelWithReaction(message.channel)
        return
      }

      let response
      try {
        response = await randomPhoto.getMedia(source)
      } catch (error) {
        console.log('Could not get media', error)
        await message.channel.send(configHandler.getMessageContent('randomMediaFail'))
        return
      }

      // didn't get anything back probably a 404
      if (response === undefined || response.content === undefined) {
        await message.channel.send(configHandler.getMessageContent('randomMediaNoContent'))
        return
      }

      // can't use the source
      if (response.unsupportedSource) {
        await message.channel.send(configHandler.getMessageContent('randomMediaUnsupported'))
        return
      }

      // not allowed in regular chat
      if (response.isNsfw && configHandler.config.nsfwChannelId !== message.channel.id) {
        await message.channel.send(configHandler.getMessageContent('randomMediaNsfwLocked'))
        return
      }

      if (response.title !== undefined) {
        const formattedMessage = response.title + '\n' +
                '```\n' +
                response.content + '\n' +
                '```'
        await helpers.sendMessageAndWaitReaction(formattedMessage, message.channel, configHandler)
      } else {
        await helpers.sendMessageAndWaitReaction(response.content, message.channel, configHandler)
      }
    }
  }
}).call(this)
