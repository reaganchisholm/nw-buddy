import { Platform as AngularPlatform } from '@angular/cdk/platform'
import { Platform as IonicPlatform } from '@ionic/angular'
import { Inject, Injectable } from '@angular/core'
import { environment } from '../../../environments'
import { ElectronService } from '~/electron'
import { DOCUMENT } from '@angular/common'

@Injectable({ providedIn: 'root' })
export class PlatformService {
  public readonly env = environment

  /**
   * Whether the Angular application is being rendered in the browser.
   */
  public get isBrowser() {
    return this.angularPlatform.isBrowser
  }
  /**
   * Whether the current browser is Microsoft Edge.
   */
  public get isEdge() {
    return this.angularPlatform.EDGE
  }
  /**
   * Whether the current rendering engine is Microsoft Trident.
   */
  public get isTrident() {
    return this.angularPlatform.TRIDENT
  }
  /**
   * Whether the current rendering engine is Blink.
   */
  public get isBlink() {
    return this.angularPlatform.BLINK
  }
  /**
   * Whether the current rendering engine is WebKit.
   */
  public get isWebkit() {
    return this.angularPlatform.WEBKIT
  }
  /**
   * Whether the current platform is Apple iOS.
   */
  public get isIos() {
    return this.angularPlatform.IOS
  }
  /**
   * Whether the current browser is Firefox.
   */
  public get isFirefox() {
    return this.angularPlatform.FIREFOX
  }
  /**
   * Whether the current platform is Android.
   */
  public get isAndroid() {
    return this.angularPlatform.ANDROID
  }
  /**
   * Whether the current browser is Safari.
   */
  public get isSafari() {
    return this.angularPlatform.SAFARI
  }

  /**
   * Whether the current platform is Overwolf
   */
  public get isOverwolf() {
    return this.ionicPlatform.testUserAgent('OverwolfClient')
  }

  /**
   * Whether the current platform is Electron
   */
  public get isElectron() {
    return this.electron.isElectron
  }

  /**
   * Whether the website is embedded in an iframe
   */
  public get isIframe() {
    return this.doc.defaultView.self !== this.doc.defaultView.top
  }

  public constructor(
    private angularPlatform: AngularPlatform,
    private ionicPlatform: IonicPlatform,
    private electron: ElectronService,
    @Inject(DOCUMENT)
    private doc: Document
  ) {
    //
  }
}
