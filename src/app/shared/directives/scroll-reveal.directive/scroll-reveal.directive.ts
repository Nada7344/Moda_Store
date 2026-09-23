import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  Renderer2
} from '@angular/core';

import {
  NavigationEnd,
  Router
} from '@angular/router';

import { Subscription, filter } from 'rxjs';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements AfterViewInit, OnDestroy {

  @Input('appScrollRevealDelay') delay = 0;

  private _observer?: IntersectionObserver;

  private _routerSub?: Subscription;

  constructor(
    private _el: ElementRef<HTMLElement>,
    private _renderer: Renderer2,
    private _router: Router
  ) {}

  ngAfterViewInit(): void {

    const element = this._el.nativeElement;

    this._renderer.addClass(element, 'reveal-up');

    if (this.delay) {
      this._renderer.setStyle(
        element,
        'transition-delay',
        `${this.delay}ms`
      );
    }

    if (!('IntersectionObserver' in window)) {

      this._renderer.addClass(element, 'is-visible');

      return;

    }

    this._observe(element);


    this._routerSub = this._router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {

        this._renderer.removeClass(element, 'is-visible');

        this._observer?.disconnect();

        this._observe(element);

      });

  }

  private _observe(element: HTMLElement): void {

    this._observer = new IntersectionObserver(
      (entries) => {

        entries.forEach(entry => {

          if (entry.isIntersecting) {

            this._renderer.addClass(element, 'is-visible');

            this._observer?.unobserve(element);

          }

        });

      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -60px 0px',
      }
    );

    this._observer.observe(element);

  }

  ngOnDestroy(): void {

    this._observer?.disconnect();

    this._routerSub?.unsubscribe();

  }

}
