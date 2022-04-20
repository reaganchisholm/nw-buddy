import { Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit } from '@angular/core'
import {
  combineLatest,
  distinctUntilChanged,
  map,
  ReplaySubject,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs'
import { LocaleService } from '../i18n'
import { NwService } from './nw.service'

interface TextContext {
  text: string
  itemId: string
  charLevel: number
}

@Directive({
  selector: '[nwText]',
})
export class NwTextDirective implements OnInit, OnChanges, OnDestroy {
  @Input()
  public nwText: string

  @Input()
  public itemId: string

  @Input()
  public charLevel: number = 60

  private destroy$ = new Subject()
  private change$ = new ReplaySubject<TextContext>(1)

  public constructor(private elRef: ElementRef<HTMLElement>, private nw: NwService, private locale: LocaleService) {}

  public ngOnInit(): void {
    combineLatest([this.change$.pipe(distinctUntilChanged()), this.locale.change])
      .pipe(
        map(([context]) => {
          return {
            ...context,
            text: this.nw.translate(context.text),
          }
        })
      )
      .pipe(switchMap((context) => this.nw.expression.solve(context)))
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.elRef.nativeElement.textContent = String(res)
      })
  }

  public ngOnChanges(): void {
    this.change$.next({
      text: this.nwText,
      itemId: this.itemId,
      charLevel: this.charLevel,
    })
  }

  public ngOnDestroy(): void {
    this.destroy$.next(null)
    this.destroy$.complete()
  }
}
