import { type Ref } from 'vue'

export interface LoadEntry {
  no: number
  [key: string]: number
}

export function useLoadManager<T extends LoadEntry>(
  loads: Ref<T[]>,
  createEntry: (no: number, values: number[]) => T,
  columnCount: number = 2
) {
  function getNextNo(): number {
    if (loads.value.length === 0) return 1
    return Math.max(...loads.value.map(d => d.no)) + 1
  }

  function addLoad(entry: T) {
    loads.value.push(entry)
  }

  function removeLoad(index: number) {
    loads.value.splice(index, 1)
  }

  function clearLoads() {
    loads.value = []
  }

  function importFromText(text: string) {
    let startNo = getNextNo()
    const lines = text.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      const parts = trimmed.split(/[,\s\t]+/)
      if (parts.length >= columnCount) {
        const values = parts.slice(0, columnCount).map(Number)
        if (values.every(v => !isNaN(v))) {
          loads.value.push(createEntry(startNo++, values))
        }
      }
    }
  }

  return {
    getNextNo,
    addLoad,
    removeLoad,
    clearLoads,
    importFromText,
  }
}
