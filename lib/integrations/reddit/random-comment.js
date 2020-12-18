const baseUrl = 'https://reddit.com'
const removeMarkdown = require('remove-markdown')
const got = require('got');

(() => {
  exports.getComment = async (sourceName) => {
    const requestUrl = `${baseUrl}/r/${sourceName}/random/.json`
    let comments

    while (comments === undefined || comments.length === 1) {
      comments = await getResponse(requestUrl)
    }

    let comment
    do {
      const index = Math.floor(Math.random() * comments.length)
      comment = comments[index]
    }
    while (comment.data.author === 'AutoModerator')

    if (comment === undefined) {
      return undefined
    }

    return {
      content: removeMarkdown(comment.data.body)
    }
  }

  async function getResponse (requestUrl) {
    let responseData
    try {
      responseData = await got(requestUrl)
    } catch (error) {
      // occurs when the subreddit is private
      if (error.response?.statusCode === 403) {
        return {
          unsupportedSource: true
        }
      }
      // occurs when the subreddit has been manually removed or banned
      if (error.response?.statusCode === 404) {
        return undefined
      }

      console.log('Could not get data from source', error)
      throw (error)
    }

    const responseJson = JSON.parse(responseData.body)
    return responseJson[1].data.children
  }
}).call(this)
