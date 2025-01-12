import { A11yModule } from '@angular/cdk/a11y'
import { DIALOG_DATA, Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, HostListener, Inject, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { EquipSlotId } from '@nw-data/common'
import { catchError, combineLatest, firstValueFrom, fromEvent, map, of, switchMap, takeUntil } from 'rxjs'
import { ItemInstance } from '~/data'
import { NwModule } from '~/nw'
import { IconsModule } from '~/ui/icons'
import { svgAngleLeft } from '~/ui/icons/svg'
import { imageFileFromPaste, imageFromDropEvent } from '~/utils/image-file-from-paste'
import { useTesseract } from '~/utils/use-tesseract'
import { ItemDetailModule } from '~/widgets/data/item-detail'
import { GearImporterStore } from './gear-importer.store'

export interface GearImporterDialogState {
  file: File
  loading: boolean
  slotId: EquipSlotId
}

@Component({
  standalone: true,
  selector: 'nwb-gear-importer-dialog',
  templateUrl: './gear-importer-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NwModule, ItemDetailModule, IconsModule, FormsModule, A11yModule],
  providers: [GearImporterStore],
  host: {
    class: 'flex flex-col h-full bg-base-100 rounded-md border border-base-100',
  },
})
export class GearImporterDialogComponent implements OnInit {
  public static open(dialog: Dialog, config: DialogConfig<EquipSlotId>) {
    return dialog.open<ItemInstance>(GearImporterDialogComponent, {
      maxWidth: 800,
      panelClass: ['w-full', 'layout-pad', 'self-end', 'sm:self-center', 'shadow'],
      autoFocus: true,

      ...config,
    })
  }

  protected vm$ = combineLatest({
    recognition: this.store.recognition$,
    result: this.store.result$,
    filteredResult: this.store.filteredResult$,
    selection: this.store.selection$,
    working: this.store.working$,
    filter: this.store.filter$,
    itemType: this.store.itemType$,
  }).pipe(
    map((data) => {
      console.log(data)
      const items = data.filteredResult
      return {
        items: items,
        itemCount: items.length,
        resultCount: data.result?.length,
        index: data.selection,
        item: items[data.selection],
        working: data.working,
        filter: data.filter,
      }
    })
  )

  protected iconLeft = svgAngleLeft

  public constructor(
    private dialog: DialogRef<ItemInstance>,
    private store: GearImporterStore,
    @Inject(DIALOG_DATA)
    slotId: EquipSlotId
  ) {
    store.patchState({ slotId })
  }

  protected submit(item: ItemInstance) {
    this.dialog.close(item)
  }

  protected close() {
    this.dialog.close(null)
  }

  protected async back() {
    const state = await firstValueFrom(this.store.state$)
    if (!state.file) {
      return this.close()
    }
    this.store.patchState({
      file: null,
      recognition: null,
      selection: 0,
      filter: null,
    })
  }

  @HostListener('paste', ['$event'])
  protected onPaste(e: ClipboardEvent) {
    // console.debug('paste', e)
    // this.store.patchState({
    //   file: imageFileFromPaste(e),
    // })
  }

  @HostListener('drop', ['$event'])
  protected onDrop(e: DragEvent) {
    e.preventDefault()
    this.store.patchState({
      file: imageFromDropEvent(e),
    })
  }

  @HostListener('dragover', ['$event'])
  protected onDragover(e: DragEvent) {
    e.preventDefault()
  }

  public ngOnInit(): void {
    fromEvent(document, 'paste')
      .pipe(takeUntil(this.store.destroy$))
      .subscribe((e: ClipboardEvent) => {
        this.store.patchState({
          file: imageFileFromPaste(e),
        })
      })
    this.store.imageFile$
      .pipe(
        switchMap(async (image) => {
          if (!image) {
            return null
          }
          this.store.patchState({
            recognition: null,
            selection: 0,
            filter: null,
          })
          const tesseract = await useTesseract()
          return tesseract.recognize(image).then((res) => {
            const lines = res.data.lines.map((line) => {
              return line.words
                .filter((it) => it.confidence >= 10)
                .map((it) => it.text.trim())
                .join(' ')
            })
            return lines
          })
        }),
        catchError(() => of(null))
      )
      .pipe(takeUntil(this.store.destroy$))
      .subscribe((res) => {
        this.store.patchState({
          recognition: res,
          selection: 0,
          filter: null,
        })
      })
  }

  protected async prevItem() {
    const state = await firstValueFrom(this.vm$)
    this.store.patchState({
      selection: Math.max(0, state.index - 1),
    })
  }
  protected async nextItem() {
    const state = await firstValueFrom(this.vm$)
    this.store.patchState({
      selection: Math.min(state.itemCount - 1, state.index + 1),
    })
  }

  protected updateFilter(value: string) {
    this.store.patchState({ filter: value, selection: 0 })
  }
}
