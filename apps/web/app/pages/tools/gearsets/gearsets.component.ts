import { Dialog } from '@angular/cdk/dialog'
import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { RouterModule } from '@angular/router'
import { filter, switchMap } from 'rxjs'
import { GearsetRow, GearsetsDB, GearsetsStore } from '~/data'
import { NwModule } from '~/nw'
import { DataTableModule } from '~/ui/data-table'
import { IconsModule } from '~/ui/icons'
import { svgPlus } from '~/ui/icons/svg'
import { ConfirmDialogComponent, PromptDialogComponent } from '~/ui/modal'
import { NavToobalModule } from '~/ui/nav-toolbar'
import { QuicksearchModule, QuicksearchService } from '~/ui/quicksearch'
import { GearsetsTableAdapter } from './gearsets-table.adapter'

@Component({
  standalone: true,
  selector: 'nwb-gearsets-page',
  templateUrl: './gearsets.component.html',
  imports: [CommonModule, RouterModule, NwModule, DataTableModule, QuicksearchModule, NavToobalModule, IconsModule],
  providers: [GearsetsTableAdapter.provider(), QuicksearchService, GearsetsStore],
  host: {
    class: 'layout-col bg-base-100',
  },
})
export class GearsetsComponent implements OnInit {
  protected iconCreate = svgPlus

  public constructor(
    private store: GearsetsStore,
    protected search: QuicksearchService,
    private dialog: Dialog
  ) {}

  public ngOnInit(): void {
    this.store.loadAll()
  }

  protected async createItem() {
    PromptDialogComponent.open(this.dialog, {
      data: {
        title: 'Create new set',
        body: 'Give this set a name',
        input: `New Gearset`,
        positive: 'Create',
        negative: 'Cancel',
      },
    })
      .closed.pipe(filter((it) => !!it))
      .subscribe((newName) => {
        this.store.createRecord({
          record: {
            id: null,
            name: newName,
          },
        })
      })
  }

  protected deleteItem(item: GearsetRow) {
    ConfirmDialogComponent.open(this.dialog, {
      data: {
        title: 'Delete Gearset',
        body: 'Are you sure you want to delete this gearset?',
        positive: 'Delete',
        negative: 'Cancel',
      },
    })
      .closed.pipe(filter((it) => !!it))
      .subscribe(() => {
        this.store.destroyRecord({ recordId: item.record.id })
      })
  }
}
