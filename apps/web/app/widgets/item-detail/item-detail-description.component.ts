import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { map } from 'rxjs'
import { NwModule } from '~/nw'
import { ItemDetailService } from './item-detail.service'

@Component({
  standalone: true,
  selector: 'nwb-item-detail-description',
  templateUrl: './item-detail-description.component.html',
  styleUrls: ['./item-detail-description.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NwModule],
  host: {
    class: 'block'
  },
})
export class ItemDetailDescriptionComponent {

  @Input()
  public innerClass: string

  public constructor(protected detail: ItemDetailService) {

  }
}
