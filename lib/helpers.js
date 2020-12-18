(() => {
  exports.sendMessageAndWaitReaction = async (message, channel, configManager) => {
    const reactEmoji = configManager.config.reactionEmoji
    let newMessage
    try {
      newMessage = await channel.send(message)
    } catch (error) {
      console.log('Could not send new message', error)
      return
    }

    try {
      await newMessage.react(reactEmoji)
    } catch (error) {
      console.log('Could not react to new message', error)
      return
    }

    const filter = (reaction, user) => reaction?.emoji?.name === reactEmoji && (reactionUser = user) !== undefined
    let reactionUser
    let collected
    try {
      collected = await newMessage.awaitReactions(filter, { max: 1, time: configManager.config.reactionTimeout })
    } catch (error) {
      console.log('Could not await reactions for new message', error)
      return
    }

    const reaction = collected.first()

    if (reaction?.emoji?.name === reactEmoji) {
      const hiddenText = configManager.getMessageContent('hiddenByReaction').format(reactionUser)
      try {
        await newMessage.edit(`||${newMessage.content}||\n${hiddenText}`)
      } catch (error) {
        console.log('Could not edit new message', error)
      }
      try {
        await newMessage.reactions.cache.get(reactEmoji).remove()
      } catch (error) {
        console.log('Could not remove existing reactions to new message after hiding', error)
      }
    } else {
      try {
        await newMessage.reactions.cache.get(reactEmoji).remove()
      } catch (error) {
        console.log('Could not remove reactions after timeout', error)
      }
    }
  }
}).call(this)
