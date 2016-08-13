import { Component } from '@angular/core';

import { ChecksService } from '../../services/checks.service';

@Component({
  selector: 'create-check-dialog',
  templateUrl: 'views/checks-create-dialog/dialog.template.html',
  providers: [ ChecksService ]
})
export class CreateCheckDialogComponent {

  public constructor(private checksService: ChecksService) {
  }
}
