import { defineStore } from 'pinia'
import { ref } from 'vue'

export type TabName = 'browser' | 'library' | 'user'

export interface ContextMenuData {
  x: number
  y: number
  items: ContextMenuItemData[]
  outsideAutoClose?: boolean
  triggerEl?: HTMLElement
}

export type ContextMenuItemData =
  | ContextMenuItemText
  | ContextMenuItemSeparator
  | ContextMenuItemSubmenu

export interface ContextMenuItemText {
  type: 'text'
  text: string
  onClick: () => void
}

export interface ContextMenuItemSeparator {
  type: 'separator'
}

export interface ContextMenuItemSubmenu {
  type: 'submenu'
  text: string
  submenu: ContextMenuItemData[]
}

export interface BackableState {
  tab: TabName
  targetBrowserURL?: string
}

export const useAppStore = defineStore('app', () => {
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

  const contextMenu = ref<ContextMenuData>()

  const showContextMenu = (data: ContextMenuData) => {
    contextMenu.value = data
  }

  const hideContextMenu = () => {
    contextMenu.value = undefined
  }

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
    contextMenu
  }
})
