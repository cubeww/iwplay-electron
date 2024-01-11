import { basename, dirname, extname, join, resolve } from 'path';
import { dirSize, getFiles, readTextFile, writeTextFile } from '../utils/fs';
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, unlinkSync } from 'fs';
import { ChildProcess, execFile, execSync } from 'child_process';
import sevenz from '../../../resources/7z.exe?asset&asarUnpack';
import dbghelper from '../../../resources/dbghelper.exe?asset&asarUnpack';
import resizer from '../../../resources/resizer.exe?asset&asarUnpack';
import { sendEvent } from '../event';
import { setSettings, getSettings } from './settings';
import { app } from 'electron';

interface RunningFangameItem {
  process: ChildProcess;
  runDate: Date;
}

const runningFangameItems: { [gameID: string]: RunningFangameItem } = {};

export interface FangameProfile {
  playTime: number;
  lastPlayed: Date;
}

export interface FangameManifest {
  id: string;
  installedAt: Date;
  startupPath: string;
  sizeOnDisk: number;
  resize: boolean;
}

export interface FangameReadme {
  name: string;
  content: string;
  path: string;
}

interface AddLibraryOptions {
  path: string;
}

interface RemoveLibraryOptions {
  index: number;
}

interface GetInstalledFangameIDsOptions {
  libraryPath: string;
}

interface InstallGameOptions {
  libraryPath: string;
  gameID: string;
  file: string;
}

interface UninstallGameOptions {
  libraryPath: string;
  gameID: string;
}

interface RunGameOptions {
  libraryPath: string;
  gameID: string;
}

interface StopGameOptions {
  gameID: string;
}

interface CreateManifestOptions {
  libraryPath: string;
  gameID: string;
}

interface GetManifestOptions {
  libraryPath: string;
  gameID: string;
}

interface SaveManifestOptions {
  libraryPath: string;
  gameID: string;
  manifest: FangameManifest;
}

interface GetGameExecutablesOptions {
  libraryPath: string;
  gameID: string;
}

interface GetGameReadmesOptions {
  libraryPath: string;
  gameID: string;
}

interface ApplyDebugHelperOptions {
  libraryPath: string;
  gameID: string;
}

interface OpenGameDirectoryOptions {
  libraryPath: string;
  gameID: string;
}

interface GetProfileOptions {
  gameID: string;
}

interface SaveProfileOptions {
  gameID: string;
  profile: FangameProfile;
}

// Basic Library Functions
// -----------------------

/**
 * Add a game library.
 * The files in the game library will not be removed.
 */
export function addLibrary({ path }: AddLibraryOptions) {
  // Check if the directory already exists.
  const paths = getSettings().libraryPaths;
  const pl = resolve(path).toLowerCase();
  for (const p of paths) {
    if (resolve(p).toLowerCase() === pl) {
      return;
    }
  }

  // Save to the settings file
  paths.push(path);
  setSettings({ ...getSettings(), libraryPaths: paths });
}

/**
 * Remove a game library.
 * It will only be removed from the settings file
 * and will not be removed from the hard disk.
 */
export function removeLibrary({ index }: RemoveLibraryOptions) {
  const paths = getSettings().libraryPaths;
  paths.splice(index);
  setSettings({ ...getSettings(), libraryPaths: paths });
}

/**
 * Get all the game ID in the game library.
 */
export function getInstalledFangameIDs({ libraryPath }: GetInstalledFangameIDsOptions) {
  const appsPath = join(libraryPath, 'iwapps');
  const files = readdirSync(appsPath);
  const ids = [] as string[];
  for (const f of files) {
    const fullPath = join(appsPath, f);
    if (statSync(fullPath).isDirectory()) {
      continue;
    }
    if (extname(f) === '.json' && f.slice(0, 10) === 'iwmanifest') {
      const id = f.substring(f.indexOf('_') + 1, f.indexOf('.'));
      ids.push(id);
    }
  }
  return ids;
}

// Library Game Functions
// ----------------------

/**
 * Install a game at the specified game ID folder of the specified game library index,
 * And create a manifest file for it
 */
export function installGame({ file, gameID, libraryPath }: InstallGameOptions) {
  const gamePath = join(libraryPath, 'iwapps', 'common', gameID);
  if (existsSync(gamePath)) {
    uninstallGame({ libraryPath, gameID });
  }
  mkdirSync(gamePath);

  if (extname(file) === '.exe') {
    const filename = basename(file);
    execSync(`copy "${file}" "${join(gamePath, filename)}"`);
  } else {
    execSync(`"${sevenz}" x "${file}" -o"${gamePath}"`);
  }

  createManifest({ gameID, libraryPath });

  sendEvent('game-installed', { gameID, libraryPath });
}

/**
 * Delete a game of specified game library index
 */
export function uninstallGame({ gameID, libraryPath }: UninstallGameOptions) {
  const gamePath = join(libraryPath, 'iwapps', 'common', gameID);
  if (existsSync(gamePath)) {
    rmSync(gamePath, { recursive: true });
  }
  const manifestPath = join(libraryPath, 'iwapps', `iwmanifest_${gameID}.json`);
  if (existsSync(manifestPath)) {
    unlinkSync(manifestPath);
  }
  sendEvent('game-uninstalled', { gameID });
}

/**
 * Start a game
 */
