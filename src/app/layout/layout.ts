import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Navbar } from '../shared/navbar/navbar';
import { Footer } from '../shared/footer/footer';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    Navbar,
      ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {}
