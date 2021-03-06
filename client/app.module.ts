import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule, Title } from '@angular/platform-browser';
import { MomentModule } from 'angular2-moment';
import { SlimLoadingBarService } from 'ng2-slim-loading-bar';

import { AppComponent } from './app.component';
import { routing } from './app.routing';
import { HomePageComponent } from './components/home-page/component';
import { SettingsPageComponent } from './components/settings-page/component';
import { ApiService } from './services/api.service';
import { AuthService } from './services/auth.service';
import { ChecksService } from './services/checks.service';
import { Logger } from './services/log.service';
import { SettingsService } from './services/settings.service';
import { StorageService } from './services/storage.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MomentModule,
    ReactiveFormsModule,
    routing
  ],
  declarations: [
    AppComponent,
    HomePageComponent,
    SettingsPageComponent
  ],
  bootstrap: [ AppComponent ],
  providers: [
    ApiService,
    AuthService,
    ChecksService,
    Logger,
    SlimLoadingBarService,
    SettingsService,
    StorageService,
    Title
  ]
})
export class AppModule {}
