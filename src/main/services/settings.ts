import { join } from 'path';
import { sendEvent } from '../event';
import { app } from 'electron';
import { readTextFile, writeTextFile } from '../utils/fs';

export interface AppSettings {
  libraryPaths: string[];
  language: 'en' | 'zh';
}

const defaultSettings: AppSettings = {
  libraryPaths: [],
  language: 'en',
};

const settingsFile = join(app.getPath('userData'), 'iwplay-settings.json');

let settings = {} as AppSettings;

export function setSettings(obj: AppSettings) {
  settings = obj;

  // Send new settings to renderer processes
  sendEvent('update-settings', settings);

  // Save new settings to file
  writeTextFile(settingsFile, JSON.stringify(settings, null, 4));
}

export function getSettings() {
  return settings;
}

export function loadSettings() {
  try {
    const json: AppSettings = JSON.parse(readTextFile(settingsFile));
    settings = { ...defaultSettings, ...json };
  } catch {
    settings = { ...defaultSettings };
  }
}
