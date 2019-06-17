import { ensure } from './utils.mjs'

export class TagPostListEntry {
  constructor(tag) {
    this.tag = tag
    this.posts = []
  }

  push(post) {
    this.posts.push(post)
  }
}

export default class Tag {
  /*
    In JavaScript object keys have to be strings.
    Therefore we cannot do {tagInstance => [postInstance1, ...]}
  */
  static buildMap(posts) {
    return posts.reduce((tagsWithPosts, post) => {
      post.tags.forEach((tag) => {
        if (!tagsWithPosts[tag.slug]) tagsWithPosts[tag.slug] = new TagPostListEntry(tag)
        tagsWithPosts[tag.slug].push(post)
      })
      return tagsWithPosts
    }, {})
  }

  constructor(name) {
    this.name = ensure(name, `${this.constructor.name}: name is required`)
  }

  get slug() {
    return this.name.toLowerCase()
      .replace(/&/g, 'and')
      .replace(/ /g, '-')
      .replace(/[:,?!.]/g, '')
  }

  asShortJSON() {
    return {
      name: this.name,
      slug: this.slug,
      path: `/tags/${this.slug}.json`
    }
  }

  asJSON(posts) {
    ensure(posts, `${this.constructor.name}.asJSON(): posts are required`)
    return Object.assign(this.asShortJSON(), {posts: posts.map(post => post.asShortJSON())})
  }
}
