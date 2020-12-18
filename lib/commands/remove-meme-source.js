(() => {
  exports.command = {
    name: 'removememesource',
    arguments: [{
      name: 'source',
      description: 'subreddit to remove',
      required: true
    }],
    description: 'removes an existing source from the memes pool',
    async execute (message, commandInfo, configHandler) {
      const oldSource = commandInfo.args[0].toLowerCase()
      const commandConfig = configHandler.getConfigForCommand('meme')
      if (commandConfig.subscriptions.includes(oldSource)) {
        commandConfig.subscriptions = commandConfig.subscriptions.filter(item => item !== oldSource)
        try {
          configHandler.save()
        } catch (error) {
          console.log('Could not save subscription configuration', error)
          await message.channel.send(configHandler.getMessageContent('genericError'))
          return
        }

        await message.channel.send(configHandler.getMessageContent('removeMemeSourceRemoveSuccess').format(oldSource))
      } else {
        await message.channel.send(configHandler.getMessageContent('removeMemeSourceConflict').format(oldSource))
      }
    }
  }
}).call(this)
