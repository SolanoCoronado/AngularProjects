import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { GameComponent } from './game/game.component';
import { ResultsComponent } from './results/results.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, 
  { path: 'game', component: GameComponent }, 
  { path: 'results', component: ResultsComponent },
  { path: '**', redirectTo: '' }, 
];
