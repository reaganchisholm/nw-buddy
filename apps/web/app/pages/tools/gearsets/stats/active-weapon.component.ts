import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Damagetable } from '@nw-data/generated'
import { combineLatest, firstValueFrom, map } from 'rxjs'
import { NwDbService, NwModule } from '~/nw'
import { CombatMode, Mannequin } from '~/nw/mannequin'
import { NW_WEAPON_TYPES, damageTypeIcon } from '~/nw/weapon-types'
import { IconsModule } from '~/ui/icons'
import { svgBurst, svgPeopleGroup } from '~/ui/icons/svg'
import { TooltipModule } from '~/ui/tooltip'
import { humanize, mapFilter, mapProp } from '~/utils'

@Component({
  standalone: true,
  selector: 'nwb-active-weapon',
  templateUrl: './active-weapon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NwModule, CdkMenuModule, FormsModule, IconsModule, TooltipModule],
  host: {
    class: 'layout-content',
  },
})
export class ActiveWeaponComponent {
  protected combatModeOptions: Array<{ label: string; value: CombatMode }> = [
    {
      label: 'PvE',
      value: 'pve',
    },
    {
      label: 'PvP Arena',
      value: 'pvpArena',
    },
    {
      label: 'PvP Openworld',
      value: 'pvpOpenworld',
    },
    {
      label: 'PvP War',
      value: 'pvpWar',
    },
    {
      label: 'PvP Outpostrush',
      value: 'pvpOutpostrush',
    },
  ]

  protected dmgMain$ = this.mannequin.statDamageBase$.pipe(
    map((it) => {
      if (!it.BaseDamage?.value) {
        return null
      }
      return {
        ...it.BaseDamage,
        label: 'Damage',
        icon: damageTypeIcon(it.BaseDamageType),
      }
    })
  )

  protected dmgMain1$ = combineLatest({
    dmgBase: this.mannequin.statDamageBase$,
    dmgMods: this.mannequin.statDamageMods$,
    dmgEmpower: this.mannequin.statDmg$,
  }).pipe(
    map(({ dmgBase, dmgMods, dmgEmpower }) => {
      const weaponDamage = dmgBase.BaseDamage.value
      const dmgCoef = dmgBase.DamageCoef?.value ?? 1
      const ammoCoef = dmgBase.DamageCoefAmmo?.value ?? 1
      const dmgMod = 1 + dmgBase.BaseDamageMod.value
      const empower = 1 + (dmgEmpower.DamageCategories[dmgBase.BaseDamageType]?.value ?? 0)

      return weaponDamage * dmgCoef * ammoCoef * dmgMod * empower
    })
  )

  protected dmgMain2$ = combineLatest({
    dmgBase: this.mannequin.statDamageBase$,
    dmgMods: this.mannequin.statDamageMods$,
    dmgEmpower: this.mannequin.statDmg$,
  }).pipe(
    map(({ dmgBase, dmgMods, dmgEmpower }) => {
      const weaponDamage = dmgBase.BaseDamage.value
      const dmgCoef = dmgBase.DamageCoef?.value ?? 1
      const ammoCoef = dmgBase.DamageCoefAmmo?.value ?? 1
      const dmgMod = 1 + dmgBase.BaseDamageMod.value
      const empower = 1 + (dmgEmpower.DamageCategories[dmgBase.BaseDamageType]?.value ?? 0)
      const critMod = Math.max(dmgMods.Crit?.value || 0, 0)

      return weaponDamage * dmgCoef * ammoCoef * (dmgMod + critMod) * empower
    })
  )

  protected dmgConverted$ = this.mannequin.statDamageBase$.pipe(
    map((it) => {
      if (!it.ConvertedDamage?.value) {
        return null
      }
      return {
        ...it.ConvertedDamage,
        label: 'Converted',
        icon: damageTypeIcon(it.ConvertedDamageType),
      }
    })
  )

