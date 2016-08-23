import * as _ from 'lodash';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap/components/modal/modal.component';

import { ChecksService } from '../../services/checks.service';

@Component({
  selector: 'create-check-dialog',
  templateUrl: 'components/checks-create-dialog/template.html',
  directives: [ CreateCheckDialogComponent ]
})
export class CreateCheckDialogComponent implements OnInit {

  @ViewChild(ModalDirective)
  public modal: ModalDirective;

  private checkForm: FormGroup;

  public constructor(private checksService: ChecksService, private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.checkForm = this.formBuilder.group({
      title: [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(50)
        ]),
        this.checksService.validateTitleAvailable.bind(this.checksService)
      ]
    });
  }

  open() {
    this.modal.show();
  }

  close() {
    this.modal.hide();
  }

  save() {

    var data = _.extend(this.checkForm.value, { interval: 1 });

    this.checksService.createCheck(data).subscribe(check => {
      this.close();
    });
  }
}
