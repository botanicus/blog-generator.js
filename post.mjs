/*
  This is so we have a simple, plain object compatible interface
  and we can treat it same as the object parsed from the stored JSON.
*/

import fs from 'fs'
import { ensure } from './utils.mjs'
import PostParser from './post/parser.mjs'
import PostLocation from './post/location.mjs'

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

  get content() {
    return this.post.markdownWithHeader
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
    return this.header.tags || []
  }

  get title() {
    return this.post.parseBody().title
  }

  get excerpt() {
    return this.post.parseBody().excerpt
  }

  get body() {
    return this.post.parseBody().body
  }

  asJSON() {
    return {
      title: this.title,
      slug: this.slug,
      date: this.date,
      excerpt: this.excerpt,
      body: this.body,
      tags: this.tags
    }
  }

  getLocation(contentDirectory, outputDirectory) {
    return new PostLocation(this.originalFileTimestamp, this.timestamp, this.slug, contentDirectory, outputDirectory)
  }
}
