import { DIALOG_DATA, Dialog, DialogConfig, DialogModule, DialogRef } from '@angular/cdk/dialog'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Inject, inject } from '@angular/core'
import { Dyecolors } from '@nw-data/generated'
import { NwDbService, NwModule } from '~/nw'
import { TooltipModule } from '~/ui/tooltip'

export interface DyePickerDialogData {
  colors: Dyecolors[]
  color: Dyecolors
}

@Component({
  standalone: true,
  selector: 'nwb-dye-picker',
  templateUrl: './dye-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NwModule, DialogModule, TooltipModule],
  host: {
    class: 'flex flex-col h-full bg-base-100 border border-base-100 rounded-md overflow-hidden',
  },
})
export class DyePickerComponent {
  public static open(dialog: Dialog, config: DialogConfig<DyePickerDialogData>) {
    return dialog.open<Dyecolors, DyePickerDialogData, DyePickerComponent>(DyePickerComponent, {
      maxWidth: 600,
      maxHeight: 600,
      panelClass: ['w-full', 'layout-pad', 'self-end', 'sm:self-center', 'shadow'],
      ...config,
    })
  }

  protected colors: Dyecolors[]
  protected color: Dyecolors

  public constructor(
    private dialog: DialogRef<Dyecolors, DyePickerDialogData>,
    @Inject(DIALOG_DATA)
    protected data: DyePickerDialogData
  ) {
    this.colors = data.colors
    this.color = data.color
  }

  protected commit(color = this.color) {
    this.dialog.close(color)
  }

  protected cancel() {
    this.dialog.close()
  }
}