export function runGame({ gameID, libraryPath }: RunGameOptions) {
  const manifest = getManifest({ gameID, libraryPath });
  if (!manifest.startupPath) {
    throw new Error('No startup path');
  }

  if (gameID in runningFangameItems) {
    execSync(`taskkill /pid ${runningFangameItems[gameID].process.pid} /F /T`);
    delete runningFangameItems[gameID];
  }

  const file = join(libraryPath, 'iwapps', 'common', gameID, manifest.startupPath);
  const p = execFile(file, { cwd: dirname(file) });

  if (manifest.resize) {
    execFile(resizer, [`${p.pid}`, '800', '608']);
  }

  p.on('close', () => {
    // Save to profile
    const item = runningFangameItems[gameID];
    const playTime = (new Date().getTime() - item.runDate.getTime()) / 1000; // In seconds
    const lastPlayed = new Date();

    let profile: FangameProfile;
    try {
      profile = getProfile({ gameID });
    } catch {
      // Profile not exists, create new one
      profile = { playTime: 0 } as FangameProfile;
    }
    profile.playTime += playTime;
    profile.lastPlayed = lastPlayed;
    saveProfile({ gameID, profile });

    delete runningFangameItems[gameID];
    sendEvent('game-close', { gameID });
  });

  runningFangameItems[gameID] = { process: p, runDate: new Date() };
  sendEvent('game-run', { gameID });
}

export function stopGame({ gameID }: StopGameOptions) {
  if (gameID in runningFangameItems) {
    execSync(`taskkill /pid ${runningFangameItems[gameID].process.pid} /F /T`);
  }
}

/**
 * Get running fangame ids
 */
export function getRunningFangameIDs() {
  return Object.keys(runningFangameItems);
}

// Fangame Manifest Functions
// --------------------------

/**
 * Create the default manifest for the specified game
 */
export function createManifest({ gameID, libraryPath }: CreateManifestOptions) {
  const manifestPath = join(libraryPath, 'iwapps', `iwmanifest_${gameID}.json`);
  if (existsSync(manifestPath)) {
    unlinkSync(manifestPath);
  }

  const gamePath = join(libraryPath, 'iwapps', 'common', gameID);
  if (!existsSync(gamePath)) {
    throw new Error('Game not installed');
  }

  const executablePaths = getGameExecutables({ libraryPath: libraryPath, gameID: gameID });
  const startupPath = executablePaths.length === 1 ? executablePaths[0] : '';
  const sizeOnDisk = dirSize(gamePath);

  const manifest: FangameManifest = {
    id: gameID,
    installedAt: new Date(),
    sizeOnDisk,
    startupPath,
    resize: false,
  };

  writeTextFile(manifestPath, JSON.stringify(manifest));
  return manifest;
}

/**
 * Get game manifest.
 */
export function getManifest({ gameID, libraryPath }: GetManifestOptions) {
  const manifestPath = join(libraryPath, 'iwapps', `iwmanifest_${gameID}.json`);
  const manifest = JSON.parse(readTextFile(manifestPath));
  if (!manifest) {
    throw new Error('Manifest not exists!');
  }
  return manifest as FangameManifest;
}

export function saveManifest({ libraryPath, gameID, manifest }: SaveManifestOptions) {
  const manifestPath = join(libraryPath, 'iwapps', `iwmanifest_${gameID}.json`);
  writeTextFile(manifestPath, JSON.stringify(manifest, null, 4));
}

// Game Helper Functions
// -------------------------

/**
 * Get the specified game executable file (.exe) collection
 */
export function getGameExecutables({ gameID, libraryPath }: GetGameExecutablesOptions) {
  const gamePath = join(libraryPath, 'iwapps', 'common', gameID);
  const files = getFiles(gamePath, '');
  const paths = [] as string[];
  for (const f of files) {
    if (extname(f) === '.exe') {
      paths.push(f);
    }
  }
  return paths;
}

/**
 * Get the specified game readme file (.txt) collection
 */
export function getGameReadmes({ gameID, libraryPath }: GetGameReadmesOptions) {
  const gamePath = join(libraryPath, 'iwapps', 'common', gameID);
  const files = getFiles(gamePath, '');
  const paths = [] as FangameReadme[];
  for (const f of files) {
    if (extname(f) === '.txt') {
      const fullPath = join(gamePath, f);
      paths.push({
        name: basename(f),
        content: readTextFile(fullPath),
        path: fullPath,
      });
    }
  }
  return paths;
}

/**
 * Apply renex's dbghelp to specified game
 */
export function applyDebugHelper({ libraryPath, gameID }: ApplyDebugHelperOptions) {
  const folderPath = join(libraryPath, 'iwapps', 'common', gameID);
  return execSync(`"${dbghelper}" "${folderPath}"`, { cwd: folderPath });
}

export function openGameDirectory({ libraryPath, gameID }: OpenGameDirectoryOptions) {
  const folderPath = join(libraryPath, 'iwapps', 'common', gameID);
  return execSync(`explorer "${folderPath}"`);
}

// Fangame Profile Functions
// -------------------------

export function getProfile({ gameID }: GetProfileOptions) {
  const profileFile = join(app.getPath('userData'), 'userdata', 'guest', gameID, 'profile.json');
  return JSON.parse(readTextFile(profileFile)) as FangameProfile;
}

export function saveProfile({ gameID, profile }: SaveProfileOptions) {
  const profileFile = join(app.getPath('userData'), 'userdata', 'guest', gameID, 'profile.json');
  return writeTextFile(profileFile, JSON.stringify(profile, null, 4));
}
