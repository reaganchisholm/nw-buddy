import { animate, query, stagger, state, style, transition, trigger } from '@angular/animations'
import { DOCUMENT } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core'
import { Subject, take, takeUntil } from 'rxjs'

import { TranslateService } from './i18n'

import { LANG_OPTIONS, MAIN_MENU } from './menu'
import { AppPreferencesService } from './preferences'
import { svgMap } from './ui/icons/svg'
import { LayoutService } from './ui/layout'
import { mapProp } from './utils'
import { PlatformService } from './utils/platform.service'

@Component({
  selector: 'nw-buddy-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('listAnimation', [
      transition('void => *', [
        query(':enter', [style({ opacity: 0 }), stagger(100, [animate('0.3s', style({ opacity: 1 }))])]),
      ]),
    ]),
    trigger('headerAnimation', [
      state('void', style({ opacity: 0 })),
      state('true', style({ opacity: 1 })),
      transition('void => *', [animate('0.3s')]),
    ]),
    trigger('enteranimation', [
      transition(':enter', [style({ opacity: 0 }), animate('1s 0.3s ease-out', style({ opacity: 1 }))]),
    ]),
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  public get isElectron() {
    return this.platform.isElectron
  }

  public get isWeb() {
    return this.platform.env.environment === 'WEB' || this.platform.env.environment === 'DEV'
  }

  public get isPtr() {
    return this.platform.env.isPTR
  }

  public get isOverwolf() {
    return this.platform.isOverwolf
  }

  public get language() {
    return this.preferences.language.get()
  }
  public set language(value: string) {
    this.preferences.language.set(value)
  }
  public get lang() {
    return LANG_OPTIONS.find((it) => it.value === this.language)?.label
  }

  protected mainMenu = MAIN_MENU
  protected langOptions = LANG_OPTIONS
  protected langLoaded = false
  protected isDesktop$ = this.layout.breakpoint.observe('(min-width: 1200px)').pipe(mapProp('matches'))
  protected mapIcon = svgMap
  protected mapActive = false
  protected mapCollapsed = false

  private destroy$ = new Subject<void>()

  constructor(
    private preferences: AppPreferencesService,
    private platform: PlatformService,
    private cdRef: ChangeDetectorRef,
    @Inject(DOCUMENT)
    private document: Document,
    private translate: TranslateService,
    private layout: LayoutService
  ) {
    //
  }

  public ngOnInit(): void {
    this.preferences.language.observe().subscribe((locale) => {
      this.translate.use(locale)
    })
    this.translate.locale.value$
      .pipe(take(1))
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.onLangLoaded()
      })
    this.mapActive = this.preferences.mapActive.get()
    this.mapCollapsed = this.preferences.mapCollapsed.get()
  }

  public ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  protected toggleMap() {
    this.mapActive = !this.mapActive
    this.preferences.mapActive.set(this.mapActive)
  }

  protected toggleMapCollapes() {
    this.mapCollapsed = !this.mapCollapsed
    this.preferences.mapCollapsed.set(this.mapCollapsed)
  }

  private onLangLoaded() {
    // 1s delay 0.3s animation
    this.langLoaded = true
    this.cdRef.markForCheck()
    setTimeout(() => this.removeLoader(), 150)
  }

  private removeLoader() {
    const el = this.document.querySelector('[data-loader]')
    el.classList.add('opacity-0')
    setTimeout(() => el.remove(), 300)
  }
}
