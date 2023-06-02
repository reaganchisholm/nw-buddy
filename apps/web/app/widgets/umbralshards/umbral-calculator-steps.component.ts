import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core'
import { getItemIconPath } from '@nw-data/common'
import { combineLatest, map } from 'rxjs'
import { UmbralCalculatorService } from './umbral-calculator.service'
import { UpgradeStep } from './utils'

@Component({
  selector: 'nwb-umbral-calculator-steps',
  templateUrl: './umbral-calculator-steps.component.html',
  styleUrls: ['./umbral-calculator-steps.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'layout-content',
  },
})
export class UmbralCalculatorStepsComponent {
  protected trackByIndex = (i: number) => i

  public shardIcon = this.service.shardItem.pipe(map((it) => getItemIconPath(it)))
  protected vm$ = combineLatest({
    steps: this.service.steps,
    marker: this.service.marker,
    shardIcon: this.service.shardIcon,
  })

  public constructor(private service: UmbralCalculatorService, private cdRef: ChangeDetectorRef) {}

  public upgrade(item: UpgradeStep) {
    item.state.items.forEach((it) => {
      this.service.writeScore(it.id, it.score)
    })
    setTimeout(() => this.service.setMarker(null))
  }

  protected setMarker(item: UpgradeStep) {
    this.service.setMarker(item)
  }
}
