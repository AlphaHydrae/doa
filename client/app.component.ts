import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { ChecksService } from './services/checks.service';
import { CreateCheckDialogComponent } from './views/checks-create-dialog/dialog.component';

import './rxjs';

@Component({
  selector: 'my-app',
  templateUrl: 'app.template.html',
  providers: [ CreateCheckDialogComponent ],
  directives: [ CreateCheckDialogComponent ]
})
export class AppComponent {
  title = 'DOA'

  public constructor(private checksService: ChecksService, private titleService: Title, public viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef;
    titleService.setTitle(this.title);
  }
}
