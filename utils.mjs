import assert from 'assert'

export function ensure(object, message) {
  assert(object, message)
  return object
}
