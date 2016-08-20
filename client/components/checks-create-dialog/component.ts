import * as _ from 'lodash';
import { Component, ViewChild } from '@angular/core';
import { Control } from '@angular/common';
import { ModalDirective } from 'ng2-bootstrap/components/modal/modal.component';

import { ChecksService } from '../../services/checks.service';
import { CheckTitleUniquenessValidator } from './title-validator';

@Component({
  selector: 'create-check-dialog',
  templateUrl: 'components/checks-create-dialog/template.html',
  directives: [ CreateCheckDialogComponent, CheckTitleUniquenessValidator ]
})
export class CreateCheckDialogComponent {

  @ViewChild(ModalDirective)
  public modal: ModalDirective;

  public check: Object;
  private titleField: Control;

  public constructor(private checksService: ChecksService) {
    this.check = {};
    //this.titleField = new Control('', null, checkValidator.checkTitleUniqueness.bind(checkValidator));
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
