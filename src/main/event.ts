import { GameDownloadItem, windows } from '.';
import { FangameProfile } from './utils/library';
import { AppSettings } from './utils/settings';

interface MaximizeEventOptions {
  value: boolean;
}

interface GameRunEventOptions {
  gameID: string;
}

interface GameCloseEventOptions {
  gameID: string;
}

interface WebviewDownloadEventOptions {
  url: string;
  filename: string;
  filesize: number;
}

interface DownloadUpdatedEventOptions {
  items: GameDownloadItem[];
  updateItem: GameDownloadItem;
}

interface DownloadSuccessfullyEventOptions {
  items: GameDownloadItem[];
  successItem: GameDownloadItem;
}

interface DownloadFailedEventOptions {
  items: GameDownloadItem[];
  failedItem: GameDownloadItem;
}

interface GameInstalledEventOptions {
  gameID: string;
  libraryPath: string;
}

interface GameUninstalledEventOptions {
  gameID: string;
}

interface GameProfileUpdatedEventOptions {
  gameID: string;
  profile: FangameProfile;
}

export interface ShowEventOptions {
  tab: 'delfruit' | 'library';
  gameID?: string;
}

export type EventMap = {
  'minimize': void;
  'maximize': MaximizeEventOptions;
  'game-installed': GameInstalledEventOptions;
  'game-uninstalled': GameUninstalledEventOptions;
  'game-run': GameRunEventOptions;
  'game-close': GameCloseEventOptions;
  'game-profile-updated': GameProfileUpdatedEventOptions;
  'webview-download': WebviewDownloadEventOptions;
  'download-updated': DownloadUpdatedEventOptions;
  'download-successfully': DownloadSuccessfullyEventOptions;
  'download-failed': DownloadFailedEventOptions;
  'show': ShowEventOptions;
  'update-settings': AppSettings;
};

export function sendEvent<T extends keyof EventMap>(name: T, options: EventMap[T]) {
  for (const window of Object.values(windows)) {
    if (!window.isDestroyed()) {
      window.webContents.send(name, options);
    }
  }
}
