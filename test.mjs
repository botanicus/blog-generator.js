import test from 'ava'
import { getShortPostFromStoredJSON } from './post.mjs'

import './fs_actions_test.mjs'

test('foo', t => {
  t.pass()
})
// import { getFullPostFromStoredJSON, getFullPostFromObject, getShortPostFromStoredJSON, getShortPostFromObject } from './post.mjs'

// const basicPost = {
//   title: 'Hello world',
//   slug: 'hello-world',
//   path: '/posts/2019-05-20-hello-world/hello-world.json',
//   tags: [],
//   excerpt: 'Lorem ipsum'
// }

// const storedShortPost = {createdAt: '...'}
// storedShortPost.__proto__ = basicPost

// const storedFullPost = {body: 'Lorem ...'}
// storedFullPost.__proto__ = storedShortPost

// /* Main */
// let post = getShortPostFromStoredJSON(storedShortPost)
// console.log('~ getShortPostFromStoredJSON')
// console.log(post)

// post = getFullPostFromStoredJSON(storedFullPost)
// console.log("\n~ getFullPostFromStoredJSON")
// console.log(post)

// post = getShortPostFromObject(object)
// console.log("\n~ getShortPostFromObject")
// console.log(post)

