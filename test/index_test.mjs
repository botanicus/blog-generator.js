import fs from 'fs'
import assert from 'assert'
import { validate, generate } from '../index.mjs'
import timekeeper from 'timekeeper'

timekeeper.travel(new Date(2019, 5, 15, 14))

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

    const firstPost = {
      title: 'Hello world',
      date: '2019-06-01T16:50:00Z',
      excerpt: 'Test',
      slug: 'hello-world',
      tags: ['intro']
    }

    const secondPost = {
      title: 'New post',
      date: '2019-06-15T14:00:00Z',
      excerpt: 'Test',
      slug: 'new-post',
      tags: []
    }

    const firstPostWithBody = Object.assign({body: ''}, firstPost)

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
      assert.deepEqual(JSON.parse(firstPostContent), firstPostWithBody)

      const generateIndexAction = actions.actions[3]
      assert.equal(generateIndexAction.constructor.name, 'FileWriteAction')
      assert.equal(generateIndexAction.targetFilePath, `${outputDirectory}/posts.json`)
      const generateIndexActionContent = JSON.parse(generateIndexAction.content)
      assert.deepEqual(generateIndexActionContent, [firstPost])

      const createTagDirectoryAction = actions.actions[4]
      assert.equal(createTagDirectoryAction.constructor.name, 'EnsureDirectoryAction')
      assert.equal(createTagDirectoryAction.targetDirectoryPath, `${outputDirectory}/tags`)

      const generateTagIndexAction = actions.actions[5]
      assert.equal(generateTagIndexAction.constructor.name, 'FileWriteAction')
      assert.equal(generateTagIndexAction.targetFilePath, `${outputDirectory}/tags/intro.json`)
      const generateTagIndexActionContent = JSON.parse(generateTagIndexAction.content)
      assert.deepEqual(generateTagIndexActionContent, [firstPost])

      const gitAddPossibleEditsAction = actions.actions[6]
      assert.equal(gitAddPossibleEditsAction.constructor.name, 'GitAddAction')
      assert.equal(gitAddPossibleEditsAction.gitRootDirectory, process.cwd())
      assert.deepEqual(gitAddPossibleEditsAction.paths, [contentDirectory, outputDirectory])

      const gitCommitPossibleEditsAction = actions.actions[7]
      assert.equal(gitCommitPossibleEditsAction.constructor.name, 'GitCommitAction')
      assert.equal(gitCommitPossibleEditsAction.gitRootDirectory, process.cwd())
      assert.equal(gitCommitPossibleEditsAction._message, 'Edits')

      const createNewPostLogAction = actions.actions[8]
      assert.equal(createNewPostLogAction.constructor.name, 'ConsoleLogAction')
      assert.equal(createNewPostLogAction._message, 'New post published')

      const createSecondPostDirectoryAction = actions.actions[9]
      assert.equal(createSecondPostDirectoryAction.constructor.name, 'CreateDirectoryAction')
      assert.equal(createSecondPostDirectoryAction.targetDirectoryPath, `${outputDirectory}/2019-06-15-new-post`)

      const createSecondPostJSONAction = actions.actions[10]
      assert.equal(createSecondPostJSONAction.constructor.name, 'FileWriteAction')
      assert.equal(createSecondPostJSONAction.targetFilePath, `${outputDirectory}/2019-06-15-new-post/new-post.json`)
      const secondPostContent = JSON.parse(createSecondPostJSONAction.content)
      // 2019-06-15T00:26:59.189Z
      // assert.ok(secondPostContent.date.match(/^20\d{2}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$/))
      delete secondPostContent.date
      assert.deepEqual(secondPostContent, {
        title: 'New post',
        slug: 'new-post',
        excerpt: 'Test',
        body: '',
        tags: []
      })

      const renameSlugAction = actions.actions[11]
      assert.equal(renameSlugAction.constructor.name, 'MoveFileAction')
      assert.equal(renameSlugAction.sourceFile, `${contentDirectory}/2019-06-03-new-post`)
      assert.equal(renameSlugAction.targetDirectory, `${contentDirectory}/2019-06-15-new-post`)

      const createSecondPostSourceAction = actions.actions[12]
      assert.equal(createSecondPostSourceAction.constructor.name, 'FileWriteAction')
      assert.equal(createSecondPostSourceAction.targetFilePath, `${contentDirectory}/2019-06-15-new-post/new-post.md`)
      assert.equal(createSecondPostSourceAction.content, "date: 2019-06-15 14:00:00\n\n---\n\n# New post\n\n_Test_\n")

      const gitAddSecondPostSourceAction = actions.actions[13]
      assert.equal(gitAddSecondPostSourceAction.constructor.name, 'GitAddAction')
      assert.equal(gitAddSecondPostSourceAction.gitRootDirectory, process.cwd())
      assert.deepEqual(gitAddSecondPostSourceAction.paths, [`${contentDirectory}/2019-06-15-new-post`, `${outputDirectory}/2019-06-15-new-post`])

      const gitRemoveOldSourceDirectoryAction = actions.actions[14]
      assert.equal(gitRemoveOldSourceDirectoryAction.constructor.name, 'GitRemoveAction')
      assert.equal(gitRemoveOldSourceDirectoryAction.gitRootDirectory, process.cwd())
      assert(gitRemoveOldSourceDirectoryAction.options.recursive)
      assert.deepEqual(gitRemoveOldSourceDirectoryAction.paths, [`${contentDirectory}/2019-06-03-new-post`])

      const gitCommitSecondPostSourceAction = actions.actions[15]
      assert.equal(gitCommitSecondPostSourceAction.constructor.name, 'GitCommitAction')
      assert.equal(gitCommitSecondPostSourceAction.gitRootDirectory, process.cwd())
      assert.equal(gitCommitSecondPostSourceAction._message, 'Post New post published')

      const generateNewIndexAction = actions.actions[16]
      assert.equal(generateNewIndexAction.constructor.name, 'FileWriteAction')
      assert.equal(generateNewIndexAction.targetFilePath, `${outputDirectory}/posts.json`)
      const generateNewIndexActionContent = JSON.parse(generateNewIndexAction.content)
      assert.deepEqual(generateNewIndexActionContent, [firstPost, secondPost])

      const ensureTagDirectoryAction = actions.actions[17]
      assert.equal(ensureTagDirectoryAction.constructor.name, 'EnsureDirectoryAction')
      assert.equal(ensureTagDirectoryAction.targetDirectoryPath, `${outputDirectory}/tags`)

      const generateNewTagIndexAction = actions.actions[18]
      assert.equal(generateNewTagIndexAction.constructor.name, 'FileWriteAction')
      assert.equal(generateNewTagIndexAction.targetFilePath, `${outputDirectory}/tags/intro.json`)
      const generateNewTagIndexActionContent = JSON.parse(generateNewTagIndexAction.content)
      assert.deepEqual(generateNewTagIndexActionContent, [firstPost])

      assert(!actions.actions[19])
    })
  })
})
