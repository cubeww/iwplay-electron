import { api } from './api'
import { join, extname } from 'path-browserify'

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

export const libraryUtil = {
  async initializeLibrary(location: string) {
    if (await api.pathExists(location)) {
      await api.removeDir(location)
      await api.createDir(location)
    }
    await api.createDir(getCommonPath(location))
  },

  async checkLibrary(location: string) {
    if (!(await api.pathExists(getCommonPath(location)))) {
      await api.createDir(getCommonPath(location))
    }
  },

  async install(location: string, id: string, file: string) {
    await this.checkLibrary(location)

    if (await api.pathExists(getGamePath(location, id))) {
      await this.uninstall(location, id)
    }
  },

  async uninstall(location: string, id: string) {
    await this.checkLibrary(location)

    if (await api.pathExists(getGamePath(location, id))) {
      await api.removeDir(getGamePath(location, id))
    }

    if (await api.pathExists(getManifestPath(location, id))) {
      await api.removeFile(getManifestPath(location, id))
    }
  },

  async getFangameIDsByManifest(location: string) {
    await this.checkLibrary(location)

    const appsPath = getAppsPath(location)
    const files = await api.readDir(appsPath)

    const ids: string[] = []
    for (const f of files) {
      const fullPath = join(appsPath, f)
      if (await api.isDir(fullPath)) {
        continue
      }
      if (extname(f) === '.json' && f.slice(0, 10) === 'iwmanifest') {
        const id = f.substring(f.indexOf('_') + 1, f.indexOf('.'))
        ids.push(id)
      }
    }
    return ids
  },

  async getFangameIDsByGameDir(location: string) {
    await this.checkLibrary(location)

    const commonPath = getCommonPath(location)
    const files = await api.readDir(commonPath)

    const ids: string[] = []
    for (const f of files) {
      const fullPath = join(commonPath, f)
      if (await api.isDir(fullPath)) {
        ids.push(f)
      }
    }
    return ids
  },

  async createManifest(location: string, id: string) {
    await this.checkLibrary(location)

    const manifestPath = getManifestPath(location, id)
    if (await api.pathExists(manifestPath)) {
      await api.removeFile(manifestPath)
    }

    const gamePath = getGamePath(location, id)
    if (!(await api.pathExists(gamePath))) {
      throw new Error('game not installed')
    }

    const files = await api.readDir(gamePath, true)
    const executablePaths: string[] = []

    for (const f of files) {
      if (extname(f) === '.exe') {
        executablePaths.push(f)
      }
    }

    const startupPath = executablePaths.length === 1 ? executablePaths[0] : ''
    const sizeOnDisk = await api.dirSize(gamePath)

    const manifest: FangameManifest = {
      id,
      executablePaths,
      installedAt: new Date(),
      sizeOnDisk,
      startupPath
    }

    await api.writeFile(manifestPath, JSON.stringify(manifest, null, 4))

    return manifest
  },

  async createAllManifest(location: string) {
    await this.checkLibrary(location)

    const ids = await this.getFangameIDsByGameDir(location)
    for (const id of ids) {
      await this.createManifest(location, id)
    }
  }
}
