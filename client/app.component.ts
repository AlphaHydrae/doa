import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { EmptyPipe } from './pipes/empty.pipe';
import { PresentPipe } from './pipes/present.pipe';
import { ChecksService } from './services/checks.service';
import { CreateCheckDialogComponent } from './views/checks-create-dialog/dialog.component';

import './rxjs';

@Component({
  selector: 'my-app',
  templateUrl: 'app.template.html',
  providers: [ CreateCheckDialogComponent ],
  directives: [ CreateCheckDialogComponent ],
  pipes: [ EmptyPipe, PresentPipe ]
})
export class AppComponent {

  title = 'DOA'
  checks = null

  public constructor(private checksService: ChecksService, private titleService: Title, public viewContainerRef: ViewContainerRef) {

    this.viewContainerRef = viewContainerRef;
    titleService.setTitle(this.title);

    this.checksService.checksObs.subscribe(checks => {
      this.checks = checks;
    });
  }
}
