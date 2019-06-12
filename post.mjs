/*
  This is so we have a simple, plain object compatible interface
  and we can treat it same as the object parsed from the stored JSON.
*/

import PostParser from './parser.mjs'

function appendLeadingZeroes(n) {
  return (n <= 9) ? `0${n}` : n
}

export default class Post {
  constructor(slug, markdownWithHeader) {
    this.post = new PostParser(slug, markdownWithHeader)
  }

  get slug() {
    return this.post.slug
  }

  set date(value) {
    this.post.date = value
  }

  get date() {
    return this.post.date
  }

  get timestamp() {
    const yyyy = this.post.date.getFullYear()
    const mm = appendLeadingZeroes(this.post.date.getMonth() + 1)
    const dd = appendLeadingZeroes(this.post.date.getDate() + 1)
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
}
