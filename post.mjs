import { ensure } from './utils.mjs'
import Post from './parser.mjs'

const createdAt = new Date()

function getPostObject(data) {
  return function (data) {
    return {
      title: ensure(data.title, 'getPostObject: title is required'),
      slug: ensure(data.slug, 'getPostObject: slug is required'),
      path: ensure(data.path, 'getPostObject: path is required'),
      tags: ensure(data.tags, 'getPostObject: tags are required'),
      excerpt: ensure(data.excerpt, 'getPostObject: excerpt is required'),
      createdAt: ensure(data.createdAt, 'getPostObject: createdAt is required')
    }
  }
}

function addCreatedAt(fn) {
  return function (data) {
    // ensureNull(data.createdAt)
    data.createdAt = createdAt
    return fn(data)
  }
}

function withBody(fn) {
  return function (data) {
    ensure(data.body, 'withBody: body is required')
    const post = fn(data)
    post.body = data.body
    return post;
  }
}

/* This is to represent i. e. posts/2019-05-19-hello-world/hello-world.json */
export function getFullPostFromStoredJSON (data) {
  return withBody(getPostObject())(data)
}

/* This is to represent i. e. posts/2019-05-19-hello-world/hello-world.json */
export function getFullPostFromObject (post) {
  return withBody(addCreatedAt(getPostObject()))(post)
}

export function getShortPostFromStoredJSON (data) {
  return getPostObject()(data)
}

export function getShortPostFromObject (post) {
  return addCreatedAt(getPostObject())(post)
}
