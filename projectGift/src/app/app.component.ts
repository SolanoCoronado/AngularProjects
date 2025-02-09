import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { GiphyBrowserComponent } from './giphy-browser/giphy-browser.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HttpClientModule,
    GiphyBrowserComponent,
    FormsModule
  ],
  template: `
    <div class="container">
      <h1>{{ title }}</h1>
      <app-giphy-browser></app-giphy-browser>
    </div>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'projectGift';
}