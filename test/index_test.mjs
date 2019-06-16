import fs from 'fs'
import assert from 'assert'
import { validate, generate } from '../index.mjs'
import timekeeper from 'timekeeper'
import { saveSnapshot, loadSnapshot } from './helpers.mjs'

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
    const contentDirectory  = 'test/assets/content'

    it('creates the post directory', () => {
      const savedStateActions = loadSnapshot('test/snapshot.yml')
      const actions = generate(contentDirectory, outputDirectory)

      assert.deepEqual(actions, savedStateActions)
    })
  })
})
