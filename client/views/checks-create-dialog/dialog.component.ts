import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap/components/modal/modal.component';
import { MODAL_DIRECTIVES, BS_VIEW_PROVIDERS } from 'ng2-bootstrap/ng2-bootstrap';

import { ChecksService } from '../../services/checks.service';

@Component({
  selector: 'create-check-dialog',
  templateUrl: 'views/checks-create-dialog/dialog.template.html',
  providers: [ ChecksService ],
  directives: [ MODAL_DIRECTIVES, CreateCheckDialogComponent ],
  viewProviders: [ BS_VIEW_PROVIDERS ]
})
export class CreateCheckDialogComponent {

  @ViewChild('modal')
  public modal: ModalDirective;

  public constructor(private checksService: ChecksService) {
  }

  open() {
    this.modal.show();
  }
}
