import {
  ItemRarity,
  NW_FALLBACK_ICON,
  getAffixMODs,
  getItemIconPath,
  getItemRarity,
  getItemRarityLabel,
  getItemTierAsRoman,
  isItemArtifact,
  isItemNamed,
  isMasterItem,
} from '@nw-data/common'
import { ItemInstanceRow } from '~/data'
import { RangeFilter, SelectFilter } from '~/ui/data/ag-grid'
import { TableGridUtils } from '~/ui/data/table-grid'
import { svgTrashCan } from '~/ui/icons/svg'
import { humanize } from '~/utils'
import { DnDService } from '~/utils/services/dnd.service'

export type InventoryTableUtils = TableGridUtils<InventoryTableRecord>
export type InventoryTableRecord = ItemInstanceRow

export function inventoryColIcon(util: InventoryTableUtils, dnd: DnDService) {
  return util.colDef({
    colId: 'icon',
    headerValueGetter: () => 'Icon',
    resizable: false,
    sortable: false,
    filter: false,
    pinned: true,
    width: 100,
    minWidth: 100,
    maxWidth: 100,
    dndSource: true,
    dndSourceOnRowDrag: (params) => {
      const data = params.rowNode.data as InventoryTableRecord
      const json = JSON.stringify(data)
      params.dragEvent.dataTransfer.setData('application/json', json)
      dnd.data = data
    },
    cellRenderer: util.cellRenderer(({ data }) => {
      const item = data.item
      return util.elItemIcon({
        class: ['transition-all translate-x-0 hover:translate-x-1'],
        icon: getItemIconPath(item) || NW_FALLBACK_ICON,
        isArtifact: isMasterItem(item) && isItemArtifact(item),
        isNamed: isMasterItem(item) && isItemNamed(item),
        rarity: getItemRarity(item),
      })
    }),
  })
}
export function inventoryColName(util: InventoryTableUtils) {
  return util.colDef<string>({
    colId: 'name',
    headerValueGetter: () => 'Name',
    sortable: true,
    filter: true,
    width: 250,
    valueGetter: ({ data }) => util.i18n.get(data.item.Name),
    getQuickFilterText: ({ data }) => util.i18n.get(data.item.Name),
    cellRenderer: util.lineBreaksRenderer(),
    cellClass: ['multiline-cell', 'py-2'],
    autoHeight: true,
  })
}
export function inventoryColPerks(util: InventoryTableUtils) {
  return util.colDef<string[]>({
    colId: 'perks',
    width: 150,
    sortable: false,
    headerValueGetter: () => 'Perks',
    getQuickFilterText: () => '',
    valueGetter: ({ data }) => data.perks?.map((it) => it?.perk?.PerkID),
    cellRenderer: util.cellRenderer(({ data }) => {
      const perks = data.perks || []
      if (!perks.length) {
        return null
      }
      return util.el('div.flex.flex-row.items-center.h-full', {}, [
        ...perks.map(({ perk }) => {
          if (!perk) {
            return util.elImg({
              class: ['w-7', 'h-7', 'nw-icon'],
              src: 'assets/icons/crafting_perkbackground.png',
            })
          }
          return util.el(
            'a.block.w-7.h-7',
            {
              attrs: {
                target: '_blank',
                href: util.tipLink('perk', perk.PerkID),
              },
            },
            util.elImg({
              class: ['w-7', 'h-7', 'nw-icon'],
              src: perk?.IconPath,
            })
          )
        }),
      ])
    }),
    filter: SelectFilter,
    filterParams: SelectFilter.params({
      showSearch: true,
      optionsGetter: (node) => {
        const perks = (node.data as ItemInstanceRow).perks || []
        return perks
          .filter((it) => !!it?.perk)
          .map(({ perk }) => {
            return {
              id: perk.PerkID,
              label: util.i18n.get(perk.DisplayName || perk.AppliedSuffix || perk.AppliedPrefix),
              icon: perk.IconPath,
            }
          })
      },
    }),
  })
}
export function inventoryColRarity(util: InventoryTableUtils) {
  return util.colDef<ItemRarity>({
    colId: 'rarity',
    headerValueGetter: () => 'Rarity',
    field: 'rarity',
    valueFormatter: ({ value }) => util.i18n.get(getItemRarityLabel(value)),
    getQuickFilterText: ({ value }) => util.i18n.get(getItemRarityLabel(value)),
    filter: SelectFilter,
    width: 80,
  })
}
export function inventoryColTier(util: InventoryTableUtils) {
  return util.colDef<number>({
    colId: 'tier',
    headerValueGetter: () => 'Tier',
    getQuickFilterText: () => '',
    width: 60,
    field: 'item.Tier',
    valueFormatter: ({ value }) => getItemTierAsRoman(value),
    filter: SelectFilter,
  })
}
export function inventoryColGearScore(util: InventoryTableUtils) {
  return util.colDef<[number, number]>({
    colId: 'gearScore',
    headerValueGetter: () => 'GS',
    getQuickFilterText: () => '',
    width: 60,
    cellClass: 'text-right',
    comparator: (a, b) => a[1] - b[1],
    valueGetter: ({ data }) => {
      return [data.record.gearScore, data.record.gearScore]
    },
    valueFormatter: ({ value }) => {
      if (value[0] === value[1]) {
        return String(value[0])
      }
      return `${value[0]}-${value[1]}`
    },
    filter: RangeFilter,
  })
}
export function inventoryColAttributeMods(util: InventoryTableUtils) {
  return util.colDef<string[]>({
    colId: 'attributeMods',
    headerValueGetter: () => 'Attr. Mods',
    width: 100,
    valueGetter: ({ data }) => {
      return data.perks
        ?.map((it) => it?.affix)
        .filter((it) => !!it)
        .map((it) => getAffixMODs(it, 0))
        .flat(1)
        .map((it) => util.i18n.get(it.labelShort))
    },
    cellRenderer: util.tagsRenderer({ transform: humanize }),
    filter: SelectFilter,
    filterParams: SelectFilter.params({}),
  })
}
export function inventoryColItemType(util: InventoryTableUtils) {
  return util.colDef<string>({
    colId: 'itemType',
    headerValueGetter: () => 'Item Type',
    field: 'item.ItemType',
    width: 100,
    filter: SelectFilter,
  })
}
export function inventoryColItemClass(util: InventoryTableUtils) {
  return util.colDef<string[]>({
    colId: 'itemClass',
    headerValueGetter: () => 'Item Class',
    width: 250,
    field: 'item.ItemClass',
    cellRenderer: util.tagsRenderer({ transform: humanize }),
    filter: SelectFilter,
    filterParams: SelectFilter.params({}),
  })
}
export function inventoryColActions(
  util: InventoryTableUtils,
  options: {
    destroyAction: (e: Event, data: InventoryTableRecord) => void
  }
) {
  return util.colDef({
    colId: 'actions',
    headerValueGetter: () => 'Actions',
    cellClass: 'text-center',
    width: 100,
    rowDragText: ({}) => 'Text',
    cellRenderer: util.cellRenderer(({ data }) => {
      return util.el('div.btn-group.content-center', {}, [
        util.el(
          'button.btn.btn-ghost',
          {
            ev: {
              onclick: (e) => options.destroyAction(e, data),
            },
          },
          [util.el('span.w-4.h-4', { html: svgTrashCan })]
        ),
      ])
    }),
  })
}
