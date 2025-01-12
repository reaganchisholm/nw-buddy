import { ChangeDetectorRef, Directive, forwardRef, Input } from '@angular/core'
import { NwDbService } from '~/nw'
import { ModelViewerService } from '../../model-viewer'
import { ItemDetailStore } from './item-detail.store'

@Directive({
  standalone: true,
  selector: '[nwbItemDetail]',
  exportAs: 'itemDetail',
  providers: [
    {
      provide: ItemDetailStore,
      useExisting: forwardRef(() => ItemDetailDirective),
    },
  ],
})
export class ItemDetailDirective extends ItemDetailStore {
  @Input()
  public set nwbItemDetail(value: string) {
    this.patchState({ entityId: value })
  }

  public constructor(db: NwDbService, models: ModelViewerService, cdRef: ChangeDetectorRef) {
    super(db, models, cdRef)
  }
}
