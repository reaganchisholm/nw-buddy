import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { NwModule } from '~/nw'
import { DataGridModule } from '~/ui/data/table-grid'
import { DataViewModule, DataViewService, provideDataView } from '~/ui/data/data-view'
import { IconsModule } from '~/ui/icons'
import { QuicksearchModule, QuicksearchService } from '~/ui/quicksearch'
import { TooltipModule } from '~/ui/tooltip'
import { VirtualGridModule } from '~/ui/data/virtual-grid'
import { HtmlHeadService, eqCaseInsensitive, observeRouteParam, selectStream } from '~/utils'
import { ItemTableRecord } from '~/widgets/data/item-table'
import { LootLimitTableAdapter } from '~/widgets/data/loot-limit-table'
import { PoiTableAdapter } from '~/widgets/data/poi-table'
import { VitalTableAdapter } from '~/widgets/data/vital-table'
import { ScreenshotModule } from '~/widgets/screenshot'
import { LootBucketTableAdapter } from '~/widgets/data/loot-bucket-table'

@Component({
  standalone: true,
  selector: 'nwb-loot-buckets-page',
  templateUrl: './loot-buckets-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DataGridModule,
    DataViewModule,
    IonicModule,
    NwModule,
    QuicksearchModule,
    RouterModule,
    ScreenshotModule,
    TooltipModule,
    VirtualGridModule,
    IconsModule,
  ],
  host: {
    class: 'layout-col',
  },
  providers: [
    provideDataView({
      adapter: LootBucketTableAdapter,
    }),
    QuicksearchService.provider({
      queryParam: 'search',
    }),
  ],
})
export class LootBucketsPageComponent {
  protected title = 'Loot Buckets'
  protected defaultRoute = 'table'
  protected filterParam = 'filter'
  protected selectionParam = 'id'
  protected persistKey = 'loot-buckets-table'
  protected categoryParam$ = observeRouteParam(inject(ActivatedRoute), 'category')
  protected category$ = selectStream(this.categoryParam$, (it) => {
    return eqCaseInsensitive(it, this.defaultRoute) ? null : it
  })

  public constructor(
    protected service: DataViewService<ItemTableRecord>,
    protected search: QuicksearchService,
    head: HtmlHeadService
  ) {
    service.patchState({ mode: 'table', modes: ['table'] })
    head.updateMetadata({
      url: head.currentUrl,
      title: 'New World - Loot Buckets DB',
    })
  }
}
