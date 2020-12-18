(() => {
  exports.command = {
    name: 'listmemesources',
    arguments: [],
    description: 'lists all sources in the memes pool',
    async execute (message, commandInfo, configHandler) {
      const pool = configHandler.getConfigForCommand('meme').subscriptions
      let formattedMessage = `${configHandler.getMessageContent('listMemeSourcesInfo')}\n` + '```\n'
      pool.forEach((subscription) => {
        formattedMessage += `${subscription}\n`
      })
      formattedMessage += '```'
      await message.channel.send(formattedMessage)
    }
  }
}).call(this)
