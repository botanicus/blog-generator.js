import PathRouter from '../../post/router.mjs'
import assert from 'assert'

describe('PathRouter', () => {
  describe('constructor', () => {
    it('cannot be initialized without originalFileTimestamp', () => {
      assert.throws(() => new PathRouter(), /originalFileTimestamp is required/)
    })

    it('cannot be initialized without publishedDateTimestamp', () => {
      assert.throws(() => new PathRouter('2019-06-03'), /publishedDateTimestamp is required/)
    })

    it('cannot be initialized without slug', () => {
      assert.throws(() => new PathRouter('2019-06-03', '2019-06-15'), /slug is required/)
    })

    it('cannot be initialized without contentDirectory', () => {
      assert.throws(() => new PathRouter('2019-06-03', '2019-06-15', 'hello-world'), /contentDirectory is required/)
    })

    it('cannot be initialized without outputDirectory', () => {
      assert.throws(() => new PathRouter('2019-06-03', '2019-06-15', 'hello-world', 'content'), /outputDirectory is required/)
    })

    it('can be initialized with originalFileTimestamp, publishedDateTimestamp, slug, contentDirectory and outputDirectory', () => {
      assert.doesNotThrow(() => new PathRouter('2019-06-03', '2019-06-15', 'hello-world', 'content', 'output'))
    })
  })
})
