import { join } from 'path-browserify';
import { ref } from 'vue';
import { invoke } from './invoke';

type Language = 'cn' | 'en';

interface Config {
  libraryPaths: string[];
  language: Language;
}

const configData = ref<Config>({
  libraryPaths: [],
  language: 'cn'
});

const configFile = join(await invoke('get-path', 'userData'), 'iwplay-config.json');

export const config = {
  async init() {
    try {
      const json = await invoke('read-file', configFile);
      configData.value = JSON.parse(json);
    } catch {
      await invoke('write-file', configFile, JSON.stringify(configData.value, undefined, 4));
    }
  },

  get<K extends keyof Config>(key: K): Config[K] {
    return configData.value[key];
  },

  set<K extends keyof Config>(key: K, value: Config[K]) {
    configData.value[key] = value;

    invoke('write-file', configFile, JSON.stringify(configData.value, undefined, 4));
  }
};
