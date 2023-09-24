import { GridOptions } from '@ag-grid-community/core'
import { inject } from '@angular/core'
import { NW_FALLBACK_ICON, NwExpEval, NwExpJoin, parseNwExpression } from '@nw-data/common'
import { Perks } from '@nw-data/generated'
import { Observable, combineLatest, defer, map, of, switchMap, tap } from 'rxjs'
import { NwDbService } from '~/nw'
import { TableGridUtils } from '~/ui/data/table-grid'
import { DataViewAdapter, DataViewCategory } from '~/ui/data/data-view'
import { VirtualGridOptions } from '~/ui/data/virtual-grid'

export interface FaultRow {
  perk: Perks
  expressions: Array<{
    lang: string
    text: string
    expr: string
  }>
}

const KNOWN_LANG = [
  { value: 'en-us', label: 'EN' },
  { value: 'de-de', label: 'DE' },
  { value: 'es-es', label: 'ES' },
  { value: 'fr-fr', label: 'FR' },
  { value: 'it-it', label: 'IT' },
  { value: 'pl-pl', label: 'PL' },
  { value: 'pt-br', label: 'BR' },
]

export class ExprFaultsAdapter implements DataViewAdapter<FaultRow> {
  private db: NwDbService = inject(NwDbService)
  private utils: TableGridUtils<FaultRow> = inject(TableGridUtils)

  public entityID(item: FaultRow): string | number {
    return item.perk.PerkID
  }

  public entityCategories(item: FaultRow): DataViewCategory[] {
    return null
  }

  public gridOptions(): GridOptions<FaultRow> {
    const utils = this.utils
    return {
      rowSelection: 'single',
      rowBuffer: 0,
      columnDefs: [
        utils.colDef({
          colId: 'icon',
          headerValueGetter: () => 'Icon',
          resizable: false,
          sortable: false,
          filter: false,
          pinned: true,
          width: 62,
          cellRenderer: utils.cellRenderer(({ data }) => {
            return utils.elA(
              {
                attrs: {
                  href: utils.nwLink.link('perk', data.perk.PerkID),
                  target: '_blank',
                },
              },
              [
                utils.elImg({
                  src: data.perk.IconPath || NW_FALLBACK_ICON,
                  class: ['transition-all', 'translate-x-0', 'hover:translate-x-1'],
                }),
              ]
            )
          }),
        }),
        utils.colDef({
          colId: 'name',
          headerValueGetter: () => 'Name',
          sortable: true,
          filter: true,
          width: 250,
          valueGetter: utils.valueGetter(({ data }) => utils.i18n.get(data.perk.DisplayName)),
          cellRenderer: utils.lineBreaksRenderer(),
          cellClass: ['multiline-cell', 'py-2'],
          autoHeight: true,
          getQuickFilterText: ({ value }) => value,
        }),
        ...KNOWN_LANG.map((it, i) =>
          utils.colDef({
            colId: `lang-${it.value}`,
            filter: false,
            cellClass: ['multiline-cell', 'py-2'],
            autoHeight: true,
            headerValueGetter: () => it.label,
            width: 400,
            valueGetter: utils.valueGetter(({ data }) => data.expressions[i].expr),
          })
        ),
      ],
    }
  }

  public virtualOptions(): VirtualGridOptions<FaultRow> {
    return null
  }

  public connect(): Observable<FaultRow[]> {
    return this.entities
  }

  public entities: Observable<FaultRow[]> = defer(() => this.getFaultRows())

  private getFaultRows() {
    const loadLang$ = combineLatest(
      KNOWN_LANG.map((it) => {
        return this.utils.i18n.loader
          .loadTranslations(it.value)
          .pipe(tap((data) => this.utils.i18n.merge(it.value, data)))
          .pipe(map(() => it))
      })
    )

    return combineLatest({
      lang: loadLang$,
      perks: this.db.perks,
    }).pipe(
      switchMap(({ perks }) => combineLatest(this.mapPerks(perks))),
      map((perks): FaultRow[] => {
        return perks.filter((it) => {
          const first = it.expressions[0]
          return it.expressions.some((other) => other.expr !== first.expr)
        })
      })
    )
  }

  private mapPerks(perks: Perks[]) {
    return perks.map((perk) => {
      const expressions = KNOWN_LANG.map((lang) =>
        combineLatest({
          lang: of(lang.value),
          text: of(this.utils.i18n.get(perk.Description, lang.value)),
          expr: this.extractEpxression(perk.Description, lang.value),
        })
      )
      return combineLatest({
        perk: of(perk),
        expressions: combineLatest(expressions),
      })
    })
  }
  private extractEpxression(key: string, lang: string) {
    const text = this.utils.i18n.get(key, lang)
    const root = parseNwExpression(text, true) as NwExpJoin
    const children = root.children.filter((it) => it instanceof NwExpEval)
    const splits = children.map((it) => it.print()).sort()
    return of(splits.join(' '))
  }
}
