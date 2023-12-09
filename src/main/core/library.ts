import { execSync } from 'child_process'
import { dialog, ipcMain } from 'electron'
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, unlinkSync, writeFileSync } from 'fs'
import { extname, join } from 'path'

export interface FangameManifest {
  id: string
  installedAt: Date
  executablePaths: string[]
  startupPath: string
  sizeOnDisk: number
}

function getAppsPath(location: string) {
  return join(location, 'iwapps')
}

function getCommonPath(location: string) {
  return join(location, 'iwapps', 'common')
}

function getGamePath(location: string, id: string) {
  return join(location, 'iwapps', 'common', id)
}

function getManifestPath(location: string, id: string) {
  return join(location, 'iwapps', 'iwmanifest_' + id + '.json')
}

function initializeLibrary(location: string) {
  if (existsSync(location)) {
    rmSync(location)
    mkdirSync(location)
  }
  mkdirSync(getCommonPath(location))
}

function checkLibrary(location: string) {
  if (!existsSync(getCommonPath(location))) {
    mkdirSync(getCommonPath(location))
  }
}

function install(location: string, id: string, file: string) {
  checkLibrary(location)

  const gamePath = getGamePath(location, id)

  if (existsSync(gamePath)) {
    uninstall(location, id)
  }

  mkdirSync(gamePath)
  execSync(`"resources/7z.exe" x "${file}" -o"${gamePath}"`)

  createManifest(location, id)
}

function uninstall(location: string, id: string) {
  checkLibrary(location)

  if (existsSync(getGamePath(location, id))) {
    rmSync(getGamePath(location, id))
  }

  if (existsSync(getManifestPath(location, id))) {
    unlinkSync(getManifestPath(location, id))
  }
}

function getFangameIDsByManifest(location: string) {
  checkLibrary(location)

  const appsPath = getAppsPath(location)
  const files = readdirSync(appsPath)

  const ids: string[] = []
  for (const f of files) {
    const fullPath = join(appsPath, f)
    if (statSync(fullPath).isDirectory()) {
      continue
    }
    if (extname(f) === '.json' && f.slice(0, 10) === 'iwmanifest') {
      const id = f.substring(f.indexOf('_') + 1, f.indexOf('.'))
      ids.push(id)
    }
  }
  return ids
}

function getFiles(dir: string, dir2: string, files: string[] = []) {
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

function getFangameIDsByGameDir(location: string) {
  checkLibrary(location)

  const commonPath = getCommonPath(location)
  const files = readdirSync(commonPath)

  const ids: string[] = []
  for (const f of files) {
    const fullPath = join(commonPath, f)
    if (statSync(fullPath).isDirectory()) {
      ids.push(f)
    }
  }
  return ids
}

function dirSize(dir: string) {
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
}

function createManifest(location: string, id: string) {
  checkLibrary(location)

  const manifestPath = getManifestPath(location, id)
  if (existsSync(manifestPath)) {
    unlinkSync(manifestPath)
  }

  const gamePath = getGamePath(location, id)
  if (!existsSync(gamePath)) {
    throw new Error('game not installed')
  }

  const files = getFiles(gamePath, '')
  const executablePaths: string[] = []

  for (const f of files) {
    if (extname(f) === '.exe') {
      executablePaths.push(f)
    }
  }

  const startupPath = executablePaths.length === 1 ? executablePaths[0] : ''
  const sizeOnDisk = dirSize(gamePath)

  const manifest: FangameManifest = {
    id,
    executablePaths,
    installedAt: new Date(),
    sizeOnDisk,
    startupPath
  }

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 4))

  return manifest
}

function createAllManifest(location: string) {
  checkLibrary(location)

  const ids = getFangameIDsByGameDir(location)
  for (const id of ids) {
    createManifest(location, id)
  }
}

function selectInstallZip() {
  const f = dialog.showOpenDialogSync({
    title: '选择游戏压缩包',
    filters: [
      { name: 'Compress Files', extensions: ['zip', 'rar', '7z'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  if (typeof f === 'object' && typeof f[0] === 'string') {
    return {
      filename: f[0],
      filesize: statSync(f[0]).size
    }
  }

  return null
}

export default () => {
  ipcMain.handle('library-initialize', (_event, { location }) => initializeLibrary(location))
  ipcMain.handle('library-install', (_event, { location, id, files }) => install(location, id, files))
  ipcMain.handle('library-uninstall', (_event, { location, id }) => uninstall(location, id))
  ipcMain.handle('library-create-manifest', (_event, { location, id }) => createManifest(location, id))
  ipcMain.handle('library-create-all-manifest', (_event, { location }) => createAllManifest(location))
  ipcMain.handle('library-select-install-zip', (_event, {}) => selectInstallZip())
}
