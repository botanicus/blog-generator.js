import test from 'ava'
import assert from 'assert'
import { MoveFileAction } from './fs_actions.mjs'

/* MoveFileAction */
test('MoveFileAction cannot be instantiated without sourceFile', t => {
  assert.throws(() => new MoveFileAction(), /sourceFile/)
  t.pass()
})

test('MoveFileAction cannot be instantiated without targetDirectory', t => {
  assert.throws(() => new MoveFileAction('file.txt'), /targetDirectory/)
  t.pass()
})

test('MoveFileAction can be instantiated with sourceFile and targetDirectory', t => {
  assert.doesNotThrow(() => new MoveFileAction('file.txt', '/tmp'))
  t.pass()
})

test('MoveFileAction has sourceFile and targetDirectory properties', t => {
  const action = new MoveFileAction('file.txt', '/tmp')
  assert(action.sourceFile)
  assert(action.targetDirectory)
  t.pass()
})

test('MoveFileAction.prototype.validate() throws an error if the sourceFile does not exist', t => {
  const action = new MoveFileAction('file.txt', '/tmp')
  assert.throws(() => action.validate(), /ENOENT/)
  t.pass()
})

test('MoveFileAction.prototype.validate() throws an error if the sourceFile is not a file', t => {
  const action = new MoveFileAction('/tmp', '/tmp')
  assert.throws(() => action.validate(), /must be a file/)
  t.pass()
})

test('MoveFileAction.prototype.validate() throws an error if the targetDirectory does not exist', t => {
  const action = new MoveFileAction('fs_actions_test.mjs', '/a/b/c')
  assert.throws(() => action.validate(), /ENOENT/)
  t.pass()
})

test('MoveFileAction.prototype.validate() throws an error if the targetDirectory is not a directory', t => {
  const action = new MoveFileAction('fs_actions_test.mjs', 'fs_actions_test.mjs')
  assert.throws(() => action.validate(), /must be a directory/)
  t.pass()
})

// TODO: Test MoveFileAction.prototype.commit()
