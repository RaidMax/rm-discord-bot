/* eslint no-extend-native: ["error", { "exceptions": ["String"] }] */
String.prototype.format = function () {
  let formatted = this
  for (const arg in arguments) {
    formatted = formatted.replace('{' + arg + '}', arguments[arg])
  }
  return formatted
}
