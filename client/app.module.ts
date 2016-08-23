import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule, Title } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { routing } from './app.routing';
import { HomePageComponent } from './components/home-page/component';
import { SettingsPageComponent } from './components/settings-page/component';
import { ChecksService } from './services/checks.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
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
