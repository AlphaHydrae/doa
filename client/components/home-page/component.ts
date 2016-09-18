import { Component } from '@angular/core';

import { EmptyPipe } from '../../pipes/empty.pipe';
import { PresentPipe } from '../../pipes/present.pipe';
import { ChecksListComponent } from '../checks-list/checks-list';
import { ChecksService } from '../../services/checks.service';
import { CreateCheckDialogComponent } from '../checks-create-dialog/component';

@Component({
  moduleId: module.id.toString(),
  selector: 'home-page',
  templateUrl: 'template.html',
  providers: [ ChecksListComponent, CreateCheckDialogComponent ],
  directives: [ ChecksListComponent, CreateCheckDialogComponent ],
  pipes: [ EmptyPipe, PresentPipe ]
})
export class HomePageComponent {

  public constructor(private checksService: ChecksService) {
  }
}
