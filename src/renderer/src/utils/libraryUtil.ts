import { join, extname } from 'path-browserify'
import { invoke } from './invoke'

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
    if (await invoke('path-exists', location)) {
      await invoke('remove-dir', location)
      await invoke('create-dir', location)
    }
    await invoke('create-dir', getCommonPath(location))
  },

  async checkLibrary(location: string) {
    if (!(await invoke('path-exists', getCommonPath(location)))) {
      await invoke('create-dir', getCommonPath(location))
    }
  },

  async install(location: string, id: string, file: string) {
    await this.checkLibrary(location)

    const gamePath = getGamePath(location, id)

    if (await invoke('path-exists', gamePath)) {
      await this.uninstall(location, id)
    }

    await invoke('create-dir', gamePath)
    await invoke('exec', `"resources/7z.exe" x "${file}" -o"${gamePath}"`)

    await this.createManifest(location, id)
  },

  async uninstall(location: string, id: string) {
    await this.checkLibrary(location)

    if (await invoke('path-exists', getGamePath(location, id))) {
      await invoke('remove-dir', getGamePath(location, id))
    }

    if (await invoke('path-exists', getManifestPath(location, id))) {
      await invoke('remove-file', getManifestPath(location, id))
    }
  },

  async getFangameIDsByManifest(location: string) {
    await this.checkLibrary(location)

    const appsPath = getAppsPath(location)
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

  async getFangameIDsByGameDir(location: string) {
    await this.checkLibrary(location)

    const commonPath = getCommonPath(location)
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

  async createManifest(location: string, id: string) {
    await this.checkLibrary(location)

    const manifestPath = getManifestPath(location, id)
    if (await invoke('path-exists', manifestPath)) {
      await invoke('remove-dir', manifestPath)
    }

    const gamePath = getGamePath(location, id)
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

  async createAllManifest(location: string) {
    await this.checkLibrary(location)

    const ids = await this.getFangameIDsByGameDir(location)
    for (const id of ids) {
      await this.createManifest(location, id)
    }
  }
}
