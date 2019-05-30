import assert from 'assert'
import Post from '../post.mjs'

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

  describe('#tags', () => {
    it('returns an empty array if there is no header', () => {
      const post = new Post('hello-world', markdownWithoutHeader)
      assert.deepEqual(post.tags, [])
    })

    it('returns an empty array if there are no tags in the header', () => {
      const post = new Post('hello-world', `meta: yes\n---\n${markdownWithoutHeader}`)
      assert.deepEqual(post.tags, [])
    })

    it('returns an array of the tags', () => {
      const post = new Post('hello-world', markdownWithHeader)
      assert.deepEqual(post.tags, ['React.js'])
    })
  })


  describe('#excerpt', () => {
    it("throws an error if there isn't one", () => {
      const post = new Post('hello-world', '# Mrqiczka')
      assert.throws(() => post.excerpt, /doesn't contain tag P on expected position/)
    })

    it("throws an error if there isn't one", () => {
      const post = new Post('hello-world', "# Mrqiczka\n## Subtitle")
      assert.throws(() => post.excerpt, /is supposed to be P tag/)
    })

    it("throws an error if the excerpt isn't *wrapped*", () => {
      const post = new Post('hello-world', "# Mrqiczka\nLorem ipsum.")
      assert.throws(() => post.excerpt, /is supposed to be EM tag/)
    })

    it('returns the excerpt', () => {
      const post = new Post('hello-world', markdownWithHeader)
      assert.equal(post.excerpt, 'Lorem ipsum.')
    })
  })

  describe('#post', () => {
    it('returns the post without the title and excerpt', () => {
      const post = new Post('hello-world', markdownWithHeader)
      assert.equal(post.body, '## First title')
    })
  })
})

