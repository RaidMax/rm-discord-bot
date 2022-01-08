const baseUrl = 'https://reddit.com'
const imageFormats = ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'webp', 'svg', 'gifv']
const removeMarkdown = require('remove-markdown')
const got = require('got');

(() => {
  exports.getMedia = async (sourceName) => {
    const requestUrl = `${baseUrl}/r/${sourceName}/random/.json`
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
    let postData

    if (responseJson.length > 1) {
      postData = responseJson[0].data.children[0].data
    } else {
      // occurs when the subreddit and subsequent search returns nothing
      if (responseJson.data.children.length === 0 ||
          responseJson.data.children[0].type !== 't3') {
        return undefined
      }

      // occurs when the subreddit has random disabled
      if (responseJson.data.children.length > 2) {
        return {
          content: '',
          unsupportedSource: true
        }
      }

      postData = responseJson.data.children[0].data
    }

    const directUrl = getDirectMediaUrl(postData)

    // we have a direct media link we can return
    if (directUrl !== undefined) {
      return {
        content: directUrl,
        isNsfw: isNsfw(postData),
        unsupportedSource: false
      }
    }

    // it's most likely a link to an external page or something not text
    if (!postData.is_self) {
      if (postData.thumbnail === '') {
        return undefined
      }
      return {
        content: postData.thumbnail,
        isNsfw: isNsfw(postData),
        unsupportedSource: false
      }
    }

    // it's a text post
    return {
      content: removeMarkdown(postData.selftext),
      title: postData.title,
      isNsfw: isNsfw(postData),
      unsupportedSource: false
    }
  }

  function isImageUrl (url) {
    const format = url.split('.').pop().toLowerCase()
    return imageFormats.find(f => f === format) !== undefined
  }

  function getVideoUrl (postData) {
    if (postData.post_hint === 'rich:video') {
      return postData.url
    }
    return postData.preview?.reddit_video_preview?.fallback_url
  }

  function getDirectMediaUrl (postData) {
    if (isImageUrl(postData.url)) {
      return postData.url
    }

    const videoUrl = getVideoUrl(postData)

    if (videoUrl !== undefined) {
      return videoUrl
    }
    
    return undefined
  }

  function isNsfw (postData) {
    return postData.over_18 ||
        postData.whitelist_status?.includes('nsfw') ||
        postData.parent_whitelist_status?.includes('nsfw')
  }
}).call(this)
