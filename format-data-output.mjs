import { ensure } from './utils.mjs'

const createdAt = new Date()

export function formatLongPostObject (post) {
  const createdAt = post.createdAt || createdAt.toUTCString()
  const date = Date.parse(data.createdAt)
  const timestamp = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`

  return {
    title: ensure(post.title, 'getPostObject: title is required'),
    slug: ensure(post.slug, 'getPostObject: slug is required'),
    tags: ensure(post.tags, 'getPostObject: tags are required'),
    excerpt: ensure(post.excerpt, 'getPostObject: excerpt is required'),
    body: ensure(post.body, 'getPostObject: body is required'),
    path: `/posts/${timestamp}-${post.slug}/${post.slug}.json`,
    createdAt
  }
}

export function formatShortPostObject (post) {
  const object = formatLongPostObject(post)
  delete object.body
  return object
}
