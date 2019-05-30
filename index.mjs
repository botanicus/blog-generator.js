import {
  formatLongPostObject,
  formatShortPostObject
} from './format-data-output.mjs'

import {
  FileSystemActions,
  MoveFileAction,
  FileWriteAction,
  CreateDirectoryAction,
  RemoveDirectoryAction,
  RemoveFileAction
} from 'fs-actions'

import Post from './post.mjs'

export function validate (contentDirectory) {
  return true
}

/*
  1. Remove everything in the output/ directory.
  2. Load all the posts from the MD originals.
  3. For each 2019-05-20-hello-world/:
     a) Create output/2019-05-20-hello-world/.
     b) Generate hello-world.json from hello-world.md.
     c) Copy all the images.
     d) Rewrite the header: add date.
  4. Generate output/posts.json and output/tags/*.json.
*/
export function generate (contentDirectory, outputDirectory) {
  const actions = new FileSystemActions()

  cleanUpDirectory(outputDirectory, actions)

  return actions
}

function cleanUpDirectory (directory, actions) {
  if (fs.statSync(directory).isDirectory()) {
    fs.readdirSync(directory).
      /* Filter out .git and the likes. */
      filter((path) => path.match(/^[^\.]/)).
      forEach((path) => {
        const fullPath = `${directory}/${path}`
        if (fs.statSync(fullPath).isDirectory()) {
          actions.add(new RemoveDirectoryAction(fullPath))
        } else {
          actions.add(new RemoveFileAction(fullPath))
        }
      })
  } else {
    actions.add(new CreateDirectoryAction(directory))
  }
}
