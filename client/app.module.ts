import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule, Title } from '@angular/platform-browser';

import { AppComponent } from './app.component';

@NgModule({
  imports: [ BrowserModule, HttpModule ],
  declarations: [ AppComponent ],
  bootstrap: [ AppComponent ],
  providers: [ Title ]
})
export class AppModule { }
