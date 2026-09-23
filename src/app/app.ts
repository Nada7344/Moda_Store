import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './shared/footer/footer';
import { CartDrawer } from './shared/cart-drawer/cart-drawer';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer, CartDrawer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('ModaStore');

  constructor(private _authService: AuthService) {}

  ngOnInit(): void {

    this._authService.checkIfLogin();
  }
}
