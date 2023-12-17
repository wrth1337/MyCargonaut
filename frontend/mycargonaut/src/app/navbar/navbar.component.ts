import { Component } from '@angular/core';
import {NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true,
  imports: [
    NgOptimizedImage
  ],
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
}
