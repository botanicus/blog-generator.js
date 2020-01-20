import { ensure } from '../utils.mjs'

const currentDate = new Date()

export function formatLongPostObject (post) {
  const serializedDate = post.date || currentDate.toUTCString()
  const date = Date.parse(serializedDate)
  const timestamp = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`

  return {
    title: ensure(post.title, 'getPostObject: title is required'),
    slug: ensure(post.slug, 'getPostObject: slug is required'),
    tags: ensure(post.tags, 'getPostObject: tags are required'),
    excerpt: ensure(post.excerpt, 'getPostObject: excerpt is required'),
    body: ensure(post.body, 'getPostObject: body is required'),
    lang: ensure(post.lang, 'getPostObject: lang is required')
    date: serializedDate
  }
}

export function formatShortPostObject (post) {
  const object = formatLongPostObject(post)
  delete object.body
  return object
}
