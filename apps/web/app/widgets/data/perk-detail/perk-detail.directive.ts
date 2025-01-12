import { Directive, forwardRef, Input, Output } from '@angular/core'
import { NwDbService } from '~/nw'
import { PerkDetailStore } from './perk-detail.store'

@Directive({
  standalone: true,
  selector: '[nwbPerkDetail]',
  exportAs: 'perkDetail',
  providers: [
    {
      provide: PerkDetailStore,
      useExisting: forwardRef(() => PerkDetailDirective),
    },
  ],
})
export class PerkDetailDirective extends PerkDetailStore {
  @Input()
  public set nwbPerkDetail(value: string) {
    this.patchState({ perkId: value })
  }

  @Output()
  public nwbPerkChange = this.perk$

  public constructor(db: NwDbService) {
    super(db)
  }
}
