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
  get originalSourceDirectory() {
    return path.join(this._contentDirectory, `${this.originalFileTimestamp}-${this.slug}`)
  }

 /* ${contentDirectory}/posts/2019-06-01-hello-world/hello-world.md */
  get originalSourceFile() {
    return path.join(this.originalSourceDirectory, `${this.slug}.md`)
  }

 /* ${contentDirectory}/posts/2019-06-01-hello-world */
  get standardizedSourceDirectory() {
    return path.join(this._contentDirectory, `${this.publishedDateTimestamp}-${this.slug}`)
  }

 /* ${contentDirectory}/posts/2019-06-01-hello-world/hello-world.md */
  get standardizedSourceFile() {
    return path.join(this.standardizedSourceDirectory, `${this.slug}.md`)
  }

 /* ${outpoutDirectory}/posts/2019-06-01-hello-world */
  get outputDirectory() {
    return path.join(this._outputDirectory, `${this.publishedDateTimestamp}-${this.slug}`)
  }

 /* ${outpoutDirectory}/posts/2019-06-01-hello-world/hello-world.json */
  get outputFile() {
    return path.join(this.outputDirectory, `${this.slug}.json`)
  }
}
