import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,

  imports: [
    RouterLink,
  ],

  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {

  whatsappNumber = '201000000000';
  whatsappDisplay = '+20 100 000 0000';

  instagramHandle = '@moda.store';
  instagramUrl = 'https://instagram.com/moda.store';

  email = 'support@modastore.com';

  get whatsappUrl(): string {
    return `https://wa.me/${this.whatsappNumber}`;
  }

}
