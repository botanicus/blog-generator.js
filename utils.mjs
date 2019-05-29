import assert from 'assert'

export function ensure (object, message) {
  assert(object, message)
  return object
}

export function escapeRegExp (string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
}
