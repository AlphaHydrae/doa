import * as _ from 'lodash';
import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap/components/modal/modal.component';

import { ChecksService } from '../../services/checks.service';

@Component({
  selector: 'create-check-dialog',
  templateUrl: 'components/checks-create-dialog/template.html',
  providers: [],
  directives: [ CreateCheckDialogComponent ]
})
export class CreateCheckDialogComponent {

  @ViewChild(ModalDirective)
  public modal: ModalDirective;

  public check: Object;

  public constructor(private checksService: ChecksService) {
    this.check = {};
  }

  open() {
    this.check = {};
    this.modal.show();
  }

  close() {
    this.modal.hide();
  }

  save() {
    this.checksService.createCheck(_.extend(this.check, { interval: 1 })).subscribe(check => {
      this.close();
    });
  }
}
