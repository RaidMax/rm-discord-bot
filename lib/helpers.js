const maxMessageLength = 2000;

(() => {
  exports.sendMessageAndWaitReaction = async (message, channel, configManager) => {
    // we don't want to exceed the maximum message length
    if (message.length > maxMessageLength) {
      message = message.substring(0, maxMessageLength)
    }
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
        let editedMessage = `||${newMessage.content}||\n${hiddenText}`
        if (editedMessage > maxMessageLength) {
          editedMessage = editedMessage.substring(0, maxMessageLength)
        }
        await newMessage.edit(editedMessage)
      } catch (error) {
        console.log('Could not edit new message', error)
      }
      try {
        const cachedReaction = newMessage.reactions.cache.get(reactEmoji)
        if (!cachedReaction.message.deleted) {
          await cachedReaction.remove()
        }
      } catch (error) {
        console.log('Could not remove existing reactions to new message after hiding', error)
      }
    } else {
      try {
        const cachedReaction = newMessage.reactions.cache.get(reactEmoji)
        if (!cachedReaction.message.deleted) {
          await cachedReaction.remove()
        }
      } catch (error) {
        console.log('Could not remove reactions after timeout', error)
      }
    }
  }
}).call(this)
