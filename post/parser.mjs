/* Private model, the public API is in post.mjs. */

// /* To be used in the YAML header, NOT in the JSON data. */
// get fullDate() {
//   if (!this.post.date) return

//   const HH = appendLeadingZeroes(this.post.date.getHours())
//   const MM = appendLeadingZeroes(this.post.date.getMinutes())

//   /* Apending 00 so YAML recognise it as a date. */
//   return `${this.timestamp} ${HH}:${MM}:00`
// }

import { ensure, escapeRegExp } from '../utils.mjs'
import jsdom from 'jsdom'
const { JSDOM } = jsdom
import showdown from 'showdown'
import yaml from 'js-yaml'

/* TODO: validate that date is a Date instance. */
export default class PostParser {
  constructor(slug, markdownWithHeader) {
    this.slug = ensure(slug, 'Post: slug is required')
    this.markdownWithHeader = ensure(markdownWithHeader, `Post: markdownWithHeader is required for post ${slug}`)
  }

  /* This is required by the addCreatedAt() function in post.mjs. */
  set date(dateValue) {
    if (this.header.date) {
      throw new Error(`Date of ${this.slug} is already set`)
    }

    ensure(dateValue.getMonth, 'Post#date accepts only date-like objects')
    this.header.date = dateValue
  }

  get date() {
    return this.header.date
  }

  /* We have to cache the value, so when we set the date, it doesn't get thrown away. */
  get header() {
    if (this._header) return this._header

    const yamlData = this.split()[0]
    this._header = yamlData ? yaml.safeLoad(yamlData) : {}

    return this._header
  }

  get rawBody() {
    return this.split()[1]
  }

  /*
    It seems that showdown never throws an error,
    therefore this method should never throw.
  */
  parseBody() {
    const converter = new showdown.Converter()
    const html = converter.makeHtml(this.rawBody)
    const dom = JSDOM.fragment(html)
    return new Body(dom, this.rawBody)
  }

  /* Private. */

  /*
    Note that showdown itself support metadata:

    const converter = new showdown.Converter({metadata: true})
    console.log(converter.getMetadata())

    (This requires additional '---' before the metadata block.)

    However this doesn't seem to parse arrays, it escapes them to:

    {tags: '[&quot;React.js&quot;]'}
  */
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
}

class Body {
  constructor(dom, rawBody) {
    this.document = ensure(dom, 'Body: dom is required')
    this.rawBody = ensure(rawBody, 'Body: rawBody is required')
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

  /* Private. */
  validate(node, expectedTagName) {
    if (!node) {
      throw `Document doesn't contain tag ${expectedTagName} on expected position`
    }

    if (node.tagName !== expectedTagName) {
      throw `The first element is supposed to be ${expectedTagName} tag, was ${node.nodeName} ${node}`
    }
  }
}