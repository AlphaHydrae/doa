import * as _ from 'lodash';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap/components/modal/modal.component';

import { AuthService } from '../../services/auth.service';
import { Logger } from '../../services/log.service';

@Component({
  moduleId: module.id.toString(),
  selector: 'login-dialog',
  templateUrl: 'template.html',
  directives: [ LoginDialogComponent ]
})
export class LoginDialogComponent implements OnInit {

  @ViewChild(ModalDirective)
  public modal: ModalDirective;

  private loginForm: FormGroup;

  public constructor(private auth: AuthService, private formBuilder: FormBuilder, private log: Logger) {
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: [
        '',
        Validators.required
      ],
      password: [
        '',
        Validators.required
      ]
    });
  }

  open() {
    this.modal.show();
  }

  close() {
    this.modal.hide();
  }

  signIn() {
    if (!this.loginForm.valid) {
      this.log.warn('Login form is not valid');
      return;
    }

    var data = this.loginForm.value;

    this.auth.signIn(data).subscribe(() => {
      this.close();
    });
 }
}
