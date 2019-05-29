import assert from 'assert'
import Post from '../parser.mjs';

const markdownWithHeader = `
# Hello world

*Lorem ipsum.*

## First title
`

describe('Post', () => {
  describe('constructor', () => {
    it('cannot be initialized without slug', () => {
      assert.throws(() => new Post(), /slug is required/)
    })

    it('cannot be initialized without markdownWithHeader', () => {
      assert.throws(() => new Post('hello-world'), /markdownWithHeader is required/)
    })

    it('can be initialized with slug and markdownWithHeader', () => {
      const createPost = () => new Post('hello-world', markdownWithHeader)
      assert.doesNotThrow(createPost)

      const post = createPost()
      assert(post.slug)
      assert(post.markdownWithHeader)
    })
  })
})
