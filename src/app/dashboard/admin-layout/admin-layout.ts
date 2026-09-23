import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

import { DOCUMENT } from '@angular/common';

import {
  NavigationEnd,
  Router,
  RouterOutlet
} from '@angular/router';

import { Subscription, filter } from 'rxjs';

import { AdminSidebar } from '../admin-sidebar/admin-sidebar';
import { AdminTopbar } from '../admin-topbar/admin-topbar';

import { UserService } from '../../core/services/user.service';
import { IUser } from '../../core/models/user.model';

@Component({
  selector: 'app-admin-layout',
  standalone: true,

  imports: [
    RouterOutlet,
    AdminSidebar,
    AdminTopbar
  ],

  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout implements OnInit, OnDestroy {

  @ViewChild('sidebarToggle')
  sidebarToggle?: ElementRef<HTMLInputElement>;

  admin: IUser | null = null;

  private _navigationSub?: Subscription;

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private _router: Router,
    private _userService: UserService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this._document.body.classList.add('admin');

    this._userService.getProfile().subscribe({

      next: (response) => {

        this.admin = response.data.user;

        this._cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'ADMIN PROFILE ERROR:',
          error
        );

        this._cdr.detectChanges();
      }

    });

    this._navigationSub = this._router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd
        )
      )
      .subscribe(() => {

        if (this.sidebarToggle) {

          this.sidebarToggle.nativeElement.checked = false;

        }

      });

  }

  ngOnDestroy(): void {

    this._document.body.classList.remove('admin');

    this._navigationSub?.unsubscribe();

  }

}
