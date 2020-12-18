(() => {
  exports.command = {
    name: 'addmemesource',
    arguments: [{
      name: 'source',
      description: 'subreddit to add',
      required: true
    }],
    description: 'adds a new source to the memes pool',
    async execute (message, commandInfo, configHandler) {
      const newSource = commandInfo.args[0].toLowerCase()
      const pool = configHandler.getConfigForCommand('meme').subscriptions
      if (!pool.includes(newSource)) {
        pool.push(newSource)
        try {
          configHandler.save()
        } catch (error) {
          console.log('Could not save subscription configuration', error)
          await message.channel.send(configHandler.getMessageContent('genericError'))
          return
        }

        await message.channel.send(configHandler.getMessageContent('addMemeSourceAddSuccess').format(newSource))
      } else {
        await message.channel.send(configHandler.getMessageContent('addMemeSourceConflict').format(newSource))
      }
    }
  }
}).call(this)
