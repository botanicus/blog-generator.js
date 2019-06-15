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
        assert.equal(createOutputDirectoryAction.targetDirectoryPath, outputDirectory)
      })
    })

    describe('with an existing output directory', () => {
      const outputDirectory  = 'test/assets/output'

      it('empties the output directory out', () => {
        const actions = generate(contentDirectory, outputDirectory)

        const removeFileAction = actions.actions[0]
        assert.equal(removeFileAction.targetFilePath, `${outputDirectory}/index.json`)

        const removeDirectoryAction = actions.actions[1]
        assert.equal(removeDirectoryAction.targetDirectoryPath, `${outputDirectory}/tags`)
      })
    })
  })

  describe('with a content directory with some posts in it', () => {
    const contentDirectory = 'test/assets/content'

    it('creates the post directory', () => {
      const actions = generate(contentDirectory, outputDirectory)
      const createOutputDirectoryAction = actions.actions[0]
      assert.equal(createOutputDirectoryAction.constructor.name, 'CreateDirectoryAction')
      assert.equal(createOutputDirectoryAction.targetDirectoryPath, outputDirectory)

      const createFirstPostDirectoryAction = actions.actions[1]
      assert.equal(createFirstPostDirectoryAction.constructor.name, 'CreateDirectoryAction')
      assert.equal(createFirstPostDirectoryAction.targetDirectoryPath, `${outputDirectory}/2019-06-01-hello-world`)

      const createFirstPostJSONAction = actions.actions[2]
      assert.equal(createFirstPostJSONAction.constructor.name, 'FileWriteAction')
      assert.equal(createFirstPostJSONAction.targetFilePath, `${outputDirectory}/2019-06-01-hello-world/hello-world.json`)
      const firstPostContent = createFirstPostJSONAction.content
      assert.deepEqual(JSON.parse(firstPostContent), {
        title: 'Hello world',
        slug: 'hello-world',
        date: '2019-06-01T16:50:00.000Z',
        excerpt: 'Test',
        body: '',
        tags: []
      })

      const todayTimestamp = '2019-06-15' // FIXME
      const createNewPostLogAction = actions.actions[3]
      assert.equal(createNewPostLogAction.constructor.name, 'ConsoleLogAction')
      assert.equal(createNewPostLogAction.message, 'New post detected new-post, setting published date')

      const createSecondPostDirectoryAction = actions.actions[4]
      assert.equal(createSecondPostDirectoryAction.constructor.name, 'CreateDirectoryAction')
      assert.equal(createSecondPostDirectoryAction.targetDirectoryPath, `${outputDirectory}/${todayTimestamp}-new-post`)

      const createSecondPostJSONAction = actions.actions[5]
      assert.equal(createSecondPostJSONAction.constructor.name, 'FileWriteAction')
      assert.equal(createSecondPostJSONAction.targetFilePath, `${outputDirectory}/${todayTimestamp}-new-post/new-post.json`)
      const secondPostContent = JSON.parse(createSecondPostJSONAction.content)
      // 2019-06-15T00:26:59.189Z
      assert.ok(secondPostContent.date.match(/^20\d{2}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$/))
      delete secondPostContent.date
      assert.deepEqual(secondPostContent, {
        title: 'New post',
        slug: 'new-post',
        excerpt: 'Test',
        body: '',
        tags: []
      })

      const createSecondPostSourceAction = actions.actions[6]
      assert.equal(createSecondPostSourceAction.constructor.name, 'FileWriteAction')
      assert.equal(createSecondPostSourceAction.targetFilePath, `${contentDirectory}/2019-06-03-new-post/new-post.md`)
      assert.equal(createSecondPostSourceAction.content, fs.readFileSync(`${contentDirectory}/2019-06-03-new-post/new-post.md`).toString())
    })
  })
})
