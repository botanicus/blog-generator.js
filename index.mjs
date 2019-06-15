import fs from 'fs'

import {
  formatLongPostObject,
  formatShortPostObject
} from './post/formatters.mjs'

import {
  FileSystemActions,
  MoveFileAction,
  FileWriteAction,
  CreateDirectoryAction,
  RemoveDirectoryAction,
  RemoveFileAction,
  ConsoleLogAction
} from '@botanicus/fs-actions'

import {
  GitAddAction,
  GitRemoveAction,
  GitCommitAction
} from '@botanicus/fs-actions/git.mjs'

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
   Rewrite the slug if necessary, based on today's date (both content and output).
  */
  posts.forEach((post) => generatePost(post, actions, contentDirectory, outputDirectory))

  generateIndex(posts, actions, outputDirectory)
  generateTagIndices(posts, actions, outputDirectory)

  return actions
}

/* Existing post has always consistency in the original timestamp and the actual one from the date YAML header. */
function regenerateExistingPost (post, actions, location) {
  actions.add(new CreateDirectoryAction(location.outputDirectory))
  actions.add(new FileWriteAction(location.outputFile, JSON.stringify(post.asJSON())))
}

function generateNewPost (post, actions, contentDirectory, outputDirectory) {
  // const now = new Date()
  // post.date = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  post.date = new Date()
  const location = post.getLocation(contentDirectory, outputDirectory)

  actions.add(new ConsoleLogAction(`New post detected ${post.slug}, setting published date`))

  actions.add(new CreateDirectoryAction(location.outputDirectory))
  actions.add(new FileWriteAction(location.outputFile, JSON.stringify(post.asJSON())))

  actions.add(new MoveFileAction(location.originalSourceDirectory, location.standardizedSourceDirectory))
  actions.add(new FileWriteAction(location.standardizedSourceFile, post.serialize()))
  actions.add(new GitAddAction(process.cwd(), [location.standardizedSourceDirectory]))

  if (location.originalSourceDirectory !== location.standardizedSourceDirectory) {
    actions.add(new GitRemoveAction(process.cwd(), [location.standardizedSourceDirectory]))
  }

  if (post.tags.length) {
    actions.add(new GitCommitAction(process.cwd(), `Post ${post.title} published with tags ${post.tags.join(' ')}`))
  } else {
    actions.add(new GitCommitAction(process.cwd(), `Post ${post.title} published`))
  }
}

function generatePost (post, actions, contentDirectory, outputDirectory) {
  post.date ? regenerateExistingPost(
    post, actions, post.getLocation(contentDirectory, outputDirectory)
  ) : generateNewPost(post, actions, contentDirectory, outputDirectory)
}

function generateIndex (posts, actions, outputDirectory) {
  // TODO
  console.log('~ generateIndex: TODO')
}

function generateTagIndices (posts, actions, outputDirectory) {
  // TODO
  console.log('~ generateTagIndices: TODO')
}

function loadAllPosts (postDirectory) {
  const postDirectories = fs.readdirSync(postDirectory).
    filter((basename) => fs.statSync(`${postDirectory}/${basename}`).isDirectory() && basename.match(/^\d{4}-\d{2}-\d{2}-/))

  return postDirectories.map((directory) => {
    const slug = directory.replace(/^\d{4}-\d{2}-\d{2}-(.+)$/, '$1')
    const path = `${postDirectory}/${directory}/${slug}.md`
    const post = new Post(slug, path)
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
