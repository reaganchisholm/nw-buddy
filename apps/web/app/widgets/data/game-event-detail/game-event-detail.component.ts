import { CommonModule, DecimalPipe } from '@angular/common'
import { ChangeDetectionStrategy, Component, forwardRef, Input } from '@angular/core'
import { GameEvent } from '@nw-data/generated'
import { NwDbService, NwModule } from '~/nw'
import { ItemFrameModule } from '~/ui/item-frame'
import { PropertyGridCell, PropertyGridModule } from '~/ui/property-grid'
import { GameEventDetailStore } from './game-event-detail.store'

@Component({
  standalone: true,
  selector: 'nwb-game-event-detail',
  templateUrl: './game-event-detail.component.html',
  exportAs: 'detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NwModule, ItemFrameModule, PropertyGridModule, DecimalPipe],
  providers: [
    DecimalPipe,
    {
      provide: GameEventDetailStore,
      useExisting: forwardRef(() => GameEventDetailComponent),
    },
  ],
  host: {
    class: 'block rounded-md overflow-clip',
  },
})
export class GameEventDetailComponent extends GameEventDetailStore {
  @Input()
  public set eventId(value: string) {
    this.patchState({ eventId: value })
  }

  public constructor(db: NwDbService, private decimals: DecimalPipe) {
    super(db)
  }

  public formatValue = (value: any, key: keyof GameEvent): PropertyGridCell | PropertyGridCell[] => {
    switch (key) {
      case 'LootLimitReachedGameEventId':
      case 'LootLimitId': {
        return [
          {
            value: String(value),
            accent: true,
            routerLink: ['/loot-limits/table', value],
          },
        ]
      }
      case 'ItemReward': {
        const id = String(value)
        if (id.startsWith('[LTID]')) {
          return [
            {
              value: value,
              accent: true,
              routerLink: ['/loot/table', id.replace('[LTID]', '')],
            },
          ]
        }
        if (id.includes('HousingItem')) {
          return [
            {
              value: value,
              accent: true,
              routerLink: ['/housing/table', value],
            },
          ]
        }
        return [
          {
            value: value,
            accent: true,
            routerLink: ['/items/table', value],
          },
        ]
      }
      default: {
        if (Array.isArray(value)) {
          return value.map((it) => ({
            value: String(it),
            secondary: true,
          }))
        }
        if (typeof value === 'number') {
          return [
            {
              value: this.decimals.transform(value, '0.0-7'),
              accent: true,
            },
          ]
        }
        return [
          {
            value: String(value),
            accent: typeof value === 'number',
            info: typeof value === 'boolean',
            bold: typeof value === 'boolean',
          },
        ]
      }
    }
  }
}

function statusEffectCells(list: string | string[]): PropertyGridCell[] {
  list = typeof list === 'string' ? [list] : list
  return list?.map((it) => {
    const isLink = it !== 'All'
    return {
      value: String(it),
      accent: isLink,
      routerLink: isLink ? ['/status-effects/table', it] : null,
    }
  })
}

function abilitiesCells(list: string | string[]): PropertyGridCell[] {
  list = typeof list === 'string' ? [list] : list
  return list?.map((it) => {
    return {
      value: String(it),
      accent: true,
      routerLink: ['/abilities/table', it],
    }
  })
}
