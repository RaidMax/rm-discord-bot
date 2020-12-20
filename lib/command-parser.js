(() => {
  exports.parse = async function (message, prefix, guild) {
    const messageContent = message.slice(prefix.length).split(' ')
    const args = messageContent.length > 1 ? messageContent.slice(1) : []

    let mention
    if (args.length > 0) {
      try {
        mention = await getMentionedUserFromArguments(args[0], guild)
      } catch (error) {
        console.log('Could not get mentioned user from arguments', error)
      }
    }

    return {
      name: messageContent[0].toLowerCase(),
      args: args,
      mention: mention
    }
  }

  exports.hasRequiredArguments = function (command, parsedCommand) {
    const neededArgs = command.arguments?.filter(arg => arg.required)?.length
    if (neededArgs === undefined) {
      return true
    }

    return neededArgs <= parsedCommand.args?.length ?? 0
  }

  async function getMentionedUserFromArguments (user, guild) {
    const memberCache = guild.members.cache
    const matches = user.match(/^<@!?(\d+)>$/)
    const query = (guildMember) => guildMember.user.username.toLowerCase() === user.toLowerCase() ||
                guildMember.nickname?.toLowerCase() === user.toLowerCase()

    if (matches) {
      return memberCache.get(matches[1])
    }

    const guildMember = memberCache.find(query)

    if (guildMember !== undefined) {
      return guildMember.user
    }

    const guildMembers = await guild.members.fetch({ query: user.toLowerCase(), limit: 1 })
    return guildMembers.find(query)?.user
  }
}).call(this)
