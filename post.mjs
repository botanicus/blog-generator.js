/*
  This is so we have a simple, plain object compatible interface
  and we can treat it same as the object parsed from the stored JSON.
*/

import PostParser from './parser.mjs'

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
