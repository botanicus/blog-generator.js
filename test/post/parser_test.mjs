import assert from 'assert'
import Post from '../../post/parser.mjs'

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

  describe('#date', () => {
    it('cannot be set to a non-date objects', () => {
      const post = new Post('hello-world', markdownWithHeader)
      assert.throws(() => post.date = '', /accepts only date-like objects/)
    })

    it('can be set to a date-like object', () => {
      const post = new Post('hello-world', markdownWithHeader)
      assert.doesNotThrow(() => post.date = new Date())
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
    describe('#title', () => {
      it("throws an error if there isn't one", () => {
        const post = new Post('hello-world', 'mrqiczka')
        const body = post.parseBody()
        assert.throws(() => body.title, /is supposed to be H1 tag/)
      })

      it('returns the main post title if there is one', () => {
        const post = new Post('hello-world', markdownWithHeader)
        const body = post.parseBody()
        assert.equal(body.title, 'Hello world')
      })
    })

    describe('#excerpt', () => {
      it("throws an error if there isn't one", () => {
        const post = new Post('hello-world', '# Mrqiczka')
        const body = post.parseBody()
        assert.throws(() => body.excerpt, /doesn't contain tag P on expected position/)
      })

      it("throws an error if there isn't one", () => {
        const post = new Post('hello-world', "# Mrqiczka\n## Subtitle")
        const body = post.parseBody()
        assert.throws(() => body.excerpt, /is supposed to be P tag/)
      })

      it("throws an error if the excerpt isn't *wrapped*", () => {
        const post = new Post('hello-world', "# Mrqiczka\nLorem ipsum.")
        const body = post.parseBody()
        assert.throws(() => body.excerpt, /is supposed to be EM tag/)
      })

      it('returns the excerpt', () => {
        const post = new Post('hello-world', markdownWithHeader)
        const body = post.parseBody()
        assert.equal(body.excerpt, 'Lorem ipsum.')
      })
    })

    describe('#body', () => {
      it('returns the body without the title and excerpt', () => {
        const post = new Post('hello-world', markdownWithHeader)
        const body = post.parseBody()
        assert.equal(body.body, '## First title')
      })
    })
  })
})
