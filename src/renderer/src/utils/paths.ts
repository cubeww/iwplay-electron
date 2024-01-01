/*
  LibraryPath/
    iwapps/
      common/
        {fangame-id}/
          {fangame-files}
      iwmanifest_{fangame-id}.json
    iwplay-library.json
    

  AppDataPath/
    userdata/
      {user-id}/
        {fangame-id}/
          profile.json
    appcache/
      delfruit-fangamelist.json
    iwplay-config.json
*/

import { invoke } from './invoke';

const userdata = await invoke('get-path', 'userData');

export const paths = {
  /////////////
  // Library //
  /////////////

  libraryMeta(libraryPath: string) {
    return libraryPath + '/iwplay-library.json';
  },

  iwapps(libraryPath: string) {
    return libraryPath + '/iwapps';
  },

  common(libraryPath: string) {
    return libraryPath + '/iwapps/common';
  },

  gameDir(libraryPath: string, id: string) {
    return libraryPath + '/iwapps/common/' + id + '/';
  },

  gameExe(libraryPath: string, id: string, startup: string) {
    return libraryPath + '/iwapps/common/' + id + '/' + startup;
  },

  manifest(libraryPath: string, id: string) {
    return libraryPath + '/iwapps/iwmanifest_' + id + '.json';
  },

  downloading(libraryPath: string, id: string) {
    return libraryPath + '/iwapps/downloading/' + id;
  },

  /////////////
  // AppData //
  /////////////

  config() {
    return userdata + '/iwplay-config.json';
  },

  appCache() {
    return userdata + '/appcache';
  },

  delFruitFangameList() {
    return userdata + '/appcache/delfruit-fangamelist.json';
  },

  fangameProfile(userid: string, id: string) {
    return userdata + '/userdata/' + userid + '/' + id + '/profile.json';
  }
};
