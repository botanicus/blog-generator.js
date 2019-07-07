import path from 'path'
import { ensure } from '../utils.mjs'

/*
  We need to be able to retrieve a post based on only its slug.
  That means no timestamps in the output directory.

  Timestamps are useful for organizing the content directory.
*/

class SourceLocation {
  constructor(timestamp, slug, path) {
    this.timestamp = ensure(timestamp, `${this.constructor.name}: timestamp is required`)
    this.slug = ensure(slug, `${this.constructor.name}: slug is required`)
    this.path = ensure(path, `${this.constructor.name}: path is required`)
  }

  getDirectoryBaseName() {
    return `${this.timestamp}-${this.slug}`
  }

  getDirectoryPath() {
    return path.join(this.path, this.getDirectoryBaseName())
  }

  getFilePath(basename = 'post.md') {
    return path.join(this.getDirectoryPath(), basename)
  }
}

/*
  output/hello-world/hello-world.json
  output/hello-world/cute-kitty.png
*/
class OutputLocation {
  constructor(slug, path) {
    this.slug = ensure(slug, `${this.constructor.name}: slug is required`)
    this.path = ensure(path, `${this.constructor.name}: path is required`)
  }

  getDirectoryPath() {
    return path.join(this.path, this.slug)
  }

  getFilePath(basename = 'post.json') {
    return path.join(this.getDirectoryPath(), basename)
  }
}

export default class PathRouter {
  constructor(originalFileTimestamp, publishedDateTimestamp, slug, contentDirectory, outputDirectory) {
    ensure(originalFileTimestamp, `${this.constructor.name}: originalFileTimestamp is required`)
    ensure(publishedDateTimestamp, `${this.constructor.name}: publishedDateTimestamp is required`)
    ensure(slug, `${this.constructor.name}: slug is required`)
    ensure(contentDirectory, `${this.constructor.name}: contentDirectory is required`)
    ensure(outputDirectory, `${this.constructor.name}: outputDirectory is required`)

    this.originalSource = new SourceLocation(originalFileTimestamp, slug, contentDirectory)
    this.standardizedSource = new SourceLocation(publishedDateTimestamp, slug, contentDirectory)
    this.output = new OutputLocation(slug, outputDirectory)
  }

  hasSourceDirectoryChanged() {
    return this.originalSource.getDirectoryPath() !== this.standardizedSource.getDirectoryPath()
  }
}
