import { formatLongPostObject, formatShortPostObject} from './format-data-output.mjs'
import { FileSystemActions, MoveFileAction, FileWriteAction, CreateDirectoryAction } from 'fs-actions'
import Post from './parser.mjs'

export function validate (content_directory) {
  return true
}

/*
  1. Remove everything in the output/ directory.
  2. Load all the posts from the MD originals.
  3. For each 2019-05-20-hello-world/:
     a) Create output/2019-05-20-hello-world/.
     b) Generate hello-world.json from hello-world.md.
     c) Copy all the images.
  4. Generate output/posts.json and output/tags/*.json.
*/
export function generate (content_directory, output_directory) {
  const actions = new FileSystemActions()
  return actions
}
