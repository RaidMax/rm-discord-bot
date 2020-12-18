const fs = require('fs');

(() => {
  exports.build = function (config, commandName, guildId) {
    return {
      source: config,
      config: config.servers[guildId],
      commandConfig: config.servers[guildId].commands[commandName],
      getMessageContent (messageKey) {
        return this.config.messages[messageKey] ?? this.source.defaultMessages[messageKey] ?? messageKey
      },
      getConfigForCommand (commandName) {
        return this.config.commands[commandName]
      },
      save () {
        try {
          fs.writeFileSync('config/appsettings.json', JSON.stringify(this.source, null, 4))
        } catch (error) {
          console.log('Could not save configuration', error)
        }
      }
    }
  }
}).call(this)
