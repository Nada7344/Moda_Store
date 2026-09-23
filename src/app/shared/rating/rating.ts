import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-rating',
  imports: [],
  templateUrl: './rating.html',
  styleUrl: './rating.css',
})
export class Rating {

  @Input({ required: true })
  value!: number;

  @Input()
  count?: number;

  get stars(): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(this.value));
  }

}
