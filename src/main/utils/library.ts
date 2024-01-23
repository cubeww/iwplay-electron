import { basename, dirname, extname, join, resolve } from 'path';
import { getFiles, readTextFile, writeTextFile } from '../utils/fs';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, unlinkSync } from 'fs';
import { ChildProcess, exec, execFile, execSync } from 'child_process';
import sevenz from '../../../resources/7z.exe?asset&asarUnpack';
import dbghelper from '../../../resources/dbghelper.exe?asset&asarUnpack';
import resizer from '../../../resources/resizer.exe?asset&asarUnpack';
import icon from '../../../resources/icon.png?asset&asarUnpack';
import { sendEvent } from '../event';
import { setSettings, getSettings } from './settings';
import { app, Notification } from 'electron';

interface RunningFangameItem {
  process: ChildProcess;
  runDate: Date;
}

const runningFangameItems: { [gameID: string]: RunningFangameItem } = {};

export interface FangameProfile {
  playTime?: number;
  lastPlayed?: Date;
  cleared?: boolean;
}

export interface FangameManifest {
  id: string;
  name: string;
  installedAt: Date;
  startupPath: string;
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
  gameName: string;
  file: string;
}

interface UninstallGameOptions {
  libraryPath: string;
  gameID: string;
}

interface BackupGameOptions {
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
  gameName: string;
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

interface CheckLibraryOptions {
  libraryPath: string;
}

interface ClearDownloadingOptions {
  libraryPath: string;
}

// Basic Library Functions
// -----------------------

/**
 * Check library folders.
 * If not exists, try to create new one.
 */
function checkLibrary({ libraryPath }: CheckLibraryOptions) {
  const commonPath = join(libraryPath, 'iwapps', 'common');
  const downloadingPath = join(libraryPath, 'iwapps', 'downloading');
  const backupPath = join(libraryPath, 'iwapps', 'backup');

  mkdirSync(commonPath, { recursive: true });
  mkdirSync(downloadingPath, { recursive: true });
  mkdirSync(backupPath, { recursive: true });
}

/**
 * Add a game library.
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
  checkLibrary({ libraryPath });

  const appsPath = join(libraryPath, 'iwapps');
  const commonPath = join(appsPath, 'common');
  let ids = readdirSync(commonPath);

  // Remove invalid ids
  ids = ids.filter((id) => {
    const n = Number(id) | 0;
    return n !== Infinity && String(n) === id && n >= 0;
  });

  // Check if manifest file exists
  // ids.forEach((id) => {
  //   const manifestFile = join(appsPath, `iwmanifest_${id}.json`);
  //   if (!existsSync(manifestFile)) {
  //     // Missing manifest detected, recreate it
  //     createManifest({ libraryPath, gameID: id, gameName: '' });
  //   }
  // });

  return ids;
}

// Library Game Functions
// ----------------------

/**
 * Install a game in the specified game library,
 * And create a manifest file for it
 */
export function installGame({ file, gameID, gameName, libraryPath }: InstallGameOptions) {
  checkLibrary({ libraryPath });
  const gamePath = join(libraryPath, 'iwapps', 'common', gameID);

  // If game path already exists, copy to backup folder & uninstall it
  if (existsSync(gamePath)) {
    backupGame({ libraryPath, gameID });
    uninstallGame({ libraryPath, gameID });
  }
  mkdirSync(gamePath, { recursive: true });

  if (statSync(file).isDirectory()) {
    cpSync(file, gamePath, { recursive: true });
  } else if (extname(file) === '.exe') {
    const filename = basename(file);
    execSync(`copy "${file}" "${join(gamePath, filename)}"`);
  } else {
    execSync(`"${sevenz}" x "${file}" -o"${gamePath}"`);
  }

  createManifest({ gameID, gameName, libraryPath });

  sendEvent('game-installed', { gameID, libraryPath });
  new Notification({ icon: icon, title: 'IWPlay', body: 'Fangame Installed: ' + gameName }).show();
}

/**
 * Uninstall a game in the specified game library
 */
export function uninstallGame({ gameID, libraryPath }: UninstallGameOptions) {
  checkLibrary({ libraryPath });

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
 * Move specified game to backup folder
 */
export function backupGame({ gameID, libraryPath }: BackupGameOptions) {
  checkLibrary({ libraryPath });

  const gamePath = join(libraryPath, 'iwapps', 'common', gameID);
  const backupPath = join(libraryPath, 'iwapps', 'backup', gameID);
  if (existsSync(gamePath)) {
    if (existsSync(backupPath)) {
      rmSync(backupPath, { recursive: true });
    }
    cpSync(gamePath, backupPath, { recursive: true });
  }
}

/**
 * Run a game, and put it in running fangame items
 */
export function runGame({ gameID, libraryPath }: RunGameOptions) {
  checkLibrary({ libraryPath });

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
    profile.playTime! += playTime;
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
 * Get running fangame IDs
 */
export function getRunningFangameIDs() {
  return Object.keys(runningFangameItems);
}

/**
 * Clear downloading fangame files
 */
export function clearDownloading({ libraryPath }: ClearDownloadingOptions) {
  checkLibrary({ libraryPath });
  const download = join(libraryPath, 'iwapps', 'downloading');
  rmSync(download, { recursive: true });
  mkdirSync(download, { recursive: true });
}

// Fangame Manifest Functions
// --------------------------

/**
 * Create the default manifest for the specified game
 */
export function createManifest({ gameID, gameName, libraryPath }: CreateManifestOptions) {
  checkLibrary({ libraryPath });

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

  const manifest: FangameManifest = {
    id: gameID,
    name: gameName,
    installedAt: new Date(),
    startupPath,
    resize: false,
  };

  writeTextFile(manifestPath, JSON.stringify(manifest, null, 4));
  return manifest;
}

/**
 * Get game manifest.
 */
export function getManifest({ gameID, libraryPath }: GetManifestOptions) {
  checkLibrary({ libraryPath });

  const manifestPath = join(libraryPath, 'iwapps', `iwmanifest_${gameID}.json`);
  const manifest = JSON.parse(readTextFile(manifestPath));
  if (!manifest) {
    throw new Error('Manifest not exists!');
  }
  return manifest as FangameManifest;
}

/**
 * Save game manifest to file.
 */
export function saveManifest({ libraryPath, gameID, manifest }: SaveManifestOptions) {
  checkLibrary({ libraryPath });

  const manifestPath = join(libraryPath, 'iwapps', `iwmanifest_${gameID}.json`);
  writeTextFile(manifestPath, JSON.stringify(manifest, null, 4));
}

// Game Helper Functions
// ---------------------

/**
 * Get the specified game executable file (.exe) collection
 */
export function getGameExecutables({ gameID, libraryPath }: GetGameExecutablesOptions) {
  checkLibrary({ libraryPath });

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
  checkLibrary({ libraryPath });

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
  checkLibrary({ libraryPath });

  const folderPath = join(libraryPath, 'iwapps', 'common', gameID);
  const tempPath = app.getPath('temp');
  return execSync(`"${dbghelper}" "${folderPath}"`, { cwd: tempPath });
}

/**
 * Open the game directory in the explorer
 */
export function openGameDirectory({ libraryPath, gameID }: OpenGameDirectoryOptions) {
  checkLibrary({ libraryPath });

  const folderPath = join(libraryPath, 'iwapps', 'common', gameID);
  exec(`start "" "${folderPath}"`);
}

// Fangame Profile Functions
// -------------------------

/**
 * Get game profile.
 */
export function getProfile({ gameID }: GetProfileOptions) {
  const profileFile = join(app.getPath('userData'), 'userdata', 'guest', gameID, 'profile.json');
  return JSON.parse(readTextFile(profileFile)) as FangameProfile;
}

/**
 * Save game profile.
 */
export function saveProfile({ gameID, profile }: SaveProfileOptions) {
  const profileFile = join(app.getPath('userData'), 'userdata', 'guest', gameID, 'profile.json');
  writeTextFile(profileFile, JSON.stringify(profile, null, 4));
  sendEvent('game-profile-updated', { gameID, profile });
}

/**
 * Get all game profiles
 */
export function getAllProfiles() {
  const path = join(app.getPath('userData'), 'userdata', 'guest');
  mkdirSync(path, { recursive: true });
  const ids = readdirSync(path);
  const profiles: { [gameID: string]: FangameProfile } = {};
  for (const id of ids) {
    const profilePath = join(path, id, 'profile.json');
    try {
      const profile = JSON.parse(readTextFile(profilePath));
      profiles[id] = profile;
    } catch {
      // Skip
    }
  }
  return profiles;
}
