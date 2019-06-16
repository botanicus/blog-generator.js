/* TODO: Move to fs-actions. */

import fs from 'fs'
import yaml from 'js-yaml'

import * as fsActions from '@botanicus/fs-actions'
import * as gitActions from '@botanicus/fs-actions/git.mjs'

const pkg = Object.assign({}, fsActions, gitActions)

export function saveSnapshot (path, actions) {
  fs.writeFileSync(path, yaml.dump(actions.snapshot()))
}

export function loadSnapshot (path) {
  const actions = yaml.load(fs.readFileSync(path)).map((action) => {
    const constructor = pkg[action.type]
    delete action.type
    const signature = getConstructorSignature(constructor)
    const params = signature.map((argumentName) => action[argumentName])
    return new constructor(...params)
  })
  return new pkg.FileSystemActions(...actions)
}

function getConstructorSignature (constructor) {
  const lines = constructor.toString().split("\n")
  const line = lines.filter((line) => line.match(/^\s+constructor\(/))[0]
  /* Handle inheritance such as GitAddAction -> GitAction. */
  if (!line) return getConstructorSignature(Object.getPrototypeOf(constructor))
  return line.trim().replace(/^constructor\((.+)\) \{$/, '$1').replace(/\s*=\s*[^),]+/).split(', ')
}
