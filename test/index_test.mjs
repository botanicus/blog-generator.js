import fs from 'fs'
import assert from 'assert'
import { validate, generate } from '../index.mjs'

const outputDirectory  = 'test/assets/output-new'
// describe('validate()', () => {
//   it('', () => {
//   })
// })

describe('generate()', () => {
  describe('with an empty content directory', () => {
    const contentDirectory = 'test/assets/content-empty'

    describe('without an existing output directory', () => {
      it('creates the output directory first', () => {
        const actions = generate(contentDirectory, outputDirectory)
        const createOutputDirectoryAction = actions.actions[0]
        assert(createOutputDirectoryAction.targetDirectoryPath, outputDirectory)
      })
    })

    describe('with an existing output directory', () => {
      const outputDirectory  = 'test/assets/output'

      it('empties the output directory out', () => {
        const actions = generate(contentDirectory, outputDirectory)

        const removeFileAction = actions.actions[0]
        assert(removeFileAction.targetFilePath, `${outputDirectory}/index.json`)

        const removeDirectoryAction = actions.actions[1]
        assert(removeDirectoryAction.targetDirectoryPath, `${outputDirectory}/tags`)
      })
    })
  })

  describe('with a content directory with some posts in it', () => {
    const contentDirectory = 'test/assets/content'

    it('creates the post directory', () => {
      const actions = generate(contentDirectory, outputDirectory)
      const createOutputDirectoryAction = actions.actions[0]
      assert(createOutputDirectoryAction.targetDirectoryPath, outputDirectory)

      const createFirstPostDirectoryAction = actions.actions[1]
      assert(createFirstPostDirectoryAction.targetDirectoryPath, `${outputDirectory}/2019-06-03-hello-world`)

      const createFirstPostSourceAction = actions.actions[2]
      assert(createFirstPostSourceAction.targetFilePath, `${outputDirectory}/2019-06-03-hello-world/hello-world.md`)
      assert(createFirstPostSourceAction.content, fs.readFileSync(`${contentDirectory}/2019-06-03-hello-world/hello-world.md`))

      const createFirstPostJSONAction = actions.actions[3]
      assert(createFirstPostJSONAction.targetFilePath, `${outputDirectory}/2019-06-03-hello-world/hello-world.json`)
      const content = createFirstPostJSONAction.content
      console.log(content)
      // assert(content.date)
      delete content.date
      console.log(content)
      assert.deepEqual(JSON.parse(content), {
        title: 'Hello world',
        slug: 'hello-world',
        excerpt: 'Test',
        body: '',
        tags: []
      })
    })
  })
})
