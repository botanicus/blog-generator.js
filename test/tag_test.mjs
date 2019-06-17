import Tag from '../tag.mjs'
import assert from 'assert'

describe('Tag', () => {
  describe('constructor', () => {
    it('cannot be initialized without name', () => {
      assert.throws(() => new Tag(), /name is required/)
    })
  })

  describe('#slug', () => {
    const examples = {
      'Ruby on Rails': 'ruby-on-rails',
      'XYZ: Will it replace ABC.js?': 'xyz-will-it-replace-abcjs',
      'One, two & three': 'one-two-and-three'
    }

    it('converts name to slug', () => {
      for (const [name, slug] of Object.entries(examples)) {
        const tag = new Tag(name)
        assert.equal(tag.slug, slug)
      }
    })
  })
})
