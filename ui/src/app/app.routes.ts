import { Routes } from '@angular/router';
import { OfficialsListComponent } from './components/officials-list/officials-list';
import { PoliticalSnapshotComponent } from './components/political-snapshot/political-snapshot';

export const routes: Routes = [
  { path: '', component: OfficialsListComponent },
  { path: 'admin', component: PoliticalSnapshotComponent },
];
