import { Directive, forwardRef, Input, Output } from '@angular/core'
import { NwDbService } from '~/nw'
import { StatusEffectDetailStore } from './status-effect.store'

@Directive({
  standalone: true,
  selector: '[nwbStatusEffectDetail]',
  exportAs: 'effectDetail',
  providers: [
    {
      provide: StatusEffectDetailStore,
      useExisting: forwardRef(() => StatusEffectDetailDirective),
    },
  ],
})
export class StatusEffectDetailDirective extends StatusEffectDetailStore {
  @Input()
  public set nwbStatusEffectDetail(value: string) {
    this.patchState({ effectId: value })
  }

  @Output()
  public nwbStatusEffectChange = this.effect$

  public constructor(db: NwDbService) {
    super(db)
  }
}
