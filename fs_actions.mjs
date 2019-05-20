export class FileSystemActions {
  constructor(...actions) {
    this.actions = actions
  }

  add(...actions) {
    this.actions.forEach((action) => {
      if (!action.validate || !action.commit) {
        throw `Action ${action} must have .validate() and .commit() functions`
      }
    })

    this.actions.push(...actions)
  }

  validate() {
    this.actions.forEach((action) => action.validate())
  }

  commit() {
    this.actions.forEach((action) => action.commit())
  }
}

export class FileSystemAction {
  // TODO
}

export class MoveFileAction extends FileSystemAction {
  // TODO
}

export class FileWriteAction extends FileSystemAction {
  // TODO
}

export class CreateDirectoryAction extends FileSystemAction {
  // TODO
}
