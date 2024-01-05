import { invoke } from './invoke';
import { paths } from './paths';

export interface FangameManifest {
  id: string;
  installedAt: Date;
  // executablePaths: string[];
  startupPath: string;
  sizeOnDisk: number;
}

export const library = {
  async initializeLibrary(path: string) {
    if (await invoke('path-exists', path)) {
      await invoke('remove-dir', path);
      await invoke('create-dir', path);
    }
    await invoke('create-dir', paths.common(path));
  },

  async checkLibrary(path: string) {
    if (!(await invoke('path-exists', paths.common(path)))) {
      await invoke('create-dir', paths.common(path));
    }
  },

  async install(libraryPath: string, id: string, file: string) {
    await this.checkLibrary(libraryPath);

    const gamePath = paths.gameDir(libraryPath, id);

    if (await invoke('path-exists', gamePath)) {
      await this.uninstall(libraryPath, id);
    }

    await invoke('create-dir', gamePath);

    if (file.split('.').pop() === 'exe') {
      const filename = file.replaceAll('\\', '/').split('/').pop();
      await invoke('copy', file, gamePath + '/' + filename);
    } else {
      await invoke('unzip', file, gamePath);
    }

    await this.createManifest(libraryPath, id);
  },

  async uninstall(libraryPath: string, id: string) {
    await this.checkLibrary(libraryPath);

    if (await invoke('path-exists', paths.gameDir(libraryPath, id))) {
      await invoke('remove-dir', paths.gameDir(libraryPath, id));
    }

    if (await invoke('path-exists', paths.manifest(libraryPath, id))) {
      await invoke('remove-file', paths.manifest(libraryPath, id));
    }
  },

  async getFangameIDsByManifest(libraryPath: string) {
    await this.checkLibrary(libraryPath);

    const appsPath = paths.iwapps(libraryPath);
    const files = await invoke('read-dir', appsPath);

    const ids: string[] = [];
    for (const f of files) {
      const fullPath = appsPath + '/' + f;
      if (await invoke('is-dir', fullPath)) {
        continue;
      }
      if (f.split('.').pop() === 'json' && f.slice(0, 10) === 'iwmanifest') {
        const id = f.substring(f.indexOf('_') + 1, f.indexOf('.'));
        ids.push(id);
      }
    }
    return ids;
  },

  async getFangameIDsByGameDir(libraryPath: string) {
    await this.checkLibrary(libraryPath);

    const commonPath = paths.common(libraryPath);
    const files = await invoke('read-dir', commonPath);

    const ids: string[] = [];
    for (const f of files) {
      const fullPath = commonPath + '/' + f;
      if (await invoke('is-dir', fullPath)) {
        ids.push(f);
      }
    }
    return ids;
  },

  async getExecutablePaths(gamePath: string) {
    const files = await invoke('read-dir', gamePath, true);
    const executablePaths: string[] = [];

    for (const f of files) {
      if (f.split('.').pop() === 'exe') {
        executablePaths.push(f);
      }
    }

    return executablePaths;
  },

  async getReadmePaths(gamePath: string) {
    const files = await invoke('read-dir', gamePath, true);
    const executablePaths: string[] = [];

    for (const f of files) {
      if (f.split('.').pop() === 'txt') {
        executablePaths.push(f);
      }
    }

    return executablePaths;
  },

  async createManifest(libraryPath: string, id: string) {
    await this.checkLibrary(libraryPath);

    const manifestPath = paths.manifest(libraryPath, id);
    if (await invoke('path-exists', manifestPath)) {
      await invoke('remove-file', manifestPath);
    }

    const gamePath = paths.gameDir(libraryPath, id);
    if (!(await invoke('path-exists', gamePath))) {
      throw new Error('game not installed');
    }

    const executablePaths = await this.getExecutablePaths(gamePath);

    const startupPath = executablePaths.length === 1 ? executablePaths[0] : '';
    const sizeOnDisk = await invoke('dir-size', gamePath);

    const manifest: FangameManifest = {
      id,
      // executablePaths,
      installedAt: new Date(),
      sizeOnDisk,
      startupPath
    };

    await invoke('write-file', manifestPath, JSON.stringify(manifest, null, 4));

    return manifest;
  },

  async createAllManifest(libraryPath: string) {
    await this.checkLibrary(libraryPath);

    const ids = await this.getFangameIDsByGameDir(libraryPath);
    for (const id of ids) {
      await this.createManifest(libraryPath, id);
    }
  },

  async getManifest(libraryPath: string, id: string) {
    await this.checkLibrary(libraryPath);

    const manifestPath = paths.manifest(libraryPath, id);
    if (!(await invoke('path-exists', manifestPath))) {
      throw new Error('Manifest not exists');
    }

    return JSON.parse(await invoke('read-file', manifestPath)) as FangameManifest;
  }
};
