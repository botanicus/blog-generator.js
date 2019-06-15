/* Usage: node --experimental-modules bin/blog-generator.mjs */

import { validate, generate } from '../index.mjs'
import fs from 'fs'

if (process.argv.length !== 4) {
  console.error(`Usage: ${process.title} [contentDirectory] [outputDirectory]`)
  process.exit(1)
}

const contentDirectory = process.argv[2]
const outputDirectory = process.argv[3]

/* Throw an error if either of the directories doesn't exist. */
fs.statSync(contentDirectory).isDirectory()
fs.statSync(outputDirectory).isDirectory()

// try {
  validate(contentDirectory)
// } catch(error) {
//   abort("#{error.class}: #{error.message}")
// }

console.log('~ Validation successful.')

// try {
  const actions = generate(contentDirectory, outputDirectory)
  // actions.validate()
  actions.commit()
// } catch(error) {
//   abort("#{error.class}: #{error.message}")
// }

console.log('~ Post generation successful.')
