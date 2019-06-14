import path from 'path'
import { ensure } from '../utils.mjs'

export default class PostLocation {
  constructor(timestamp, slug, contentDirectory, outputDirectory) {
    this.timestamp = ensure(timestamp, 'PostLocation: timestamp is required')
    this.slug = ensure(slug, 'PostLocation: slug is required')
    this._contentDirectory = ensure(contentDirectory, 'PostLocation: contentDirectory is required')
    this._outputDirectory = ensure(outputDirectory, 'PostLocation: outputDirectory is required')
  }

 /* ${contentDirectory}/posts/2019-06-01-hello-world */
  get sourceDirectory() {
    return path.join(this._contentDirectory, `${this.timestamp}-${this.slug}`)
  }

 /* ${contentDirectory}/posts/2019-06-01-hello-world/hello-world.md */
  get sourceFile() {
    return path.join(this._sourceDirectory, `${this.slug}.md`)
  }

 /* ${outpoutDirectory}/posts/2019-06-01-hello-world */
  get outputDirectory() {
    return path.join(this._outputDirectory, `${this.timestamp}-${this.slug}`)
  }

 /* ${outpoutDirectory}/posts/2019-06-01-hello-world/hello-world.json */
  get outputFile() {
    return path.join(this._outputDirectory, `${this.slug}.json`)
  }
}
