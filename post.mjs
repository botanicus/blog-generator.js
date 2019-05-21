import { ensure } from './utils.mjs'

const createdAt = new Date()

function getPostObject() {
  /* The post is going to be:
   * - a plain object, if the data comes from a JSON file
   * - or an instance of Post. */
  return function (post) {
    return {
      title: ensure(post.title, 'getPostObject: title is required'),
      slug: ensure(post.slug, 'getPostObject: slug is required'),
      tags: ensure(post.tags, 'getPostObject: tags are required'),
      excerpt: ensure(post.excerpt, 'getPostObject: excerpt is required'),
      createdAt: ensure(post.createdAt, 'getPostObject: createdAt is required')
    }
  }
}

function addCreatedAt(fn) {
  return function (data) {
    ensure(!data.createdAt, 'addCreatedAt: data.createdAt must not be defined beforehands')
    data.createdAt = createdAt.toUTCString()
    return fn(data)
  }
}

function addPath (fn) {
  return function (data) {
    const post = fn(data)
    const date = Date.parse(data.createdAt)
    const timestamp = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    console.log(timestamp)
    post.path = `/posts/${timestamp}-${data.slug}/${data.slug}.json`
    return post
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

export function getFullPostFromObject (post) {
  return withBody(addCreatedAt(getPostObject()))(post)
}

/* This is to represent items from posts.json and tags/*.json */
export function getShortPostFromStoredJSON (data) {
  return addPath(getPostObject())(data)
}

export function getShortPostFromObject (post) {
  return addPath(addCreatedAt(getPostObject()))(post)
}
