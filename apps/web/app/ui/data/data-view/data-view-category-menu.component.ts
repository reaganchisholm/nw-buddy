import { CdkOverlayOrigin, OverlayModule } from '@angular/cdk/overlay'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, HostListener, Input } from '@angular/core'
import { RouterModule } from '@angular/router'
import { ComponentStore } from '@ngrx/component-store'
import { NwModule } from '~/nw'
import { IconsModule } from '~/ui/icons'
import { svgChevronLeft } from '~/ui/icons/svg'
import { eqCaseInsensitive, selectStream, tapDebug } from '~/utils'
import { DataViewCategory } from './data-view-category'
import { DataViewService } from './data-view.service'
import { defer, map, of, switchMap } from 'rxjs'
import { gridDisplayRowCount } from '../ag-grid/utils'

export interface DataViewCategoryMenuState {
  showCounter?: boolean
  routePrefix?: string
  defaultTitle?: string
  defaultIcon?: string
  defaultRoute?: string
}

@Component({
  standalone: true,
  selector: 'nwb-data-view-category-menu,button[nwbDataCateogryMenu]',
  templateUrl: './data-view-category-menu.component.html',
  imports: [CommonModule, OverlayModule, IconsModule, NwModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex flex-row gap-3 items-center py-1',
  },
  hostDirectives: [CdkOverlayOrigin],
})
export class DataViewCategoryMenuComponent extends ComponentStore<DataViewCategoryMenuState> {
  @Input()
  public nwbDataCateogryMenu: void

  @Input()
  public set category(value: string | null) {
    this.service.patchState({ category: value })
  }

  @Input()
  public set routePrefix(value: string) {
    this.patchState({
      routePrefix: value,
    })
  }

  @Input({ required: true })
  public set defaultTitle(value: string) {
    this.patchState({ defaultTitle: value })
  }

  @Input()
  public set defaultIcon(value: string) {
    this.patchState({ defaultIcon: value })
  }

  @Input({ required: true })
  public set defaultRoute(value: string) {
    this.patchState({ defaultRoute: value })
  }

  @Input()
  public set showCounter(value: boolean) {
    this.patchState({ showCounter: value })
  }

  protected isPanelOpen = false
  protected iconChevron = svgChevronLeft

  protected readonly counter$ = selectStream(
    {
      enabled: this.select((it) => it.showCounter),
      totalCount: defer(() => this.totalRowCount$),
      displayedCount: defer(() => this.displayedRowCount$),
    },
    ({ totalCount, displayedCount, enabled }) => {
      return enabled ? { total: totalCount, displayed: displayedCount } : null
    }
  )

  protected readonly categories$ = selectStream(
    {
      categories: this.service.categories$,
      category: this.service.category$,
      routePrefix: this.select((it) => it.routePrefix),
    },
    collectCategories
  )

  protected totalRowCount$ = this.service.categoryItems$.pipe(map((list) => list?.length || 0))
  protected displayedRowCount$ = this.service.agGrid$.pipe(
    switchMap((grid) => (grid ? gridDisplayRowCount(of(grid)) : of(null)))
  )
  protected readonly hasCategories$ = this.select(this.categories$, (it) => it.length > 0)
  protected readonly activeCateogry$ = this.select(this.categories$, (it) => it.find((it) => it.active))
  protected readonly defaultCategory$ = this.select(selectDefaultCategory)

  public constructor(protected cdkOrigin: CdkOverlayOrigin, private service: DataViewService<unknown>) {
    super({})
  }

  @HostListener('click')
  public open() {
    this.isPanelOpen = true
  }
}

function collectCategories({
  categories,
  category,
  routePrefix,
}: {
  categories: DataViewCategory[]
  category: string | number | null
  routePrefix: string
}) {
  categories = categories || []
  return categories.map((it) => {
    return {
      ...it,
      route: [routePrefix || './', it.id.toLowerCase()],
      active: eqCaseInsensitive(String(it.id), String(category)),
    }
  })
}

function selectDefaultCategory({ defaultTitle, defaultRoute, defaultIcon, routePrefix }: DataViewCategoryMenuState) {
  return {
    id: defaultRoute,
    route: [routePrefix || './', defaultRoute.toLowerCase()],
    label: defaultTitle,
    icon: defaultIcon,
  }
}
