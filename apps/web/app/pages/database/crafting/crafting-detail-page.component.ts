import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { Crafting, Housingitems, ItemDefinitionMaster } from '@nw-data/generated'
import { map, tap } from 'rxjs'
import { TranslateService } from '~/i18n'
import { NwDbService, NwModule } from '~/nw'
import { getItemIconPath, getItemIdFromRecipe } from '@nw-data/common'
import { LayoutModule } from '~/ui/layout'
import { HtmlHeadService, observeRouteParam } from '~/utils'
import { CraftingCalculatorComponent } from '~/widgets/crafting'
import { ItemDetailModule } from '~/widgets/data/item-detail'
import { ScreenshotModule } from '~/widgets/screenshot'

@Component({
  standalone: true,
  selector: 'nwb-crafting-detail-page',
  templateUrl: './crafting-detail-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    NwModule,
    ItemDetailModule,
    CraftingCalculatorComponent,
    ScreenshotModule,
    LayoutModule,
  ],
  host: {
    class: 'flex-none flex flex-col',
  },
})
export class CraftingDetailPageComponent {
  protected id$ = observeRouteParam(this.route, 'id')
  protected recipe$ = this.db.recipe(this.id$)
  protected itemId$ = this.recipe$.pipe(map((it) => getItemIdFromRecipe(it)))

  public constructor(
    private route: ActivatedRoute,
    private db: NwDbService,
    private i18n: TranslateService,
    private head: HtmlHeadService
  ) {
    //
  }

  protected onEntity(entity: ItemDefinitionMaster | Housingitems) {
    if (!entity) {
      return
    }
    this.head.updateMetadata({
      title: [this.i18n.get(entity.Name), 'Recipe'].join(' - '),
      description: this.i18n.get(entity.Description),
      url: this.head.currentUrl,
      image: `${this.head.origin}/${getItemIconPath(entity)}`,
    })
  }
}
