import { Injectable } from '@angular/core'
import { Observable, of, shareReplay, Subject, switchMap, tap } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class IntersectionObserverService {
  private observer: IntersectionObserver

  private observers = new Map<Element, Observable<IntersectionObserverEntry>>()
  private subjects = new Map<Element, Subject<IntersectionObserverEntry>>()

  public constructor() {
    this.observer = new IntersectionObserver((it) => {
      for (const entry of it) {
        this.subjects.get(entry.target)?.next(entry)
      }
    }, {})
  }

  public observe(el: HTMLElement) {
    if (!this.observers.has(el)) {
      this.observers.set(
        el,
        of(null)
          .pipe(
            tap({
              subscribe: () => {
                this.subjects.set(el, new Subject<IntersectionObserverEntry>())
                this.observer.observe(el)
              },
              unsubscribe: () => {
                this.subjects.delete(el)
                this.observer.unobserve(el)
              },
            })
          )
          .pipe(switchMap(() => this.subjects.get(el)))
          .pipe(
            shareReplay({
              refCount: true,
              bufferSize: 1,
            })
          )
      )
    }
    return this.observers.get(el)
  }
}
