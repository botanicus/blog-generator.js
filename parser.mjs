import { ensure } from './utils.mjs'
import jsdom from 'jsdom'
import showdown from 'showdown'
import yaml from 'js-yaml'

export default class Post {
  constructor(slug, markdownWithHeader) {
    this.slug = ensure(slug, 'Post: slug is required')
    this.markdownWithHeader = ensure(markdownWithHeader, 'Post: markdownWithHeader is required')
  }

  /* This is required by the addCreatedAt() function in post.mjs. */
  set createdAt(dateValue) {
    ensure(dateValue.getMonth, 'Post#createdAt accepts only date-like objects')
    this._createdAt = dateValue
  }

  get createdAt() {
    return this._createdAt
  }

  get header() {
    if (this.markdownWithHeader.match(/\n---\s*\n/)) {
      const lines = this.markdownWithHeader.split("\n")
      const endIndex = lines.indexOf('---') /* TODO: This should allow trailing whitespace. */
      const yamlData = lines.slice(0, endIndex).join("\n")
      return yaml.safeLoad(yamlData)
    } else {
      return {}
    }
  }

  parse() {
    const converter = new showdown.Converter()
    // console.log(converter)
    const html      = converter.makeHtml(this.markdownWithHeader)
    // console.log('')
    // console.log(html)
    return new ParsedPost(document)
  }
}

// Post
//   #header
//   #title
//   #body

export class ParsedPost {
  constructor(document) {
    this.document = document
  }

  get title() {
    return this.document.css('h1').innerText()
  }
}
