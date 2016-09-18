import { enableProdMode } from '@angular/core';
import { provideForms, disableDeprecatedForms } from '@angular/forms';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';
import { env } from './config';

if (env == 'production') {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule, [ disableDeprecatedForms(), provideForms() ]);
