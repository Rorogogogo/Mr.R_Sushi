// mr-r-sushi/src/utils/appEvents.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Listener = (data?: any) => void
const listeners: Record<string, Listener[]> = {}

export const appEvents = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on: (event: string, callback: Listener): void => {
    if (!listeners[event]) {
      listeners[event] = []
    }
    listeners[event].push(callback)
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  off: (event: string, callback: Listener): void => {
    if (!listeners[event]) return
    const index = listeners[event].indexOf(callback)
    if (index > -1) {
      listeners[event].splice(index, 1)
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit: (event: string, data?: any): void => {
    if (!listeners[event]) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listeners[event].forEach((listener) => listener(data))
  },
}
