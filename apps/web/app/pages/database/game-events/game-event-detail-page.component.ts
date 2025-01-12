import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { NwModule } from '~/nw'
import { LayoutModule } from '~/ui/layout'
import { observeRouteParam } from '~/utils'
import { GameEventDetailModule } from '~/widgets/data/game-event-detail'
import { LootModule } from '~/widgets/loot'
import { ScreenshotModule } from '~/widgets/screenshot'

@Component({
  standalone: true,
  selector: 'nwb-game-event-detail-page',
  templateUrl: './game-event-detail-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, NwModule, GameEventDetailModule, ScreenshotModule, LayoutModule, LootModule],
  host: {
    class: 'flex-none flex flex-col',
  },
})
export class GameEventDetailPageComponent {
  protected eventId$ = observeRouteParam(this.route, 'id')

  public constructor(private route: ActivatedRoute) {
    //
  }
}
