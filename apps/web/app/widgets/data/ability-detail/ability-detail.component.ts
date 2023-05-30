import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, forwardRef, Input } from '@angular/core'
import { Ability } from '@nw-data/generated'
import { NwDbService, NwModule } from '~/nw'
import { ItemFrameModule } from '~/ui/item-frame'
import { PropertyGridModule } from '~/ui/property-grid'
import { PropertyGridCell } from '~/ui/property-grid/property-grid-cell.directive'
import { AbilityDetailStore } from './ability-detail.store'

@Component({
  standalone: true,
  selector: 'nwb-ability-detail',
  templateUrl: './ability-detail.component.html',
  exportAs: 'detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NwModule, ItemFrameModule, PropertyGridModule],
  providers: [
    {
      provide: AbilityDetailStore,
      useExisting: forwardRef(() => AbilityDetailComponent),
    },
  ],
  host: {
    class: 'block rounded-md overflow-clip',
  },
})
export class AbilityDetailComponent extends AbilityDetailStore {
  @Input()
  public set abilityId(value: string) {
    this.patchState({ abilityId: value })
  }

  @Input()
  public disableProperties: boolean

  public constructor(db: NwDbService) {
    super(db)
  }

  public formatValue = (value: any, key: keyof Ability): PropertyGridCell | PropertyGridCell[] => {
    switch (key) {
      case 'TargetStatusEffectDurationList':
        return statusEffectCells(value as Ability['TargetStatusEffectDurationList'])
      case 'RemoveTargetStatusEffectsList':
        return statusEffectCells(value as Ability['RemoveTargetStatusEffectsList'])
      case 'StatusEffectsList':
        return statusEffectCells(value as Ability['StatusEffectsList'])
      case 'SelfApplyStatusEffect':
        return statusEffectCells(value as Ability['SelfApplyStatusEffect'])
      case 'DamageTableStatusEffectOverride':
      case 'DontHaveStatusEffect':
      case 'OnEquipStatusEffect':
      case 'OtherApplyStatusEffect':
      case 'StatusEffect':
      case 'StatusEffectBeingApplied':
      case 'TargetStatusEffect': {
        return statusEffectCells(value)
      }
      case 'CooldownId':
      case 'AbilityID':
      case 'RequiredEquippedAbilityId':
      case 'RequiredAbilityId': {
        return abilitiesCells(value)
      }
      case 'AbilityList': {
        return abilitiesCells(value as Ability['AbilityList'])
      }
      case 'DamageTableRow':
      case 'DamageTableRowOverride':
      case 'RemoteDamageTableRow': {
        return damageCells(value as Ability['DamageTableRow'])
      }
      case 'AttackType': {
        return damageCells(value as Ability['AttackType'])
      }
      default: {
        if (Array.isArray(value)) {
          return value.map((it) => ({
            value: String(it),
            secondary: true,
          }))
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

function damageCells(list: string | string[]): PropertyGridCell[] {
  list = typeof list === 'string' ? [list] : list
  return list?.map((it) => {
    return {
      value: String(it),
      accent: true,
      routerLink: ['/damage/table'],
      queryParams: { search: it },
    }
  })
}
