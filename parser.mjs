import { ensure } from './utils.mjs'
import jsdom from 'jsdom'
import showdown from 'showdown'

// converter = new showdown.Converter(),
// text      = '# hello, markdown!',
// html      = converter.makeHtml(text);
export default class Post {
  constructor(slug, markdownWithHeader) {
    this.slug = ensure(slug, 'Post: slug is required')
    this.markdownWithHeader = ensure(markdownWithHeader, 'Post: markdownWithHeader is required')
  }

  /* This is required by the addCreatedAt() function in post.mjs. */
  set createdAt(value) {
    console.log(`~ Using ${value} as createdAt`)
    this.createdAt = value
  }

  get createdAt() {
    return this.createdAt
  }

  get title() {
    return this.document.css('h1').innerText()
  }
}
