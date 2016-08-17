import { Component, ViewContainerRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DROPDOWN_DIRECTIVES, MODAL_DIRECTIVES, BS_VIEW_PROVIDERS } from 'ng2-bootstrap/ng2-bootstrap';

import { HomePageComponent } from './components/home-page/component';
import { NavbarComponent } from './components/navbar/component';

import './rxjs';

@Component({
  selector: 'app',
  templateUrl: 'app.template.html',
  providers: [ HomePageComponent, NavbarComponent ],
  directives: [ DROPDOWN_DIRECTIVES, MODAL_DIRECTIVES, HomePageComponent, NavbarComponent ],
  viewProviders: [ BS_VIEW_PROVIDERS ]
})
export class AppComponent {

  public title = 'DOA';

  public constructor(private titleService: Title, public viewContainerRef: ViewContainerRef) {

    this.viewContainerRef = viewContainerRef;

    titleService.setTitle(this.title);
  }
}
