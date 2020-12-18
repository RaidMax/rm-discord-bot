const randomPhoto = require('../integrations/reddit/random-media')
const helpers = require('../helpers');

(() => {
  exports.command = {
    name: 'meme',
    arguments: [{
      name: 'action',
      description: 'action to perform',
      validValues: ['subscribe', 'unsubscribe'],
      required: true
    },
    {
      name: 'source',
      description: 'source of meme',
      required: true
    }],
    description: 'posts a random meme',
    async execute (message, commandInfo, config) {
      const index = Math.floor(Math.random() * config.commandConfig.subscriptions.length)
      let source = config.commandConfig.subscriptions[index] ?? 'memes'

      if (commandInfo.args.length > 0) {
        source = commandInfo.args[0]
      }

      if (source === 'subscribe' && commandInfo.args.length > 1) {
        const newSubscription = commandInfo.args[1].toLowerCase()
        if (!config.commandConfig.subscriptions.includes(newSubscription)) {
          config.commandConfig.subscriptions.push(newSubscription)
          config.save()
          await message.channel.send(config.getMessageContent('memesCommandSubscribe').format(newSubscription))
          return
        }
        // todo: already added message
      }

      if (source === 'unsubscribe' && commandInfo.args.length > 1) {
        const oldSubscription = commandInfo.args[1].toLowerCase()
        if (config.commandConfig.subscriptions.includes(oldSubscription)) {
          config.commandConfig.subscriptions = config.commandConfig.subscriptions.filter(item => item !== oldSubscription)
          config.save()
          await message.channel.send(config.getMessageContent('memesCommandUnsubscribe').format(oldSubscription))
          return
        }
        // todo: already removed message
        return
      }

      if (source === 'list') {
        let formattedMessage = '```\n'
        config.commandConfig.subscriptions.forEach((subscription) => {
          formattedMessage += `${subscription}\n`
        })
        formattedMessage += '```'
        await message.channel.send(formattedMessage)
        return
      }

      if (config.commandConfig.blacklistedSources.includes(source.toLowerCase())) {
        await config.commandConfig.blacklistedSourceReplacement.sendToChannelWithReaction(message.channel)
        return
      }

      let response
      try {
        response = await randomPhoto.getMedia(source)
      } catch (error) {
        console.log('Could not get media', error)
        await message.channel.send(config.getMessageContent('randomMediaFail'))
        return
      }

      // didn't get anything back probably a 404
      if (response === undefined || response.content === undefined) {
        await message.channel.send(config.getMessageContent('randomMediaNoContent'))
        return
      }

      // can't use the source
      if (response.unsupportedSource) {
        await message.channel.send(config.getMessageContent('randomMediaUnsupported'))
        return
      }

      // not allowed in regular chat
      if (response.isNsfw && config.config.nsfwChannelId !== message.channel.id) {
        await message.channel.send(config.getMessageContent('randomMediaNsfwLocked'))
        return
      }

      if (response.title !== undefined) {
        const formattedMessage = response.title + '\n' +
                '```\n' +
                response.content + '\n' +
                '```'
        await helpers.sendMessageAndWaitReaction(formattedMessage, message.channel, config)
      } else {
        await helpers.sendMessageAndWaitReaction(response.content, message.channel, config)
      }
    }
  }
}).call(this)
