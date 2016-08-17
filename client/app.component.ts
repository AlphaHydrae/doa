import { Component, ViewContainerRef } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { HomePageComponent } from './components/home-page/component';
import { NavbarComponent } from './components/navbar/component';

import './rxjs';

@Component({
  selector: 'app',
  templateUrl: 'app.template.html',
  providers: [ HomePageComponent, NavbarComponent ],
  directives: [ HomePageComponent, NavbarComponent ]
})
export class AppComponent {

  public title = 'DOA';

  public constructor(private titleService: Title, public viewContainerRef: ViewContainerRef) {

    this.viewContainerRef = viewContainerRef;

    titleService.setTitle(this.title);
  }
}
