/// <reference lib="webworker" />
import { ItemRarity } from '@nw-data/common'
import { environment } from 'apps/web/environments'
import { expose } from 'comlink'

export interface SearchRecord {
  id: string
  text: string
  type: string
  icons: string
  tier: number
  rarity: ItemRarity
}
export interface SearchQueryTasks {
  search: (args: { text: string; lang: string }) => Promise<SearchRecord[]>
}

const index: Record<string, Promise<any>> = {}

function fetchIndex(lang: string): Promise<SearchRecord[]> {
  if (!index[lang]) {
    index[lang] = fetch(`${environment.nwDataUrl}/search/${lang}.json`)
      .then((res) => res.json())
      .then((data) => {
        return transformImageUrls(data)
      })
  }
  return index[lang]
}

function transformImageUrls(data: any) {
  if (!Array.isArray(data)) {
    return data
  }
  const nwDataUrl = environment.nwDataUrl.replace(/\/+$/, '')
  return data.map((item) => {
    Object.entries(item).forEach(([key, value]) => {
      if (typeof value === 'string' && value.startsWith('nw-data/')) {
        item[key] = value.replace(/nw-data\/((live|ptr)\/)?/, nwDataUrl + '/')
      }
    })
    return item
  })
}

const api: SearchQueryTasks = {
  search: async ({ text, lang }) => {
    text = text.toLocaleLowerCase()
    const records = await fetchIndex(lang).catch(console.error)
    if (!records) {
      return []
    }
    const result = records
      .map((it) => {
        return {
          rank:
            stringSearch((it.text || '').toLocaleLowerCase(), text) +
            stringSearch(String(it.id || '').toLocaleLowerCase(), text),
          record: it,
        }
      })
      .filter((it) => it.rank > 0)
      .sort((a, b) => a.rank - b.rank)
    return result.map((it) => it.record)
  },
}

expose(api)

function stringSearch(hay: string, needle: string) {
  let count = 0
  for (let i = 0; i < hay.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (needle[j] !== hay[i + j]) break
      if (j === needle.length - 1) count++
    }
  }
  return count
}
