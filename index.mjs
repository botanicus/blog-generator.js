import fs from 'fs'

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
} from '@botanicus/fs-actions'

import Post from './post.mjs'

export function validate (contentDirectory) {
  const posts = loadAllPosts(contentDirectory)
  // TODO: for each, validate pics etc.
  return true
}

/*
  4. Generate output/posts.json and output/tags/*.json.
*/
export function generate (contentDirectory, outputDirectory) {
  const actions = new FileSystemActions()

  /*
    Remove everything from the output/ directory.
    Except .git/ and the likes.
  */
  cleanUpDirectory(outputDirectory, actions)

  const posts = loadAllPosts(contentDirectory)
  /*
   Create output/2019-05-20-hello-world/.
   Generate hello-world.json from hello-world.md.
   Copy all the images.
   Rewrite the header: add date.
  */
  posts.forEach((post) => {
    //
  })

  generateIndex(posts, actions)
  generateTagIndices(posts, actions)

  return actions
}

function generateIndex (posts, actions) {
  // TODO
}

function generateTagIndices (posts, actions) {
  // TODO
}

function loadAllPosts (postDirectory) {
  const postDirectories = fs.readdirSync(postDirectory).
    filter((path) => fs.statSync(path).isDirectory() && path.match(/^\d{4}-\d{2}\d{2}-/))

  return postDirectories.map((directory) => {
    const slug = path.replace(/^\d{4}-\d{2}-\d{2}-(.+)\.md$/, '$1')
    const path = `${postDirectory}/${directory}/${slug}.md`
    new Post(slug, fs.readFileSync(path))
  })
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