  protected dmgConverted1$ = combineLatest({
    dmgBase: this.mannequin.statDamageBase$,
    dmgMods: this.mannequin.statDamageMods$,
    dmgEmpower: this.mannequin.statDmg$,
  }).pipe(
    map(({ dmgBase, dmgMods, dmgEmpower }) => {
      const weaponDamage = dmgBase.ConvertedDamage.value
      const dmgCoef = dmgBase.DamageCoef?.value ?? 1
      const ammoCoef = dmgBase.DamageCoefAmmo?.value ?? 1
      const dmgMod = 1 + dmgBase.BaseDamageMod.value
      const empower = 1 + (dmgEmpower.DamageCategories[dmgBase.ConvertedDamageType]?.value ?? 0)

      return weaponDamage * dmgCoef * ammoCoef * dmgMod * empower
    })
  )

  protected dmgConverted2$ = combineLatest({
    dmgBase: this.mannequin.statDamageBase$,
    dmgMods: this.mannequin.statDamageMods$,
    dmgEmpower: this.mannequin.statDmg$,
  }).pipe(
    map(({ dmgBase, dmgMods, dmgEmpower }) => {
      const weaponDamage = dmgBase.ConvertedDamage.value
      const dmgCoef = dmgBase.DamageCoef?.value ?? 1
      const ammoCoef = dmgBase.DamageCoefAmmo?.value ?? 1
      const dmgMod = 1 + dmgBase.BaseDamageMod.value
      const empower = 1 + (dmgEmpower.DamageCategories[dmgBase.ConvertedDamageType]?.value ?? 0)
      const critMod = Math.max(0, dmgMods.Crit?.value || 0)

      return weaponDamage * dmgCoef * ammoCoef * (dmgMod + critMod) * empower
    })
  )

  protected vm$ = combineLatest({
    weapon: this.mannequin.activeWeapon$,
    weaponTag: this.mannequin.activeWeapon$.pipe(mapProp('weaponTag')),
    weaponUnsheathed: this.mannequin.activeWeapon$.pipe(mapProp('unsheathed')),
    ammoType: this.mannequin.activeWeapon$.pipe(map((it) => it.ammo?.AmmoType)),
    attackOptions: this.mannequin.activeWeaponAttacks$.pipe(mapFilter((it) => it.AttackType !== 'Ability')),
    attackSelection: this.mannequin.activeDamageTableRow$,
    attackName: this.mannequin.activeDamageTableRow$.pipe(map((it) => humanize(it?.DamageID))),
    combatMode: this.mannequin.combatMode$,
    numAroundMe: this.mannequin.numAroundMe$,
    numHits: this.mannequin.numHits$,
    DmgMain: combineLatest({
      base: this.dmgMain$,
      standard: this.dmgMain1$,
      crit: this.dmgMain2$,
    }).pipe(map((it) => (it.base?.value ? it : null))),
    DmgConverted: combineLatest({
      base: this.dmgConverted$,
      standard: this.dmgConverted1$,
      crit: this.dmgConverted2$,
    }).pipe(map((it) => (it.base?.value ? it : null))),
  })

  protected iconGroup = svgPeopleGroup
  protected iconBurst = svgBurst

  public constructor(private mannequin: Mannequin, private db: NwDbService) {
    //
  }

  protected async toggleWeapon() {
    const state = await firstValueFrom(this.mannequin.state$)
    this.mannequin.patchState({
      weaponActive: state.weaponActive === 'secondary' ? 'primary' : 'secondary',
    })
  }

  protected async toggleSheathed() {
    const state = this.mannequin.state()
    this.mannequin.patchState({
      weaponUnsheathed: !state.weaponUnsheathed,
    })
  }

  protected async commitAttack(row: Damagetable) {
    this.mannequin.patchState({
      selectedAttack: row?.DamageID,
    })
  }

  protected async commitNumAroundMe(value: number) {
    this.mannequin.patchState({
      numAroundMe: value,
    })
  }

  protected async commitNumHits(value: number) {
    this.mannequin.patchState({
      numHits: value,
    })
  }

  protected async commitCombatMode(value: CombatMode) {
    this.mannequin.patchState({
      combatMode: value,
    })
  }

  protected labelForAttack(attack: Damagetable, weaponTag: string) {
    const prefix = NW_WEAPON_TYPES.find((it) => it.WeaponTag === weaponTag)?.DamageTablePrefix
    return attack.DamageID.replace(prefix || '', '')
  }

  protected damageIcon(type: string) {
    return damageTypeIcon(type)
  }
}
