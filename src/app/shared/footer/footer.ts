import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScrollRevealDirective } from '../directives/scroll-reveal.directive/scroll-reveal.directive';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, ScrollRevealDirective],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {}
