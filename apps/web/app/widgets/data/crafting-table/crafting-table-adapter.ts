import { GridOptions } from '@ag-grid-community/core'
import { Injectable, Signal, inject } from '@angular/core'
import { getIngretientsFromRecipe, getItemIdFromRecipe, getTradeSkillLabel } from '@nw-data/common'
import { COLS_ABILITY, COLS_CRAFTING } from '@nw-data/generated'
import { Observable, combineLatest, map } from 'rxjs'
import { NwDbService } from '~/nw'
import {
  TABLE_GRID_ADAPTER_OPTIONS,
  DataTableCategory,
  TableGridAdapter,
  TableGridUtils,
  addGenericColumns,
} from '~/ui/data/table-grid'
import {
  CraftingTableRecord,
  craftingColBookmark,
  craftingColCanCraft,
  craftingColCategory,
  craftingColCooldownCeconds,
  craftingColCooldownQuantity,
  craftingColExpansion,
  craftingColGroup,
  craftingColID,
  craftingColIcon,
  craftingColInStock,
  craftingColIngredients,
  craftingColItemChance,
  craftingColName,
  craftingColPrice,
  craftingColRecipeLevel,
  craftingColTradeskill,
} from './crafting-table-cols'
import { DataViewAdapter } from '~/ui/data/data-view'
import { VirtualGridOptions } from '~/ui/data/virtual-grid'
import { CharacterStore } from '~/data'
import { toSignal } from '@angular/core/rxjs-interop'

@Injectable()
export class CraftingTableAdapter
  implements DataViewAdapter<CraftingTableRecord>, TableGridAdapter<CraftingTableRecord>
{
  private db = inject(NwDbService)
  private character = inject(CharacterStore)
  private utils: TableGridUtils<CraftingTableRecord> = inject(TableGridUtils)
  private config = inject(TABLE_GRID_ADAPTER_OPTIONS, { optional: true })
  private skills = toSignal(this.character.tradeskills$, { initialValue: null })

  public entityID(item: CraftingTableRecord): string {
    return item.RecipeID
  }

  public entityCategories(item: CraftingTableRecord): DataTableCategory[] {
    if (!item.Tradeskill) {
      return null
    }
    return [
      {
        id: item.Tradeskill,
        label: getTradeSkillLabel(item.Tradeskill),
        icon: '',
      },
    ]
  }

  public gridOptions(): GridOptions<CraftingTableRecord> {
    const build = this.config?.gridOptions || buildOptions
    return build(this.utils, this.skills)
  }

  public virtualOptions(): VirtualGridOptions<CraftingTableRecord> {
    // TODO: add virtual grid support
    return null
  }

  public connect(): Observable<CraftingTableRecord[]> {
    return combineLatest({
      items: this.db.itemsMap,
      housing: this.db.housingItemsMap,
      recipes: this.db.recipes,
    }).pipe(
      map(({ items, housing, recipes }) => {
        recipes = recipes.filter((it) => !!it.Tradeskill)
        return recipes.map<CraftingTableRecord>((it) => {
          const itemId = getItemIdFromRecipe(it)
          return {
            ...it,
            $item: items.get(itemId) || housing.get(itemId),
            $ingredients: getIngretientsFromRecipe(it)
              .map((ing) => items.get(ing.ingredient) || housing.get(ing.ingredient))
              .filter((it) => !!it),
          }
        })
      })
    )
  }
}

function buildOptions(util: TableGridUtils<CraftingTableRecord>, skills: Signal<Record<string, number>>) {
  const result: GridOptions<CraftingTableRecord> = {
    columnDefs: [
      craftingColIcon(util),
      craftingColName(util),
      craftingColID(util),
      craftingColIngredients(util),
      craftingColBookmark(util),
      craftingColInStock(util),
      craftingColPrice(util),
      craftingColTradeskill(util),
      craftingColCategory(util),
      craftingColGroup(util),
      craftingColRecipeLevel(util),
      craftingColCanCraft(util, skills),
      craftingColExpansion(util),
      craftingColItemChance(util),
      craftingColCooldownQuantity(util),
      craftingColCooldownCeconds(util),
    ],
  }
  addGenericColumns(result, {
    props: COLS_CRAFTING,
  })
  return result
}
