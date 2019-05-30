import { ensure, escapeRegExp } from './utils.mjs'
import jsdom from 'jsdom'
const { JSDOM } = jsdom
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
    const yamlData = this.split()[0]
    return yamlData ? yaml.safeLoad(yamlData) : {}
  }

  get tags() {
    return this.header.tags
  }

  get rawBody() {
    return this.split()[1]
  }

  split() {
    if (!this.markdownWithHeader.match(/\n---\s*\n/)) {
      return [null, this.markdownWithHeader]
    }

    const lines = this.markdownWithHeader.split("\n").map((line) => line.trimRight())
    const endIndex = lines.indexOf('---')
    const yamlData = lines.slice(0, endIndex).join("\n")
    const rawBody = lines.slice(endIndex + 1, lines.length - 1)
    return [yamlData, rawBody.join("\n").trim()]
  }

  parseBody() {
    const converter = new showdown.Converter()
    const html = converter.makeHtml(this.rawBody)
    const dom = JSDOM.fragment(html)
    return new ParsedPost(dom, this.rawBody)
  }
}

// Post
//   #slug
//   #createdAt
//   #header
//   #rawBody
//   #parseBody()
//     #title
//     #excerpt
//     #body

class ParsedPost {
  constructor(dom, rawBody) {
    this.document = ensure(dom, 'ParsedPost: dom is required')
    this.rawBody = ensure(rawBody, 'ParsedPost: rawBody is required')
  }

  get title() {
    const expectedTitleNode = this.document.childNodes[0]
    this.validate(expectedTitleNode, 'H1')
    return expectedTitleNode.textContent
  }

  get excerpt() {
    const expectedExcerptNode = this.document.childNodes[2]
    this.validate(expectedExcerptNode, 'P')
    const expectedEmNode = expectedExcerptNode.childNodes[0]
    this.validate(expectedEmNode, 'EM')
    return expectedEmNode.innerHTML
  }

  get body() {
    const pattern = new RegExp(`${escapeRegExp(this.title)}|${escapeRegExp(this.excerpt)}`)
    return this.rawBody.split("\n").filter((line) => !line.match(pattern)).join("\n").trim()
  }

  validate(node, expectedTagName) {
    if (!node) {
      throw `Document doesn't contain tag ${expectedTagName} on expected position`
    }

    if (node.tagName !== expectedTagName) {
      throw `The first element is supposed to be ${expectedTagName} tag, was ${node.tagName} ${node}`
    }
  }
}
