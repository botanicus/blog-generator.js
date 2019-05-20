import { ensure } from './utils.mjs'
import jsdom from 'jsdom'
import showdown from 'showdown'

// converter = new showdown.Converter(),
// text      = '# hello, markdown!',
// html      = converter.makeHtml(text);
export default class Post {
  constructor(slug, markdown_with_header) {
    this.slug = slug
    this.markdown_with_header = markdown_with_header
  }

  get title() {
    return this.document.css('h1').innerText()
  }
}
