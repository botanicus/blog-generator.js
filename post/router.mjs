import path from 'path'
import { ensure } from '../utils.mjs'

class Location {
  constructor(timestamp, slug, path, defaultBasename) {
    this.timestamp = ensure(timestamp, `${this.constructor.name}: timestamp is required`)
    this.slug = ensure(slug, `${this.constructor.name}: slug is required`)
    this.path = ensure(path, `${this.constructor.name}: path is required`)
    this.defaultBasename = ensure(defaultBasename, `${this.constructor.name}: defaultBasename is required`)
  }

  getDirectoryBaseName() {
    return `${this.timestamp}-${this.slug}`
  }

  getDirectoryPath() {
    return path.join(this.path, this.getDirectoryBaseName())
  }

  getFilePath(basename = this.defaultBasename) {
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

    this.originalSource = new Location(originalFileTimestamp, slug, contentDirectory, `${slug}.md`)
    this.standardizedSource = new Location(publishedDateTimestamp, slug, contentDirectory, `${slug}.md`)
    this.output = new Location(publishedDateTimestamp, slug, outputDirectory, `${slug}.json`)
  }

  hasSourceDirectoryChanged() {
    return this.originalSource.getDirectoryPath() !== this.standardizedSource.getDirectoryPath()
  }
}
