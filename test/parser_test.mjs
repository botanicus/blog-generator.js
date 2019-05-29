import assert from 'assert'
import Post from '../parser.mjs';

const markdownWithoutHeader = `
# Hello world

*Lorem ipsum.*

## First title
`

const markdownWithHeader = `
tags: ["React.js"]
---

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

  describe('#createdAt', () => {
    it('cannot be set to a non-date objects', () => {
      const post = new Post('hello-world', markdownWithHeader)
      assert.throws(() => post.createdAt = '', /accepts only date-like objects/)
    })

    it('can be set to a date-like object', () => {
      const post = new Post('hello-world', markdownWithHeader)
      assert.doesNotThrow(() => post.createdAt = new Date())
    })
  })

  describe('#header', () => {
    it('returns an empty object if there is no header', () => {
      const post = new Post('hello-world', markdownWithoutHeader)
      assert.deepEqual(post.header, {})
    })

    it('parses the YAML header', () => {
      const post = new Post('hello-world', markdownWithHeader)
      assert.deepEqual(post.header, {tags: ['React.js']})
    })
  })

  // TODO: tags

  describe('#rawBody', () => {
    it('parses out the raw body, leaving out the header', () => {
      const post = new Post('hello-world', markdownWithHeader)
      assert.deepEqual(post.rawBody, "# Hello world\n\n*Lorem ipsum.*\n\n## First title")
    })

    it("returns the whole markdown blob if there's no header", () => {
      const post = new Post('hello-world', markdownWithoutHeader)
      assert.deepEqual(post.rawBody, markdownWithoutHeader)
    })
  })

  describe('#parseBody()', () => {
    // it("throws an error if it isn't valid", () => {
    //   const post = new Post('hello-world', markdownWithHeader)
    //   assert.throws(() => post.parseBody(), /TODO/)
    // })

    describe('#title', () => {
      it('returns the main post title', () => {
        const post = new Post('hello-world', markdownWithHeader)
        const body = post.parseBody()
        assert.equal(body.title, 'Hello world')
      })
    })

    describe('#excerpt', () => {
      it('returns the excerpt', () => {
        const post = new Post('hello-world', markdownWithHeader)
        const body = post.parseBody()
        assert.equal(body.excerpt, 'Lorem ipsum.')
      })
    })

    describe('#body', () => {
      it('returns the body', () => {
        const post = new Post('hello-world', markdownWithHeader)
        const body = post.parseBody()
        assert.equal(body.body, '## First title')
      })
    })
  })
})
