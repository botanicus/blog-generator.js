import { ensure } from './utils.mjs'

export default class Tag {
  constructor(name) {
    this.name = ensure(name, `${this.constructor.name}: name is required`)
  }

  get slug() {
    return this.name.toLowerCase()
      .replace(/&/g, 'and')
      .replace(/ /g, '-')
      .replace(/[:,?!.]/g, '')
  }
}
