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
  posts.forEach((post) => generatePost(post, actions, outputDirectory, contentDirectory))

  generateIndex(posts, actions, outputDirectory)
  generateTagIndices(posts, actions, outputDirectory)

  return actions
}

function generatePost (post, actions, outputDirectory, contentDirectory) {
  const location = post.getLocation(contentDirectory, outputDirectory)
  actions.add(new CreateDirectoryAction(location.outputDirectory))

  if (!post.date) {
    // const now = new Date()
    // post.date = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    post.date = new Date()
    console.log(['d', post.date, post.timestamp])

    const postDirectoryPath = `${contentDirectory}/${post.timestamp}-${post.slug}`
    const postSourceFilePath = `${postDirectoryPath}/${post.slug}.md`

    actions.add(new ConsoleLogAction(`New post detected ${post.slug}, setting published date`))
    actions.add(new FileWriteAction(postSourceFilePath, post.content))
    actions.add(new GitAddAction(postDirectoryPath))
    if (post.tags.length) {
      actions.add(new GitCommitAction(`Post ${post.title} published with tags ${post.tags.join(' ')}`))
    } else {
      actions.add(new GitCommitAction(`Post ${post.title} published`))
    }

    // /* Rename to respect the real published date. */
    // if (post.timestamp !== realTimestamp) {
    //   // TODO: add GitRenameAction to fs-actions
    //   actions.add(new GitRenameAction(a, b))
    //   actions.add(new GitCommitAction(`${a} -> ${b}`))
    // }
  }

  actions.add(new FileWriteAction(`${outputDirectory}/${post.timestamp}-${post.slug}/${post.slug}.json`, JSON.stringify(post.asJSON())))
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
    const post = new Post(slug, fs.readFileSync(path).toString())
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
