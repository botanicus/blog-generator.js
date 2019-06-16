import path from 'path'
import { ensure } from '../utils.mjs'

export default class PostLocation {
  constructor(originalFileTimestamp, publishedDateTimestamp, slug, contentDirectory, outputDirectory) {
    this.originalFileTimestamp = ensure(originalFileTimestamp, `${this.constructor.name}: originalFileTimestamp is required`)
    this.publishedDateTimestamp = ensure(publishedDateTimestamp, `${this.constructor.name}: publishedDateTimestamp is required`)

    this.slug = ensure(slug, `${this.constructor.name}: slug is required`)

    this._contentDirectory = ensure(contentDirectory, `${this.constructor.name}: contentDirectory is required`)
    this._outputDirectory = ensure(outputDirectory, `${this.constructor.name}: outputDirectory is required`)
  }

 /* ${contentDirectory}/posts/2019-06-01-hello-world */
  getOriginalSourceDirectory() {
    return path.join(this._contentDirectory, `${this.originalFileTimestamp}-${this.slug}`)
  }

 /* ${contentDirectory}/posts/2019-06-01-hello-world/hello-world.md */
  getOriginalSourceFile(basename = `${this.slug}.md`) {
    return path.join(this.getOriginalSourceDirectory, basename)
  }

 /* ${contentDirectory}/posts/2019-06-01-hello-world */
  getStandardizedSourceDirectory() {
    return path.join(this._contentDirectory, `${this.publishedDateTimestamp}-${this.slug}`)
  }

 /* ${contentDirectory}/posts/2019-06-01-hello-world/hello-world.md */
  getStandardizedSourceFile(basename = `${this.slug}.md`) {
    return path.join(this.getStandardizedSourceDirectory, basename)
  }

 /* ${outpoutDirectory}/posts/2019-06-01-hello-world */
  outputDirectory() {
    return path.join(this._outputDirectory, `${this.publishedDateTimestamp}-${this.slug}`)
  }

 /* ${outpoutDirectory}/posts/2019-06-01-hello-world/hello-world.json */
  getOutputFile(basename = `${this.slug}.json`) {
    return path.join(this.outputDirectory, basename)
  }
}
