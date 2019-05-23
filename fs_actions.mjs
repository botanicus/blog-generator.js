import fs from 'fs'
import path from 'path'
import { ensure } from './utils.mjs'

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
    this.actions.forEach((action) => {
      console.log(action.message())
      action.commit()
    })
  }
}

export class FileSystemAction {
  validate() {
    throw new Error('Override this method in your subclass of FileSystemAction')
  }

  message() {
    throw new Error('Override this method in your subclass of FileSystemAction')
  }

  commit() {
    throw new Error('Override this method in your subclass of FileSystemAction')
  }
}

export class MoveFileAction extends FileSystemAction {
  constructor(sourceFile, targetDirectory) {
    super()
    this.sourceFile = ensure(sourceFile, 'MoveFileAction: sourceFile must not be empty')
    this.targetDirectory = ensure(targetDirectory, 'MoveFileAction: targetDirectory must not be empty')
  }

  validate() {
    if (!fs.statSync(this.sourceFile).isFile()) {
      throw new Error('sourceFile must be a file')
    }

    if (!fs.statSync(this.targetDirectory).isDirectory()) {
      throw new Error('targetDirectory must be a directory')
    }
  }

  message() {
    return `~ mv ${this.sourceFile} ${this.targetDirectory}`
  }

  commit() {
    fs.rename(this.sourceFile, this.targetDirectory)
  }
}

export class FileWriteAction extends FileSystemAction {
  constructor(targetFilePath, content) {
    super()
    this.targetFilePath = ensure(targetFilePath, 'FileWriteAction: targetFilePath must not be empty')
    this.content = ensure(content, 'FileWriteAction: content must not be empty')
  }

  message() {
    return `Writing ${this.targetFilePath}`
  }

  validate() {
    const targetDirName = path.dirname(this.targetFilePath)

    if (!fs.statSync(targetDirName).isDirectory()) {
      throw new Error('targetDirName must be exist')
    }
  }
}

export class CreateDirectoryAction extends FileSystemAction {
  constructor(targetDirectoryPath) {
    super()
    this.targetDirectoryPath = ensure(targetDirectoryPath, 'CreateDirectoryAction: targetDirectoryPath must not be empty')
  }

  validate() {
    const targetDirName = path.dirname(this.targetDirectoryPath)

    if (!fs.statSync(targetDirName).isDirectory()) {
      throw new Error('targetDirName must exist')
    }
  }

  message() {
    return `~ mkdir ${this.targetDirectoryPath}`
  }

  commit() {
    fs.mkdir(this.targetDirectoryPath)
  }
}
