import { ExecException, ExecFileOptions, exec, execFile } from 'child_process'
import { BrowserWindow, ipcMain } from 'electron'
import {
  ObjectEncodingOptions,
  PathLike,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync
} from 'fs'
import { join } from 'path'
import { stdout } from 'process'

let mainWindow: BrowserWindow = undefined!

// Register main api handlers
export const initMainAPI = (_mainWindow: BrowserWindow) => {
  mainWindow = _mainWindow

  // In order to avoid a bug in typescript...
  const api = mainAPI as any

  for (const methodName in api) {
    if (typeof api[methodName] === 'function') {
      ipcMain.handle(methodName, async (_event, ...args) => {
        return await api[methodName](...args)
      })
    }
  }
}

function getFiles(dir: PathLike, dir2: PathLike, files: string[] = []) {
  // Get an array of all files and directories in the passed directory using fs.readdirSync
  const fileList = readdirSync(dir)
  // Create the full path of the file/directory by concatenating the passed directory and file/directory name
  for (const file of fileList) {
    const name = `${dir}/${file}`
    const name2 = dir2 === '' ? file : `${dir2}/${file}`
    // Check if the current file/directory is a directory using fs.statSync
    if (statSync(name).isDirectory()) {
      // If it is a directory, recursively call the getFiles function with the directory path and the files array
      getFiles(name, name2, files)
    } else {
      // If it is a file, push the full path to the files array
      files.push(name2)
    }
  }
  return files
}

export const mainAPI = {
  // ========== FS
  async writeFile(file: string, text: string) {
    writeFileSync(file, text)
  },

  async readFile(file: string) {
    return readFileSync(file, { encoding: 'utf8' })
  },

  async pathExists(file: string) {
    return existsSync(file)
  },

  async createDir(dir: string) {
    mkdirSync(dir, { recursive: true })
  },

  async removeDir(dir: string) {
    rmSync(dir, { recursive: true, force: true })
  },

  async removeFile(file: string) {
    unlinkSync(file)
  },

  async readDir(dir: string, recursive?: boolean) {
    return recursive ? getFiles(dir, '') : readdirSync(dir)
  },

  async isDir(dir: string) {
    return statSync(dir).isDirectory()
  },

  async dirSize(dir: string) {
    const files = readdirSync(dir, { withFileTypes: true })

    const paths = files.map((file) => {
      const path = join(dir, file.name)

      if (file.isDirectory()) return this.dirSize(path)

      if (file.isFile()) {
        const { size } = statSync(path)

        return size
      }

      return 0
    })

    return paths.flat(Infinity).reduce((i: any, size: any) => i + size, 0)
  },

  // ========== Window
  async maximize() {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  },

  async minimize() {
    mainWindow.minimize()
  },

  async close() {
    mainWindow.close()
  },

  // ========== Process
  async execFile(
    file: string,
    args: readonly string[] | null | undefined,
    callback: (ObjectEncodingOptions & ExecFileOptions) | null | undefined
  ) {
    execFile(file, args, callback)
  },

  async exec(command: string, message: string) {
    exec(command, (error, stdout, stderr) => {
      mainWindow.webContents.send(message, error, stdout, stderr)
    })
  }
}
