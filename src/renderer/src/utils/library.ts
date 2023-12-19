import { join, extname } from 'path-browserify'
import { invoke } from './invoke'

export interface FangameManifest {
  id: string
  installedAt: Date
  executablePaths: string[]
  startupPath: string
  sizeOnDisk: number
}

function getAppsPath(libraryPath: string) {
  return join(libraryPath, 'iwapps')
}

function getCommonPath(libraryPath: string) {
  return join(libraryPath, 'iwapps', 'common')
}

function getGamePath(libraryPath: string, id: string) {
  return join(libraryPath, 'iwapps', 'common', id)
}

function getManifestPath(libraryPath: string, id: string) {
  return join(libraryPath, 'iwapps', 'iwmanifest_' + id + '.json')
}

export const library = {
  async initializeLibrary(path: string) {
    if (await invoke('path-exists', path)) {
      await invoke('remove-dir', path)
      await invoke('create-dir', path)
    }
    await invoke('create-dir', getCommonPath(path))
  },

  async checkLibrary(path: string) {
    if (!(await invoke('path-exists', getCommonPath(path)))) {
      await invoke('create-dir', getCommonPath(path))
    }
  },

  async install(libraryPath: string, id: string, file: string) {
    await this.checkLibrary(libraryPath)

    const gamePath = getGamePath(libraryPath, id)

    if (await invoke('path-exists', gamePath)) {
      await this.uninstall(libraryPath, id)
    }

    await invoke('create-dir', gamePath)
    await invoke('exec', `"resources/7z.exe" x "${file}" -o"${gamePath}"`)

    await this.createManifest(libraryPath, id)
  },

  async uninstall(libraryPath: string, id: string) {
    await this.checkLibrary(libraryPath)

    if (await invoke('path-exists', getGamePath(libraryPath, id))) {
      await invoke('remove-dir', getGamePath(libraryPath, id))
    }

    if (await invoke('path-exists', getManifestPath(libraryPath, id))) {
      await invoke('remove-file', getManifestPath(libraryPath, id))
    }
  },

  async getFangameIDsByManifest(libraryPath: string) {
    await this.checkLibrary(libraryPath)

    const appsPath = getAppsPath(libraryPath)
    const files = await invoke('read-dir', appsPath)

    const ids: string[] = []
    for (const f of files) {
      const fullPath = join(appsPath, f)
      if (await invoke('is-dir', fullPath)) {
        continue
      }
      if (extname(f) === '.json' && f.slice(0, 10) === 'iwmanifest') {
        const id = f.substring(f.indexOf('_') + 1, f.indexOf('.'))
        ids.push(id)
      }
    }
    return ids
  },

  async getFangameIDsByGameDir(libraryPath: string) {
    await this.checkLibrary(libraryPath)

    const commonPath = getCommonPath(libraryPath)
    const files = await invoke('read-dir', commonPath)

    const ids: string[] = []
    for (const f of files) {
      const fullPath = join(commonPath, f)
      if (await invoke('is-dir', fullPath)) {
        ids.push(f)
      }
    }
    return ids
  },

  async createManifest(libraryPath: string, id: string) {
    await this.checkLibrary(libraryPath)

    const manifestPath = getManifestPath(libraryPath, id)
    if (await invoke('path-exists', manifestPath)) {
      await invoke('remove-dir', manifestPath)
    }

    const gamePath = getGamePath(libraryPath, id)
    if (!(await invoke('path-exists', gamePath))) {
      throw new Error('game not installed')
    }

    const files = await invoke('read-dir', gamePath, true)
    const executablePaths: string[] = []

    for (const f of files) {
      if (extname(f) === '.exe') {
        executablePaths.push(f)
      }
    }

    const startupPath = executablePaths.length === 1 ? executablePaths[0] : ''
    const sizeOnDisk = await invoke('dir-size', gamePath)

    const manifest: FangameManifest = {
      id,
      executablePaths,
      installedAt: new Date(),
      sizeOnDisk,
      startupPath
    }

    await invoke('write-file', manifestPath, JSON.stringify(manifest, null, 4))

    return manifest
  },

  async createAllManifest(libraryPath: string) {
    await this.checkLibrary(libraryPath)

    const ids = await this.getFangameIDsByGameDir(libraryPath)
    for (const id of ids) {
      await this.createManifest(libraryPath, id)
    }
  }
}
