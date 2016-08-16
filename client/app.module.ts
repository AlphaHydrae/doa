import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule, Title } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ChecksService } from './services/checks.service';

@NgModule({
  imports: [ BrowserModule, FormsModule, HttpModule ],
  declarations: [ AppComponent ],
  bootstrap: [ AppComponent ],
  providers: [ ChecksService, Title ]
})
export class AppModule {}
