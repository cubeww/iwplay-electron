import { windowName } from '@renderer/main';
import { invoke } from '@renderer/utils/invoke';
import { listenEvent } from '@renderer/utils/listenEvent';
import { defineStore } from 'pinia';
import { computed } from 'vue';
import { ref } from 'vue';

export type TabName = 'browser' | 'library' | 'user';

export interface NavState {
  tab: TabName;
  targetBrowserURL?: string;
  fangameItemID?: string;
}

export const useNavigateStore = defineStore('navigate', () => {
  const initialize = () => {
    listenEvent('show', (action) => {
      invoke('show', windowName);
      if (action.tab === 'delfruit') {
        toggleBrowserAndLoadURL('https://delicious-fruit.com/');
      }
      if (action.tab === 'library') {
        if (!action.gameID) {
          toggleTab('library');
        } else {
          selectFangameItem(action.gameID);
        }
      }
    });
  };

  const pastStates = ref<NavState[]>([]);
  const futureStates = ref<NavState[]>([]);

  const state = ref<NavState>({
    tab: 'browser',
    targetBrowserURL: 'https://delicious-fruit.com/',
  });

  const shouldLoadURL = ref(false);

  const recordCurrentState = () => {
    futureStates.value = [];
    pastStates.value.push(state.value);
  };

  const setShouldLoadURL = (value: boolean) => {
    shouldLoadURL.value = value;
  };

  const lastVisitedFangameID = ref('');

  const updateLastVisitedFangameId = (id: string) => {
    lastVisitedFangameID.value = id;
  };

  // Navigate Actions
  // ----------------

  const back = () => {
    if (pastStates.value.length > 0) {
      futureStates.value.push(state.value);
      state.value = pastStates.value.pop()!;
      if (state.value.tab === 'browser') {
        shouldLoadURL.value = true;
      }
    }
  };

  const forward = () => {
    if (futureStates.value.length > 0) {
      pastStates.value.push(state.value);
      state.value = futureStates.value.pop()!;
      if (state.value.tab === 'browser') {
        shouldLoadURL.value = true;
      }
    }
  };

  const canBack = computed(() => pastStates.value.length > 0);
  const canForward = computed(() => futureStates.value.length > 0);

  // State Actions
  // -------------

  const toggleTab = (tab: TabName) => {
    if (state.value.tab !== tab) {
      recordCurrentState();
      state.value = { ...state.value, tab };
    }
  };

  const toggleBrowserAndLoadURL = (url: string) => {
    recordCurrentState();
    state.value = { ...state.value, tab: 'browser', targetBrowserURL: url };
    shouldLoadURL.value = true;
  };

  const selectFangameItem = (id?: string) => {
    if (state.value.fangameItemID !== id) {
      recordCurrentState();
      state.value = { ...state.value, tab: 'library', fangameItemID: id };
    }
  };

  const recordBrowserURL = (url: string) => {
    recordCurrentState();
    state.value = { ...state.value, tab: 'browser', targetBrowserURL: url };
  };

  return {
    initialize,
    state,
    shouldLoadURL,
    setShouldLoadURL,
    back,
    forward,
    canBack,
    canForward,
    toggleTab,
    toggleBrowserAndLoadURL,
    selectFangameItem,
    recordBrowserURL,
    lastVisitedFangameID,
    updateLastVisitedFangameId,
  };
});
