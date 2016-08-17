import { Component } from '@angular/core';

import { EmptyPipe } from '../../pipes/empty.pipe';
import { PresentPipe } from '../../pipes/present.pipe';
import { ChecksService } from '../../services/checks.service';
import { CreateCheckDialogComponent } from '../checks-create-dialog/component';

@Component({
  selector: 'home-page',
  templateUrl: 'components/home-page/template.html',
  providers: [ CreateCheckDialogComponent ],
  directives: [ CreateCheckDialogComponent ],
  pipes: [ EmptyPipe, PresentPipe ]
})
export class HomePageComponent {

  public checks;

  public constructor(private checksService: ChecksService) {
    this.checks = this.checksService.checksObs;
  }

  public delete(check) {
    this.checksService.deleteCheck(check);
  }
}
