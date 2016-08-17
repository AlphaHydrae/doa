import { Routes, RouterModule } from '@angular/router';

import { HomePageComponent } from './components/home-page/component';
import { SettingsPageComponent } from './components/settings-page/component';

const appRoutes: Routes = [
  {
    path: '',
    component: HomePageComponent
  },
  {
    path: 'settings',
    component: SettingsPageComponent
  }
];

export const routing = RouterModule.forRoot(appRoutes);
