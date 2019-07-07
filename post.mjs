/*
  This is so we have a simple, plain object compatible interface
  and we can treat it same as the object parsed from the stored JSON.
*/

import fs from 'fs'
import { ensure } from './utils.mjs'
import PostParser from './post/parser.mjs'
import PathRouter from './post/router.mjs'
import Tag from './tag.mjs'
import yaml from 'js-yaml'

function appendLeadingZeroes(n) {
  return (n <= 9) ? `0${n}` : n
}

export default class Post {
  constructor(slug, sourceFilePath) {
    const markdownWithHeader = fs.readFileSync(sourceFilePath).toString() // Can be Buffer (if empty for instance).
    this.originalFileTimestamp = ensure(sourceFilePath.match(/\d{4}-\d{2}-\d{2}/)[0], `${sourceFilePath} doesn't contain the required timestamp`)
    this.post = new PostParser(slug, markdownWithHeader)
  }

  get slug() {
    return this.post.slug
  }

  serialize() {
    const header = yaml.dump(this.post.header).replace(/^date: .+/, () => {
      const HH = appendLeadingZeroes(this.post.date.getHours())
      const MM = appendLeadingZeroes(this.post.date.getMinutes())
      const SS = appendLeadingZeroes(this.post.date.getSeconds())
      /* Apending 00 so YAML recognise it as a date. */
      return `date: ${this.timestamp} ${HH}:${MM}:${SS}`
    })
    return [header.trim(), '---', this.post.rawBody].join("\n\n")
  }

  set date(value) {
    this.post.date = value
  }

  get date() {
    return this.post.date
  }

  get timestamp() {
    if (!this.post.date) return

    const yyyy = this.post.date.getFullYear()
    const mm = appendLeadingZeroes(this.post.date.getMonth() + 1)
    const dd = appendLeadingZeroes(this.post.date.getDate())
    return `${yyyy}-${mm}-${dd}`
  }

  get header() {
    return this.post.header
  }

  get tags() {
    return (this.header.tags || []).map((tagName) => new Tag(tagName))
  }

  get title() {
    return this.post.parseBody().title
  }

  get excerpt() {
    return this.post.parseBody().excerpt
  }

  get body() {
    return this.post.parseBody()
  }

  get externalFiles() {
    return this.body.getExternalFiles()
  }

  asJSON() {
    return {
      title: this.title,
      slug: this.slug,
      path: `/posts/${this.slug}/post.json`,
      date: this.date,
      excerpt: this.excerpt,
      body: this.body.body,
      tags: this.tags.map(tag => tag.asShortJSON())
    }
  }

  asShortJSON() {
    const shortJSON = this.asJSON()
    delete shortJSON.body
    return shortJSON
  }

  getLocation(contentDirectory, outputDirectory) {
    return new PathRouter(this.originalFileTimestamp, this.timestamp, this.slug, contentDirectory, outputDirectory)
  }
}
