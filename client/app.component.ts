import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { ChecksService } from './services/checks.service';
import { CreateCheckDialogComponent } from './views/checks-create-dialog/dialog.component';
import { UiModalService } from './services/ui.modal.service';

import './rxjs';

@Component({
  selector: 'my-app',
  templateUrl: 'app.template.html',
  providers: [ ChecksService, CreateCheckDialogComponent, UiModalService ]
})
export class AppComponent {
  title = 'DOA'

  public constructor(private checksService: ChecksService, private titleService: Title, private uiModalService: UiModalService) {
    titleService.setTitle(this.title);
  }

  createCheck() {
    this.uiModalService.open(CreateCheckDialogComponent);
  }
}
