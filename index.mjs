import fs from 'fs'

import {
  formatLongPostObject,
  formatShortPostObject
} from './post/formatters.mjs'

import {
  FileSystemActions,
  MoveFileAction,
  CopyFileAction,
  FileWriteAction,
  CreateDirectoryAction,
  EnsureDirectoryAction,
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
import Tag from './tag.mjs'

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
    // TODO: Just create it.
    throw new Error(`generate: content directory ${contentDirectory} doesn't exist or is not a directory`)
  }

  const actions = new FileSystemActions()

  /*
    Remove everything from the output/ directory.
    Except .git/ and the likes OR create the output
    directory if it doesn't exist yet.
  */
  // TODO: The .git directory is NEVER in output, as we are manipulating the content/ as well, like when changing timestamp.
  prepareOutputDirectory(outputDirectory, actions)

  const posts = loadAllPosts(contentDirectory)

  /*
   Create output/2019-05-20-hello-world/.
   Generate hello-world.json from hello-world.md.
   Copy all the images.
   Rewrite the header: add date.
   Rewrite the slug if necessary, based on today's date (both content and output).
  */

  /* Regenerate all the published posts, so we can commit changes. */
  const publishedPosts = posts.filter((post) => post.date)
  publishedPosts.forEach((post) => generatePost(post, actions, contentDirectory, outputDirectory))

  generateIndex(publishedPosts, actions, outputDirectory)
  generateTagIndices(publishedPosts, actions, outputDirectory)

  actions.add(new GitAddAction(process.cwd(), [contentDirectory, outputDirectory]))
  actions.add(new GitCommitAction(process.cwd(), 'Edits', {soft: true}))

  /* Publish new posts. */
  posts
    .filter((post) => !post.date)
    .forEach((post) => {
      const location = generateNewPost(post, actions, contentDirectory, outputDirectory)
      /* Regenerate for atomicity, in case we have more new posts. */
      generateIndex(posts, actions, outputDirectory)
      generateTagIndices(posts, actions, outputDirectory)

      if (location.originalSource.getDirectoryPath() !== location.standardizedSource.getDirectory) {
        actions.add(new RemoveDirectoryAction(location.originalSource.getDirectoryPath()))
      }

      actions.add(new GitAddAction(process.cwd(), [contentDirectory, outputDirectory]))

      if (post.tags.length) {
        actions.add(new GitCommitAction(process.cwd(), `Post ${post.title} published with tags ${post.tags.join(' ')}`))
      } else {
        actions.add(new GitCommitAction(process.cwd(), `Post ${post.title} published`))
      }
    })


  return actions
}

/* Existing post has always consistency in the original timestamp and the actual one from the date YAML header. */
function regenerateExistingPost (post, actions, location) {
  actions.add(new CreateDirectoryAction(location.output.getDirectoryPath()))
  actions.add(new FileWriteAction(location.output.getFilePath(), formatDataForFile(JSON.stringify(post.asJSON()))))
  copyExternalImages(actions, post, location)
}

function copyExternalImages (actions, post, location) {
  post.externalFiles.forEach((basename) => {
    const origin = location.originalSource.getFilePath(basename)
    const target = location.output.getFilePath(basename)
    actions.add(new CopyFileAction(origin, target))
  })
}

function generateNewPost (post, actions, contentDirectory, outputDirectory) {
  // const now = new Date()
  // post.date = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  post.date = new Date()
  const location = post.getLocation(contentDirectory, outputDirectory)

  actions.add(new ConsoleLogAction(`${post.title} published`))

  actions.add(new CreateDirectoryAction(location.output.getDirectoryPath()))
  actions.add(new FileWriteAction(location.output.getFilePath(), formatDataForFile(JSON.stringify(post.asJSON())))
  )
  actions.add(new MoveFileAction(location.originalSource.getDirectoryPath(), location.standardizedSource.getDirectoryPath()))
  actions.add(new FileWriteAction(location.standardizedSource.getFilePath(), post.serialize()))

  copyExternalImages(actions, post, location)

  return location
}

function generatePost (post, actions, contentDirectory, outputDirectory) {
  post.date ? regenerateExistingPost(
    post, actions, post.getLocation(contentDirectory, outputDirectory)
  ) : generateNewPost(post, actions, contentDirectory, outputDirectory)
}

/*
  The dates are serialized as 2019-06-15T14:00:00.???Z
  where the ??? are 3 random digits. This screws up my tests.
*/
function makeDateFormatPredictable (string) {
  return string.replace(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.\d{3}Z/g, '$1Z')
}

function formatDataForFile (string) {
  return makeDateFormatPredictable(string) + "\n"
}

function generateIndex (posts, actions, outputDirectory) {
  actions.add(new FileWriteAction(
    `${outputDirectory}/posts.json`,
    formatDataForFile(JSON.stringify(posts.map((post) => post.asShortJSON())))
  ))
}


function generateTagIndices (posts, actions, outputDirectory) {
  const entries = Object.entries(Tag.buildMap(posts))

  if (!entries.length) return

  actions.add(new EnsureDirectoryAction(`${outputDirectory}/tags`))

  for (const [tagSlug, tagPostsEntry] of entries) {
    actions.add(new FileWriteAction(
      `${outputDirectory}/tags/${tagPostsEntry.tag.slug}.json`,
      formatDataForFile(JSON.stringify({tag: tagPostsEntry.tag.asJSON(), posts: tagPostsEntry.posts.map(post => post.asShortJSON())}))
    ))
  }
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
