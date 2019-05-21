import { getFullPostFromStoredJSON, getFullPostFromObject, getShortPostFromStoredJSON, getShortPostFromObject } from './post.mjs'
import { FileSystemActions, MoveFileAction, FileWriteAction, CreateDirectoryAction } from './fs_actions.mjs'
import Post from './parser.mjs'

export function validate (content_directory) {
  return true
}

export function generate (content_directory, output_directory) {
  const actions = new FileSystemActions()
  return actions
}
