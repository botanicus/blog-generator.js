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
  if (!fs.existsSync(contentDirectory) || !fs.statSync(contentDirectory).isDirectory()) {
    throw new Error(`generate: content directory ${contentDirectory} doesn't exist or is not a directory`)
  }

  const actions = new FileSystemActions()

  /*
    Remove everything from the output/ directory.
    Except .git/ and the likes OR create the output
    directory if it doesn't exist yet.
  */
  prepareOutputDirectory(outputDirectory, actions)

  const posts = loadAllPosts(contentDirectory)

  /*
   Create output/2019-05-20-hello-world/.
   Generate hello-world.json from hello-world.md.
   Copy all the images.
   Rewrite the header: add date.
  */
  posts.forEach((post) => generatePost(post, actions, outputDirectory))

  generateIndex(posts, actions, outputDirectory)
  generateTagIndices(posts, actions, outputDirectory)

  return actions
}

function generatePost (post, actions, outputDirectory) {
  // TODO
  console.log(`~ generatePost ${post.slug}`)
  actions.add(new CreateDirectoryAction(`${outputDirectory}/${post.timestamp}-${post.slug}`))
}

function generateIndex (posts, actions, outputDirectory) {
  // TODO
  console.log('~ generateIndex')
}

function generateTagIndices (posts, actions, outputDirectory) {
  // TODO
  console.log('~ generateTagIndices')
}

function loadAllPosts (postDirectory) {
  const postDirectories = fs.readdirSync(postDirectory).
    filter((basename) => fs.statSync(`${postDirectory}/${basename}`).isDirectory() && basename.match(/^\d{4}-\d{2}-\d{2}-/))

  return postDirectories.map((directory) => {
    const slug = directory.replace(/^\d{4}-\d{2}-\d{2}-(.+)$/, '$1')
    const path = `${postDirectory}/${directory}/${slug}.md`
    const post = new Post(slug, fs.readFileSync(path))
    if (!post.date) post.date = new Date() ////// ........
    return post
  })
}

function prepareOutputDirectory (directory, actions) {
  if (fs.existsSync(directory) && fs.statSync(directory).isDirectory()) {
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
