import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule, Title } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { routing } from './app.routing';

import { ChecksService } from './services/checks.service';
import { HomePageComponent } from './components/home-page/component';
import { SettingsPageComponent } from './components/settings-page/component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing
  ],
  declarations: [
    AppComponent,
    HomePageComponent,
    SettingsPageComponent
  ],
  bootstrap: [ AppComponent ],
  providers: [
    ChecksService,
    Title
  ]
})
export class AppModule {}
