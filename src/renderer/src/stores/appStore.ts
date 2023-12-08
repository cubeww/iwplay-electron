import { api } from '@renderer/utils/api'
import { DelFruitFangameItem, delFruitUtil } from '@renderer/utils/delFruitUtil'
import { join } from 'path-browserify'
import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'

export type TabName = 'browser' | 'library' | 'user'

export interface ContextMenuOptions {
  x: number
  y: number
  items: ContextMenuItemData[]
  triggerEl: HTMLElement
  outsideAutoClose?: boolean
}

export type ContextMenuItemData =
  | ContextMenuItemText
  | ContextMenuItemSeparator
  | ContextMenuItemSubMenu

export interface ContextMenuItemText {
  type: 'text'
  text: string
  onClick: () => void
}

export interface ContextMenuItemSeparator {
  type: 'separator'
}

export interface ContextMenuItemSubMenu {
  type: 'submenu'
  text: string
  submenu: ContextMenuItemData[]
}

export interface BackableState {
  tab: TabName
  targetBrowserURL?: string
  fangameItem?: FangameItem
}

export interface FangameItem {
  id: string
  name: string
  isRunning: boolean
  isInstalled: boolean
}

export type ActionStatus = 'pending' | 'fetching' | 'ok' | 'error'

export const useAppStore = defineStore('app', () => {
  // ========== Backable State

  const past = ref<BackableState[]>([])
  const present = ref<BackableState>({
    tab: 'browser',
    targetBrowserURL: 'https://delicious-fruit.com/'
  })
  const future = ref<BackableState[]>([])

  const shouldLoadURL = ref(false)

  const backable = <T extends Function>(action: T) => {
    return ((...args: any) => {
      future.value = []
      past.value.push(present.value)
      action(...args)
    }) as unknown as T
  }

  const toggleTab = backable((tab: TabName) => {
    present.value = { tab }
  })

  const toggleBrowserAndLoadURL = backable((url: string) => {
    present.value = { tab: 'browser', targetBrowserURL: url }
    shouldLoadURL.value = true
  })

  const recordBrowserURL = backable((url: string) => {
    present.value = { tab: 'browser', targetBrowserURL: url }
  })

  const setShouldLoadURL = (value: boolean) => {
    shouldLoadURL.value = value
  }

  const back = () => {
    if (past.value.length > 0) {
      future.value.push(present.value)
      present.value = past.value.pop()!
      if (present.value.tab === 'browser') {
        shouldLoadURL.value = true
      }
    }
  }

  const forward = () => {
    if (future.value.length > 0) {
      past.value.push(present.value)
      present.value = future.value.pop()!
      if (present.value.tab === 'browser') {
        shouldLoadURL.value = true
      }
    }
  }

  // ========== Context Menu

  const contextMenu = ref<ContextMenuOptions>()

  const showContextMenu = (options: ContextMenuOptions) => {
    contextMenu.value = options
  }

  const hideContextMenu = () => {
    contextMenu.value = undefined
  }

  // ========== Library

  const fangameItems = ref<FangameItem[]>([])
  const fetchFangameItemsStatus = ref<ActionStatus>('pending')

  const libraryLocation = ref('')

  const fetchFangameItems = async (forceDownload: boolean = false) => {
    fetchFangameItemsStatus.value = 'fetching'

    const cachePath = join(await api.getPath('userData'), 'appcache')
    if (!(await api.pathExists(cachePath))) await api.createDir(cachePath)

    const cacheFile = join(cachePath, 'delfruit-fangamelist.json')

    let items: DelFruitFangameItem[] = []

    let loadCacheOK = false

    if (!forceDownload) {
      // Try to load cache first
      try {
        const cacheData: { fetchdate: string; list: DelFruitFangameItem[] } = JSON.parse(
          await api.readFile(cacheFile)
        )

        const differenceDays =
          (new Date().getTime() - new Date(cacheData.fetchdate).getTime()) / (1000 * 60 * 60 * 24)

        if (differenceDays < 1) {
          items = cacheData.list
          loadCacheOK = true
        }
      } catch (e) {
        loadCacheOK = false
      }
    }

    if (!loadCacheOK) {
      // Fetch fangame list from DelFruit
      items = await delFruitUtil.fetchFangameItems()

      // Write to cache
      await api.writeFile(
        cacheFile,
        JSON.stringify({
          fetchdate: new Date(),
          list: items
        })
      )
    }

    for (const i of items as FangameItem[]) {
      i.isInstalled = false
      i.isRunning = false
    }

    // TODO: Get installed fangames

    // TODO: Get running fangames

    // Update store items
    fetchFangameItemsStatus.value = 'ok'
    fangameItems.value = items as FangameItem[]
  }

  const selectFangameItem = backable((item?: FangameItem) => {
    present.value = { tab: 'library', fangameItem: item }
  })

  // ========== Popup

  const popups = ref<{ component: any; context: any }[]>([])

  const showPopup = (component: any, context: any) => {
    popups.value.push({ component: shallowRef(component), context })
  }

  const closePopup = (context: any) => {
    const index = popups.value.findIndex((p) => p.context === context)
    if (index !== -1) {
      popups.value.splice(index, 1)
    }
  }

  // ========== Misc

  const isMaximize = ref(false)

  return {
    past,
    future,
    present,
    shouldLoadURL,
    toggleTab,
    toggleBrowserAndLoadURL,
    recordBrowserURL,
    setShouldLoadURL,
    back,
    forward,
    showContextMenu,
    hideContextMenu,
    contextMenu,
    isMaximize,
    popups,
    showPopup,
    closePopup,
    fangameItems,
    fetchFangameItems,
    fetchFangameItemsStatus,
    selectFangameItem
  }
})
