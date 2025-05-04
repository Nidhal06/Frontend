import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-open-space',
  templateUrl: './open-space.component.html',
  styleUrls: ['./open-space.component.css']
})
export class OpenSpaceComponent {

  safeLocationUrl: SafeResourceUrl | null = null;

  openSpaceImages = [
    'assets/images/a.jpg',
    'assets/images/b.jpg',
    'assets/images/c.jpg',
    'assets/images/d.png',
    'assets/images/l.png',
    'assets/images/h.jpg',
    'assets/images/i.jpg',
    'assets/images/j.jpg',
    'assets/images/k.jpg',
    'assets/images/e.jpg',
    'assets/images/f.jpg',
    'assets/images/g.jpg'
  ];

}
